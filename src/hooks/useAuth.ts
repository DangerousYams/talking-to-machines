import { useState, useEffect, useCallback } from 'react';
import { setAccessToken, clearAccessToken, isPaid as checkIsPaid } from '../lib/auth';

interface UseAuthReturn {
  isPaid: boolean;
  unlock: (token: string) => void;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [paid, setPaid] = useState(() => checkIsPaid());

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
