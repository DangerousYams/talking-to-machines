import React from 'react';
import type { Challenge } from '../../data/challenges';
import { CHALLENGE_TYPE_META, CONCEPT_AREA_LABELS } from '../../data/challenges';

interface FeedCardProps {
  challenge: Challenge;
  children: React.ReactNode;
  isCompleted: boolean;
}

export default function FeedCard({ challenge, children, isCompleted }: FeedCardProps) {
  const meta = CHALLENGE_TYPE_META[challenge.type];
  const conceptLabel = CONCEPT_AREA_LABELS[challenge.conceptArea];

  return (
    <div
      className="feed-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top bar: type badge + concept tag */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px 8px',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 10px',
          borderRadius: 20,
          background: `${meta.color}10`,
          border: `1px solid ${meta.color}20`,
        }}>
          <span style={{ fontSize: '0.8rem' }}>{meta.icon}</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: meta.color,
            textTransform: 'uppercase',
          }}>
            {meta.label}
          </span>
        </div>

        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          fontWeight: 500,
          letterSpacing: '0.04em',
          color: 'var(--color-subtle)',
          textTransform: 'uppercase',
        }}>
          {conceptLabel}
        </span>
      </div>

      {/* Title + brief */}
      <div style={{ padding: '4px 16px 12px', flexShrink: 0 }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--color-deep)',
          margin: '0 0 4px',
          lineHeight: 1.3,
        }}>
          {challenge.title}
        </h3>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: 'var(--color-subtle)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {challenge.brief}
        </p>
      </div>

      {/* Interaction slot */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '0 16px 16px',
        WebkitOverflowScrolling: 'touch' as any,
      }}>
        {children}
      </div>

      {/* Completed indicator */}
      {isCompleted && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#16C79A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </div>
  );
}
