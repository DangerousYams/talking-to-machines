export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

/**
 * Widget interaction ↔ completion correlation.
 *
 * For each chapter, compares completion metrics between sessions that
 * interacted with widgets vs those that didn't.
 */
export const GET: APIRoute = async ({ url }) => {
  const days = parseInt(url.searchParams.get('days') || '7');
  const since = new Date(Date.now() - days * 86400000).toISOString();

  if (!supabase) {
    return new Response(JSON.stringify({ chapters: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Fetch scroll depth data
    const { data: scrollRows } = await supabase
      .from('scroll_depth')
      .select('session_id, chapter_slug, percent_complete, reached_end, time_on_page_ms')
      .gte('created_at', since);

    // Fetch widget interactions (exclude paywall events from correlation)
    const { data: widgetRows } = await supabase
      .from('widget_interactions')
      .select('session_id, chapter_slug, widget_name, action')
      .gte('created_at', since)
      .neq('widget_name', 'paywall');

    const scrollData = scrollRows || [];
    const widgetData = widgetRows || [];

    // Build set of sessions that interacted with widgets per chapter
    const interactedSessions = new Map<string, Set<string>>();
    for (const w of widgetData) {
      const key = w.chapter_slug;
      if (!interactedSessions.has(key)) interactedSessions.set(key, new Set());
      interactedSessions.get(key)!.add(w.session_id);
    }

    // Build per-widget interaction sets per chapter
    const widgetSessions = new Map<string, Map<string, Set<string>>>();
    for (const w of widgetData) {
      if (!widgetSessions.has(w.chapter_slug)) widgetSessions.set(w.chapter_slug, new Map());
      const chMap = widgetSessions.get(w.chapter_slug)!;
      if (!chMap.has(w.widget_name)) chMap.set(w.widget_name, new Set());
      chMap.get(w.widget_name)!.add(w.session_id);
    }

    // Group scroll data by chapter
    const scrollByChapter = new Map<string, typeof scrollData>();
    for (const r of scrollData) {
      const arr = scrollByChapter.get(r.chapter_slug) || [];
      arr.push(r);
      scrollByChapter.set(r.chapter_slug, arr);
    }

    const chapters = Array.from(scrollByChapter.entries()).map(([slug, chapterScroll]) => {
      const interacted = interactedSessions.get(slug) || new Set();

      const withWidget = chapterScroll.filter((r) => interacted.has(r.session_id));
      const withoutWidget = chapterScroll.filter((r) => !interacted.has(r.session_id));

      const avg = (arr: typeof chapterScroll, key: 'percent_complete' | 'time_on_page_ms') =>
        arr.length > 0
          ? Math.round(arr.reduce((s, r) => s + Number(r[key] || 0), 0) / arr.length)
          : 0;

      const completionRate = (arr: typeof chapterScroll) =>
        arr.length > 0
          ? Math.round((arr.filter((r) => r.reached_end).length / arr.length) * 100)
          : 0;

      // Per-widget breakdown
      const chWidgets = widgetSessions.get(slug) || new Map();
      const perWidget = Array.from(chWidgets.entries()).map(([widgetName, sessions]) => {
        const widgetScroll = chapterScroll.filter((r) => sessions.has(r.session_id));
        const nonWidgetScroll = chapterScroll.filter((r) => !sessions.has(r.session_id));
        return {
          widget: widgetName,
          interactedSessions: sessions.size,
          interactedAvgPercent: avg(widgetScroll, 'percent_complete'),
          interactedCompletionRate: completionRate(widgetScroll),
          nonInteractedAvgPercent: avg(nonWidgetScroll, 'percent_complete'),
          nonInteractedCompletionRate: completionRate(nonWidgetScroll),
          lift: avg(widgetScroll, 'percent_complete') - avg(nonWidgetScroll, 'percent_complete'),
        };
      }).sort((a, b) => b.lift - a.lift);

      return {
        slug,
        totalSessions: chapterScroll.length,
        withWidget: {
          sessions: withWidget.length,
          avgPercent: avg(withWidget, 'percent_complete'),
          avgTimeSeconds: Math.round(avg(withWidget, 'time_on_page_ms') / 1000),
          completionRate: completionRate(withWidget),
        },
        withoutWidget: {
          sessions: withoutWidget.length,
          avgPercent: avg(withoutWidget, 'percent_complete'),
          avgTimeSeconds: Math.round(avg(withoutWidget, 'time_on_page_ms') / 1000),
          completionRate: completionRate(withoutWidget),
        },
        perWidget,
      };
    }).sort((a, b) => {
      const numA = parseInt(a.slug.replace('ch', '')) || 0;
      const numB = parseInt(b.slug.replace('ch', '')) || 0;
      return numA - numB;
    });

    return new Response(JSON.stringify({ chapters }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch correlation data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
