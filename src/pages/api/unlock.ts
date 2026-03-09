export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { createToken, computeCustomerId } from '../../lib/access-token';
import { registerDevice } from '../../lib/devices';
import { supabase } from '../../lib/supabase';

function jsonResponse(data: object, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: { session_id?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  const { session_id } = body;
  if (!session_id || typeof session_id !== 'string') {
    return jsonResponse({ error: 'session_id is required' }, 400);
  }

  const stripeKey = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return jsonResponse({ error: 'Payment system not configured' }, 503);
  }

  const stripe = new Stripe(stripeKey);

  try {
    // Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return jsonResponse({ error: 'Payment not completed' }, 402);
    }

    const email = session.customer_details?.email || null;
    const cid = email ? computeCustomerId(email) : null;
    const ua = request.headers.get('user-agent') || '';

    // Idempotency: check if already redeemed
    if (supabase) {
      const { data: existing } = await supabase
        .from('purchases')
        .select('id')
        .eq('stripe_session_id', session_id)
        .maybeSingle();

      if (existing) {
        // Already recorded — still generate a fresh token (user may have
        // cleared localStorage) but don't insert a duplicate row
        const token = createToken('paid', cid);
        const payload = JSON.parse(
          Buffer.from(token.split('.')[0], 'base64url').toString(),
        );
        // Register device (fire-and-forget, ignore limit for re-redeem)
        if (cid && email) {
          registerDevice(cid, email, payload.uid, ua).catch(() => {});
        }
        return jsonResponse({
          token,
          expiresAt: new Date(payload.exp * 1000).toISOString(),
        }, 200);
      }
    }

    // Generate paid access token
    const token = createToken('paid', cid);
    const payload = JSON.parse(
      Buffer.from(token.split('.')[0], 'base64url').toString(),
    );

    // Record purchase (fire-and-forget)
    if (supabase) {
      supabase.from('purchases').insert({
        stripe_session_id: session_id,
        stripe_payment_intent: session.payment_intent as string,
        customer_email: email,
        cid,
        amount_cents: session.amount_total,
        currency: session.currency,
        token_uid: payload.uid,
        token_expires_at: new Date(payload.exp * 1000).toISOString(),
        source: 'redirect',
        created_at: new Date().toISOString(),
      }).then(() => {}).catch(() => {});
    }

    // Register device (fire-and-forget)
    if (cid && email) {
      registerDevice(cid, email, payload.uid, ua).catch(() => {});
    }

    return jsonResponse({
      token,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    }, 200);
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      return jsonResponse({ error: 'Invalid payment session' }, 400);
    }
    return jsonResponse({ error: 'Failed to verify payment' }, 500);
  }
};
