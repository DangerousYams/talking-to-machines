import { useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { chapters } from '../../data/chapters';

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
  currentChapterSlug?: string;
}

export default function NavDrawer({ isOpen, onClose, accentColor, currentChapterSlug }: NavDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const drawerWidth = isMobile ? 280 : 320;

  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Trap focus inside drawer when open
  useEffect(() => {
    if (!isOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    if (focusable.length) focusable[0].focus();
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const resources = [
    { label: 'Lab', emoji: '\uD83E\uDDEA', href: '/lab' },
    { label: 'Tools', emoji: '\uD83D\uDD27', href: '/tools' },
    { label: 'Practice', emoji: '\uD83D\uDCDD', href: '/practice' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          background: 'rgba(0,0,0,0.4)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: reducedMotion ? 'none' : 'opacity 0.3s ease',
        }}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: drawerWidth,
          zIndex: 51,
          background: '#fff',
          boxShadow: isOpen ? '4px 0 24px rgba(0,0,0,0.12)' : 'none',
          transform: isOpen ? 'translateX(0)' : `translateX(-${drawerWidth}px)`,
          transition: reducedMotion ? 'none' : 'transform 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-subtle)',
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Home link */}
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--color-deep)',
            textDecoration: 'none',
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Home
        </a>

        {/* Section label */}
        <div
          style={{
            padding: '16px 24px 8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-subtle)',
          }}
        >
          Chapters
        </div>

        {/* Chapter list */}
        <nav style={{ padding: '0 12px' }}>
          {chapters.map((ch) => {
            const isCurrent = ch.slug === currentChapterSlug;
            return (
              <a
                key={ch.slug}
                href={`/${ch.slug}-cards`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  background: isCurrent ? `${accentColor}0A` : 'transparent',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isCurrent ? `${accentColor}0A` : 'transparent';
                }}
              >
                {/* Chapter number */}
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: isCurrent ? accentColor : 'rgba(0,0,0,0.06)',
                    color: isCurrent ? '#fff' : 'var(--color-subtle)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {ch.number}
                </span>

                {/* Title */}
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent ? accentColor : 'var(--color-deep)',
                    lineHeight: 1.3,
                  }}
                >
                  {ch.title}
                </span>
              </a>
            );
          })}
        </nav>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: 'rgba(0,0,0,0.06)',
            margin: '16px 24px',
          }}
        />

        {/* Resources */}
        <nav style={{ padding: '0 12px 24px' }}>
          {resources.map((r) => (
            <a
              key={r.href}
              href={r.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: 'var(--color-deep)',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '1rem', width: 24, textAlign: 'center' }}>{r.emoji}</span>
              {r.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
