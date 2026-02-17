import React, { useState } from 'react';
import type { ChallengeComponentProps, ToolChainPayload } from '../../../data/challenges';

export default function ToolChain({ challenge, onSubmit }: ChallengeComponentProps) {
  const payload = challenge.payload as ToolChainPayload;
  const [chain, setChain] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const availableTools = payload.availableTools.filter((t) => !chain.includes(t.id));

  const addTool = (id: string) => {
    if (submitted) return;
    setChain((prev) => [...prev, id]);
  };

  const removeTool = (index: number) => {
    if (submitted) return;
    setChain((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (chain.length === 0) return;
    setSubmitted(true);

    // Score: how many match the optimal chain in order
    let matchCount = 0;
    for (let i = 0; i < Math.min(chain.length, payload.optimalChain.length); i++) {
      if (chain[i] === payload.optimalChain[i]) matchCount++;
    }
    const score = matchCount / payload.optimalChain.length;

    onSubmit({
      chain,
      optimalChain: payload.optimalChain,
      score,
    });
  };

  const getToolById = (id: string) => payload.availableTools.find((t) => t.id === id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Goal */}
      <div style={{
        padding: '10px 14px',
        borderRadius: 10,
        background: 'rgba(14, 165, 233, 0.04)',
        border: '1px solid rgba(14, 165, 233, 0.1)',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: '#0EA5E9',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: 4,
        }}>
          Goal
        </span>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: 'var(--color-deep)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {payload.goal}
        </p>
      </div>

      {/* Chain (drop zone) */}
      <div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: 'var(--color-subtle)',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: 6,
        }}>
          Your pipeline {chain.length > 0 && `(${chain.length} steps)`}
        </span>

        {chain.length === 0 ? (
          <div style={{
            padding: '20px',
            borderRadius: 10,
            border: '2px dashed rgba(26, 26, 46, 0.1)',
            textAlign: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              color: 'var(--color-subtle)',
            }}>
              Tap tools below to build your pipeline
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {chain.map((id, i) => {
              const tool = getToolById(id);
              if (!tool) return null;

              const isCorrectPosition = submitted && payload.optimalChain[i] === id;
              const isInOptimal = submitted && payload.optimalChain.includes(id);

              return (
                <div
                  key={`${id}-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1px solid ${isCorrectPosition ? '#16C79A' : submitted && !isInOptimal ? '#E94560' : '#0EA5E9'}30`,
                    background: isCorrectPosition ? 'rgba(22, 199, 154, 0.04)' : '#FFFFFF',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#0EA5E9',
                    width: 20,
                    textAlign: 'center',
                  }}>
                    {i + 1}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    color: 'var(--color-deep)',
                    fontWeight: 600,
                    flex: 1,
                  }}>
                    {tool.name}
                  </span>
                  {!submitted && (
                    <button
                      onClick={() => removeTool(i)}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(26, 26, 46, 0.06)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6B7280',
                        fontSize: '0.7rem',
                        flexShrink: 0,
                      }}
                    >
                      &times;
                    </button>
                  )}
                  {i < chain.length - 1 && (
                    <span style={{ position: 'absolute', left: '50%', bottom: -10, color: '#0EA5E9', fontSize: '0.7rem' }}>
                      →
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available tools */}
      {!submitted && availableTools.length > 0 && (
        <div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: 'var(--color-subtle)',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: 6,
          }}>
            Available tools
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {availableTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => addTool(tool.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(26, 26, 46, 0.08)',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--color-deep)',
                  transition: 'all 0.15s',
                }}
              >
                + {tool.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      {chain.length > 0 && !submitted && (
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
          Submit Pipeline
        </button>
      )}

      {/* Explanation */}
      {submitted && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 10,
          background: 'rgba(14, 165, 233, 0.04)',
          border: '1px solid rgba(14, 165, 233, 0.1)',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            color: '#0EA5E9',
            display: 'block',
            marginBottom: 4,
            textTransform: 'uppercase',
          }}>
            Optimal pipeline
          </span>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--color-deep)',
            margin: '0 0 8px',
          }}>
            {payload.optimalChain.map((id) => getToolById(id)?.name).join(' → ')}
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: 'var(--color-deep)',
            margin: 0,
            lineHeight: 1.6,
          }}>
            {payload.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
