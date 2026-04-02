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
  'Hydration',
  'hydrat',
  'MISSING_CHUNK',
  'unique "key" prop',
  'Check the render method',
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

/** All public routes that should load without error */
export const ALL_ROUTES = [
  '/',
  '/ch1',
  '/ch2',
  '/ch3',
  '/ch4',
  '/ch5',
  '/ch6',
  '/ch7',
  '/ch8',
  '/ch9',
  '/ch10',
  '/ch11',
  '/absolutely-youre-right',
  '/field-guide',
  '/toolbox',
  '/course',
  '/tools',
  '/playbook',
  '/personalize',
  '/success',
  '/restore',
];

/** Chapter metadata for widget/break tests */
export const CHAPTERS = [
  { num: 1,  slug: 'ch1',  widget: 'PromptMakeover',              breakName: 'Prompt Roast' },
  { num: 2,  slug: 'ch2',  widget: 'FlipTheScript',               breakName: 'Socratic Smackdown' },
  { num: 3,  slug: 'ch3',  widget: 'ContextWindowViz',            breakName: 'Vibe Check' },
  { num: 4,  slug: 'ch4',  widget: 'ToolWall',                    breakName: 'Dream Project' },
  { num: 5,  slug: 'ch5',  widget: 'TrustThermometer',            breakName: 'Would You Let It?' },
  { num: 6,  slug: 'ch6',  widget: 'AgentBlueprint',              breakName: 'Agent Swarm' },
  { num: 7,  slug: 'ch7',  widget: 'WhatWouldYouBuild',           breakName: 'Ship It' },
  { num: 8,  slug: 'ch8',  widget: 'StackDecoder',                breakName: 'Complexity Score' },
  { num: 9,  slug: 'ch9',  widget: 'DebugDetective',              breakName: 'Eval Framework' },
  { num: 10, slug: 'ch10', widget: 'TasteTest',                   breakName: 'Irreplaceable You' },
  { num: 11, slug: 'ch11', widget: 'ProjectInstructionsBuilder',   breakName: null },
];
