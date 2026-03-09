import React, { useState } from 'react';
import type { ChallengeComponentProps, TasteOffPayload } from '../../../data/challenges';

export default function TasteOff({ challenge, onSubmit }: ChallengeComponentProps) {
  const payload = challenge.payload as TasteOffPayload;
  const [picked, setPicked] = useState<'A' | 'B' | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handlePick = (choice: 'A' | 'B') => {
    if (revealed) return;
    setPicked(choice);
    setRevealed(true);

    const matchesExpert = choice === payload.expertPick;
    onSubmit({ choice, matchesExpert });
  };

  const matchesExpert = picked === payload.expertPick;
  const options = [
    { key: 'A' as const, data: payload.optionA },
    { key: 'B' as const, data: payload.optionB },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Domain tag */}
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        color: '#F5A623',
        textTransform: 'uppercase',
      }}>
        {payload.domain}
      </span>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map(({ key, data }) => {
          const isThis = picked === key;
          const isExpert = revealed && payload.expertPick === key;
          const isWrong = revealed && isThis && !matchesExpert;

          return (
            <button
              key={key}
              onClick={() => handlePick(key)}
              disabled={revealed}
              style={{
                padding: '16px',
                borderRadius: 12,
                border: `1.5px solid ${
                  isExpert ? '#16C79A'
                  : isWrong ? 'rgba(233, 69, 96, 0.2)'
                  : isThis ? '#F5A623'
                  : 'rgba(26, 26, 46, 0.08)'
                }`,
                background: isExpert
                  ? 'rgba(22, 199, 154, 0.05)'
                  : isWrong
                    ? 'rgba(233, 69, 96, 0.02)'
                    : '#FFFFFF',
                cursor: revealed ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                opacity: revealed && !isExpert && !isThis ? 0.5 : 1,
              }}
            >
              {/* Label */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: isExpert ? '#16C79A' : 'var(--color-subtle)',
                  textTransform: 'uppercase',
                }}>
                  {data.label}
                  {isExpert && ' — Expert pick'}
                </span>
                {revealed && isThis && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    color: matchesExpert ? '#16C79A' : '#E94560',
                  }}>
                    Your pick
                  </span>
                )}
              </div>

              {/* Content */}
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                color: 'var(--color-deep)',
                margin: 0,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {data.content}
              </p>
            </button>
          );
        })}
      </div>

      {/* Expert reasoning */}
      {revealed && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 10,
          background: matchesExpert ? 'rgba(22, 199, 154, 0.05)' : 'rgba(245, 166, 35, 0.04)',
          border: `1px solid ${matchesExpert ? 'rgba(22, 199, 154, 0.15)' : 'rgba(245, 166, 35, 0.1)'}`,
          animation: 'tasteReveal 0.3s ease-out',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: matchesExpert ? '#16C79A' : '#F5A623',
            display: 'block',
            marginBottom: 6,
          }}>
            {matchesExpert ? 'Great taste!' : 'Interesting — here\'s the expert take'}
          </span>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: 'var(--color-deep)',
            margin: 0,
            lineHeight: 1.6,
          }}>
            {payload.expertReasoning}
          </p>
        </div>
      )}

      <style>{`
        @keyframes tasteReveal {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
