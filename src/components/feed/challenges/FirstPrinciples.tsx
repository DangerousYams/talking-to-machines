import React, { useState } from 'react';
import type { ChallengeComponentProps, FirstPrinciplesPayload } from '../../../data/challenges';
import Expandable from '../../ui/Expandable';

export default function FirstPrinciples({ challenge, onSubmit }: ChallengeComponentProps) {
  const payload = challenge.payload as FirstPrinciplesPayload;
  const [choice, setChoice] = useState<'trust' | 'challenge' | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSubmit = () => {
    if (!choice) return;
    setRevealed(true);

    const isCorrect = payload.aiIsCorrect
      ? choice === 'trust'
      : choice === 'challenge';

    onSubmit({
      choice,
      isCorrect,
      aiWasCorrect: payload.aiIsCorrect,
    });
  };

  const isCorrect = payload.aiIsCorrect
    ? choice === 'trust'
    : choice === 'challenge';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Question */}
      <div style={{
        padding: '14px 16px',
        borderRadius: 10,
        border: '1px solid rgba(22, 199, 154, 0.1)',
        background: 'rgba(22, 199, 154, 0.04)',
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
          {payload.domain}
        </span>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--color-deep)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {payload.question}
        </p>
      </div>

      {/* AI's answer */}
      <div style={{
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid rgba(26, 26, 46, 0.06)',
        background: 'rgba(250, 248, 245, 0.5)',
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
          AI says:
        </span>
        <Expandable maxLines={2} showMoreText="Read full answer" forceExpanded={revealed}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            color: 'var(--color-deep)',
            margin: 0,
            lineHeight: 1.6,
          }}>
            {payload.aiAnswer}
          </p>
        </Expandable>
      </div>

      {/* Trust or Challenge */}
      {!revealed && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setChoice('trust')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 10,
              border: `1.5px solid ${choice === 'trust' ? '#16C79A' : 'rgba(26, 26, 46, 0.08)'}`,
              background: choice === 'trust' ? 'rgba(22, 199, 154, 0.06)' : '#FFFFFF',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: choice === 'trust' ? '#16C79A' : 'var(--color-deep)',
              transition: 'all 0.15s',
            }}
          >
            Trust It
          </button>
          <button
            onClick={() => setChoice('challenge')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 10,
              border: `1.5px solid ${choice === 'challenge' ? '#E94560' : 'rgba(26, 26, 46, 0.08)'}`,
              background: choice === 'challenge' ? 'rgba(233, 69, 96, 0.04)' : '#FFFFFF',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: choice === 'challenge' ? '#E94560' : 'var(--color-deep)',
              transition: 'all 0.15s',
            }}
          >
            Challenge It
          </button>
        </div>
      )}

      {/* Submit */}
      {choice && !revealed && (
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
          Lock In
        </button>
      )}

      {/* Reveal */}
      {revealed && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 10,
          background: isCorrect ? 'rgba(22, 199, 154, 0.06)' : 'rgba(233, 69, 96, 0.04)',
          border: `1px solid ${isCorrect ? 'rgba(22, 199, 154, 0.15)' : 'rgba(233, 69, 96, 0.1)'}`,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: isCorrect ? '#16C79A' : '#E94560',
            display: 'block',
            marginBottom: 6,
          }}>
            {isCorrect ? 'Sharp thinking!' : 'Got you!'}
            {' '}The AI was {payload.aiIsCorrect ? 'correct' : 'wrong'}.
          </span>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--color-deep)',
            margin: '0 0 6px',
          }}>
            Correct answer: {payload.correctAnswer}
          </p>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: 'var(--color-deep)',
            margin: 0,
            lineHeight: 1.6,
          }}>
            {payload.reasoning}
          </p>
        </div>
      )}
    </div>
  );
}
