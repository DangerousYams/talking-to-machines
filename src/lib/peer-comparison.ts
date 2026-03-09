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
    case 'snap-judgment':
      if (high) return "Sharp BS detector. You don't fall for plausible-sounding nonsense.";
      if (mid) return "Decent instincts, but some of those fakes are tricky. The best defense is healthy skepticism.";
      return "Those fakes are designed to fool you — and they did. The more you verify, the better your radar gets.";

    case 'taste-off':
      if (high) return "Great taste. You and the experts see things the same way.";
      if (mid) return "Solid eye. Your picks were reasonable — the experts just weighed things a bit differently.";
      return "Interesting choices. Taste is a muscle — the more you compare, the sharper it gets.";

    case 'speed-prompt':
      if (high) return "Fast and precise. You write prompts under pressure like a pro.";
      if (mid) return "Good instincts. With more practice, your prompts will get specific even faster.";
      return "Time pressure is brutal. The key: specificity over length. One clear detail beats three vague sentences.";

    case 'odd-one-out':
      if (high) return "Pattern spotter. You see the connections others miss.";
      if (mid) return "Good eye for categories. The trickier ones test deeper conceptual understanding.";
      return "These patterns are subtle. Knowing the conceptual boundaries between AI concepts takes time — and you're building it.";

    case 'detective':
      if (high) return "Natural debugger. You spotted the prompt flaw instantly.";
      if (mid) return "Decent diagnosis. Prompt bugs are like code bugs — they get easier to spot with practice.";
      return "Tricky one! Prompt bugs are sneaky because the output looks wrong, but the real problem is upstream in the prompt.";

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
