import React from 'react';

interface FeedHeroCardProps {
  totalChallenges: number;
  completedCount: number;
}

export default function FeedHeroCard({ totalChallenges, completedCount }: FeedHeroCardProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '2rem 1.5rem',
      textAlign: 'center',
      background: 'linear-gradient(165deg, #FAF8F5 0%, #F0EDFF 40%, #FFF0F3 70%, #FAF8F5 100%)',
    }}>
      {/* Icon */}
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 16,
        background: 'linear-gradient(135deg, #7B61FF, #E94560)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 24px rgba(123, 97, 255, 0.2)',
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>

      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
        fontWeight: 800,
        color: 'var(--color-deep)',
        margin: '0 0 0.75rem',
        lineHeight: 1.1,
      }}>
        The Arena
      </h1>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
        color: 'var(--color-subtle)',
        lineHeight: 1.6,
        margin: '0 0 1.5rem',
        maxWidth: 400,
      }}>
        Creative challenges that build real AI skills. Make things, then see how your approach compares to others.
      </p>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        marginBottom: '2rem',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--color-deep)',
          }}>
            {totalChallenges}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 500,
            color: 'var(--color-subtle)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Challenges
          </div>
        </div>
        {completedCount > 0 && (
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#16C79A',
            }}>
              {completedCount}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 500,
              color: 'var(--color-subtle)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              Done
            </div>
          </div>
        )}
      </div>

      {/* Scroll hint */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        opacity: 0.4,
        animation: 'feedPulse 2s ease-in-out infinite',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--color-subtle)',
        }}>
          Scroll to start
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      <style>{`
        @keyframes feedPulse {
          0%, 100% { opacity: 0.4; transform: translateY(0); }
          50% { opacity: 0.7; transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
}
