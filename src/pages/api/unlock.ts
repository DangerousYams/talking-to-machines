export const prerender = false;

import type { APIRoute } from 'astro';
import { createToken } from '../../lib/access-token';

/**
 * POST /api/unlock
 * Placeholder unlock endpoint. Generates a paid token without payment validation.
 * Stripe integration will replace this later.
 */
export const POST: APIRoute = async () => {
  try {
    const token = createToken('paid');

    // Decode to get expiry for the response
    const payload = JSON.parse(
      Buffer.from(token.split('.')[0], 'base64url').toString()
    );

    return new Response(
      JSON.stringify({ token, expiresAt: new Date(payload.exp * 1000).toISOString() }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate access token' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
