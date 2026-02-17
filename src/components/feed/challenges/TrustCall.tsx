import React, { useState } from 'react';
import type { ChallengeComponentProps, TrustCallPayload } from '../../../data/challenges';

const RISK_COLORS = {
  low: '#16C79A',
  medium: '#F5A623',
  high: '#E94560',
};

export default function TrustCall({ challenge, onSubmit }: ChallengeComponentProps) {
  const payload = challenge.payload as TrustCallPayload;
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSubmit = () => {
    if (!selected) return;
    setRevealed(true);
    onSubmit({
      selectedId: selected,
      isOptimal: selected === payload.bestChoice,
    });
  };

  const isOptimal = selected === payload.bestChoice;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Scenario */}
      <div style={{
        padding: '14px 16px',
        borderRadius: 10,
        background: 'rgba(14, 165, 233, 0.04)',
        border: '1px solid rgba(14, 165, 233, 0.1)',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--color-deep)',
          margin: '0 0 6px',
          lineHeight: 1.4,
        }}>
          {payload.scenario}
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: 'var(--color-subtle)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {payload.context}
        </p>
      </div>

      {/* Question */}
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        color: 'var(--color-subtle)',
        textTransform: 'uppercase',
        margin: 0,
      }}>
        How much autonomy should the AI have?
      </p>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {payload.options.map((option) => {
          const isSelected = selected === option.id;
          const isBest = revealed && option.id === payload.bestChoice;
          const isWrongPick = revealed && isSelected && !isOptimal;
          const riskColor = RISK_COLORS[option.risk];

          let borderColor = 'rgba(26, 26, 46, 0.08)';
          let bgColor = '#FFFFFF';
          if (isSelected && !revealed) {
            borderColor = '#0EA5E9';
            bgColor = 'rgba(14, 165, 233, 0.04)';
          }
          if (isBest) {
            borderColor = '#16C79A';
            bgColor = 'rgba(22, 199, 154, 0.06)';
          }
          if (isWrongPick) {
            borderColor = '#E94560';
            bgColor = 'rgba(233, 69, 96, 0.04)';
          }

          return (
            <button
              key={option.id}
              onClick={() => !revealed && setSelected(option.id)}
              disabled={revealed}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                border: `1.5px solid ${borderColor}`,
                background: bgColor,
                cursor: revealed ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                color: 'var(--color-deep)',
                flex: 1,
              }}>
                {option.label}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: riskColor,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: 10,
                background: `${riskColor}10`,
                flexShrink: 0,
              }}>
                {option.risk} risk
              </span>
            </button>
          );
        })}
      </div>

      {/* Submit */}
      {selected && !revealed && (
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
          Make the Call
        </button>
      )}

      {/* Explanation */}
      {revealed && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 10,
          background: isOptimal ? 'rgba(22, 199, 154, 0.06)' : 'rgba(14, 165, 233, 0.04)',
          border: `1px solid ${isOptimal ? 'rgba(22, 199, 154, 0.15)' : 'rgba(14, 165, 233, 0.1)'}`,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: isOptimal ? '#16C79A' : '#0EA5E9',
            display: 'block',
            marginBottom: 6,
          }}>
            {isOptimal ? 'Great judgment!' : 'Worth reconsidering'}
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
      )}
    </div>
  );
}
