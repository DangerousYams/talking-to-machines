import { useState, useCallback } from 'react';

const STORAGE_KEY = 'ttm_ftue_dismissed';

export function useFTUE(key: string) {
  const [seen, setSeen] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return !!data[key];
    } catch {
      return false;
    }
  });

  const markSeen = useCallback(() => {
    setSeen(true);
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      data[key] = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [key]);

  return { seen, markSeen };
}
