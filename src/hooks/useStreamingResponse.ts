import { useState, useCallback, useRef, useEffect } from 'react';
import { streamChat, type ChatMessage } from '../lib/claude';

interface UseStreamingResponseOptions {
  systemPrompt?: string;
  maxTokens?: number;
}

interface UseStreamingResponseReturn {
  response: string;
  isStreaming: boolean;
  error: string | null;
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
  sendMessages: (messages: ChatMessage[]) => void;
  abort: () => void;
  reset: () => void;
}

export function useStreamingResponse(
  options: UseStreamingResponseOptions = {}
): UseStreamingResponseReturn {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

  // Abort on unmount
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setIsStreaming(false);
  }, []);

  const sendMessages = useCallback(
    (chatMessages: ChatMessage[]) => {
      // Abort any in-flight request
      controllerRef.current?.abort();

      setResponse('');
      setIsStreaming(true);
      setError(null);

      let accumulated = '';

      const controller = streamChat({
        messages: chatMessages,
        systemPrompt: options.systemPrompt,
        maxTokens: options.maxTokens,
        onChunk: (text) => {
          accumulated += text;
          setResponse(accumulated);
        },
        onDone: () => {
          setIsStreaming(false);
          setMessages((prev) => [...chatMessages, { role: 'assistant', content: accumulated }]);
          controllerRef.current = null;
        },
        onError: (err) => {
          setError(err);
          setIsStreaming(false);
          controllerRef.current = null;
        },
      });

      controllerRef.current = controller;
    },
    [options.systemPrompt, options.maxTokens]
  );

  const sendMessage = useCallback(
    (content: string) => {
      const newMessages: ChatMessage[] = [...messages, { role: 'user', content }];
      sendMessages(newMessages);
    },
    [messages, sendMessages]
  );

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setResponse('');
    setIsStreaming(false);
    setError(null);
    setMessages([]);
  }, []);

  return { response, isStreaming, error, messages, sendMessage, sendMessages, abort, reset };
}
