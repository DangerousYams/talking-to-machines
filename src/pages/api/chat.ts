export const prerender = false;

import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { validateToken } from '../../lib/access-token';

// ---------------------------------------------------------------------------
// Model routing — server-side only, never trust client model choice
// ---------------------------------------------------------------------------
const MODEL_MAP: Record<string, string> = {
  'prompt-roast': 'claude-haiku-4-5-20251001',
  'block-gen': 'claude-haiku-4-5-20251001',
};
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

const MAX_TOKENS_MAP: Record<string, number> = {
  'prompt-roast': 512,
  'block-gen': 200,
};

// ---------------------------------------------------------------------------
// KV adapter — Vercel KV in prod, in-memory Map for local dev
// ---------------------------------------------------------------------------
interface KVStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, opts?: { ex?: number }): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
}

let kvStore: KVStore | null = null;

async function getKV(): Promise<KVStore> {
  if (kvStore) return kvStore;

  const kvUrl = import.meta.env.KV_REST_API_URL || process.env.KV_REST_API_URL;
  if (kvUrl) {
    // Use Vercel KV / Upstash Redis
    const { kv } = await import('@vercel/kv');
    kvStore = {
      get: (key) => kv.get<string>(key),
      set: (key, value, opts) => kv.set(key, value, opts?.ex ? { ex: opts.ex } : undefined).then(() => {}),
      incr: (key) => kv.incr(key),
      expire: (key, seconds) => kv.expire(key, seconds).then(() => {}),
    };
  } else {
    // In-memory fallback for local dev
    const store = new Map<string, { value: string; expiresAt: number }>();
    const counters = new Map<string, { count: number; expiresAt: number }>();

    kvStore = {
      get: async (key) => {
        const entry = store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) { store.delete(key); return null; }
        return entry.value;
      },
      set: async (key, value, opts) => {
        const ttl = opts?.ex ? opts.ex * 1000 : 86400 * 1000;
        store.set(key, { value, expiresAt: Date.now() + ttl });
      },
      incr: async (key) => {
        const entry = counters.get(key);
        if (!entry || Date.now() > entry.expiresAt) {
          counters.set(key, { count: 1, expiresAt: Date.now() + 86400 * 1000 });
          return 1;
        }
        entry.count++;
        return entry.count;
      },
      expire: async (key, seconds) => {
        const entry = counters.get(key);
        if (entry) entry.expiresAt = Date.now() + seconds * 1000;
        const storeEntry = store.get(key);
        if (storeEntry) storeEntry.expiresAt = Date.now() + seconds * 1000;
      },
    };
  }
  return kvStore;
}

// ---------------------------------------------------------------------------
// Per-minute rate limiter (protects against bursts regardless of quota)
// ---------------------------------------------------------------------------
const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkBurstLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

// ---------------------------------------------------------------------------
// Quota helpers
// ---------------------------------------------------------------------------
function secondsUntilMidnightUTC(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCDate(midnight.getUTCDate() + 1);
  midnight.setUTCHours(0, 0, 0, 0);
  return Math.ceil((midnight.getTime() - now.getTime()) / 1000);
}

function midnightUTCIso(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

async function checkAndIncrQuota(
  kv: KVStore,
  key: string,
  limit: number
): Promise<{ allowed: boolean; remaining: number; limit: number; reset: string }> {
  const count = await kv.incr(key);
  if (count === 1) {
    // First request of the day — set TTL to midnight UTC
    await kv.expire(key, secondsUntilMidnightUTC());
  }
  const reset = midnightUTCIso();
  if (count > limit) {
    return { allowed: false, remaining: 0, limit, reset };
  }
  return { allowed: true, remaining: limit - count, limit, reset };
}

// ---------------------------------------------------------------------------
// Roast cache helpers
// ---------------------------------------------------------------------------
function hashPrompt(text: string): string {
  const normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');
  return createHash('sha256').update(normalized).digest('hex');
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------
function jsonResponse(data: object, status: number, extra?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });
}

function quotaHeaders(remaining: number, limit: number, reset: string): Record<string, string> {
  return {
    'X-Quota-Remaining': String(remaining),
    'X-Quota-Limit': String(limit),
    'X-Quota-Reset': reset,
  };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    return jsonResponse({ error: 'API key not configured' }, 503);
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!checkBurstLimit(ip)) {
    return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429);
  }

  // Parse body
  let body: {
    messages?: unknown;
    systemPrompt?: string;
    maxTokens?: number;
    source?: string;
  };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { messages, systemPrompt, maxTokens = 1024, source } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonResponse({ error: 'messages array is required' }, 400);
  }

  // Extract and validate auth token
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const tokenPayload = token ? validateToken(token) : null;
  const isPaidUser = tokenPayload?.tier === 'paid';

  const kv = await getKV();

  // -----------------------------------------------------------------------
  // Route: prompt-roast (free for everyone, 5/day per IP, Haiku)
  // -----------------------------------------------------------------------
  if (source === 'prompt-roast') {
    // Check roast cache first
    const userMessage = (messages as { role: string; content: string }[]).find(m => m.role === 'user');
    if (userMessage) {
      const hash = hashPrompt(userMessage.content);
      const cached = await kv.get(`cache:roast:${hash}`);
      if (cached) {
        return jsonResponse({ cached: true, result: cached }, 200);
      }
    }

    if (isPaidUser) {
      // Paid users: deduct from daily quota
      const quota = await checkAndIncrQuota(kv, `quota:paid:${tokenPayload!.uid}`, 30);
      if (!quota.allowed) {
        return jsonResponse(
          { error: 'Daily limit reached. Resets at midnight UTC.' },
          429,
          quotaHeaders(quota.remaining, quota.limit, quota.reset)
        );
      }
      // Proxy with Haiku, return quota headers, cache result
      return proxyToClaudeAndCache(apiKey, messages, systemPrompt, source, userMessage, kv, quota);
    } else {
      // Free users: 5 roasts/day per IP
      const quota = await checkAndIncrQuota(kv, `quota:roast:${ip}`, 5);
      if (!quota.allowed) {
        return jsonResponse(
          { error: "You've used your 5 free roasts today! Unlock full access for unlimited roasts." },
          429
        );
      }
      return proxyToClaudeAndCache(apiKey, messages, systemPrompt, source, userMessage, kv, null);
    }
  }

  // -----------------------------------------------------------------------
  // Route: block-gen (paid only, Haiku)
  // -----------------------------------------------------------------------
  if (source === 'block-gen') {
    if (!isPaidUser) {
      return jsonResponse({ error: 'This feature requires full access' }, 401);
    }
    const quota = await checkAndIncrQuota(kv, `quota:paid:${tokenPayload!.uid}`, 30);
    if (!quota.allowed) {
      return jsonResponse(
        { error: 'Daily limit reached. Resets at midnight UTC.' },
        429,
        quotaHeaders(quota.remaining, quota.limit, quota.reset)
      );
    }
    return proxyToClaude(apiKey, messages, systemPrompt, source, maxTokens, quotaHeaders(quota.remaining, quota.limit, quota.reset));
  }

  // -----------------------------------------------------------------------
  // Route: default (paid only, Sonnet)
  // -----------------------------------------------------------------------
  if (!isPaidUser) {
    return jsonResponse({ error: 'This feature requires full access' }, 401);
  }

  const quota = await checkAndIncrQuota(kv, `quota:paid:${tokenPayload!.uid}`, 30);
  if (!quota.allowed) {
    return jsonResponse(
      { error: 'Daily limit reached. Resets at midnight UTC.' },
      429,
      quotaHeaders(quota.remaining, quota.limit, quota.reset)
    );
  }

  return proxyToClaude(apiKey, messages, systemPrompt, source || undefined, maxTokens, quotaHeaders(quota.remaining, quota.limit, quota.reset));
};

// ---------------------------------------------------------------------------
// Proxy to Claude (streaming)
// ---------------------------------------------------------------------------
async function proxyToClaude(
  apiKey: string,
  messages: unknown,
  systemPrompt: string | undefined,
  source: string | undefined,
  maxTokens: number,
  extraHeaders: Record<string, string>
): Promise<Response> {
  const model = (source && MODEL_MAP[source]) || DEFAULT_MODEL;
  const capTokens = source && MAX_TOKENS_MAP[source]
    ? Math.min(maxTokens, MAX_TOKENS_MAP[source])
    : Math.min(maxTokens, 2048);

  const anthropicBody: Record<string, unknown> = {
    model,
    max_tokens: capTokens,
    messages,
    stream: true,
  };
  if (systemPrompt) anthropicBody.system = systemPrompt;

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(anthropicBody),
  });

  if (!upstream.ok) {
    await upstream.text(); // consume body
    return jsonResponse(
      { error: `Anthropic API error: ${upstream.status}` },
      upstream.status >= 500 ? 502 : upstream.status
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const event = JSON.parse(data);
              if (event.type === 'content_block_delta' && event.delta?.text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
                );
              } else if (event.type === 'message_stop') {
                controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...extraHeaders,
    },
  });
}

// ---------------------------------------------------------------------------
// Proxy to Claude with response caching (for roasts — non-streaming return)
// ---------------------------------------------------------------------------
async function proxyToClaudeAndCache(
  apiKey: string,
  messages: unknown,
  systemPrompt: string | undefined,
  source: string,
  userMessage: { role: string; content: string } | undefined,
  kv: KVStore,
  quota: { remaining: number; limit: number; reset: string } | null
): Promise<Response> {
  const model = MODEL_MAP[source] || DEFAULT_MODEL;
  const capTokens = MAX_TOKENS_MAP[source] || 512;

  const anthropicBody: Record<string, unknown> = {
    model,
    max_tokens: capTokens,
    messages,
    stream: true,
  };
  if (systemPrompt) anthropicBody.system = systemPrompt;

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicBody),
    });

    if (!upstream.ok) {
      await upstream.text();
      return jsonResponse(
        { error: `Anthropic API error: ${upstream.status}` },
        upstream.status >= 500 ? 502 : upstream.status
      );
    }

    // Accumulate the full response for caching
    const decoder = new TextDecoder();
    const reader = upstream.body!.getReader();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const event = JSON.parse(data);
          if (event.type === 'content_block_delta' && event.delta?.text) {
            fullText += event.delta.text;
          }
        } catch {
          // Skip
        }
      }
    }

    // Cache the result
    if (userMessage && fullText) {
      const hash = hashPrompt(userMessage.content);
      await kv.set(`cache:roast:${hash}`, fullText, { ex: 86400 });
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (quota) Object.assign(headers, quotaHeaders(quota.remaining, quota.limit, quota.reset));

    return new Response(JSON.stringify({ cached: false, result: fullText }), { status: 200, headers });
  } catch {
    return jsonResponse({ error: 'Failed to connect to AI service' }, 502);
  }
}
