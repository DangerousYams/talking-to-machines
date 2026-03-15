import { useState, useEffect, useRef } from 'react';
import { breakTools } from '../data/break-tools';
import { getUnlockedTools, TOOLS_CHANGE_EVENT } from '../lib/tools-unlock';

export default function ToolsCollection() {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [featured, setFeatured] = useState<string | null>(null);

  useEffect(() => {
    setUnlocked(getUnlockedTools());
    setMounted(true);

    // Check for ?tool= query param
    const params = new URLSearchParams(window.location.search);
    const toolParam = params.get('tool');
    if (toolParam && breakTools.some(t => t.id === toolParam)) {
      setFeatured(toolParam);
    }

    const sync = () => setUnlocked(getUnlockedTools());
    window.addEventListener(TOOLS_CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(TOOLS_CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const count = unlocked.length;
  const featuredTool = featured ? breakTools.find(t => t.id === featured) : null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 6rem' }}>

      {/* Featured tool card (from ?tool= param) */}
      {featuredTool && (
        <FeaturedCard tool={featuredTool} isUnlocked={unlocked.includes(featuredTool.id)} mounted={mounted} />
      )}

      {/* Progress */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        marginBottom: 48,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
      }}>
        <div style={{
          flex: 1, height: 4, borderRadius: 2,
          background: 'rgba(26,26,46,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: 'linear-gradient(90deg, #E94560, #7B61FF, #16C79A)',
            width: `${(count / breakTools.length) * 100}%`,
            transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          }} />
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          color: count === breakTools.length ? '#16C79A' : 'var(--color-subtle)',
          flexShrink: 0,
        }}>
          {count}/{breakTools.length}
        </span>
      </div>

      {/* Tool grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16,
      }}>
        {breakTools.map((tool, i) => {
          const isUnlocked = unlocked.includes(tool.id);
          return (
            <ToolCard
              key={tool.id}
              tool={tool}
              isUnlocked={isUnlocked}
              index={i}
              mounted={mounted}
              isFeatured={tool.id === featured}
            />
          );
        })}
      </div>
    </div>
  );
}

function FeaturedCard({ tool, isUnlocked, mounted }: {
  tool: typeof breakTools[number];
  isUnlocked: boolean;
  mounted: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mounted && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [mounted]);

  return (
    <div
      ref={ref}
      style={{
        borderRadius: 16,
        border: `1.5px solid ${tool.accent}30`,
        background: `linear-gradient(135deg, ${tool.accent}06 0%, ${tool.accent}02 100%)`,
        padding: '32px 28px',
        marginBottom: 40,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: tool.accent,
          opacity: 0.7,
        }}>
          Chapter {String(tool.chapter).padStart(2, '0')}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.58rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-subtle)',
          opacity: 0.4,
        }}>
          /
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: isUnlocked ? '#16C79A' : 'var(--color-subtle)',
          opacity: isUnlocked ? 0.8 : 0.5,
        }}>
          {isUnlocked ? 'Unlocked' : 'Locked'}
        </span>
      </div>

      <h2 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(1.4rem, 4vw, 1.8rem)',
        fontWeight: 800,
        color: 'var(--color-deep)',
        margin: '0 0 10px',
        letterSpacing: '-0.02em',
      }}>
        {tool.name}
      </h2>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '1rem',
        lineHeight: 1.7,
        color: 'var(--color-deep)',
        opacity: 0.65,
        margin: '0 0 24px',
        maxWidth: '55ch',
      }}>
        {tool.description}
      </p>

      {isUnlocked ? (
        <a
          href={`/ch${tool.chapter}#break`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 24px',
            borderRadius: 100,
            background: tool.accent,
            color: 'white',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = `0 6px 24px ${tool.accent}30`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Open tool
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      ) : (
        <a
          href="/ch1"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 24px',
            borderRadius: 100,
            border: '1.5px solid rgba(26,26,46,0.12)',
            background: 'transparent',
            color: 'var(--color-deep)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textDecoration: 'none',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(26,26,46,0.03)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          Start reading to unlock
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      )}
    </div>
  );
}

function ToolCard({ tool, isUnlocked, index, mounted, isFeatured }: {
  tool: typeof breakTools[number];
  isUnlocked: boolean;
  index: number;
  mounted: boolean;
  isFeatured: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const delay = 0.3 + index * 0.06;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 14,
        border: `1px solid ${isFeatured
          ? `${tool.accent}40`
          : isUnlocked
            ? (hovered ? `${tool.accent}40` : `${tool.accent}18`)
            : 'rgba(26,26,46,0.06)'}`,
        background: isUnlocked
          ? (hovered ? `${tool.accent}08` : 'rgba(255,255,255,0.6)')
          : 'rgba(26,26,46,0.015)',
        padding: '28px 24px',
        transition: 'all 0.3s ease',
        cursor: isUnlocked ? 'pointer' : 'default',
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? (hovered && isUnlocked ? 'translateY(-2px)' : 'translateY(0)')
          : 'translateY(14px)',
        transitionProperty: 'opacity, transform, border-color, background, box-shadow',
        transitionDuration: mounted ? '0.3s' : '0.5s',
        transitionDelay: mounted ? '0s' : `${delay}s`,
        transitionTimingFunction: 'ease',
        boxShadow: hovered && isUnlocked
          ? `0 8px 32px ${tool.accent}12`
          : 'none',
      }}
      onClick={() => {
        if (isUnlocked) {
          window.location.href = `/ch${tool.chapter}#break`;
        }
      }}
    >
      {/* Chapter badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: isUnlocked ? tool.accent : 'var(--color-subtle)',
          opacity: isUnlocked ? 0.7 : 0.4,
        }}>
          Chapter {String(tool.chapter).padStart(2, '0')}
        </span>

        {/* Status icon */}
        {isUnlocked ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.4 }}>
            <path d="M20 6L9 17l-5-5" stroke={tool.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.25 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* Tool name */}
      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.15rem',
        fontWeight: 800,
        color: isUnlocked ? 'var(--color-deep)' : 'var(--color-subtle)',
        margin: '0 0 8px',
        lineHeight: 1.25,
        letterSpacing: '-0.01em',
        opacity: isUnlocked ? 1 : 0.5,
      }}>
        {tool.name}
      </h3>

      {/* Description or locked message */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.84rem',
        lineHeight: 1.6,
        color: isUnlocked ? 'var(--color-deep)' : 'var(--color-subtle)',
        opacity: isUnlocked ? 0.6 : 0.35,
        margin: 0,
      }}>
        {isUnlocked
          ? tool.description
          : `Complete Chapter ${tool.chapter} to unlock`
        }
      </p>
    </div>
  );
}
