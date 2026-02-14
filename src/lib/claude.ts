export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamChatOptions {
  messages: ChatMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

/**
 * Streams a chat response from the /api/chat proxy.
 * Returns an AbortController so callers can cancel the request.
 */
export function streamChat(options: StreamChatOptions): AbortController {
  const { messages, systemPrompt, maxTokens, onChunk, onDone, onError } = options;
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, systemPrompt, maxTokens }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        onError(data.error || `HTTP ${res.status}`);
        return;
      }

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
