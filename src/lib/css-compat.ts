/**
 * SSR-safe dvh unit helper.
 *
 * Always returns `vh` during SSR and initial hydration so server/client match.
 * After hydration, returns `dvh` on browsers that support it.
 *
 * The detection is lazy (checked on first client-side call) to avoid the
 * module-level `CSS.supports` check that produces a different value on the
 * server (no `CSS` global → `vh`) vs. the client (`dvh`), causing React
 * hydration warnings.
 */
let _supportsDvh: boolean | null = null;

function supportsDvh(): boolean {
  if (_supportsDvh === null) {
    _supportsDvh =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('height', '1dvh');
  }
  return _supportsDvh;
}

/**
 * Whether React has completed its initial hydration pass.
 * Before this flips to `true`, always return `vh` to match SSR output.
 */
let hydrated = false;

if (typeof window !== 'undefined') {
  // Schedule after the current micro-task queue drains (post-hydration).
  // requestAnimationFrame fires after React's synchronous hydration commit.
  requestAnimationFrame(() => {
    hydrated = true;
  });
}

export function dvhValue(n: number): string {
  if (!hydrated) return `${n}vh`;
  return supportsDvh() ? `${n}dvh` : `${n}vh`;
}
