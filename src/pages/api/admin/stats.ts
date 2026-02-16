export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ url }) => {
  const days = parseInt(url.searchParams.get('days') || '7');
  const since = new Date(Date.now() - days * 86400000).toISOString();

  if (!supabase) {
    // Return mock data when Supabase isn't configured
    return new Response(JSON.stringify({
      totalViews: 0,
      uniqueSessions: 0,
      totalInteractions: 0,
      totalAiSpend: 0,
      dailyPageViews: [],
      topChapters: [],
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Fetch page views
    const { data: pageViews } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', since);

    // Fetch widget interactions
    const { data: interactions } = await supabase
      .from('widget_interactions')
      .select('*')
      .gte('created_at', since);

    // Fetch AI usage
    const { data: aiUsage } = await supabase
      .from('ai_usage')
      .select('*')
      .gte('created_at', since);

    const views = pageViews || [];
    const widgetData = interactions || [];
    const aiData = aiUsage || [];

    // Total views
    const totalViews = views.length;

    // Unique sessions
    const uniqueSessions = new Set(views.map((v: any) => v.session_id)).size;

    // Total interactions
    const totalInteractions = widgetData.length;

    // Total AI spend
    const totalAiSpend = aiData.reduce((sum: number, row: any) => sum + (row.cost_usd || 0), 0);

    // Daily page views
    const dailyMap = new Map<string, { count: number; scroll: number; cards: number }>();
    for (const v of views) {
      const date = v.created_at.slice(0, 10);
      const entry = dailyMap.get(date) || { count: 0, scroll: 0, cards: 0 };
      entry.count++;
      if (v.variant === 'scroll') entry.scroll++;
      else if (v.variant === 'cards') entry.cards++;
      dailyMap.set(date, entry);
    }
    const dailyPageViews = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top chapters
    const chapterMap = new Map<string, number>();
    for (const v of views) {
      if (v.chapter_slug) {
        chapterMap.set(v.chapter_slug, (chapterMap.get(v.chapter_slug) || 0) + 1);
      }
    }
    const topChapters = Array.from(chapterMap.entries())
      .map(([chapter, viewCount]) => ({ chapter, views: viewCount }))
      .sort((a, b) => b.views - a.views);

    return new Response(JSON.stringify({
      totalViews,
      uniqueSessions,
      totalInteractions,
      totalAiSpend,
      dailyPageViews,
      topChapters,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
