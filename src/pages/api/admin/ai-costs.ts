export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ url }) => {
  const days = parseInt(url.searchParams.get('days') || '7');
  const since = new Date(Date.now() - days * 86400000).toISOString();

  if (!supabase) {
    return new Response(JSON.stringify({
      totalCost: 0,
      totalRequests: 0,
      totalTokens: 0,
      dailyCosts: [],
      byWidget: [],
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data: aiUsage } = await supabase
      .from('ai_usage')
      .select('*')
      .gte('created_at', since);

    const rows = aiUsage || [];

    const totalCost = rows.reduce((sum: number, r: any) => sum + (r.cost_usd || 0), 0);
    const totalRequests = rows.length;
    const totalTokens = rows.reduce((sum: number, r: any) => sum + (r.input_tokens || 0) + (r.output_tokens || 0), 0);

    // Daily costs
    const dailyMap = new Map<string, { cost: number; requests: number }>();
    for (const r of rows) {
      const date = r.created_at.slice(0, 10);
      const entry = dailyMap.get(date) || { cost: 0, requests: 0 };
      entry.cost += r.cost_usd || 0;
      entry.requests++;
      dailyMap.set(date, entry);
    }
    const dailyCosts = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // By widget
    const widgetMap = new Map<string, { requests: number; tokens: number; cost: number }>();
    for (const r of rows) {
      const widget = r.widget_name || 'unknown';
      const entry = widgetMap.get(widget) || { requests: 0, tokens: 0, cost: 0 };
      entry.requests++;
      entry.tokens += (r.input_tokens || 0) + (r.output_tokens || 0);
      entry.cost += r.cost_usd || 0;
      widgetMap.set(widget, entry);
    }
    const byWidget = Array.from(widgetMap.entries())
      .map(([widget, data]) => ({ widget, ...data }))
      .sort((a, b) => b.cost - a.cost);

    return new Response(JSON.stringify({
      totalCost,
      totalRequests,
      totalTokens,
      dailyCosts,
      byWidget,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch AI costs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
