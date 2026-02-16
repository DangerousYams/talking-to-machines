// Route map for scroll-vs-cards experiment
export const CHAPTER_ROUTES: Record<string, { scroll: string; cards: string }> = {
  ch1: { scroll: '/ch1', cards: '/ch1-cards' },
  ch2: { scroll: '/ch2', cards: '/ch2-cards' },
  ch3: { scroll: '/ch3', cards: '/ch3-cards' },
  ch4: { scroll: '/ch4', cards: '/ch4-cards' },
  ch5: { scroll: '/ch5', cards: '/ch5-cards' },
  ch6: { scroll: '/ch6', cards: '/ch6-cards' },
  ch7: { scroll: '/ch7', cards: '/ch7-cards' },
  ch8: { scroll: '/ch8', cards: '/ch8-cards' },
  ch9: { scroll: '/ch9', cards: '/ch9-cards' },
  ch10: { scroll: '/ch10', cards: '/ch10-cards' },
  ch11: { scroll: '/ch11', cards: '/ch11-cards' },
};

export interface Experiment {
  id: string;
  name: string;
  variants: string[];
  weights: number[];
  status: 'active' | 'paused';
}

export const ACTIVE_EXPERIMENTS: Experiment[] = [
  {
    id: 'scroll-vs-cards',
    name: 'Scroll vs Cards Format',
    variants: ['scroll', 'cards'],
    weights: [0.5, 0.5],
    status: 'active',
  },
];

// Deterministic hash-based assignment
export function hashAssign(sessionId: string, experimentId: string, weights: number[]): number {
  const str = `${experimentId}:${sessionId}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const normalized = (Math.abs(hash) % 10000) / 10000;

  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (normalized < cumulative) return i;
  }
  return weights.length - 1;
}

export function getOrAssignVariant(experimentId: string, sessionId: string): string {
  const experiment = ACTIVE_EXPERIMENTS.find((e) => e.id === experimentId);
  if (!experiment || experiment.status !== 'active') return 'scroll'; // default

  const idx = hashAssign(sessionId, experimentId, experiment.weights);
  return experiment.variants[idx];
}

// Cookie helpers
export function getSessionIdFromCookie(cookieHeader: string): string | null {
  const match = cookieHeader.match(/(?:^|; )ab_session=([^;]*)/);
  return match ? match[1] : null;
}

export function getVariantFromCookie(cookieHeader: string, experimentId: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|; )ab_${experimentId}=([^;]*)`));
  return match ? match[1] : null;
}

// Extract chapter slug from URL path like /ch3 or /ch3-cards
export function getChapterFromPath(path: string): string | null {
  const match = path.match(/^\/(ch\d+)(?:-cards)?$/);
  return match ? match[1] : null;
}

// Determine if path is scroll or cards variant
export function getPathVariant(path: string): 'scroll' | 'cards' | null {
  if (/^\/ch\d+-cards$/.test(path)) return 'cards';
  if (/^\/ch\d+$/.test(path)) return 'scroll';
  return null;
}
