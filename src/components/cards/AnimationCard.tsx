import type { ReactNode } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface AnimationCardProps {
  children: ReactNode;
  caption?: string;
  isActive?: boolean;
  cardIndex?: number;
  totalCards?: number;
  onMenuOpen?: () => void;
}

export default function AnimationCard({ children, caption, isActive = false, cardIndex, totalCards, onMenuOpen }: AnimationCardProps) {
  const isMobile = useIsMobile();

  return (
    <div
      role="region"
      aria-label={caption || 'Animation'}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : '32px 32px',
        background: 'var(--color-cream)',
        position: 'relative',
        overflow: 'hidden',
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
            zIndex: 5,
          }}
        >
          {cardIndex}/{totalCards}
        </span>
      )}
      <div
        style={{
          maxWidth: isMobile ? '100%' : 900,
          width: '100%',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0,
          ...(isMobile ? { flexDirection: 'column' as const } : {}),
        }}
      >
        {isActive ? (
          isMobile ? (
            <div style={{
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              padding: '8px 0',
            }}>
              {children}
            </div>
          ) : children
        ) : null}
      </div>

      {caption && (
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 500,
            letterSpacing: '0.04em',
            color: isMobile ? 'rgba(107,114,128,0.9)' : 'var(--color-subtle)',
            textAlign: 'center',
            margin: 0,
            maxWidth: isMobile ? '100%' : 360,
            opacity: isMobile ? 1 : 0.6,
            ...(isMobile ? {
              position: 'absolute' as const,
              bottom: 0,
              left: 0,
              right: 0,
              padding: '12px 16px',
              background: 'linear-gradient(transparent, rgba(248,246,243,0.85) 30%, rgba(248,246,243,0.95))',
              zIndex: 4,
            } : {}),
          }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}
