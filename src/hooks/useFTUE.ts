import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'ttm_ftue_dismissed';

export function useFTUE(key: string) {
  // Start true (suppressed) to match SSR; useEffect flips to false on client
  const [seen, setSeen] = useState(true);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (!data[key]) setSeen(false);
    } catch {
      setSeen(false);
    }
  }, [key]);

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
