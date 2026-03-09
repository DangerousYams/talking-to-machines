export const prerender = false;

import type { APIRoute } from 'astro';
import { validateToken, createToken } from '../../lib/access-token';
import { registerDevice, removeDevice, getActiveDevices } from '../../lib/devices';
import { supabase } from '../../lib/supabase';

function jsonResponse(data: object, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  const { token } = body;
  if (!token || typeof token !== 'string') {
    return jsonResponse({ error: 'token is required' }, 400);
  }

  // Validate signature but allow expired tokens
  const payload = validateToken(token, { ignoreExpiry: true });
  if (!payload) {
    return jsonResponse({ error: 'Invalid token' }, 401);
  }

  if (!payload.cid) {
    return jsonResponse({ error: 'Token cannot be refreshed (no customer ID)' }, 403);
  }

  // Verify purchase exists for this customer
  if (!supabase) {
    return jsonResponse({ error: 'Database not configured' }, 503);
  }

  const { data: purchase } = await supabase
    .from('purchases')
    .select('id, customer_email')
    .eq('cid', payload.cid)
    .limit(1)
    .maybeSingle();

  if (!purchase) {
    return jsonResponse({ error: 'No purchase found' }, 403);
  }

  const ua = request.headers.get('user-agent') || '';

  // Create new token
  const newToken = createToken('paid', payload.cid);
  const newPayload = JSON.parse(
    Buffer.from(newToken.split('.')[0], 'base64url').toString(),
  );

  // Swap device: remove old token_uid, register new one
  // First find old device row
  const devices = await getActiveDevices(payload.cid);
  const oldDevice = devices.find((d) => d.token_uid === payload.uid);
  if (oldDevice) {
    await removeDevice(payload.cid, oldDevice.id);
  }

  // Register new device
  await registerDevice(
    payload.cid,
    purchase.customer_email,
    newPayload.uid,
    ua,
  );

  return jsonResponse({
    token: newToken,
    expiresAt: new Date(newPayload.exp * 1000).toISOString(),
  }, 200);
};
