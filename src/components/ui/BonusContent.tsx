import { useState, useRef, useEffect, type ReactNode } from 'react';

interface Props {
  accentColor: string;
  children: ReactNode;
}

export default function BonusContent({ accentColor, children }: Props) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const id = useRef(`bc-${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => {
    if (open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
      // After transition, switch to auto so inner content can grow
      const t = setTimeout(() => setHeight(-1), 600);
      return () => clearTimeout(t);
    } else {
      setHeight(0);
    }
  }, [open]);

  return (
    <section
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '0 1.5rem',
      }}
    >
      <style>{`
        @keyframes ${id}-dots {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }
        @keyframes ${id}-arrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
      `}</style>

      {/* ── Closed state: invitation banner ── */}
      {!open && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '3rem 2rem',
            borderRadius: 16,
            border: `1px solid ${accentColor}15`,
            background: `linear-gradient(135deg, ${accentColor}04, ${accentColor}08)`,
            cursor: 'pointer',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
          onClick={() => setOpen(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = accentColor + '30';
            e.currentTarget.style.boxShadow = `0 8px 40px ${accentColor}10`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = accentColor + '15';
            e.currentTarget.style.boxShadow = 'none';
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(true); }}
        >
          {/* Five dots */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {['#E94560', '#7B61FF', '#16C79A', '#F5A623', '#0EA5E9'].map((c, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: c,
                  opacity: 0.5,
                  animation: `${id}-dots 2.5s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>

          {/* Handwritten label */}
          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '1.2rem',
            fontWeight: 600,
            color: accentColor,
            margin: '0 0 6px',
            opacity: 0.8,
            transform: 'rotate(-1.5deg)',
          }}>
            Want more?
          </p>

          {/* Title */}
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.3rem, 4vw, 1.6rem)',
            fontWeight: 800,
            color: '#1A1A2E',
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
            textAlign: 'center',
          }}>
            Bonus Exercises
          </h3>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.88rem',
            color: '#6B7280',
            margin: '0 0 20px',
            textAlign: 'center',
            maxWidth: '36ch',
            lineHeight: 1.5,
          }}>
            Two hands-on experiments to go deeper with context engineering.
          </p>

          {/* Arrow */}
          <div style={{
            animation: `${id}-arrow 2s ease-in-out infinite`,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      )}

      {/* ── Open state: content reveal ── */}
      {open && (
        <div>
          {/* Section header (replaces the banner) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingTop: '1rem',
          }}>
            <p style={{
              fontFamily: "'Caveat', cursive",
              fontSize: '1.1rem',
              fontWeight: 600,
              color: accentColor,
              margin: '0 0 4px',
              opacity: 0.7,
              transform: 'rotate(-1.5deg)',
            }}>
              Bonus
            </p>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.2rem, 3.5vw, 1.4rem)',
              fontWeight: 800,
              color: '#1A1A2E',
              margin: 0,
              letterSpacing: '-0.02em',
            }}>
              Go Deeper
            </h3>
            <div style={{
              width: 40,
              height: 2,
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor}50)`,
              borderRadius: 2,
              marginTop: 12,
            }} />
          </div>

          {/* Animated content container */}
          <div
            ref={contentRef}
            style={{
              overflow: 'hidden',
              height: height === -1 ? 'auto' : height,
              transition: 'height 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '3rem',
            }}>
              {children}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
