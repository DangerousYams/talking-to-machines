import { useState, type ReactNode } from 'react';

interface FlipCardProps {
  frontContent: ReactNode;
  backTitle: string;
  backContent: ReactNode;
  accentColor: string;
  flipLabel?: string;
}

export default function FlipCard({
  frontContent,
  backTitle,
  backContent,
  accentColor,
  flipLabel = 'Why did that work?',
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div style={{ perspective: '1200px' }}>
      <div
        style={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s ease',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT FACE ── */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            position: 'relative',
          }}
        >
          {frontContent}

          <button
            onClick={() => setFlipped(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.75rem 1.25rem',
              marginTop: '1rem',
              background: 'none',
              border: `1px solid ${accentColor}30`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: accentColor,
              fontWeight: 500,
              letterSpacing: '0.01em',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${accentColor}08`;
              e.currentTarget.style.borderColor = `${accentColor}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.borderColor = `${accentColor}30`;
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 1l4 4-4 4" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <path d="M7 23l-4-4 4-4" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            {flipLabel}
          </button>
        </div>

        {/* ── BACK FACE ── */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            background: 'var(--color-cream, #F8F6F3)',
            borderRadius: '12px',
            border: `1px solid ${accentColor}20`,
            padding: '2rem',
          }}
        >
          {/* Accent bar */}
          <div
            style={{
              width: '3rem',
              height: '3px',
              borderRadius: '2px',
              background: accentColor,
              marginBottom: '1.25rem',
            }}
          />

          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: accentColor,
              margin: '0 0 1.25rem',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {backTitle}
          </h3>

          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              lineHeight: 1.75,
              color: 'var(--color-deep, #1A1A2E)',
            }}
          >
            {backContent}
          </div>

          <button
            onClick={() => setFlipped(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1.5rem',
              padding: '0.65rem 1.25rem',
              background: accentColor,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'white',
              fontWeight: 600,
              letterSpacing: '0.01em',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.85';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Back to widget
          </button>
        </div>
      </div>
    </div>
  );
}
