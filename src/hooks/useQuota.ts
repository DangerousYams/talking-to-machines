import { useState, useEffect } from 'react';
import { onQuotaChange } from '../lib/claude';

interface UseQuotaReturn {
  remaining: number | null;
  limit: number;
  resetTime: Date | null;
}

export function useQuota(): UseQuotaReturn {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState(30);
  const [resetTime, setResetTime] = useState<Date | null>(null);

  useEffect(() => {
    const unsub = onQuotaChange((r, l, reset) => {
      setRemaining(r);
      setLimit(l);
      setResetTime(new Date(reset));
    });
    return unsub;
  }, []);

  return { remaining, limit, resetTime };
}
