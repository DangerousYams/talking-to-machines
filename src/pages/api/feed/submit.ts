export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { computePercentile, generateInsight, updateAggregates } from '../../../lib/peer-comparison';
import type { ChallengeType, ConceptArea } from '../../../data/challenges';

export const POST: APIRoute = async ({ request }) => {
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: {
    sessionId?: string;
    challengeId?: string;
    challengeType?: ChallengeType;
    conceptArea?: ConceptArea;
    submission?: Record<string, unknown>;
    timeMs?: number;
    usedAi?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { sessionId, challengeId, challengeType, conceptArea, submission, timeMs, usedAi } = body;

  if (!sessionId || !challengeId || !challengeType || !conceptArea || !submission) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Compute a quality score heuristic
  const qualityScore = computeQualityScore(challengeType, submission, timeMs);

  // 1. Insert submission
  try {
    await supabase.from('challenge_submissions').insert({
      session_id: sessionId,
      challenge_id: challengeId,
      challenge_type: challengeType,
      concept_area: conceptArea,
      submission,
      time_ms: timeMs || null,
      used_ai: usedAi || false,
      quality_score: qualityScore,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Continue even if insert fails
  }

  // 2. Get or create aggregate
  let aggregate = {
    total_submissions: 0,
    avg_quality_score: null as number | null,
    response_distribution: {} as Record<string, number>,
    time_p50_ms: null as number | null,
  };

  try {
    const { data } = await supabase
      .from('challenge_aggregates')
      .select('*')
      .eq('challenge_id', challengeId)
      .maybeSingle();

    if (data) {
      aggregate = {
        total_submissions: data.total_submissions,
        avg_quality_score: data.avg_quality_score,
        response_distribution: data.response_distribution || {},
        time_p50_ms: data.time_p50_ms,
      };
    }
  } catch {
    // Will create new
  }

  // 3. Update aggregates
  const timeBucket = timeMs ? String(Math.floor(timeMs / 5000) * 5000) : undefined;
  const updated = updateAggregates(aggregate, {
    quality_score: qualityScore,
    time_ms: timeMs,
    bucket: timeBucket,
  });

  try {
    await supabase
      .from('challenge_aggregates')
      .upsert({
        challenge_id: challengeId,
        ...updated,
        updated_at: new Date().toISOString(),
      });
  } catch {
    // Continue
  }

  // 4. Update session progress
  try {
    const conceptColumn = conceptArea.replace(/-/g, '_');
    const { data: existing } = await supabase
      .from('session_progress')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (existing) {
      const completedIds = existing.completed_ids || [];
      if (!completedIds.includes(challengeId)) {
        completedIds.push(challengeId);
        const updateData: Record<string, unknown> = {
          total_completed: (existing.total_completed || 0) + 1,
          completed_ids: completedIds,
          updated_at: new Date().toISOString(),
        };
        if (conceptColumn in existing) {
          updateData[conceptColumn] = (existing[conceptColumn] || 0) + 1;
        }
        await supabase
          .from('session_progress')
          .update(updateData)
          .eq('session_id', sessionId);
      }
    } else {
      const insertData: Record<string, unknown> = {
        session_id: sessionId,
        total_completed: 1,
        completed_ids: [challengeId],
        updated_at: new Date().toISOString(),
      };
      insertData[conceptColumn] = 1;
      await supabase.from('session_progress').insert(insertData);
    }
  } catch {
    // Continue
  }

  // 5. Compute percentile
  const percentile = timeMs
    ? computePercentile(timeMs, updated.response_distribution, updated.total_submissions)
    : qualityScore !== null
      ? Math.round(qualityScore * 100)
      : 50;

  const insight = generateInsight(challengeType as ChallengeType, percentile);

  return new Response(JSON.stringify({
    percentile,
    totalSubmissions: updated.total_submissions,
    distribution: updated.response_distribution,
    insight,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

function computeQualityScore(
  type: string,
  submission: Record<string, unknown>,
  timeMs?: number,
): number | null {
  switch (type) {
    case 'reverse-engineer':
    case 'first-principles':
    case 'trust-call':
      return submission.isCorrect ? 1 : 0;

    case 'taste-curator':
      return submission.matchesExpert ? 1 : 0.5;

    case 'debug-detective':
      return typeof submission.score === 'number' ? submission.score : null;

    case 'tool-chain':
    case 'agent-architect':
      return typeof submission.score === 'number' ? submission.score : null;

    case 'prompt-forge':
    case 'context-surgeon': {
      // Score based on criteria matched and time
      const criteria = submission.criteriaMatched as number | undefined;
      const total = submission.totalCriteria as number | undefined;
      if (criteria !== undefined && total) {
        return criteria / total;
      }
      return null;
    }

    default:
      return null;
  }
}
