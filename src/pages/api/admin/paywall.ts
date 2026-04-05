export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

/**
 * Paywall conversion funnel.
 *
 * Returns how many sessions saw the paywall, clicked checkout, and converted,
 * broken down by chapter and conversion method.
 */
export const GET: APIRoute = async ({ url }) => {
  const days = parseInt(url.searchParams.get('days') || '7');
  const since = new Date(Date.now() - days * 86400000).toISOString();

  if (!supabase) {
    return new Response(JSON.stringify({ total: {}, byChapter: [], daily: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data: rows } = await supabase
      .from('widget_interactions')
      .select('session_id, chapter_slug, action, metadata, created_at')
      .eq('widget_name', 'paywall')
      .gte('created_at', since);

    const records = rows || [];

    // Total funnel
    const shownSessions = new Set<string>();
    const clickedSessions = new Set<string>();
    const convertedSessions = new Set<string>();
    const conversionMethods: Record<string, number> = {};

    for (const r of records) {
      if (r.action === 'shown') shownSessions.add(r.session_id);
      if (r.action === 'checkout_clicked') clickedSessions.add(r.session_id);
      if (r.action === 'converted') {
        convertedSessions.add(r.session_id);
        const method = (r.metadata as any)?.method || 'unknown';
        conversionMethods[method] = (conversionMethods[method] || 0) + 1;
      }
    }

    const total = {
      shown: shownSessions.size,
      clicked: clickedSessions.size,
      converted: convertedSessions.size,
      clickRate: shownSessions.size > 0 ? Math.round((clickedSessions.size / shownSessions.size) * 100) : 0,
      conversionRate: shownSessions.size > 0 ? Math.round((convertedSessions.size / shownSessions.size) * 100) : 0,
      methods: conversionMethods,
    };

    // By chapter
    const byChapterMap = new Map<string, { shown: Set<string>; clicked: Set<string>; converted: Set<string> }>();
    for (const r of records) {
      if (!byChapterMap.has(r.chapter_slug)) {
        byChapterMap.set(r.chapter_slug, { shown: new Set(), clicked: new Set(), converted: new Set() });
      }
      const ch = byChapterMap.get(r.chapter_slug)!;
      if (r.action === 'shown') ch.shown.add(r.session_id);
      if (r.action === 'checkout_clicked') ch.clicked.add(r.session_id);
      if (r.action === 'converted') ch.converted.add(r.session_id);
    }

    const byChapter = Array.from(byChapterMap.entries())
      .map(([slug, data]) => ({
        slug,
        shown: data.shown.size,
        clicked: data.clicked.size,
        converted: data.converted.size,
        clickRate: data.shown.size > 0 ? Math.round((data.clicked.size / data.shown.size) * 100) : 0,
        conversionRate: data.shown.size > 0 ? Math.round((data.converted.size / data.shown.size) * 100) : 0,
      }))
      .sort((a, b) => {
        const numA = parseInt(a.slug.replace('ch', '')) || 0;
        const numB = parseInt(b.slug.replace('ch', '')) || 0;
        return numA - numB;
      });

    // Daily trend
    const dailyMap = new Map<string, { shown: Set<string>; converted: Set<string> }>();
    for (const r of records) {
      const date = r.created_at.slice(0, 10);
      if (!dailyMap.has(date)) dailyMap.set(date, { shown: new Set(), converted: new Set() });
      const day = dailyMap.get(date)!;
      if (r.action === 'shown') day.shown.add(r.session_id);
      if (r.action === 'converted') day.converted.add(r.session_id);
    }

    const daily = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        shown: data.shown.size,
        converted: data.converted.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return new Response(JSON.stringify({ total, byChapter, daily }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch paywall data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
