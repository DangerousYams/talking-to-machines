import { useState, useEffect, type ReactNode } from 'react';
import { unlockTool } from '../../lib/tools-unlock';

interface Props {
  accentColor: string;
  toolName: string;
  children: ReactNode;
}

export default function BreakReveal({ accentColor, toolName, children }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (revealed) {
    return <>{children}</>;
  }

  // Unique ID for keyframes scoping
  const id = toolName.replace(/\s+/g, '-').toLowerCase();

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '3rem 1.5rem',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes br-shackle-${id} {
          0% { transform: rotate(0deg); transform-origin: right bottom; }
          20% { transform: rotate(-8deg); transform-origin: right bottom; }
          40% { transform: rotate(6deg); transform-origin: right bottom; }
          60% { transform: rotate(-4deg); transform-origin: right bottom; }
          80% { transform: rotate(2deg); transform-origin: right bottom; }
          100% { transform: rotate(0deg); transform-origin: right bottom; }
        }
        @keyframes br-glow-${id} {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
        @keyframes br-float-${id} {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes br-shimmer-${id} {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .br-lock-${id}:hover .br-shackle {
          animation: br-shackle-${id} 0.6s ease-in-out;
        }
        .br-cta-${id} {
          position: relative;
          overflow: hidden;
        }
        .br-cta-${id}::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%);
          transform: translateX(-100%);
          animation: br-shimmer-${id} 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>

      {/* Glow orb behind lock */}
      <div style={{
        position: 'absolute',
        width: 120, height: 120, borderRadius: '50%',
        background: `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)`,
        top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        animation: `br-glow-${id} 3s ease-in-out infinite`,
        pointerEvents: 'none',
      }} />

      {/* Lock icon with animated shackle */}
      <div
        className={`br-lock-${id}`}
        style={{
          position: 'relative',
          width: 56, height: 56,
          marginBottom: 20,
          cursor: 'default',
          animation: `br-float-${id} 3s ease-in-out infinite`,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* Lock body */}
        <svg
          width="56" height="56" viewBox="0 0 56 56" fill="none"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* Body */}
          <rect x="12" y="26" width="32" height="22" rx="4"
            fill={accentColor} opacity="0.12"
            stroke={accentColor} strokeWidth="2"
          />
          {/* Keyhole */}
          <circle cx="28" cy="35" r="3" fill={accentColor} opacity="0.5" />
          <rect x="27" y="36" width="2" height="5" rx="1" fill={accentColor} opacity="0.5" />
        </svg>
        {/* Shackle — separate so it can animate */}
        <svg
          className="br-shackle"
          width="56" height="56" viewBox="0 0 56 56" fill="none"
          style={{
            position: 'absolute', top: 0, left: 0,
            transformOrigin: '36px 26px',
          }}
        >
          <path
            d="M20 26V20a8 8 0 0 1 16 0v6"
            stroke={accentColor} strokeWidth="2.5" strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Tool name — the star of the show */}
      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(1.3rem, 4vw, 1.6rem)',
        fontWeight: 800,
        color: '#1A1A2E',
        margin: '0 0 4px',
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s',
      }}>
        {toolName}
      </h3>

      {/* Subtitle */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.88rem',
        color: '#6B7280',
        margin: '0 0 28px',
        lineHeight: 1.5,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s',
      }}>
        Chapter complete — new tool unlocked
      </p>

      {/* CTA button */}
      <button
        className={`br-cta-${id}`}
        onClick={() => {
          const toolId = toolName.replace(/\s+/g, '-').toLowerCase();
          unlockTool(toolId);
          setRevealed(true);
        }}
        style={{
          padding: '13px 36px',
          borderRadius: 100,
          border: `1.5px solid ${accentColor}`,
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          background: 'transparent',
          color: accentColor,
          transition: 'background 0.3s, color 0.3s, transform 0.3s, box-shadow 0.3s, opacity 0.5s ease 0.45s',
          opacity: mounted ? 1 : 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = accentColor;
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 8px 30px ${accentColor}35`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = accentColor;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        Open
      </button>
    </div>
  );
}
