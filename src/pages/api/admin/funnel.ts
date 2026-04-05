export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

/**
 * Cross-chapter funnel: shows how sessions flow through chapters.
 *
 * Returns:
 * - chapterCounts: sessions per chapter
 * - transitions: { from, to, count } for consecutive chapter visits
 * - journeyDepth: distribution of how many chapters each session visited
 * - sessionJourneys: (optional, if ?detail=true) per-session chapter lists
 */
export const GET: APIRoute = async ({ url }) => {
  const days = parseInt(url.searchParams.get('days') || '7');
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const paidFilter = url.searchParams.get('paid'); // 'true', 'false', or null (all)
  const detail = url.searchParams.get('detail') === 'true';

  if (!supabase) {
    return new Response(JSON.stringify({ chapterCounts: [], transitions: [], journeyDepth: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    let query = supabase
      .from('scroll_depth')
      .select('session_id, chapter_slug, percent_complete, reached_end, is_paid, created_at')
      .gte('created_at', since);

    if (paidFilter === 'true') query = query.eq('is_paid', true);
    if (paidFilter === 'false') query = query.or('is_paid.eq.false,is_paid.is.null');

    const { data: rows } = await query;
    const records = rows || [];

    // Group by session
    const bySession = new Map<string, typeof records>();
    for (const r of records) {
      const arr = bySession.get(r.session_id) || [];
      arr.push(r);
      bySession.set(r.session_id, arr);
    }

    // Chapter counts: unique sessions per chapter
    const chapterSet = new Map<string, Set<string>>();
    for (const r of records) {
      if (!chapterSet.has(r.chapter_slug)) chapterSet.set(r.chapter_slug, new Set());
      chapterSet.get(r.chapter_slug)!.add(r.session_id);
    }
    const chapterCounts = Array.from(chapterSet.entries())
      .map(([slug, sessions]) => ({ slug, sessions: sessions.size }))
      .sort((a, b) => {
        const numA = parseInt(a.slug.replace('ch', '')) || 0;
        const numB = parseInt(b.slug.replace('ch', '')) || 0;
        return numA - numB;
      });

    // Transitions: for each session, get ordered chapter sequence and count transitions
    const transitionCounts = new Map<string, number>();
    const journeyLengths: number[] = [];
    const sessionJourneys: { session: string; chapters: string[] }[] = [];

    for (const [sessionId, sessionRows] of bySession) {
      // Get unique chapters visited, ordered by chapter number
      const chaptersVisited = [...new Set(sessionRows.map((r) => r.chapter_slug))].sort(
        (a, b) => {
          const numA = parseInt(a.replace('ch', '')) || 0;
          const numB = parseInt(b.replace('ch', '')) || 0;
          return numA - numB;
        },
      );

      journeyLengths.push(chaptersVisited.length);

      if (detail) {
        sessionJourneys.push({ session: sessionId, chapters: chaptersVisited });
      }

      // Count transitions between consecutive chapters
      for (let i = 0; i < chaptersVisited.length - 1; i++) {
        const key = `${chaptersVisited[i]}→${chaptersVisited[i + 1]}`;
        transitionCounts.set(key, (transitionCounts.get(key) || 0) + 1);
      }
    }

    const transitions = Array.from(transitionCounts.entries())
      .map(([key, count]) => {
        const [from, to] = key.split('→');
        return { from, to, count };
      })
      .sort((a, b) => {
        const numA = parseInt(a.from.replace('ch', '')) || 0;
        const numB = parseInt(b.from.replace('ch', '')) || 0;
        return numA - numB;
      });

    // Journey depth distribution: how many chapters per session
    const depthDist = new Map<number, number>();
    for (const len of journeyLengths) {
      depthDist.set(len, (depthDist.get(len) || 0) + 1);
    }
    const journeyDepth = Array.from(depthDist.entries())
      .map(([chapters, count]) => ({ chapters, count }))
      .sort((a, b) => a.chapters - b.chapters);

    const result: Record<string, unknown> = {
      totalSessions: bySession.size,
      chapterCounts,
      transitions,
      journeyDepth,
    };
    if (detail) result.sessionJourneys = sessionJourneys;

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch funnel data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
