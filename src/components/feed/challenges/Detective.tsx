import React, { useState } from 'react';
import type { ChallengeComponentProps, DetectivePayload } from '../../../data/challenges';

export default function Detective({ challenge, onSubmit }: ChallengeComponentProps) {
  const payload = challenge.payload as DetectivePayload;
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handlePick = (id: string) => {
    if (revealed) return;
    setPicked(id);
    setRevealed(true);

    const isCorrect = id === payload.correctId;
    onSubmit({ choice: id, isCorrect });
  };

  const isCorrect = picked === payload.correctId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Buggy prompt — slight tilt for "broken" feel */}
      <div style={{
        padding: '14px 16px',
        borderRadius: 10,
        border: '1px solid rgba(233, 69, 96, 0.12)',
        background: 'rgba(233, 69, 96, 0.02)',
        transform: revealed && isCorrect ? 'rotate(0deg)' : 'rotate(-0.5deg)',
        transition: 'transform 0.3s ease',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: '#E94560',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: 6,
        }}>
          Prompt
        </span>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          color: 'var(--color-deep)',
          margin: 0,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
        }}>
          {payload.prompt}
        </p>
      </div>

      {/* Bad output */}
      <div style={{
        padding: '10px 14px',
        borderRadius: 10,
        border: '1px solid rgba(26, 26, 46, 0.06)',
        background: 'rgba(250, 248, 245, 0.5)',
        transform: revealed && isCorrect ? 'rotate(0deg)' : 'rotate(0.3deg)',
        transition: 'transform 0.3s ease',
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
          Bad output
        </span>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: 'var(--color-subtle)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {payload.badOutput}
        </p>
      </div>

      {/* Bug options — one tap */}
      {!revealed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: 'var(--color-subtle)',
            textTransform: 'uppercase',
          }}>
            What went wrong?
          </span>
          {payload.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handlePick(opt.id)}
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                border: '1.5px solid rgba(26, 26, 46, 0.08)',
                background: '#FFFFFF',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--color-deep)',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Reveal */}
      {revealed && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          animation: 'detectiveReveal 0.3s ease-out',
        }}>
          {/* Verdict */}
          <div style={{ textAlign: 'center' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: isCorrect ? '#16C79A' : '#E94560',
              letterSpacing: '0.04em',
            }}>
              {isCorrect ? 'Case closed!' : 'Not the bug!'}
            </span>
            {!isCorrect && (
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--color-subtle)',
                marginLeft: 8,
              }}>
                It was: {payload.options.find(o => o.id === payload.correctId)?.label}
              </span>
            )}
          </div>

          {/* Fixed prompt */}
          <div style={{
            padding: '12px 14px',
            borderRadius: 10,
            background: 'rgba(22, 199, 154, 0.04)',
            border: '1px solid rgba(22, 199, 154, 0.12)',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: '#16C79A',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 6,
            }}>
              Fixed prompt
            </span>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--color-deep)',
              margin: 0,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}>
              {payload.fixedPrompt}
            </p>
          </div>

          {/* Explanation */}
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

      <style>{`
        @keyframes detectiveReveal {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
