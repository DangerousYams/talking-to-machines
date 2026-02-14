const TOKEN_KEY = 'ttm_access_token';

interface TokenPayload {
  uid: string;
  tier: 'free' | 'paid';
  iat: number;
  exp: number;
}

/** Read token from localStorage. */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Store a token in localStorage. */
export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  // Notify other tabs / hooks listening
  window.dispatchEvent(new Event('ttm-auth-change'));
}

/** Remove the stored token. */
export function clearAccessToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event('ttm-auth-change'));
}

/**
 * Decode the token payload without verifying signature.
 * Client-side display only — server always re-validates.
 */
export function getTokenPayload(): TokenPayload | null {
  const token = getAccessToken();
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  try {
    // Convert base64url → standard base64 with padding
    let b64 = parts[0].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    const decoded = JSON.parse(atob(b64));
    if (!decoded.uid || !decoded.tier || !decoded.exp) return null;
    return decoded as TokenPayload;
  } catch {
    return null;
  }
}

/** Check if the current user has a valid paid token (client-side check). */
export function isPaid(): boolean {
  const payload = getTokenPayload();
  if (!payload) return false;
  if (payload.tier !== 'paid') return false;
  // Check expiry
  return payload.exp > Math.floor(Date.now() / 1000);
}
