export const prerender = false;

import type { APIRoute } from 'astro';
import { randomBytes } from 'node:crypto';
import { supabase } from '../../lib/supabase';
import { sendMagicLink } from '../../lib/email';

function jsonResponse(data: object, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Global IP rate limiter: 5 restore requests per 15 minutes per IP
// Prevents Resend quota burn via email enumeration spray
const ipAttempts = new Map<string, { count: number; resetAt: number }>();

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipAttempts.set(ip, { count: 1, resetAt: now + 15 * 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export const POST: APIRoute = async ({ request }) => {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  const { email } = body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return jsonResponse({ error: 'Valid email is required' }, 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Always return success to prevent email enumeration
  const successResponse = () =>
    jsonResponse({ ok: true, message: 'If that email has a purchase, a restore link was sent.' }, 200);

  // Global IP rate limit (checked before any DB work)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!checkIpRateLimit(ip)) return successResponse();

  if (!supabase) return successResponse();

  // Check for purchase
  const { data: purchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('customer_email', normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (!purchase) return successResponse();

  // Per-email rate limit: max 3 per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('magic_links')
    .select('id', { count: 'exact', head: true })
    .eq('customer_email', normalizedEmail)
    .gte('created_at', oneHourAgo);

  if (count && count >= 3) return successResponse();

  // Generate magic token and insert
  const magicToken = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

  const { error: insertErr } = await supabase.from('magic_links').insert({
    customer_email: normalizedEmail,
    token: magicToken,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  });

  if (insertErr) {
    console.error('Magic link insert failed:', insertErr);
    return successResponse();
  }

  // Send email
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || new URL(request.url).host;
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = `${proto}://${host}`;
  console.log('restore-debug', { host, proto, origin, rawUrl: request.url, fwdHost: request.headers.get('x-forwarded-host'), hostHeader: request.headers.get('host') });
  await sendMagicLink(normalizedEmail, magicToken, origin);

  return successResponse();
};
