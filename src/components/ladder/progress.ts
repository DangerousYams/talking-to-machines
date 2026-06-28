import type { LevelId } from '../../data/ladder';

export interface CardResult {
  done: boolean;
  score?: number;
  total?: number;
  at: number;
}

export interface LadderProgress {
  v: 1;
  placedLevel: LevelId | null;
  quizTotal: number | null;
  earnedLevels: LevelId[];
  cards: Record<string, CardResult>;
  startedAt: number;
}

const KEY = 'ttm-ladder-v1';

export function freshProgress(): LadderProgress {
  return { v: 1, placedLevel: null, quizTotal: null, earnedLevels: [], cards: {}, startedAt: Date.now() };
}

export function loadProgress(): LadderProgress {
  if (typeof window === 'undefined') return freshProgress();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return freshProgress();
    const parsed = JSON.parse(raw) as LadderProgress;
    if (parsed?.v !== 1) return freshProgress();
    return parsed;
  } catch {
    return freshProgress();
  }
}

export function saveProgress(p: LadderProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Storage full or blocked — progress just won't persist
  }
}

export function resetProgress(): LadderProgress {
  const p = freshProgress();
  saveProgress(p);
  return p;
}
