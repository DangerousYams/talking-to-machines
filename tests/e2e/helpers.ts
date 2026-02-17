import type { Page } from '@playwright/test';

/** Known console errors that are safe to ignore (e.g. missing env vars in dev) */
const BENIGN_PATTERNS = [
  'Database not configured',
  'Failed to fetch',
  'supabase',
  'SUPABASE',
  'KV_REST',
  'net::ERR_',
  'favicon',
  'the server responded with a status of 503',
  'Vite',
  'HMR',
  '[vite]',
  'Download the React DevTools',
  'jsxDEV is not a function',
];

export interface CollectedError {
  type: 'console' | 'pageerror';
  text: string;
}

/**
 * Attach listeners that accumulate console.error and uncaught exceptions.
 * Call **before** navigating.  Returns the mutable array of errors.
 */
export function collectErrors(page: Page): CollectedError[] {
  const errors: CollectedError[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push({ type: 'console', text: msg.text() });
    }
  });

  page.on('pageerror', (err) => {
    errors.push({ type: 'pageerror', text: err.message });
  });

  return errors;
}

/** Strip known-harmless errors so assertions focus on real regressions. */
export function filterBenignErrors(errors: CollectedError[]): CollectedError[] {
  return errors.filter(
    (e) => !BENIGN_PATTERNS.some((p) => e.text.toLowerCase().includes(p.toLowerCase())),
  );
}

/** iPhone 15 Pro user-agent string for middleware tests */
export const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

/** All routes that should load without error (excludes auth-gated pages) */
export const ALL_ROUTES = [
  '/',
  '/feed',
  '/profile',
  '/practice',
  '/tools',
  '/lab',
  '/ch1',
  '/ch1-cards',
  '/ch2',
  '/ch2-cards',
  '/ch3',
  '/ch3-cards',
  '/ch4',
  '/ch4-cards',
  '/ch5',
  '/ch5-cards',
  '/ch6',
  '/ch6-cards',
  '/ch7',
  '/ch7-cards',
  '/ch8',
  '/ch8-cards',
  '/ch9',
  '/ch9-cards',
  '/ch10',
  '/ch10-cards',
  '/ch11',
  '/ch11-cards',
];
