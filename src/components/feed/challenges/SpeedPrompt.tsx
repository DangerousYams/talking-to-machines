import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChallengeComponentProps, SpeedPromptPayload } from '../../../data/challenges';

export default function SpeedPrompt({ challenge, onSubmit, isActive }: ChallengeComponentProps) {
  const payload = challenge.payload as SpeedPromptPayload;
  const [phase, setPhase] = useState<'ready' | 'typing' | 'waiting' | 'done'>('ready');
  const [prompt, setPrompt] = useState('');
  const [timeLeft, setTimeLeft] = useState(payload.timeLimitSeconds);
  const [response, setResponse] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Timer logic
  useEffect(() => {
    if (phase !== 'typing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSend();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const handleStart = () => {
    setPhase('typing');
    setTimeLeft(payload.timeLimitSeconds);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleSend = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!prompt.trim()) {
      setPhase('ready');
      setTimeLeft(payload.timeLimitSeconds);
      return;
    }

    setPhase('waiting');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: payload.systemPrompt,
          maxTokens: 512,
        }),
      });

      if (!res.ok) throw new Error('API error');

      // Read streamed response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE events
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.delta?.text || parsed.content?.[0]?.text || '';
                fullText += delta;
                setResponse(fullText);
              } catch {
                // Not JSON, might be raw text
                fullText += data;
                setResponse(fullText);
              }
            }
          }
        }
      }

      // Extract score from response
      const scoreMatch = fullText.match(/PROMPT_SCORE:\s*(\d+)/i);
      const extractedScore = scoreMatch ? Math.min(10, Math.max(1, parseInt(scoreMatch[1]))) : 5;
      setScore(extractedScore);

      // Clean response — remove the score line
      const cleanResponse = fullText.replace(/\n*PROMPT_SCORE:\s*\d+.*/is, '').trim();
      setResponse(cleanResponse);

      setPhase('done');
      onSubmit({ prompt, score: extractedScore / 10, timeLeft });
    } catch {
      // Fallback: simulate a score based on prompt length and specificity
      const simScore = Math.min(10, Math.max(3, Math.floor(prompt.length / 15)));
      setScore(simScore);
      setResponse('(AI unavailable — scored on prompt quality heuristics)');
      setPhase('done');
      onSubmit({ prompt, score: simScore / 10, timeLeft });
    }
  }, [prompt, payload.systemPrompt, timeLeft, onSubmit]);

  const timerColor = timeLeft <= 5 ? '#E94560' : timeLeft <= 10 ? '#F5A623' : '#7B61FF';
  const timerPct = (timeLeft / payload.timeLimitSeconds) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Task */}
      <div style={{
        padding: '12px 14px',
        borderRadius: 10,
        background: 'rgba(123, 97, 255, 0.04)',
        border: '1px solid rgba(123, 97, 255, 0.1)',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--color-deep)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {payload.task}
        </p>
      </div>

      {/* Ready state */}
      {phase === 'ready' && (
        <button
          onClick={handleStart}
          style={{
            padding: '16px 24px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #7B61FF, #E94560)',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          Start — {payload.timeLimitSeconds}s
        </button>
      )}

      {/* Typing state */}
      {phase === 'typing' && (
        <>
          {/* Timer bar */}
          <div style={{
            width: '100%',
            height: 6,
            borderRadius: 3,
            background: 'rgba(26, 26, 46, 0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${timerPct}%`,
              height: '100%',
              borderRadius: 3,
              background: timerColor,
              transition: 'width 1s linear, background 0.3s',
            }} />
          </div>

          {/* Timer number */}
          <div style={{
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: timerColor,
            lineHeight: 1,
            animation: timeLeft <= 5 ? 'timerPulse 0.5s ease-in-out infinite' : 'none',
          }}>
            {timeLeft}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            style={{
              width: '100%',
              minHeight: 80,
              padding: '12px 14px',
              borderRadius: 10,
              border: `1.5px solid ${timerColor}30`,
              background: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              color: 'var(--color-deep)',
              lineHeight: 1.5,
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={!prompt.trim()}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              background: prompt.trim() ? 'var(--color-deep)' : 'rgba(26, 26, 46, 0.1)',
              color: prompt.trim() ? 'var(--color-cream)' : 'var(--color-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              cursor: prompt.trim() ? 'pointer' : 'default',
              textTransform: 'uppercase',
            }}
          >
            Send
          </button>
        </>
      )}

      {/* Waiting state */}
      {phase === 'waiting' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          padding: '1.5rem',
        }}>
          <div style={{
            width: 28,
            height: 28,
            border: '3px solid rgba(123, 97, 255, 0.15)',
            borderTopColor: '#7B61FF',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--color-subtle)',
          }}>
            AI is judging your prompt...
          </span>
          {response && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(250, 248, 245, 0.5)',
              border: '1px solid rgba(26, 26, 46, 0.06)',
              width: '100%',
            }}>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: 'var(--color-deep)',
                margin: 0,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {response}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Done state */}
      {phase === 'done' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          animation: 'snapReveal 0.3s ease-out',
        }}>
          {/* Score */}
          <div style={{
            textAlign: 'center',
            padding: '12px 0',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '2.5rem',
              fontWeight: 800,
              color: score && score >= 7 ? '#16C79A' : score && score >= 5 ? '#F5A623' : '#E94560',
              lineHeight: 1,
            }}>
              {score}/10
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 600,
              color: 'var(--color-subtle)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              Prompt Score
            </span>
          </div>

          {/* Your prompt */}
          <div style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(123, 97, 255, 0.04)',
            border: '1px solid rgba(123, 97, 255, 0.1)',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: '#7B61FF',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 4,
            }}>
              Your prompt
            </span>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              color: 'var(--color-deep)',
              margin: 0,
              lineHeight: 1.5,
            }}>
              {prompt}
            </p>
          </div>

          {/* AI response */}
          {response && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(250, 248, 245, 0.5)',
              border: '1px solid rgba(26, 26, 46, 0.06)',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: 'var(--color-subtle)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 4,
              }}>
                AI response
              </span>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: 'var(--color-deep)',
                margin: 0,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {response}
              </p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes timerPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes snapReveal {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
