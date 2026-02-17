import { useState, useEffect, useRef } from 'react';

/**
 * URL param overrides (bypass media query entirely):
 *   ?mobile       → force mobile mode
 *   ?desktop      → force desktop mode
 */
function getForceFlag(): boolean | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  if (params.has('mobile')) return true;
  if (params.has('desktop')) return false;
  return null;
}

/**
 * useIsMobile — SSR-safe responsive breakpoint hook.
 *
 * Always starts `false` to match server-rendered HTML (no hydration mismatch).
 * Updates to the real value in useEffect after hydration.
 * Debounces subsequent matchMedia changes by 150ms.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const forced = getForceFlag();
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);

    // Sync to real value after hydration
    setIsMobile(forced !== null ? forced : mql.matches);

    // If forced, no need to listen for changes
    if (forced !== null) return;

    const handler = (e: MediaQueryListEvent) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsMobile(e.matches), 150);
    };

    mql.addEventListener('change', handler);
    return () => {
      mql.removeEventListener('change', handler);
      clearTimeout(timeoutRef.current);
    };
  }, [breakpoint]);

  return isMobile;
}
