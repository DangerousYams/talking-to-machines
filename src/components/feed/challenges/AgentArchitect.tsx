import React, { useState } from 'react';
import type { ChallengeComponentProps, AgentArchitectPayload } from '../../../data/challenges';

export default function AgentArchitect({ challenge, onSubmit }: ChallengeComponentProps) {
  const payload = challenge.payload as AgentArchitectPayload;
  const [orderedSteps, setOrderedSteps] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [constraintsOpen, setConstraintsOpen] = useState(false);

  const availableSteps = payload.steps.filter((s) => !orderedSteps.includes(s.id));

  const addStep = (id: string) => {
    if (submitted) return;
    setOrderedSteps((prev) => [...prev, id]);
  };

  const removeStep = (index: number) => {
    if (submitted) return;
    setOrderedSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (orderedSteps.length === 0) return;
    setSubmitted(true);

    const correctOrder = payload.steps.map((s) => s.id);
    let matchCount = 0;
    for (let i = 0; i < Math.min(orderedSteps.length, correctOrder.length); i++) {
      if (orderedSteps[i] === correctOrder[i]) matchCount++;
    }

    onSubmit({
      orderedSteps,
      correctOrder,
      score: matchCount / correctOrder.length,
    });
  };

  const getStepById = (id: string) => payload.steps.find((s) => s.id === id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Goal */}
      <div style={{
        padding: '10px 14px',
        borderRadius: 10,
        background: 'rgba(245, 166, 35, 0.04)',
        border: '1px solid rgba(245, 166, 35, 0.1)',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: '#F5A623',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: 4,
        }}>
          Agent Goal
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

      {/* Constraints — collapsed summary */}
      {payload.constraints.length > 0 && (
        <div>
          <span
            role="button"
            tabIndex={0}
            onClick={() => setConstraintsOpen((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setConstraintsOpen((v) => !v);
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 10px',
              borderRadius: 6,
              background: 'rgba(26, 26, 46, 0.04)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              fontWeight: 600,
              color: 'var(--color-subtle)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {constraintsOpen ? '▾' : '▸'} {payload.constraints.length} constraints
          </span>
          {constraintsOpen && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {payload.constraints.map((c, i) => (
                <span
                  key={i}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: 'rgba(26, 26, 46, 0.04)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    fontWeight: 500,
                    color: 'var(--color-subtle)',
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User's ordered steps */}
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
          Your agent plan {orderedSteps.length > 0 && `(${orderedSteps.length} steps)`}
        </span>

        {orderedSteps.length === 0 ? (
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
              Tap steps below to build the agent's plan
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {orderedSteps.map((id, i) => {
              const step = getStepById(id);
              if (!step) return null;

              const correctId = payload.steps[i]?.id;
              const isCorrectPos = submitted && id === correctId;

              return (
                <div
                  key={`${id}-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1px solid ${isCorrectPos ? '#16C79A' : submitted ? '#E9456030' : '#F5A62330'}`,
                    background: isCorrectPos ? 'rgba(22, 199, 154, 0.04)' : '#FFFFFF',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#F5A623',
                    width: 20,
                    textAlign: 'center',
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--color-deep)',
                    }}>
                      {step.label}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6rem',
                      color: 'var(--color-subtle)',
                      marginLeft: 6,
                    }}>
                      [{step.tool}]
                    </span>
                  </div>
                  {!submitted && (
                    <button
                      onClick={() => removeStep(i)}
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available steps */}
      {!submitted && availableSteps.length > 0 && (
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
            Available steps
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {availableSteps.map((step) => (
              <button
                key={step.id}
                onClick={() => addStep(step.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(26, 26, 46, 0.08)',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ color: '#F5A623', fontWeight: 700, fontSize: '0.8rem' }}>+</span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  color: 'var(--color-deep)',
                  fontWeight: 600,
                }}>
                  {step.label}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  color: 'var(--color-subtle)',
                  marginLeft: 'auto',
                }}>
                  {step.tool}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      {orderedSteps.length > 0 && !submitted && (
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
          Deploy Agent
        </button>
      )}

      {/* Results */}
      {submitted && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 10,
          background: 'rgba(245, 166, 35, 0.04)',
          border: '1px solid rgba(245, 166, 35, 0.1)',
        }}>
          {payload.failureMode && (
            <>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 600,
                color: '#E94560',
                display: 'block',
                marginBottom: 4,
                textTransform: 'uppercase',
              }}>
                Watch out for
              </span>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: 'var(--color-deep)',
                margin: '0 0 8px',
                lineHeight: 1.5,
              }}>
                {payload.failureMode}
              </p>
            </>
          )}
          {payload.guardRail && (
            <>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 600,
                color: '#16C79A',
                display: 'block',
                marginBottom: 4,
                textTransform: 'uppercase',
              }}>
                Guardrail
              </span>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: 'var(--color-deep)',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {payload.guardRail}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
