import { useState, useMemo } from 'react';
import { toolsCatalog, categoryLabels, categoryColors, type ToolCategory, type Tool } from '../../../data/tools-catalog';
import { useIsMobile } from '../../../hooks/useMediaQuery';

const allCategories: (ToolCategory | 'all')[] = [
  'all', 'image-gen', 'image-edit', 'video', 'music', 'audio', 'research', 'browser', 'coding',
];

const pricingColors: Record<string, { bg: string; text: string; label: string }> = {
  free: { bg: 'rgba(22, 199, 154, 0.1)', text: '#16C79A', label: 'Free' },
  freemium: { bg: 'rgba(245, 166, 35, 0.1)', text: '#F5A623', label: 'Freemium' },
  paid: { bg: 'rgba(233, 69, 96, 0.1)', text: '#E94560', label: 'Paid' },
};

function ToolCard({ tool, isExpanded, onToggle, isMobile }: { tool: Tool; isExpanded: boolean; onToggle: () => void; isMobile: boolean }) {
  const catColor = categoryColors[tool.category];
  const pricing = pricingColors[tool.pricing];

  return (
    <div
      onClick={onToggle}
      style={{
        background: isExpanded ? '#FEFDFB' : 'white',
        border: `1px solid ${isExpanded ? catColor + '30' : 'rgba(26,26,46,0.06)'}`,
        borderRadius: 12,
        padding: isMobile ? '1rem' : '1.25rem 1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isExpanded
          ? `0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px ${catColor}15`
          : '0 1px 4px rgba(0,0,0,0.03)',
        breakInside: 'avoid' as const,
        marginBottom: '0.75rem',
      }}
    >
      {/* Top line with badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' as const }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase' as const,
          color: catColor,
          background: catColor + '12',
          padding: '2px 8px',
          borderRadius: 4,
        }}>
          {categoryLabels[tool.category]}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase' as const,
          color: pricing.text,
          background: pricing.bg,
          padding: '2px 8px',
          borderRadius: 4,
        }}>
          {pricing.label}
        </span>
      </div>

      {/* Name */}
      <h4 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.05rem',
        fontWeight: 700,
        color: '#1A1A2E',
        margin: '0 0 0.35rem',
        lineHeight: 1.3,
      }}>
        {tool.name}
      </h4>

      {/* Description */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.85rem',
        lineHeight: 1.6,
        color: 'rgba(26,26,46,0.6)',
        margin: 0,
      }}>
        {tool.desc}
      </p>

      {/* Expanded detail */}
      {isExpanded && tool.detail && (
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: `1px solid ${catColor}15`,
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.88rem',
            lineHeight: 1.75,
            color: '#1A1A2E',
            margin: 0,
          }}>
            {tool.detail}
          </p>
        </div>
      )}

      {/* Expand hint */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '0.5rem',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'rgba(26,26,46,0.25)',
          letterSpacing: '0.05em',
        }}>
          {isExpanded ? 'click to collapse' : 'click for details'}
        </span>
      </div>
    </div>
  );
}

export default function ToolWall() {
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  const filteredTools = useMemo(() => {
    return toolsCatalog.filter((tool) => {
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      const matchesSearch =
        searchQuery === '' ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toolCount = filteredTools.length;

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '1.25rem 1rem 0' : '1.5rem 2rem 0', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.25rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #0EA5E9, #0EA5E980)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>
              The Tool Wall
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
              {toolCount} tools across {Object.keys(categoryLabels).length} categories
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? '1rem' : '1.25rem 2rem' }}>
        {/* Search bar */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              borderRadius: 8,
              border: '1px solid rgba(26,26,46,0.1)',
              background: '#FEFDFB',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: '#1A1A2E',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box' as const,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#0EA5E950'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)'; }}
          />
        </div>

        {/* Category filter tabs */}
        <div style={{
          display: 'flex',
          gap: '0.35rem',
          flexWrap: isMobile ? 'nowrap' as const : 'wrap' as const,
          overflowX: isMobile ? 'auto' as const : 'visible' as const,
          WebkitOverflowScrolling: 'touch' as const,
          marginBottom: '1.5rem',
          paddingBottom: isMobile ? '0.25rem' : 0,
        }}>
          {allCategories.map((cat) => {
            const isActive = cat === activeCategory;
            const color = cat === 'all' ? '#0EA5E9' : categoryColors[cat as ToolCategory];
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setExpandedTool(null);
                }}
                style={{
                  padding: isMobile ? '0.45rem 0.75rem' : '0.35rem 0.75rem',
                  borderRadius: 6,
                  border: `1px solid ${isActive ? color + '40' : 'rgba(26,26,46,0.08)'}`,
                  background: isActive ? color + '12' : 'transparent',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: isActive ? color : '#6B7280',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase' as const,
                  flexShrink: 0,
                  whiteSpace: 'nowrap' as const,
                }}
              >
                {cat === 'all' ? 'All' : categoryLabels[cat as ToolCategory]}
              </button>
            );
          })}
        </div>

        {/* Masonry grid */}
        {filteredTools.length === 0 ? (
          <div style={{
            textAlign: 'center' as const,
            padding: '3rem 1rem',
            color: '#6B7280',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
          }}>
            No tools match your search. Try a different term.
          </div>
        ) : (
          <div style={{
            columnCount: isMobile ? 1 : 2,
            columnGap: '0.75rem',
          }}>
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.name}
                tool={tool}
                isExpanded={expandedTool === tool.name}
                onToggle={() =>
                  setExpandedTool(expandedTool === tool.name ? null : tool.name)
                }
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div style={{
        padding: isMobile ? '1rem' : '1rem 2rem',
        borderTop: '1px solid rgba(26,26,46,0.04)',
        textAlign: 'center' as const,
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'rgba(26,26,46,0.3)',
          letterSpacing: '0.05em',
          margin: 0,
        }}>
          This landscape changes fast. New tools appear every week.
        </p>
      </div>
    </div>
  );
}
