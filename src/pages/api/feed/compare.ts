export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { computePercentile, generateInsight } from '../../../lib/peer-comparison';
import type { ChallengeType } from '../../../data/challenges';

export const GET: APIRoute = async ({ url }) => {
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const challengeId = url.searchParams.get('challengeId');
  const sessionId = url.searchParams.get('sessionId');

  if (!challengeId) {
    return new Response(JSON.stringify({ error: 'challengeId required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get aggregate
    const { data: aggregate } = await supabase
      .from('challenge_aggregates')
      .select('*')
      .eq('challenge_id', challengeId)
      .maybeSingle();

    if (!aggregate) {
      return new Response(JSON.stringify({
        percentile: 50,
        totalSubmissions: 0,
        distribution: {},
        insight: 'Be the first to complete this challenge!',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If sessionId provided, get user's submission for percentile
    let percentile = 50;
    if (sessionId) {
      const { data: submission } = await supabase
        .from('challenge_submissions')
        .select('time_ms, quality_score')
        .eq('session_id', sessionId)
        .eq('challenge_id', challengeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (submission?.time_ms) {
        percentile = computePercentile(
          submission.time_ms,
          aggregate.response_distribution || {},
          aggregate.total_submissions,
        );
      } else if (submission?.quality_score !== null) {
        percentile = Math.round((submission?.quality_score || 0.5) * 100);
      }
    }

    // Determine challenge type from ID prefix
    const typeMap: Record<string, ChallengeType> = {
      'pf': 'prompt-forge',
      're': 'reverse-engineer',
      'tc': 'taste-curator',
      'trc': 'trust-call',
      'fp': 'first-principles',
      'cs': 'context-surgeon',
      'dd': 'debug-detective',
      'tlc': 'tool-chain',
      'aa': 'agent-architect',
    };
    const prefix = challengeId.split('-')[0];
    const challengeType = typeMap[prefix] || 'prompt-forge';

    const insight = generateInsight(challengeType, percentile);

    return new Response(JSON.stringify({
      percentile,
      totalSubmissions: aggregate.total_submissions,
      distribution: aggregate.response_distribution || {},
      insight,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch comparison data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
