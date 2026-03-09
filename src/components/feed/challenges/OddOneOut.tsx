import React, { useState } from 'react';
import type { ChallengeComponentProps, OddOneOutPayload } from '../../../data/challenges';

export default function OddOneOut({ challenge, onSubmit }: ChallengeComponentProps) {
  const payload = challenge.payload as OddOneOutPayload;
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handlePick = (index: number) => {
    if (revealed) return;
    setPicked(index);
    setRevealed(true);

    const isCorrect = index === payload.oddIndex;
    onSubmit({ pickedIndex: index, isCorrect });
  };

  const isCorrect = picked === payload.oddIndex;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 2x2 Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
      }}>
        {payload.items.map((item, i) => {
          const isOdd = i === payload.oddIndex;
          const isPicked = i === picked;
          const isGroupMember = revealed && !isOdd;

          return (
            <button
              key={i}
              onClick={() => handlePick(i)}
              disabled={revealed}
              style={{
                padding: '18px 14px',
                borderRadius: 12,
                border: `1.5px solid ${
                  revealed && isOdd
                    ? isPicked ? '#16C79A' : '#E94560'
                    : revealed && isPicked && !isOdd
                      ? '#E94560'
                      : isGroupMember
                        ? 'rgba(14, 165, 233, 0.2)'
                        : 'rgba(26, 26, 46, 0.08)'
                }`,
                background: revealed && isOdd
                  ? isPicked ? 'rgba(22, 199, 154, 0.06)' : 'rgba(233, 69, 96, 0.04)'
                  : revealed && isPicked && !isOdd
                    ? 'rgba(233, 69, 96, 0.03)'
                    : isGroupMember
                      ? 'rgba(14, 165, 233, 0.04)'
                      : '#FFFFFF',
                cursor: revealed ? 'default' : 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: 'var(--color-deep)',
                textAlign: 'center',
                lineHeight: 1.4,
                transition: 'all 0.2s ease',
                position: 'relative',
                animation: revealed && isPicked && !isOdd ? 'cardShake 0.4s ease' : 'none',
              }}
            >
              {item}
              {revealed && isOdd && (
                <span style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: isPicked ? '#16C79A' : '#E94560',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  color: '#fff',
                  fontWeight: 700,
                }}>
                  {isPicked ? '✓' : '!'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Reveal */}
      {revealed && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          animation: 'oddReveal 0.3s ease-out',
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
              {isCorrect ? 'Spotted it!' : 'Not quite!'}
            </span>
          </div>

          {/* Pattern */}
          <div style={{
            padding: '12px 14px',
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
              The pattern: {payload.pattern}
            </span>
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
        @keyframes cardShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(2px); }
        }
        @keyframes oddReveal {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
