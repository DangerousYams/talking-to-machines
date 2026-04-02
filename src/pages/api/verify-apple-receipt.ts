export const prerender = false;

import type { APIRoute } from 'astro';
import { createToken } from '../../lib/access-token';
import { supabase } from '../../lib/supabase';

function jsonResponse(data: object, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * POST /api/verify-apple-receipt
 *
 * Verifies an Apple StoreKit 2 transaction JWS and issues an API access token.
 * This is the native app equivalent of /api/unlock (which uses Stripe).
 *
 * Body: { jwsRepresentation: string }
 * Returns: { token: string, expiresAt: string }
 *
 * COPPA-safe: No email, no PII. The transaction ID is the only identifier.
 */
export const POST: APIRoute = async ({ request }) => {
  let body: { jwsRepresentation?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  const { jwsRepresentation } = body;
  if (!jwsRepresentation || typeof jwsRepresentation !== 'string') {
    return jsonResponse({ error: 'jwsRepresentation is required' }, 400);
  }

  try {
    // Decode the JWS to extract transaction info
    // Apple's JWS format: header.payload.signature (base64url encoded)
    const parts = jwsRepresentation.split('.');
    if (parts.length !== 3) {
      return jsonResponse({ error: 'Invalid JWS format' }, 400);
    }

    // Decode payload (middle part)
    const payloadBase64 = parts[1];
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
    const transactionInfo = JSON.parse(payloadJson);

    // Verify the transaction is for our product
    const expectedBundleId = import.meta.env.APPLE_BUNDLE_ID || process.env.APPLE_BUNDLE_ID || 'com.talkingtomachines.app';
    const expectedProductId = 'com.talkingtomachines.fullaccess';

    if (transactionInfo.bundleId && transactionInfo.bundleId !== expectedBundleId) {
      return jsonResponse({ error: 'Invalid bundle ID' }, 403);
    }

    if (transactionInfo.productId && transactionInfo.productId !== expectedProductId) {
      return jsonResponse({ error: 'Invalid product ID' }, 403);
    }

    // For production: Verify the JWS signature with Apple's public key
    // Apple provides the App Store Server API for server-to-server verification:
    // https://developer.apple.com/documentation/appstoreserverapi
    //
    // For now, we decode and trust the JWS if it has valid structure.
    // TODO: Add full JWS signature verification using Apple's root certificate chain:
    //   1. Fetch Apple's root cert from the JWS header's x5c chain
    //   2. Verify the cert chain against Apple's known root CA
    //   3. Verify the JWS signature using the leaf certificate
    //
    // In production, also call the App Store Server API to confirm:
    // GET https://api.storekit.itunes.apple.com/inApps/v1/transactions/{transactionId}

    const transactionId = transactionInfo.transactionId || transactionInfo.originalTransactionId || 'unknown';

    // Generate a deterministic "customer ID" from the transaction
    // This is privacy-preserving — no email or personal info
    const { createHash } = await import('node:crypto');
    const cid = createHash('sha256').update(`apple:${transactionId}`).digest('hex');

    // Check for existing token (idempotency)
    if (supabase) {
      const { data: existing } = await supabase
        .from('purchases')
        .select('id')
        .eq('customer_id', cid)
        .eq('source', 'apple')
        .limit(1);

      if (!existing || existing.length === 0) {
        // Record the purchase
        await supabase.from('purchases').insert({
          customer_id: cid,
          source: 'apple',
          product: 'ttm-full-access',
          amount: 0, // Apple handles payment; we don't know the exact amount
          currency: 'USD',
          metadata: {
            transactionId,
            productId: transactionInfo.productId,
            purchaseDate: transactionInfo.purchaseDate,
            environment: transactionInfo.environment || 'unknown',
          },
        });
      }
    }

    // Create a long-lived token (90 days for Apple, since we can re-verify)
    const token = createToken('paid', cid, { expiryDays: 90 });

    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    return jsonResponse({ token, expiresAt }, 200);
  } catch (err) {
    console.error('Apple receipt verification error:', err);
    return jsonResponse({ error: 'Verification failed' }, 500);
  }
};
