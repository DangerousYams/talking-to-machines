export const prerender = false;

import type { APIRoute } from 'astro';
import { createToken } from '../../lib/access-token';
import { supabase } from '../../lib/supabase';

function jsonResponse(data: object, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Per-IP rate limiter: 10 attempts per 15 minutes
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRedeemRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export const POST: APIRoute = async ({ request }) => {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!checkRedeemRateLimit(ip)) {
    return jsonResponse({ error: 'Too many attempts. Try again later.' }, 429);
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  const { code } = body;
  if (!code || typeof code !== 'string') {
    return jsonResponse({ error: 'code is required' }, 400);
  }

  if (!supabase) {
    return jsonResponse({ error: 'Database not configured' }, 503);
  }

  const normalizedCode = code.trim().toUpperCase();

  // Atomic: increment times_used only if under max_uses (or unlimited)
  const { data: accessCode, error: fetchErr } = await supabase
    .from('access_codes')
    .select('*')
    .eq('code', normalizedCode)
    .maybeSingle();

  if (fetchErr || !accessCode) {
    return jsonResponse({ error: 'Invalid access code' }, 404);
  }

  // Check expiry
  if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
    return jsonResponse({ error: 'This code has expired' }, 410);
  }

  // Check usage limit
  if (accessCode.max_uses !== null && accessCode.times_used >= accessCode.max_uses) {
    return jsonResponse({ error: 'This code has reached its usage limit' }, 410);
  }

  // Atomic increment with race-condition guard
  let updateQuery = supabase
    .from('access_codes')
    .update({ times_used: accessCode.times_used + 1 })
    .eq('id', accessCode.id);

  // Only add usage guard when there's actually a limit
  if (accessCode.max_uses !== null) {
    updateQuery = updateQuery.lt('times_used', accessCode.max_uses);
  }

  const { data: updated, error: updateErr } = await updateQuery
    .select('id')
    .maybeSingle();

  if (updateErr || !updated) {
    return jsonResponse({ error: 'This code has reached its usage limit' }, 410);
  }

  // Create token: code tokens get cid = null (no device tracking, no refresh)
  // 365-day expiry since no refresh is available
  const token = createToken('paid', null, { expiryDays: 365 });
  const payload = JSON.parse(
    Buffer.from(token.split('.')[0], 'base64url').toString(),
  );

  // Record redemption (fire-and-forget)
  const ua = request.headers.get('user-agent') || '';
  supabase.from('code_redemptions').insert({
    code_id: accessCode.id,
    code: normalizedCode,
    token_uid: payload.uid,
    device_name: ua.slice(0, 200),
    redeemed_at: new Date().toISOString(),
  }).then(() => {}).catch(() => {});

  return jsonResponse({
    token,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  }, 200);
};
