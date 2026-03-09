export const prerender = false;

import type { APIRoute } from 'astro';
import { validateToken } from '../../lib/access-token';
import { getActiveDevices, removeDevice } from '../../lib/devices';

function jsonResponse(data: object, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const payload = token ? validateToken(token) : null;

  if (!payload || !payload.cid) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const devices = await getActiveDevices(payload.cid);
  return jsonResponse({ devices }, 200);
};

export const DELETE: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const payload = token ? validateToken(token) : null;

  if (!payload || !payload.cid) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let body: { deviceId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  if (!body.deviceId || typeof body.deviceId !== 'string') {
    return jsonResponse({ error: 'deviceId is required' }, 400);
  }

  const ok = await removeDevice(payload.cid, body.deviceId);
  if (!ok) {
    return jsonResponse({ error: 'Failed to remove device' }, 500);
  }

  return jsonResponse({ ok: true }, 200);
};
