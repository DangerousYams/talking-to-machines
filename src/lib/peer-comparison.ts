import type { ComparisonData, ChallengeType } from '../data/challenges';

/**
 * Compute percentile from aggregates.
 * Uses linear interpolation when exact match isn't in the distribution.
 */
export function computePercentile(
  value: number,
  distribution: Record<string, number>,
  total: number,
): number {
  if (total === 0) return 50;

  // Sort distribution entries by key (numeric value)
  const entries = Object.entries(distribution)
    .map(([k, v]) => [Number(k), v] as [number, number])
    .sort((a, b) => a[0] - b[0]);

  let belowCount = 0;
  for (const [threshold, count] of entries) {
    if (value > threshold) {
      belowCount += count;
    } else {
      break;
    }
  }

  return Math.round((belowCount / total) * 100);
}

/**
 * Generate an insight string based on challenge type and percentile.
 */
export function generateInsight(
  challengeType: ChallengeType,
  percentile: number,
  extraData?: Record<string, unknown>,
): string {
  const high = percentile >= 70;
  const mid = percentile >= 40;

  switch (challengeType) {
    case 'taste-curator':
      if (high) return "Your taste aligns strongly with the expert panel. You've got a sharp eye for quality.";
      if (mid) return "Your picks were reasonable, though the experts saw something different. Taste develops with exposure.";
      return "You and the experts went different directions. That's not wrong — but understanding why they chose differently is the skill.";

    case 'trust-call':
    case 'first-principles':
      if (high) return "Strong critical thinking. You caught what most people miss.";
      if (mid) return "Decent instincts, but there's room to sharpen your reasoning.";
      return "This one trips up a lot of people. The key is slowing down and reasoning from first principles.";

    case 'prompt-forge':
    case 'context-surgeon':
      if (high) return "You completed this faster and more thoroughly than most. Your prompting instincts are strong.";
      if (mid) return "Solid approach. With practice, you'll develop the muscle memory for great prompts.";
      return "This is a skill that improves dramatically with practice. Try the hint next time for a boost.";

    case 'reverse-engineer':
      if (high) return "You can read AI output like a fingerprint. That's a genuinely valuable skill.";
      if (mid) return "Good eye. Reverse-engineering prompts gets easier as you write more of them.";
      return "Prompt-to-output mapping is tricky. The more you practice writing prompts, the better you'll read them.";

    case 'debug-detective':
      if (high) return "Sharp debugging instincts. You spotted the issues that most people overlook.";
      if (mid) return "You caught some bugs but missed others. The subtle ones are where the real skill is.";
      return "Prompt debugging is one of the hardest skills. Each miss teaches you what to look for next time.";

    case 'tool-chain':
      if (high) return "Your workflow design is efficient and logical. You understand how AI tools fit together.";
      if (mid) return "Good pipeline thinking. Consider the data flow between tools — that's where optimization happens.";
      return "Orchestrating tools is complex. Think about what each tool needs as input and what it produces.";

    case 'agent-architect':
      if (high) return "Your agent design shows strong systems thinking. You understand decomposition and tool assignment.";
      if (mid) return "Good architecture. Think about failure modes and what guardrails each step needs.";
      return "Agent design has a lot of moving parts. Focus on clear handoffs between steps — that's where agents break.";

    default:
      if (high) return "Impressive performance! You're building strong AI skills.";
      if (mid) return "Solid work. Keep practicing to sharpen these skills.";
      return "Every challenge you complete builds the skill. Keep going.";
  }
}

/**
 * Update aggregates with a new submission.
 * Returns the updated aggregate values.
 */
export function updateAggregates(
  existing: {
    total_submissions: number;
    avg_quality_score: number | null;
    response_distribution: Record<string, number>;
    time_p50_ms: number | null;
  },
  submission: {
    quality_score?: number;
    time_ms?: number;
    bucket?: string;
  },
) {
  const newTotal = existing.total_submissions + 1;

  // Update average quality score
  let newAvgScore = existing.avg_quality_score;
  if (submission.quality_score !== undefined) {
    const oldSum = (existing.avg_quality_score || 0) * existing.total_submissions;
    newAvgScore = (oldSum + submission.quality_score) / newTotal;
  }

  // Update response distribution
  const newDist = { ...existing.response_distribution };
  if (submission.bucket) {
    newDist[submission.bucket] = (newDist[submission.bucket] || 0) + 1;
  }

  // Simple median approximation for time (just average for now)
  let newTimeP50 = existing.time_p50_ms;
  if (submission.time_ms) {
    if (existing.time_p50_ms === null) {
      newTimeP50 = submission.time_ms;
    } else {
      // Exponential moving average for median approximation
      newTimeP50 = Math.round(existing.time_p50_ms * 0.9 + submission.time_ms * 0.1);
    }
  }

  return {
    total_submissions: newTotal,
    avg_quality_score: newAvgScore,
    response_distribution: newDist,
    time_p50_ms: newTimeP50,
  };
}
