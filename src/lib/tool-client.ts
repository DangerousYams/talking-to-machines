// Stable per-device client id for the open Cultivated AI tools.
// Used to key the free daily AI quota so a whole workshop room on one
// Wi-Fi network does not share a single per-IP allowance.

const CLIENT_ID_KEY = 'cai-tool-uid';

export function getToolClientId(): string {
  if (typeof localStorage === 'undefined') return 'ssr';
  try {
    const existing = localStorage.getItem(CLIENT_ID_KEY);
    if (existing && /^[a-z0-9-]{8,64}$/i.test(existing)) return existing;
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(CLIENT_ID_KEY, id);
    return id;
  } catch {
    return 'no-storage';
  }
}
