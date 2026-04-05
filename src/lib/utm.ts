/**
 * UTM parameter capture & persistence.
 *
 * On first page load with UTM params, saves them to a cookie (90-day TTL)
 * so attribution survives across pages and sessions.
 * Also captures gclid (Google Ads click ID) for conversion matching.
 */

const UTM_COOKIE = 'ttm_utm';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'] as const;

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

/** Read stored UTM params from cookie. Returns {} if none. */
export function getUtmParams(): UtmParams {
  if (typeof document === 'undefined') return {};
  const match = document.cookie.match(new RegExp(`(?:^|; )${UTM_COOKIE}=([^;]*)`));
  if (!match) return {};
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return {};
  }
}

/** Capture UTM params from the current URL and persist to cookie. First-touch wins — won't overwrite. */
export function captureUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};

  // If we already have stored params, keep them (first-touch attribution)
  const existing = getUtmParams();
  if (Object.keys(existing).length > 0) return existing;

  const url = new URL(window.location.href);
  const params: UtmParams = {};
  for (const key of UTM_KEYS) {
    const val = url.searchParams.get(key);
    if (val) params[key] = val;
  }

  if (Object.keys(params).length === 0) return {};

  // Persist for 90 days
  document.cookie = `${UTM_COOKIE}=${encodeURIComponent(JSON.stringify(params))}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`;
  return params;
}
