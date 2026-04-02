import { useState, useEffect } from 'react';
import { toolboxItems, categories, type ToolCategory } from '../data/break-tools';

const CATEGORY_ORDER: ToolCategory[] = ['fun', 'useful', 'quiz'];

export default function ToolsCollection() {
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ToolCategory | 'all'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = activeFilter === 'all'
    ? toolboxItems
    : toolboxItems.filter(t => t.category === activeFilter);

  const grouped = CATEGORY_ORDER
    .map(cat => ({
      key: cat,
      ...categories[cat],
      items: filtered.filter(t => t.category === cat),
    }))
    .filter(g => g.items.length > 0);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 6rem' }}>

      {/* Filter pills */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 48,
        flexWrap: 'wrap',
        justifyContent: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s',
      }}>
        <FilterPill
          label="All"
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
          color="var(--color-deep)"
        />
        {CATEGORY_ORDER.map(cat => (
          <FilterPill
            key={cat}
            label={categories[cat].label}
            active={activeFilter === cat}
            onClick={() => setActiveFilter(cat)}
            color={cat === 'fun' ? '#E94560' : cat === 'useful' ? '#16C79A' : '#7B61FF'}
          />
        ))}
      </div>

      {/* Category sections */}
      {grouped.map((group, gi) => (
        <section key={group.key} style={{ marginBottom: gi < grouped.length - 1 ? 56 : 0 }}>
          {/* Section header */}
          <div style={{
            marginBottom: 20,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(10px)',
            transition: `opacity 0.5s ease ${0.2 + gi * 0.1}s, transform 0.5s ease ${0.2 + gi * 0.1}s`,
          }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.3rem, 3vw, 1.6rem)',
              fontWeight: 800,
              color: 'var(--color-deep)',
              margin: '0 0 4px',
              letterSpacing: '-0.02em',
            }}>
              {group.label}
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.88rem',
              color: 'var(--color-subtle)',
              margin: 0,
              lineHeight: 1.5,
            }}>
              {group.subtitle}
            </p>
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 14,
          }}>
            {group.items.map((tool, i) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                index={i}
                mounted={mounted}
                baseDelay={0.25 + gi * 0.1}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function FilterPill({ label, active, onClick, color }: {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '7px 18px',
        borderRadius: 100,
        border: `1.5px solid ${active ? color : 'rgba(26,26,46,0.10)'}`,
        background: active ? color : (hovered ? 'rgba(26,26,46,0.03)' : 'transparent'),
        color: active ? 'white' : 'var(--color-deep)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function ToolCard({ tool, index, mounted, baseDelay }: {
  tool: typeof toolboxItems[number];
  index: number;
  mounted: boolean;
  baseDelay: number;
}) {
  const [hovered, setHovered] = useState(false);
  const delay = baseDelay + index * 0.04;

  return (
    <a
      href={tool.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        textDecoration: 'none',
        position: 'relative',
        borderRadius: 14,
        border: `1px solid ${hovered ? `${tool.accent}40` : `${tool.accent}18`}`,
        background: hovered ? `${tool.accent}08` : 'rgba(255,255,255,0.6)',
        padding: '24px 22px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? (hovered ? 'translateY(-2px)' : 'translateY(0)')
          : 'translateY(14px)',
        transitionProperty: 'opacity, transform, border-color, background, box-shadow',
        transitionDuration: mounted ? '0.3s' : '0.5s',
        transitionDelay: mounted ? '0s' : `${delay}s`,
        transitionTimingFunction: 'ease',
        boxShadow: hovered ? `0 8px 32px ${tool.accent}12` : 'none',
      }}
    >
      {/* Accent dot + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: tool.accent,
          flexShrink: 0,
          opacity: 0.7,
        }} />
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.05rem',
          fontWeight: 800,
          color: 'var(--color-deep)',
          margin: 0,
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
        }}>
          {tool.name}
        </h3>
      </div>

      {/* Description */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.82rem',
        lineHeight: 1.6,
        color: 'var(--color-deep)',
        opacity: 0.55,
        margin: 0,
        paddingLeft: 18,
      }}>
        {tool.description}
      </p>
    </a>
  );
}
