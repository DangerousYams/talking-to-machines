export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return new Response('Webhook not configured', { status: 503 });
  }

  const stripe = new Stripe(stripeKey);

  // Signature verification requires raw body (not parsed JSON)
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signature verification failed';
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === 'paid') {
      await recordPurchase(session);
    }
  }

  if (event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;
    await recordPurchase(session);
  }

  // Always return 200 to acknowledge receipt
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

async function recordPurchase(session: Stripe.Checkout.Session) {
  if (!supabase) return;

  try {
    const { data: existing } = await supabase
      .from('purchases')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('purchases')
        .update({ webhook_confirmed: true, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase.from('purchases').insert({
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent as string,
        customer_email: session.customer_details?.email || null,
        amount_cents: session.amount_total,
        currency: session.currency,
        token_uid: null,
        token_expires_at: null,
        source: 'webhook',
        webhook_confirmed: true,
        created_at: new Date().toISOString(),
      });
    }
  } catch {
    console.error('Failed to record purchase from webhook');
  }
}
