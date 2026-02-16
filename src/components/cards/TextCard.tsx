import { useEffect, useState, type ReactNode } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';
import CardActionBar from './CardActionBar';

interface TextCardProps {
  children: ReactNode;
  variant?: 'narrative' | 'pull-quote';
  accentColor?: string;
  isActive?: boolean;
  cardIndex?: number;
  totalCards?: number;
  onMenuOpen?: () => void;
  chapterSlug?: string;
  audioIndices?: number[];
}

export default function TextCard({
  children,
  variant = 'narrative',
  accentColor = '#E94560',
  isActive = false,
  cardIndex = 1,
  totalCards = 1,
  onMenuOpen,
  chapterSlug,
  audioIndices,
}: TextCardProps) {
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

  const isPullQuote = variant === 'pull-quote';
  const hasAudio = !!(chapterSlug && audioIndices?.length);
  const barHeight = 50;

  return (
    <div
      role="region"
      aria-label={isPullQuote ? 'Pull quote' : 'Narrative'}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--color-cream)',
      }}
    >
      {/* ── Action bar (only if has audio) ── */}
      {hasAudio ? (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5 }}>
          <CardActionBar
            cardIndex={cardIndex}
            totalCards={totalCards}
            accentColor={accentColor}
            onMenuOpen={onMenuOpen}
            chapterSlug={chapterSlug}
            audioIndices={audioIndices}
            isActive={isActive}
          />
        </div>
      ) : (
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
      )}

      {/* ── Content ── */}
      <div
        style={{
          position: 'absolute',
          top: hasAudio ? barHeight : 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: isPullQuote ? 'center' : 'flex-start',
          justifyContent: 'center',
          padding: isMobile ? '24px 20px' : '40px 32px',
        }}
      >
        <div
          style={{
            maxWidth: isPullQuote ? 480 : 560,
            width: '100%',
            opacity: entered || reducedMotion ? 1 : 0,
            transform: entered || reducedMotion ? 'translateY(0)' : 'translateY(16px)',
            transition: reducedMotion ? 'none' : 'opacity 0.5s ease, transform 0.5s ease',
            ...(isPullQuote
              ? {
                  fontFamily: 'var(--font-body)',
                  fontSize: isMobile ? '1.15rem' : 'clamp(1.3rem, 3.5vw, 1.6rem)',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                  color: 'var(--color-navy)',
                  borderLeft: `3px solid ${accentColor}`,
                  paddingLeft: isMobile ? '1rem' : '1.5rem',
                }
              : {
                  fontFamily: 'var(--font-body)',
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  lineHeight: 1.75,
                  color: 'var(--color-deep)',
                }),
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
