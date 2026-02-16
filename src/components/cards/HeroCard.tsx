import { useEffect, useState } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface HeroCardProps {
  chapterNumber: number;
  title: string;
  hook: string;
  accentColor: string;
  isActive?: boolean;
  cardIndex?: number;
  totalCards?: number;
  onMenuOpen?: () => void;
}

export default function HeroCard({ chapterNumber, title, hook, accentColor, isActive = false, cardIndex, totalCards, onMenuOpen }: HeroCardProps) {
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
      aria-label={`Chapter ${chapterNumber}: ${title}`}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '32px 24px' : '48px 32px',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--color-cream)',
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

      {/* Watermark number */}
      <span
        style={{
          position: 'absolute',
          right: '-0.05em',
          top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: 'var(--font-heading)',
          fontSize: isMobile ? 'clamp(8rem, 40vw, 14rem)' : 'clamp(12rem, 20vw, 20rem)',
          fontWeight: 900,
          lineHeight: 1,
          opacity: 0.04,
          color: accentColor,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {chapterNumber}
      </span>

      {/* Chapter label */}
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: isMobile ? '0.7rem' : '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: accentColor,
          marginBottom: isMobile ? 8 : 12,
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(12px)',
          transition: reducedMotion ? 'none' : 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        Chapter {chapterNumber}
      </p>

      {/* Title */}
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: isMobile ? 'clamp(1.8rem, 8vw, 2.5rem)' : 'clamp(2.5rem, 5vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          color: 'var(--color-deep)',
          textAlign: 'center',
          maxWidth: 560,
          margin: '0 0 16px',
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(16px)',
          transition: reducedMotion ? 'none' : 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s',
        }}
      >
        {title}
      </h1>

      {/* Hook */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: isMobile ? '0.95rem' : '1.1rem',
          fontStyle: 'italic',
          color: 'var(--color-subtle)',
          textAlign: 'center',
          maxWidth: 440,
          lineHeight: 1.6,
          margin: 0,
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(12px)',
          transition: reducedMotion ? 'none' : 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s',
        }}
      >
        {hook}
      </p>

      {/* Scroll hint */}
      <div
        style={{
          position: 'absolute',
          bottom: isMobile ? 24 : 32,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: show ? 0.35 : 0,
          transition: reducedMotion ? 'none' : 'opacity 0.6s ease 0.6s',
          animation: reducedMotion ? 'none' : 'card-hero-bounce 2s ease-in-out infinite',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      <style>{`
        @keyframes card-hero-bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
      `}</style>
    </div>
  );
}
