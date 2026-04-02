import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { unlockTool, isToolUnlocked } from '../../lib/tools-unlock';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  accentColor: string;
  toolName: string;
  children: ReactNode;
}

const PALETTE = ['#16C79A', '#7B61FF', '#E94560', '#F5A623', '#0EA5E9'];
const PARTICLE_COUNT = 28;
const CELEBRATION_MS = 2400;

// Deterministic-ish seed from tool name so each chapter's burst looks different
function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
}

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface Particle {
  x: number;   // final offset X (px)
  y: number;   // final offset Y (px)
  r: number;   // radius
  color: string;
  delay: number;
  duration: number;
}

export default function BreakReveal({ accentColor, toolName, children }: Props) {
  const t = useTranslation('breakReveal');
  const toolId = toolName.replace(/\s+/g, '-').toLowerCase();
  const alreadyUnlocked = typeof window !== 'undefined' && isToolUnlocked(toolId);

  const [phase, setPhase] = useState<'celebrating' | 'ready'>(
    alreadyUnlocked ? 'ready' : 'celebrating'
  );
  const [mounted, setMounted] = useState(false);

  // Generate particles with seeded random for consistency
  const particles = useMemo<Particle[]>(() => {
    const rand = seededRand(Math.abs(hashStr(toolName)));
    return Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = rand() * Math.PI * 2;
      const dist = 80 + rand() * 160;
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 20, // slight upward bias
        r: 4 + rand() * 10,
        color: PALETTE[Math.floor(rand() * PALETTE.length)],
        delay: rand() * 0.35,
        duration: 0.6 + rand() * 0.4,
      };
    });
  }, [toolName]);

  useEffect(() => {
    // Stagger the mount-in
    const t1 = setTimeout(() => setMounted(true), 80);

    if (phase === 'celebrating') {
      // Unlock immediately
      unlockTool(toolId);
      // Transition to ready after celebration
      const t2 = setTimeout(() => setPhase('ready'), CELEBRATION_MS);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    return () => clearTimeout(t1);
  }, [phase, toolId]);

  // Already unlocked — just show the tool
  if (phase === 'ready' && alreadyUnlocked && !mounted) {
    return <>{children}</>;
  }

  // Tool revealed after celebration
  if (phase === 'ready') {
    return (
      <div style={{
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}>
        {children}
      </div>
    );
  }

  // ── Celebration phase ──
  const id = toolId;

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 320,
      padding: '3rem 1.5rem',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes br-burst-${id} {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0);
          }
          20% {
            opacity: 0.9;
            transform: translate(calc(var(--bx) * 0.3), calc(var(--by) * 0.3)) scale(1.2);
          }
          60% {
            opacity: 0.7;
            transform: translate(var(--bx), var(--by)) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(calc(var(--bx) * 1.1), calc(var(--by) * 1.3 - 30px)) scale(0.6);
          }
        }
        @keyframes br-title-${id} {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(8px);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
        }
        @keyframes br-sub-${id} {
          0% {
            opacity: 0;
            transform: translateY(6px) rotate(-2deg);
          }
          100% {
            opacity: 0.8;
            transform: translateY(0) rotate(-2deg);
          }
        }
        @keyframes br-dot-pulse-${id} {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.3); opacity: 0.8; }
        }
        @keyframes br-line-grow-${id} {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}</style>

      {/* ── Particles ── */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '45%',
            width: p.r * 2,
            height: p.r * 2,
            marginLeft: -p.r,
            marginTop: -p.r,
            borderRadius: '50%',
            background: p.color,
            opacity: 0,
            willChange: 'transform, opacity',
            '--bx': `${p.x}px`,
            '--by': `${p.y}px`,
            animation: mounted
              ? `br-burst-${id} ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`
              : 'none',
            pointerEvents: 'none',
          } as React.CSSProperties}
        />
      ))}

      {/* ── Center accent line ── */}
      <div style={{
        width: 48,
        height: 2,
        background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)`,
        borderRadius: 2,
        marginBottom: 20,
        transformOrigin: 'center',
        animation: mounted ? `br-line-grow-${id} 0.5s ease 0.5s both` : 'none',
      }} />

      {/* ── Dot divider (matches the course's 5-dot pattern) ── */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 24,
      }}>
        {PALETTE.map((color, i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: color,
              opacity: 0,
              animation: mounted
                ? `br-dot-pulse-${id} 2s ease-in-out ${0.6 + i * 0.08}s infinite, br-sub-${id} 0.4s ease ${0.5 + i * 0.06}s forwards`
                : 'none',
            }}
          />
        ))}
      </div>

      {/* ── Tool name ── */}
      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(1.5rem, 5vw, 2rem)',
        fontWeight: 800,
        color: '#1A1A2E',
        margin: '0 0 8px',
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
        textAlign: 'center',
        opacity: 0,
        animation: mounted
          ? `br-title-${id} 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.45s forwards`
          : 'none',
      }}>
        {toolName}
      </h3>

      {/* ── Handwritten unlock note ── */}
      <p style={{
        fontFamily: "'Caveat', cursive",
        fontSize: 'clamp(1.1rem, 3vw, 1.35rem)',
        fontWeight: 600,
        color: accentColor,
        margin: 0,
        opacity: 0,
        animation: mounted
          ? `br-sub-${id} 0.5s ease 0.7s forwards`
          : 'none',
      }}>
        {t('newToolUnlocked', 'New tool unlocked!')}
      </p>
    </div>
  );
}
