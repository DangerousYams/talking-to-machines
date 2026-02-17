import type { Challenge, ChallengeType, ConceptArea } from '../data/challenges';

// Import all challenge content
import { promptForgeChallenges } from '../data/challenge-content/prompt-forge';
import { reverseEngineerChallenges } from '../data/challenge-content/reverse-engineer';
import { tasteCuratorChallenges } from '../data/challenge-content/taste-curator';
import { trustCallChallenges } from '../data/challenge-content/trust-call';
import { firstPrinciplesChallenges } from '../data/challenge-content/first-principles';
import { contextSurgeonChallenges } from '../data/challenge-content/context-surgeon';
import { debugDetectiveChallenges } from '../data/challenge-content/debug-detective';
import { toolChainChallenges } from '../data/challenge-content/tool-chain';
import { agentArchitectChallenges } from '../data/challenge-content/agent-architect';

export const ALL_CHALLENGES: Challenge[] = [
  ...promptForgeChallenges,
  ...reverseEngineerChallenges,
  ...tasteCuratorChallenges,
  ...trustCallChallenges,
  ...firstPrinciplesChallenges,
  ...contextSurgeonChallenges,
  ...debugDetectiveChallenges,
  ...toolChainChallenges,
  ...agentArchitectChallenges,
];

// Low-barrier types that make good first challenges
const STARTER_TYPES: ChallengeType[] = ['prompt-forge', 'taste-curator', 'reverse-engineer'];
// AI-using types (manage API costs by alternating)
const AI_TYPES: ChallengeType[] = ['prompt-forge', 'context-surgeon'];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Build an infinite feed sequence:
 * 1. Start with a low-barrier challenge (Prompt Forge, Taste Curator, or Reverse Engineer)
 * 2. Alternate between AI-using and non-AI challenges
 * 3. Ensure concept area diversity (no 3 of the same area in a row)
 * 4. Never repeat a completed challenge in same session
 */
export function buildFeedQueue(
  completedIds: Set<string>,
  batchSize = 5,
): Challenge[] {
  const available = ALL_CHALLENGES.filter((c) => !completedIds.has(c.id));
  if (available.length === 0) return shuffle(ALL_CHALLENGES).slice(0, batchSize);

  const starters = available.filter((c) => STARTER_TYPES.includes(c.type));
  const nonStarters = available.filter((c) => !STARTER_TYPES.includes(c.type));

  const queue: Challenge[] = [];
  const used = new Set<string>();
  const recentAreas: ConceptArea[] = [];

  function addChallenge(c: Challenge) {
    queue.push(c);
    used.add(c.id);
    recentAreas.push(c.conceptArea);
    if (recentAreas.length > 3) recentAreas.shift();
  }

  // Pick a starter first
  const shuffledStarters = shuffle(starters);
  if (shuffledStarters.length > 0) {
    addChallenge(shuffledStarters[0]);
  }

  // Fill the rest with diversity-weighted selection
  const remaining = shuffle([...shuffledStarters.slice(1), ...nonStarters]);
  let lastUsedAI = starters.length > 0 && AI_TYPES.includes(starters[0]?.type);

  for (const candidate of remaining) {
    if (queue.length >= batchSize) break;
    if (used.has(candidate.id)) continue;

    // Concept area diversity: skip if 2 recent are same area
    const sameAreaCount = recentAreas.filter((a) => a === candidate.conceptArea).length;
    if (sameAreaCount >= 2) continue;

    // Alternate AI usage
    const isAI = AI_TYPES.includes(candidate.type);
    if (isAI && lastUsedAI) continue;

    addChallenge(candidate);
    lastUsedAI = isAI;
  }

  // If we didn't fill the batch (due to diversity constraints), fill with whatever's left
  if (queue.length < batchSize) {
    for (const candidate of remaining) {
      if (queue.length >= batchSize) break;
      if (used.has(candidate.id)) continue;
      addChallenge(candidate);
    }
  }

  return queue;
}

/**
 * Append more challenges to existing queue for infinite scroll
 */
export function appendToFeedQueue(
  currentQueue: Challenge[],
  completedIds: Set<string>,
  batchSize = 5,
): Challenge[] {
  const existingIds = new Set(currentQueue.map((c) => c.id));
  const allExcluded = new Set([...completedIds, ...existingIds]);
  const newBatch = buildFeedQueue(allExcluded, batchSize);
  return [...currentQueue, ...newBatch];
}
