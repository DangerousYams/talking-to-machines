export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ url }) => {
  const days = parseInt(url.searchParams.get('days') || '7');
  const since = new Date(Date.now() - days * 86400000).toISOString();

  if (!supabase) {
    return new Response(JSON.stringify({ chapters: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data: rows } = await supabase
      .from('scroll_depth')
      .select('*')
      .gte('created_at', since);

    const records = rows || [];

    // Group by chapter
    const byChapter = new Map<string, typeof records>();
    for (const r of records) {
      const arr = byChapter.get(r.chapter_slug) || [];
      arr.push(r);
      byChapter.set(r.chapter_slug, arr);
    }

    const chapters = Array.from(byChapter.entries()).map(([slug, chapterRows]) => {
      const sessions = chapterRows.length;
      const reachedEnd = chapterRows.filter((r: any) => r.reached_end).length;
      const avgPercent = sessions > 0
        ? Math.round(chapterRows.reduce((sum: number, r: any) => sum + Number(r.percent_complete), 0) / sessions)
        : 0;
      const avgTimeMs = sessions > 0
        ? Math.round(chapterRows.reduce((sum: number, r: any) => sum + Number(r.time_on_page_ms || 0), 0) / sessions)
        : 0;

      // Build drop-off buckets (10% increments)
      const buckets = Array.from({ length: 11 }, (_, i) => ({ pct: i * 10, count: 0 }));
      for (const r of chapterRows) {
        const pct = Number(r.percent_complete);
        // User reached this bucket and all prior ones
        for (let i = 0; i < buckets.length; i++) {
          if (pct >= buckets[i].pct) {
            buckets[i].count++;
          }
        }
      }

      // Variant breakdown
      const variantCounts: Record<string, { sessions: number; reachedEnd: number; avgPercent: number }> = {};
      for (const variant of ['scroll', 'cards']) {
        const vRows = chapterRows.filter((r: any) => r.variant === variant);
        if (vRows.length > 0) {
          variantCounts[variant] = {
            sessions: vRows.length,
            reachedEnd: vRows.filter((r: any) => r.reached_end).length,
            avgPercent: Math.round(vRows.reduce((s: number, r: any) => s + Number(r.percent_complete), 0) / vRows.length),
          };
        }
      }

      return {
        slug,
        sessions,
        reachedEnd,
        completionRate: sessions > 0 ? Math.round((reachedEnd / sessions) * 100) : 0,
        avgPercent,
        avgTimeSeconds: Math.round(avgTimeMs / 1000),
        buckets,
        variants: variantCounts,
      };
    }).sort((a, b) => {
      // Sort by chapter number
      const numA = parseInt(a.slug.replace('ch', '')) || 0;
      const numB = parseInt(b.slug.replace('ch', '')) || 0;
      return numA - numB;
    });

    return new Response(JSON.stringify({ chapters }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch engagement data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
