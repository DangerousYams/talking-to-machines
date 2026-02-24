export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return new Response(
      JSON.stringify({ error: 'Payment system not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const priceId = import.meta.env.STRIPE_PRICE_ID || process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return new Response(
      JSON.stringify({ error: 'Product not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const stripe = new Stripe(stripeKey);
  const origin = request.headers.get('origin')
    || import.meta.env.SITE
    || 'http://localhost:4321';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
      payment_intent_data: {
        metadata: { product: 'ttm-full-access' },
      },
      metadata: { product: 'ttm-full-access' },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Stripe.errors.StripeError
      ? err.message
      : 'Failed to create checkout session';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
