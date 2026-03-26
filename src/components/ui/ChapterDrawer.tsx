import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { chapters } from '../../data/chapters';
import { useAuth } from '../../hooks/useAuth';
import { usePersona } from '../../hooks/usePersona';

interface Props {
  currentSlug: string;
  accentColor: string;
  locale?: string;
}

export default function ChapterDrawer({ currentSlug, accentColor, locale = 'en' }: Props) {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const [isOpen, setIsOpen] = useState(false);
  const { isPaid } = useAuth();
  const { persona } = usePersona();
  const drawerRef = useRef<HTMLDivElement>(null);

  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // Focus first link when opened
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;
    const first = drawerRef.current.querySelector<HTMLElement>('a[href]');
    if (first) first.focus();
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleBackdrop = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setIsOpen(false);
  }, []);

  return (
    <>
      {/* Toggle button — fits into the header bar */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open chapter list"
        aria-expanded={isOpen}
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-subtle)',
          opacity: 0.6,
          transition: 'opacity 0.2s, color 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--color-deep)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.color = 'var(--color-subtle)'; }}
      >
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="2" y1="4" x2="14" y2="4" />
          <line x1="2" y1="8" x2="14" y2="8" />
          <line x1="2" y1="12" x2="10" y2="12" />
        </svg>
      </button>

      {/* Portal: render backdrop + drawer into document.body to escape
           the header's backdrop-filter containing block */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={handleBackdrop}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              background: 'rgba(0,0,0,0.3)',
              opacity: isOpen ? 1 : 0,
              pointerEvents: isOpen ? 'auto' : 'none',
              transition: reducedMotion ? 'none' : 'opacity 0.25s ease',
            }}
          />

          {/* Drawer panel */}
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Chapter list"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 300,
              zIndex: 51,
              background: 'var(--color-cream, #FAF8F5)',
              boxShadow: isOpen ? '4px 0 24px rgba(0,0,0,0.08)' : 'none',
              transform: isOpen ? 'translateX(0)' : 'translateX(-300px)',
              transition: reducedMotion ? 'none' : 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 8px' }}>
              <a
                href="/"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'var(--color-deep)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Home
              </a>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chapter list"
                style={{
                  width: 32,
                  height: 32,
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
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Section label */}
            <div style={{
              padding: '12px 20px 6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-subtle)',
            }}>
              Chapters
            </div>

            {/* Chapter list */}
            <nav style={{ padding: '0 10px 20px' }}>
              {chapters.map((ch) => {
                const isCurrent = ch.slug === currentSlug;
                return (
                  <>
                    <a
                      key={ch.slug}
                      href={`${prefix}/${ch.slug}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 10px',
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
                      <span style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: isCurrent ? accentColor : 'rgba(0,0,0,0.05)',
                        color: isCurrent ? '#fff' : 'var(--color-subtle)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {ch.number}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.82rem',
                        fontWeight: isCurrent ? 600 : 400,
                        color: isCurrent ? accentColor : 'var(--color-deep)',
                        lineHeight: 1.3,
                      }}>
                        {ch.title}
                      </span>
                    </a>
                    {/* Playbook interlude after ch3 */}
                    {ch.number === 3 && locale === 'en' && (
                      <a
                        key="playbook"
                        href="/playbook"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '7px 10px',
                          margin: '2px 0',
                          borderRadius: 8,
                          textDecoration: 'none',
                          background: currentSlug === 'playbook' ? '#16C79A0A' : 'transparent',
                          borderLeft: '2px dashed #16C79A30',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(22,199,154,0.04)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = currentSlug === 'playbook' ? '#16C79A0A' : 'transparent'; }}
                      >
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: currentSlug === 'playbook' ? '#16C79A' : 'rgba(22,199,154,0.1)',
                          color: currentSlug === 'playbook' ? '#fff' : '#16C79A',
                          fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          &#9830;
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                          fontWeight: currentSlug === 'playbook' ? 600 : 400,
                          color: currentSlug === 'playbook' ? '#16C79A' : '#16C79A90',
                          lineHeight: 1.3, fontStyle: 'italic',
                        }}>
                          The Playbook
                        </span>
                      </a>
                    )}
                  </>
                );
              })}
            </nav>

            {/* Resources divider + links */}
            <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '0 20px' }} />
            <nav style={{ padding: '12px 10px 24px' }}>
              <a
                href="/course"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 10px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  color: 'var(--color-deep)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '0.85rem', width: 22, textAlign: 'center' }}>🎓</span>
                Live Course
              </a>
              <a
                href="/toolbox"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 10px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  color: 'var(--color-deep)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '0.85rem', width: 22, textAlign: 'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                </span>
                Toolbox
              </a>
              {isPaid && (
                <a
                  href="/personalize"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 10px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.82rem',
                    color: 'var(--color-deep)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: '0.85rem', width: 22, textAlign: 'center' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </span>
                  {persona ? 'My Profile' : 'Personalize'}
                </a>
              )}
            </nav>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
