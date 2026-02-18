export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ url }) => {
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'sessionId required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data } = await supabase
      .from('session_progress')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (!data) {
      return new Response(JSON.stringify({
        total_completed: 0,
        completed_ids: [],
        prompt_craft: 0,
        context_engineering: 0,
        tool_landscape: 0,
        tool_use: 0,
        agent_design: 0,
        coding_with_ai: 0,
        critical_thinking: 0,
        human_judgment: 0,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch progress' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
