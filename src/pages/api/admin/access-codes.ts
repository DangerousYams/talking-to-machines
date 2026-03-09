export const prerender = false;

import type { APIRoute } from 'astro';
import { randomBytes } from 'node:crypto';
import { supabase } from '../../../lib/supabase';

function jsonResponse(data: object, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function checkAdminPassword(request: Request): boolean {
  const adminPassword = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const authHeader = request.headers.get('x-admin-password');
  return authHeader === adminPassword;
}

// GET: List all access codes
export const GET: APIRoute = async ({ request }) => {
  if (!checkAdminPassword(request)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  if (!supabase) {
    return jsonResponse({ error: 'Database not configured' }, 503);
  }

  const { data, error } = await supabase
    .from('access_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return jsonResponse({ error: 'Failed to fetch codes' }, 500);
  }

  return jsonResponse({ codes: data || [] }, 200);
};

// POST: Create a new access code
export const POST: APIRoute = async ({ request }) => {
  if (!checkAdminPassword(request)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  if (!supabase) {
    return jsonResponse({ error: 'Database not configured' }, 503);
  }

  let body: { code?: string; maxUses?: number | null; expiresAt?: string | null; note?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  const code = body.code?.trim().toUpperCase() || randomBytes(4).toString('hex').toUpperCase();

  const { data, error } = await supabase
    .from('access_codes')
    .insert({
      code,
      note: body.note || null,
      max_uses: body.maxUses ?? null,
      expires_at: body.expiresAt || null,
      times_used: 0,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return jsonResponse({ error: 'A code with that name already exists' }, 409);
    }
    return jsonResponse({ error: 'Failed to create code' }, 500);
  }

  return jsonResponse({ code: data }, 201);
};

// DELETE: Delete an access code
export const DELETE: APIRoute = async ({ request }) => {
  if (!checkAdminPassword(request)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  if (!supabase) {
    return jsonResponse({ error: 'Database not configured' }, 503);
  }

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  if (!body.id) {
    return jsonResponse({ error: 'id is required' }, 400);
  }

  const { error } = await supabase
    .from('access_codes')
    .delete()
    .eq('id', body.id);

  if (error) {
    return jsonResponse({ error: 'Failed to delete code' }, 500);
  }

  return jsonResponse({ ok: true }, 200);
};
