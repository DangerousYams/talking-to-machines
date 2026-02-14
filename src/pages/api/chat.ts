export const prerender = false;

import type { APIRoute } from 'astro';

// Simple in-memory rate limiter: 20 requests per minute per IP
const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
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

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in a minute.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { messages?: unknown; systemPrompt?: string; maxTokens?: number };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages, systemPrompt, maxTokens = 1024 } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages array is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const anthropicBody: Record<string, unknown> = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: Math.min(maxTokens, 2048),
      messages,
      stream: true,
    };

    if (systemPrompt) {
      anthropicBody.system = systemPrompt;
    }

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
      const errText = await upstream.text();
      return new Response(JSON.stringify({ error: `Anthropic API error: ${upstream.status}` }), {
        status: upstream.status >= 500 ? 502 : upstream.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse Anthropic's SSE stream and re-emit simplified events
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
                // Skip malformed JSON lines
              }
            }
          }

          // Ensure we send DONE
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
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to connect to AI service' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
