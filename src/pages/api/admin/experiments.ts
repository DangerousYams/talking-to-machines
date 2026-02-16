export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async () => {
  if (!supabase) {
    return new Response(JSON.stringify({
      experiments: [{
        id: 'scroll-vs-cards',
        name: 'Scroll vs Cards Format',
        status: 'active',
        variants: [
          { name: 'scroll', assignments: 0, views: 0, interactions: 0 },
          { name: 'cards', assignments: 0, views: 0, interactions: 0 },
        ],
      }],
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Fetch experiment assignments
    const { data: assignments } = await supabase
      .from('experiment_assignments')
      .select('*');

    // Fetch page views to get per-variant view counts
    const { data: pageViews } = await supabase
      .from('page_views')
      .select('variant, session_id');

    // Fetch interactions per variant (join via session)
    const { data: interactions } = await supabase
      .from('widget_interactions')
      .select('session_id');

    const assignmentList = assignments || [];
    const viewsList = pageViews || [];
    const interactionsList = interactions || [];

    // Build variant stats
    const variantAssignments = new Map<string, Set<string>>();
    for (const a of assignmentList) {
      if (!variantAssignments.has(a.variant)) {
        variantAssignments.set(a.variant, new Set());
      }
      variantAssignments.get(a.variant)!.add(a.session_id);
    }

    // Views per variant
    const variantViews = new Map<string, number>();
    for (const v of viewsList) {
      if (v.variant) {
        variantViews.set(v.variant, (variantViews.get(v.variant) || 0) + 1);
      }
    }

    // Interactions per variant (by matching session to variant assignment)
    const sessionVariant = new Map<string, string>();
    for (const a of assignmentList) {
      sessionVariant.set(a.session_id, a.variant);
    }

    const variantInteractions = new Map<string, number>();
    for (const i of interactionsList) {
      const variant = sessionVariant.get(i.session_id);
      if (variant) {
        variantInteractions.set(variant, (variantInteractions.get(variant) || 0) + 1);
      }
    }

    const experiments = [{
      id: 'scroll-vs-cards',
      name: 'Scroll vs Cards Format',
      status: 'active',
      variants: ['scroll', 'cards'].map(name => ({
        name,
        assignments: variantAssignments.get(name)?.size || 0,
        views: variantViews.get(name) || 0,
        interactions: variantInteractions.get(name) || 0,
      })),
    }];

    return new Response(JSON.stringify({ experiments }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch experiments' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  if (!supabase) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status || !['active', 'paused'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { error } = await supabase
      .from('experiments')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to update experiment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
