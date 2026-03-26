import { useState, useRef, useEffect, type ReactNode } from 'react';

interface Props {
  name: string;
  accentColor: string;
  /** Icon type: 'experiment' | 'terminal' | 'search' | 'puzzle' */
  icon?: string;
  children: ReactNode;
}

function ActivityIcon({ type, color }: { type: string; color: string }) {
  const props = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (type) {
    case 'experiment':
      return <svg {...props}><path d="M9 3h6M12 3v7l-4 8h8l-4-8V3"/><circle cx="8" cy="21" r="1"/><circle cx="16" cy="21" r="1"/></svg>;
    case 'terminal':
      return <svg {...props}><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>;
    case 'search':
      return <svg {...props}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case 'puzzle':
      return <svg {...props}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
    default:
      return <svg {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  }
}

export default function BonusActivity({ name, accentColor, icon, children }: Props) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
      const t = setTimeout(() => setHeight(-1), 600);
      return () => clearTimeout(t);
    } else {
      setHeight(0);
    }
  }, [open]);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 1.5rem' }}>
      {/* Button — always visible */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 20px',
          borderRadius: 12,
          border: `1px solid ${open ? accentColor + '30' : 'rgba(26,26,46,0.08)'}`,
          background: open ? `${accentColor}06` : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          textAlign: 'left' as const,
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = accentColor + '25';
            e.currentTarget.style.background = `${accentColor}04`;
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)';
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        {/* Icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: `${accentColor}12`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <ActivityIcon type={icon || 'puzzle'} color={accentColor} />
        </div>

        {/* Label */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: accentColor,
            margin: '0 0 2px',
            opacity: 0.7,
          }}>
            Bonus Activity
          </p>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#1A1A2E',
            margin: 0,
            lineHeight: 1.3,
          }}>
            {name}
          </p>
        </div>

        {/* Chevron */}
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{
            flexShrink: 0, opacity: 0.5,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Content reveal */}
      <div
        ref={contentRef}
        style={{
          overflow: 'hidden',
          height: height === -1 ? 'auto' : height,
          transition: 'height 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div style={{ paddingTop: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
