export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const adminPassword = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return new Response(JSON.stringify({ error: 'ADMIN_PASSWORD not configured' }), { status: 503 });
  }

  try {
    const { password } = await request.json();

    if (password === adminPassword) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }
};
