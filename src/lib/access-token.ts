import { createHash, createHmac, randomBytes } from 'node:crypto';

export interface TokenPayload {
  uid: string;
  tier: 'free' | 'paid';
  cid: string | null;
  iat: number;
  exp: number;
}

const DEV_SECRET = 'ttm-local-dev-secret-do-not-use-in-production';

function getSecret(): string {
  const secret = import.meta.env.ACCESS_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    if (import.meta.env.PROD) throw new Error('ACCESS_TOKEN_SECRET is not set');
    return DEV_SECRET;
  }
  return secret;
}

function sign(data: string): string {
  return createHmac('sha256', getSecret()).update(data).digest('hex');
}

function toBase64(obj: object): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function fromBase64(str: string): unknown {
  return JSON.parse(Buffer.from(str, 'base64url').toString());
}

/**
 * Compute a privacy-preserving customer ID from an email address.
 */
export function computeCustomerId(email: string): string {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

/**
 * Create a signed access token.
 * Default expiry: 30 days for paid, 1 day for free, 365 days for code-redeemed.
 */
export function createToken(
  tier: 'free' | 'paid',
  cid?: string | null,
  options?: { expiryDays?: number },
): string {
  const now = Math.floor(Date.now() / 1000);
  const defaultDays = tier === 'paid' ? 30 : 1;
  const expiryDays = options?.expiryDays ?? defaultDays;
  const payload: TokenPayload = {
    uid: randomBytes(16).toString('hex'),
    tier,
    cid: cid ?? null,
    iat: now,
    exp: now + expiryDays * 86400,
  };
  const encoded = toBase64(payload);
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

/**
 * Validate a token and return the payload, or null if invalid/expired.
 * Pass `ignoreExpiry: true` to skip the expiry check (used for token refresh).
 */
export function validateToken(
  token: string,
  options?: { ignoreExpiry?: boolean },
): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encoded, signature] = parts;
  const expected = sign(encoded);

  // Constant-time comparison
  if (signature.length !== expected.length) return null;
  let mismatch = 0;
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) return null;

  try {
    const payload = fromBase64(encoded) as TokenPayload;
    if (!payload.uid || !payload.tier || !payload.exp) return null;
    // Backward compat: old tokens without cid get null
    if (payload.cid === undefined) payload.cid = null;
    if (!options?.ignoreExpiry && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
