import { getAccessToken } from './auth';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ChatSource = 'prompt-roast' | 'block-gen' | 'feed-challenge';

export interface StreamChatOptions {
  messages: ChatMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  source?: ChatSource;
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
  onQuotaUpdate?: (remaining: number, limit: number) => void;
}

// ---------------------------------------------------------------------------
// Module-level quota event emitter (consumed by useQuota hook)
// ---------------------------------------------------------------------------
type QuotaListener = (remaining: number, limit: number, reset: string) => void;
const quotaListeners = new Set<QuotaListener>();

export function onQuotaChange(fn: QuotaListener): () => void {
  quotaListeners.add(fn);
  return () => { quotaListeners.delete(fn); };
}

function emitQuota(remaining: number, limit: number, reset: string) {
  quotaListeners.forEach((fn) => fn(remaining, limit, reset));
}

function readQuotaHeaders(res: Response) {
  const remaining = res.headers.get('X-Quota-Remaining');
  const limit = res.headers.get('X-Quota-Limit');
  const reset = res.headers.get('X-Quota-Reset');
  if (remaining !== null && limit !== null && reset !== null) {
    return { remaining: parseInt(remaining, 10), limit: parseInt(limit, 10), reset };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main streaming function
// ---------------------------------------------------------------------------

/**
 * Streams a chat response from the /api/chat proxy.
 * Returns an AbortController so callers can cancel the request.
 */
export function streamChat(options: StreamChatOptions): AbortController {
  const { messages, systemPrompt, maxTokens, source, onChunk, onDone, onError, onQuotaUpdate } = options;
  const controller = new AbortController();

  (async () => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const bodyPayload: Record<string, unknown> = { messages, systemPrompt, maxTokens };
      if (source) bodyPayload.source = source;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });

      // Read quota headers from any response
      const quota = readQuotaHeaders(res);
      if (quota) {
        emitQuota(quota.remaining, quota.limit, quota.reset);
        onQuotaUpdate?.(quota.remaining, quota.limit);
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        const errorMsg = data.error || `HTTP ${res.status}`;

        if (res.status === 401) {
          onError('Unlock required');
        } else {
          onError(errorMsg);
        }
        return;
      }

      // Handle non-streaming JSON responses (cached roasts)
      const contentType = res.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.result) {
          onChunk(data.result);
        }
        onDone();
        return;
      }

      // Handle SSE streaming response
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            onDone();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              onChunk(parsed.text);
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }

      onDone();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      onError(err instanceof Error ? err.message : 'Connection failed');
    }
  })();

  return controller;
}
