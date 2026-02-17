import React, { useState, useRef } from 'react';
import type { ChallengeComponentProps, PromptForgePayload } from '../../../data/challenges';
import { useStreamingResponse } from '../../../hooks/useStreamingResponse';

export default function PromptForge({ challenge, onSubmit, isMobile }: ChallengeComponentProps) {
  const payload = challenge.payload as PromptForgePayload;
  const [prompt, setPrompt] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { response, isStreaming, sendMessages } = useStreamingResponse({
    systemPrompt: payload.systemPrompt,
    maxTokens: 512,
    source: 'feed-challenge' as any,
  });

  const handleRun = () => {
    if (!prompt.trim() || isStreaming) return;
    sendMessages([{ role: 'user', content: prompt }]);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // Score based on evaluation criteria matched (simple keyword heuristic)
    const criteriaMatched = payload.evaluationCriteria.filter((_, i) => {
      // Basic heuristic: longer, more specific prompts tend to hit more criteria
      return prompt.length > 30 * (i + 1);
    }).length;

    onSubmit({
      prompt,
      responseLength: response.length,
      criteriaMatched,
      totalCriteria: payload.evaluationCriteria.length,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Task description */}
      <div style={{
        padding: '10px 14px',
        borderRadius: 10,
        background: 'rgba(233, 69, 96, 0.04)',
        border: '1px solid rgba(233, 69, 96, 0.1)',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: 'var(--color-deep)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {payload.task}
        </p>
      </div>

      {/* Hint */}
      {payload.hint && (
        <details style={{ margin: 0 }}>
          <summary style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: 'var(--color-subtle)',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}>
            Hint
          </summary>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            color: 'var(--color-subtle)',
            margin: '6px 0 0',
            lineHeight: 1.5,
          }}>
            {payload.hint}
          </p>
        </details>
      )}

      {/* Prompt editor */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Write your prompt here..."
        disabled={submitted}
        style={{
          width: '100%',
          minHeight: isMobile ? 100 : 120,
          padding: '12px 14px',
          borderRadius: 10,
          border: '1px solid rgba(26, 26, 46, 0.1)',
          background: '#FFFFFF',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          lineHeight: 1.6,
          color: 'var(--color-deep)',
          resize: 'vertical',
          outline: 'none',
        }}
      />

      {/* Character count */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--color-subtle)',
        }}>
          {prompt.length} chars
        </span>

        <div style={{ display: 'flex', gap: 8 }}>
          {!submitted && (
            <button
              onClick={handleRun}
              disabled={!prompt.trim() || isStreaming}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                border: '1px solid rgba(233, 69, 96, 0.3)',
                background: prompt.trim() ? '#E94560' : 'rgba(233, 69, 96, 0.1)',
                color: prompt.trim() ? '#FFFFFF' : 'rgba(233, 69, 96, 0.4)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                cursor: prompt.trim() && !isStreaming ? 'pointer' : 'default',
                textTransform: 'uppercase',
              }}
            >
              {isStreaming ? 'Running...' : 'Run Prompt'}
            </button>
          )}
        </div>
      </div>

      {/* AI Response */}
      {(response || isStreaming) && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 10,
          border: '1px solid rgba(26, 26, 46, 0.06)',
          background: 'rgba(250, 248, 245, 0.5)',
          minHeight: 60,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: 'var(--color-subtle)',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: 6,
          }}>
            AI Response
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
            {isStreaming && <span style={{ opacity: 0.4 }}>|</span>}
          </p>
        </div>
      )}

      {/* Submit button (only after running) */}
      {response && !submitted && !isStreaming && (
        <button
          onClick={handleSubmit}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--color-deep)',
            color: 'var(--color-cream)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          Submit & Compare
        </button>
      )}

      {submitted && (
        <div style={{
          textAlign: 'center',
          padding: 12,
          borderRadius: 10,
          background: 'rgba(22, 199, 154, 0.06)',
          border: '1px solid rgba(22, 199, 154, 0.15)',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#16C79A',
          }}>
            Submitted!
          </span>
        </div>
      )}
    </div>
  );
}
