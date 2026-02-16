import { useEffect, useState } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface ClosingCardProps {
  summaryQuote: string;
  nextChapterTitle: string;
  nextChapterHref: string;
  accentColor: string;
  isActive?: boolean;
  cardIndex?: number;
  totalCards?: number;
  onMenuOpen?: () => void;
}

export default function ClosingCard({ summaryQuote, nextChapterTitle, nextChapterHref, accentColor, isActive = false, cardIndex, totalCards, onMenuOpen }: ClosingCardProps) {
  const [entered, setEntered] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isActive && !entered) {
      const t = setTimeout(() => setEntered(true), 100);
      return () => clearTimeout(t);
    }
  }, [isActive, entered]);

  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const show = entered || reducedMotion;

  return (
    <div
      role="region"
      aria-label="Chapter closing"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '32px 24px' : '48px 32px',
        background: 'var(--color-cream)',
        gap: isMobile ? 28 : 40,
        position: 'relative',
      }}
    >
      {/* Menu button */}
      <button
        onClick={onMenuOpen}
        aria-label="Open navigation menu"
        style={{
          position: 'absolute',
          top: isMobile ? 10 : 14,
          left: isMobile ? 10 : 14,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          color: 'var(--color-subtle)',
          zIndex: 5,
        }}
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Progress counter */}
      {cardIndex != null && totalCards != null && (
        <span
          style={{
            position: 'absolute',
            top: isMobile ? 12 : 16,
            right: isMobile ? 14 : 18,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            color: 'var(--color-subtle)',
            opacity: 0.4,
            letterSpacing: '0.02em',
          }}
        >
          {cardIndex}/{totalCards}
        </span>
      )}
      <blockquote
        style={{
          maxWidth: isMobile ? 340 : 460,
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
          fontSize: isMobile ? '1.05rem' : 'clamp(1.15rem, 2.5vw, 1.35rem)',
          fontStyle: 'italic',
          lineHeight: 1.55,
          color: 'var(--color-navy)',
          margin: 0,
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(12px)',
          transition: reducedMotion ? 'none' : 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        {summaryQuote}
      </blockquote>

      <div
        style={{
          width: 40,
          height: 3,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)`,
          opacity: show ? 1 : 0,
          transition: reducedMotion ? 'none' : 'opacity 0.5s ease 0.2s',
        }}
      />

      <a
        href={nextChapterHref}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'var(--font-heading)',
          fontSize: isMobile ? '0.95rem' : '1.1rem',
          fontWeight: 700,
          color: accentColor,
          textDecoration: 'none',
          padding: isMobile ? '12px 24px' : '14px 28px',
          borderRadius: 12,
          border: `2px solid ${accentColor}30`,
          background: `${accentColor}08`,
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(8px)',
          transition: reducedMotion ? 'none' : 'opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s, background 0.2s ease, border-color 0.2s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${accentColor}15`;
          e.currentTarget.style.borderColor = `${accentColor}50`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `${accentColor}08`;
          e.currentTarget.style.borderColor = `${accentColor}30`;
        }}
      >
        Next: {nextChapterTitle}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </a>
    </div>
  );
}
