import { supabase } from './supabase';

function getSessionId(): string {
  if (typeof document === 'undefined') return 'ssr';
  const match = document.cookie.match(/(?:^|; )ab_session=([^;]*)/);
  if (match) return match[1];
  const id = crypto.randomUUID();
  document.cookie = `ab_session=${id}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`;
  return id;
}

type QueuedEvent = {
  table: string;
  data: Record<string, unknown>;
};

let queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flush() {
  if (!supabase || queue.length === 0) return;
  const batch = [...queue];
  queue = [];

  // Group by table
  const byTable = new Map<string, Record<string, unknown>[]>();
  for (const evt of batch) {
    const arr = byTable.get(evt.table) || [];
    arr.push(evt.data);
    byTable.set(evt.table, arr);
  }

  for (const [table, rows] of byTable) {
    try {
      await supabase.from(table).insert(rows);
    } catch {
      // Fire and forget
    }
  }
}

function enqueue(table: string, data: Record<string, unknown>) {
  if (!supabase) return;
  queue.push({ table, data: { ...data, session_id: getSessionId(), created_at: new Date().toISOString() } });
  if (queue.length >= 10) {
    flush();
  } else {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, 2000);
  }
}

export function trackPageView(path: string, variant?: string, chapter?: string) {
  enqueue('page_views', {
    page_path: path,
    variant: variant || null,
    chapter_slug: chapter || null,
    referrer: typeof document !== 'undefined' ? document.referrer : null,
  });
}

export function trackWidgetInteraction(chapter: string, widget: string, action: string, metadata?: Record<string, unknown>) {
  enqueue('widget_interactions', {
    chapter_slug: chapter,
    widget_name: widget,
    action,
    metadata: metadata || null,
  });
}

/**
 * Upsert scroll depth for a session+chapter.
 * Called periodically as the user progresses through content.
 * Uses direct upsert (not the queue) since we need to update existing rows.
 */
export async function upsertScrollDepth(params: {
  chapterSlug: string;
  variant: 'scroll' | 'cards';
  maxSectionIndex: number;
  maxSectionId: string | null;
  totalSections: number;
  percentComplete: number;
  timeOnPageMs: number;
  reachedEnd: boolean;
}) {
  if (!supabase) return;
  const sessionId = getSessionId();

  try {
    // Check for existing row
    const { data: existing } = await supabase
      .from('scroll_depth')
      .select('id, max_section_index, time_on_page_ms')
      .eq('session_id', sessionId)
      .eq('chapter_slug', params.chapterSlug)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      // Only update if the user has progressed further
      const shouldUpdate =
        params.maxSectionIndex > existing.max_section_index ||
        params.timeOnPageMs > (existing.time_on_page_ms || 0);

      if (shouldUpdate) {
        await supabase
          .from('scroll_depth')
          .update({
            max_section_index: Math.max(params.maxSectionIndex, existing.max_section_index),
            max_section_id: params.maxSectionId,
            total_sections: params.totalSections,
            percent_complete: params.percentComplete,
            time_on_page_ms: params.timeOnPageMs,
            reached_end: params.reachedEnd,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      }
    } else {
      // Insert new row
      await supabase.from('scroll_depth').insert({
        session_id: sessionId,
        chapter_slug: params.chapterSlug,
        variant: params.variant,
        max_section_index: params.maxSectionIndex,
        max_section_id: params.maxSectionId,
        total_sections: params.totalSections,
        percent_complete: params.percentComplete,
        time_on_page_ms: params.timeOnPageMs,
        reached_end: params.reachedEnd,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  } catch {
    // Fire and forget
  }
}

export function trackAiUsage(chapter: string, widget: string, model: string, inputTokens: number, outputTokens: number) {
  const costs: Record<string, [number, number]> = {
    'claude-3-5-haiku-20241022': [0.25, 1.25],
    'claude-sonnet-4-20250514': [3, 15],
  };
  const [inCost, outCost] = costs[model] || [3, 15];
  const costUsd = (inputTokens * inCost + outputTokens * outCost) / 1_000_000;

  enqueue('ai_usage', {
    chapter_slug: chapter,
    widget_name: widget,
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: costUsd,
  });
}
