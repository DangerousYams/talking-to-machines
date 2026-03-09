import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  isPaid as checkIsPaid,
  isTokenExpiringSoon,
  getCustomerId,
} from '../lib/auth';

interface UseAuthReturn {
  isPaid: boolean;
  unlock: (token: string) => void;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [paid, setPaid] = useState(() => checkIsPaid());
  const refreshAttempted = useRef(false);

  const refresh = useCallback(() => {
    setPaid(checkIsPaid());
  }, []);

  useEffect(() => {
    const onAuthChange = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'ttm_access_token') refresh();
    };

    window.addEventListener('ttm-auth-change', onAuthChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('ttm-auth-change', onAuthChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  // Auto-refresh: if token is expiring within 7 days, silently swap it
  useEffect(() => {
    if (refreshAttempted.current) return;
    if (!isTokenExpiringSoon(7)) return;
    if (!getCustomerId()) return; // Old anonymous tokens can't refresh

    const token = getAccessToken();
    if (!token) return;

    refreshAttempted.current = true;

    fetch('/api/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (data.token) {
          setAccessToken(data.token);
          setPaid(true);
        }
      })
      .catch(() => {
        // Silent failure — user can manually restore via magic link
      });
  }, []);

  const unlock = useCallback((token: string) => {
    setAccessToken(token);
    // Also refresh immediately in case the event listener hasn't fired yet
    setPaid(checkIsPaid());
  }, []);

  const logout = useCallback(() => {
    clearAccessToken();
    setPaid(false);
  }, []);

  return { isPaid: paid, unlock, logout };
}
