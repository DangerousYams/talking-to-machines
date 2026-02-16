import { useState, useEffect, useSyncExternalStore } from 'react';

export type ChapterMode = 'read' | 'speed-run' | 'listen';

// ─── Module-level store (shared across all React islands) ───
let currentMode: ChapterMode = 'read';
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

function getSnapshot(): ChapterMode {
  return currentMode;
}

function getServerSnapshot(): ChapterMode {
  return 'read';
}

export function setChapterMode(mode: ChapterMode) {
  if (currentMode === mode) return;
  currentMode = mode;
  listeners.forEach((cb) => cb());
}

// ─── React hook (works in any island, no context provider needed) ───
export function useChapterMode() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { mode, setMode: setChapterMode };
}
