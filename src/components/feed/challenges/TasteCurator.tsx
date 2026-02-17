import React, { useState } from 'react';
import type { ChallengeComponentProps, TasteCuratorPayload } from '../../../data/challenges';

export default function TasteCurator({ challenge, onSubmit, isMobile }: ChallengeComponentProps) {
  const payload = challenge.payload as TasteCuratorPayload;
  const [rankings, setRankings] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);

  const handleToggle = (id: string) => {
    if (revealed) return;
    setRankings((prev) => {
      if (prev.includes(id)) return prev.filter((r) => r !== id);
      if (prev.length >= payload.variants.length) return prev;
      return [...prev, id];
    });
  };

  const handleSubmit = () => {
    if (rankings.length === 0) return;
    setRevealed(true);
    const topPick = rankings[0];
    const matchesExpert = topPick === payload.expertTopPick;
    onSubmit({
      rankings,
      topPick,
      matchesExpert,
    });
  };

  const topPick = rankings[0];
  const matchesExpert = topPick === payload.expertTopPick;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Brief */}
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
          {payload.domain}
        </span>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: 'var(--color-deep)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {payload.brief}
        </p>
      </div>

      {/* Instructions */}
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        color: 'var(--color-subtle)',
        textTransform: 'uppercase',
        margin: 0,
      }}>
        Tap to rank (best first) — {rankings.length}/{payload.variants.length}
      </p>

      {/* Variants */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {payload.variants.map((variant) => {
          const rankIndex = rankings.indexOf(variant.id);
          const isRanked = rankIndex !== -1;
          const isExpertPick = revealed && variant.id === payload.expertTopPick;

          return (
            <button
              key={variant.id}
              onClick={() => handleToggle(variant.id)}
              disabled={revealed}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                border: `1.5px solid ${isExpertPick ? '#16C79A' : isRanked ? '#F5A623' : 'rgba(26, 26, 46, 0.08)'}`,
                background: isExpertPick ? 'rgba(22, 199, 154, 0.06)' : isRanked ? 'rgba(245, 166, 35, 0.04)' : '#FFFFFF',
                cursor: revealed ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              {isRanked && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#F5A623',
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'rgba(245, 166, 35, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {rankIndex + 1}
                </span>
              )}
              <div style={{ flex: 1 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: 'var(--color-subtle)',
                  display: 'block',
                  marginBottom: 2,
                }}>
                  {variant.label}
                  {isExpertPick && ' ★ Expert pick'}
                </span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  color: 'var(--color-deep)',
                  lineHeight: 1.5,
                }}>
                  {variant.content}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Submit */}
      {rankings.length > 0 && !revealed && (
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
          Submit Rankings
        </button>
      )}

      {/* Expert reasoning */}
      {revealed && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 10,
          background: matchesExpert ? 'rgba(22, 199, 154, 0.06)' : 'rgba(245, 166, 35, 0.04)',
          border: `1px solid ${matchesExpert ? 'rgba(22, 199, 154, 0.15)' : 'rgba(245, 166, 35, 0.1)'}`,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: matchesExpert ? '#16C79A' : '#F5A623',
            display: 'block',
            marginBottom: 6,
          }}>
            {matchesExpert ? 'Your taste matches the experts!' : 'Interesting — here\'s the expert take'}
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
    </div>
  );
}
