import React, { useState } from 'react';
import type { ChallengeComponentProps, SnapJudgmentPayload } from '../../../data/challenges';

export default function SnapJudgment({ challenge, onSubmit }: ChallengeComponentProps) {
  const payload = challenge.payload as SnapJudgmentPayload;
  const [picked, setPicked] = useState<'real' | 'fake' | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handlePick = (choice: 'real' | 'fake') => {
    if (revealed) return;
    setPicked(choice);
    setRevealed(true);

    const isCorrect = (choice === 'real') === payload.isReal;
    onSubmit({ choice, isCorrect });
  };

  const isCorrect = picked !== null && (picked === 'real') === payload.isReal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Statement — big and bold */}
      <div style={{
        padding: '24px 20px',
        borderRadius: 12,
        background: revealed
          ? isCorrect ? 'rgba(22, 199, 154, 0.05)' : 'rgba(233, 69, 96, 0.04)'
          : 'rgba(250, 248, 245, 0.6)',
        border: revealed
          ? `1.5px solid ${isCorrect ? 'rgba(22, 199, 154, 0.2)' : 'rgba(233, 69, 96, 0.15)'}`
          : '1.5px solid rgba(26, 26, 46, 0.06)',
        transition: 'all 0.3s ease',
      }}>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.05rem, 3vw, 1.25rem)',
          fontWeight: 600,
          color: 'var(--color-deep)',
          margin: 0,
          lineHeight: 1.5,
          textAlign: 'center',
        }}>
          "{payload.statement}"
        </p>
      </div>

      {/* Buttons */}
      {!revealed && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => handlePick('real')}
            style={{
              flex: 1,
              padding: '14px 16px',
              borderRadius: 10,
              border: '1.5px solid rgba(22, 199, 154, 0.15)',
              background: 'rgba(22, 199, 154, 0.04)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#16C79A',
              letterSpacing: '0.04em',
              transition: 'all 0.15s',
            }}
          >
            REAL
          </button>
          <button
            onClick={() => handlePick('fake')}
            style={{
              flex: 1,
              padding: '14px 16px',
              borderRadius: 10,
              border: '1.5px solid rgba(233, 69, 96, 0.15)',
              background: 'rgba(233, 69, 96, 0.03)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#E94560',
              letterSpacing: '0.04em',
              transition: 'all 0.15s',
            }}
          >
            FAKE
          </button>
        </div>
      )}

      {/* Reveal */}
      {revealed && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          animation: 'snapReveal 0.3s ease-out',
        }}>
          {/* Verdict */}
          <div style={{
            textAlign: 'center',
            padding: '10px 0',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              fontWeight: 800,
              color: isCorrect ? '#16C79A' : '#E94560',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              {isCorrect ? 'Nailed it!' : 'Got you!'}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-subtle)',
              marginLeft: 8,
            }}>
              This was {payload.isReal ? 'REAL' : 'FAKE'}
            </span>
          </div>

          {/* Explanation */}
          <div style={{
            padding: '12px 14px',
            borderRadius: 10,
            background: 'rgba(250, 248, 245, 0.5)',
            border: '1px solid rgba(26, 26, 46, 0.06)',
          }}>
            {!payload.isReal && payload.correction && (
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#E94560',
                margin: '0 0 8px',
                lineHeight: 1.5,
              }}>
                {payload.correction}
              </p>
            )}
            {payload.isReal && payload.source && (
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#16C79A',
                margin: '0 0 8px',
                letterSpacing: '0.04em',
              }}>
                Source: {payload.source}
              </p>
            )}
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
        </div>
      )}

      <style>{`
        @keyframes snapReveal {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
