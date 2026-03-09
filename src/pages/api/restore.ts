export const prerender = false;

import type { APIRoute } from 'astro';
import { createToken, computeCustomerId } from '../../lib/access-token';
import { registerDevice, getActiveDevices } from '../../lib/devices';
import { supabase } from '../../lib/supabase';

function jsonResponse(data: object, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: { magicToken?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  const { magicToken } = body;
  if (!magicToken || typeof magicToken !== 'string') {
    return jsonResponse({ error: 'magicToken is required' }, 400);
  }

  if (!supabase) {
    return jsonResponse({ error: 'Database not configured' }, 503);
  }

  // Look up magic link
  const { data: link } = await supabase
    .from('magic_links')
    .select('*')
    .eq('token', magicToken)
    .maybeSingle();

  if (!link) {
    return jsonResponse({ error: 'Invalid or expired link' }, 404);
  }

  // Check if expired
  if (new Date(link.expires_at) < new Date()) {
    return jsonResponse({ error: 'This link has expired. Please request a new one.' }, 410);
  }

  // Check if already used
  if (link.used_at) {
    return jsonResponse({ error: 'This link has already been used.' }, 410);
  }

  const email = link.customer_email;
  const cid = computeCustomerId(email);
  const ua = request.headers.get('user-agent') || '';

  // Check device limit BEFORE marking link as used — don't burn the link
  const existingDevices = await getActiveDevices(cid);
  if (existingDevices.length >= 5) {
    return jsonResponse({
      error: 'device_limit',
      message: 'You have reached the maximum of 5 devices.',
      devices: existingDevices,
    }, 409);
  }

  // Mark as used only after device check passes
  await supabase
    .from('magic_links')
    .update({ used_at: new Date().toISOString() })
    .eq('id', link.id);

  // Create token
  const token = createToken('paid', cid);
  const payload = JSON.parse(
    Buffer.from(token.split('.')[0], 'base64url').toString(),
  );

  // Register device
  await registerDevice(cid, email, payload.uid, ua);

  return jsonResponse({
    token,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  }, 200);
};
