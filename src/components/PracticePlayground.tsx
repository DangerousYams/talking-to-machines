import React, { useState, Suspense, lazy, useMemo } from 'react';
import { practiceTools, type PracticeTool } from '../data/practice-tools';
import { useIsMobile } from '../hooks/useMediaQuery';

// ── Lazy-loaded component map ──
const COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  // Ch1
  'prompt-makeover': lazy(() => import('./widgets/ch1/PromptMakeover')),
  'guess-the-prompt': lazy(() => import('./widgets/ch1/GuessThePrompt')),
  'iteration-loop': lazy(() => import('./widgets/ch1/IterationLoop')),
  'prompt-roast': lazy(() => import('./widgets/ch1/PromptRoast')),
  // Ch2
  'prompt-laboratory': lazy(() => import('./widgets/ch2/PromptLaboratory')),
  'flip-the-script': lazy(() => import('./widgets/ch2/FlipTheScript')),
  'debug-the-prompt': lazy(() => import('./widgets/ch2/DebugThePrompt')),
  // Ch3
  'context-window-viz': lazy(() => import('./widgets/ch3/ContextWindowViz')),
  'forgetting-experiment': lazy(() => import('./widgets/ch3/ForgettingExperiment')),
  'system-prompt-sandbox': lazy(() => import('./widgets/ch3/SystemPromptSandbox')),
  // Ch4
  'tool-wall': lazy(() => import('./widgets/ch4/ToolWall')),
  'workflow-builder': lazy(() => import('./widgets/ch4/WorkflowBuilder')),
  'head-to-head': lazy(() => import('./widgets/ch4/HeadToHead')),
  // Ch5
  'tool-catalog': lazy(() => import('./widgets/ch5/ToolCatalog')),
  'trust-thermometer': lazy(() => import('./widgets/ch5/TrustThermometer')),
  // Ch6
  'agent-blueprint': lazy(() => import('./widgets/ch6/AgentBlueprint')),
  'failure-modes-lab': lazy(() => import('./widgets/ch6/FailureModesLab')),
  'handoff-chain': lazy(() => import('./widgets/ch6/HandoffChain')),
  // Ch7
  'terminal-playground': lazy(() => import('./widgets/ch7/TerminalPlayground')),
  'skill-builder': lazy(() => import('./widgets/ch7/SkillBuilder')),
  'refactor-race': lazy(() => import('./widgets/ch7/RefactorRace')),
  // Ch8
  'project-orchestrator': lazy(() => import('./widgets/ch8/ProjectOrchestrator')),
  'context-packing': lazy(() => import('./widgets/ch8/ContextPacking')),
  // Ch9
  'fact-or-fabrication': lazy(() => import('./widgets/ch9/FactOrFabrication')),
  'sycophancy-test': lazy(() => import('./widgets/ch9/SycophancyTest')),
  // Ch10
  'skills-spectrum': lazy(() => import('./widgets/ch10/SkillsSpectrum')),
  'job-transformer': lazy(() => import('./widgets/ch10/JobTransformer')),
  'taste-test': lazy(() => import('./widgets/ch10/TasteTest')),
  'first-principles-lab': lazy(() => import('./widgets/ch10/FirstPrinciplesLab')),
  // Ch11
  'project-planner': lazy(() => import('./widgets/ch11/ProjectPlanner')),
  'showcase-gallery': lazy(() => import('./widgets/ch11/ShowcaseGallery')),
  // Labs
  'building-blocks-assembly': lazy(() => import('./lab/BuildingBlocksAssembly')),
  'prompt-morph-animation': lazy(() => import('./lab/PromptMorphAnimation')),
};

const TAG_CONFIG: Record<PracticeTool['tag'], { label: string; color: string }> = {
  build:    { label: 'Build',    color: '#7B61FF' },
  quiz:     { label: 'Quiz',     color: '#E94560' },
  explore:  { label: 'Explore',  color: '#0EA5E9' },
  simulate: { label: 'Simulate', color: '#F5A623' },
};

const CHAPTERS = [
  { num: 0, label: 'All' },
  { num: 1, label: 'Ch 1' },
  { num: 2, label: 'Ch 2' },
  { num: 3, label: 'Ch 3' },
  { num: 4, label: 'Ch 4' },
  { num: 5, label: 'Ch 5' },
  { num: 6, label: 'Ch 6' },
  { num: 7, label: 'Ch 7' },
  { num: 8, label: 'Ch 8' },
  { num: 9, label: 'Ch 9' },
  { num: 10, label: 'Ch 10' },
  { num: 11, label: 'Ch 11' },
];

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1rem',
      gap: '1rem',
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: '3px solid rgba(123, 97, 255, 0.15)',
        borderTopColor: '#7B61FF',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: 'var(--color-subtle)',
        letterSpacing: '0.04em',
      }}>
        Loading widget...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function PracticePlayground() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [chapterFilter, setChapterFilter] = useState(0);
  const [tagFilter, setTagFilter] = useState<PracticeTool['tag'] | null>(null);
  const isMobile = useIsMobile();

  const filtered = useMemo(() => {
    return practiceTools.filter((t) => {
      if (chapterFilter !== 0 && t.chapter !== chapterFilter) return false;
      if (tagFilter && t.tag !== tagFilter) return false;
      return true;
    });
  }, [chapterFilter, tagFilter]);

  const activeTool = selectedTool
    ? practiceTools.find((t) => t.id === selectedTool)
    : null;

  // ── Playground mode ──
  if (selectedTool && activeTool) {
    const Component = COMPONENTS[selectedTool];
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 1rem 4rem' }}>
        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 0 1.5rem',
          borderBottom: '1px solid rgba(26,26,46,0.06)',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setSelectedTool(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: '1px solid rgba(26,26,46,0.1)',
              borderRadius: 8,
              padding: '6px 14px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-subtle)',
              letterSpacing: '0.04em',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(26,26,46,0.2)';
              e.currentTarget.style.color = 'var(--color-deep)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)';
              e.currentTarget.style.color = 'var(--color-subtle)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Tools
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
              fontWeight: 700,
              color: 'var(--color-deep)',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {activeTool.name}
            </h2>
          </div>

          {activeTool.chapter > 0 && (
            <a
              href={`/ch${activeTool.chapter}`}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 500,
                letterSpacing: '0.04em',
                color: activeTool.accent,
                textDecoration: 'none',
                opacity: 0.7,
                transition: 'opacity 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
            >
              Ch {activeTool.chapter}: {activeTool.chapterName}
            </a>
          )}
        </div>

        {/* Widget area */}
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Suspense fallback={<LoadingSpinner />}>
            {Component ? <Component /> : (
              <p style={{ textAlign: 'center', color: 'var(--color-subtle)', padding: '3rem' }}>
                Component not found.
              </p>
            )}
          </Suspense>
        </div>
      </div>
    );
  }

  // ── Directory mode ──
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 1rem 4rem' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '2rem 0 2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #7B61FF, #E94560)',
          marginBottom: '1.25rem',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 800,
          color: 'var(--color-deep)',
          margin: '0 0 0.75rem',
          lineHeight: 1.1,
        }}>
          Practice Tools
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
          color: 'var(--color-subtle)',
          lineHeight: 1.6,
          margin: 0,
          maxWidth: 480,
          display: 'inline-block',
        }}>
          {practiceTools.length} interactive widgets from across all 11 chapters. Pick one and start practicing.
        </p>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '2rem' }}>
        {/* Chapter tabs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          justifyContent: 'center',
          marginBottom: '0.75rem',
        }}>
          {CHAPTERS.map((ch) => {
            const isActive = chapterFilter === ch.num;
            return (
              <button
                key={ch.num}
                onClick={() => setChapterFilter(ch.num)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: isActive ? 'var(--color-deep)' : 'rgba(26,26,46,0.08)',
                  background: isActive ? 'var(--color-deep)' : 'transparent',
                  color: isActive ? 'var(--color-cream)' : 'var(--color-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {ch.label}
              </button>
            );
          })}
        </div>

        {/* Tag pills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          justifyContent: 'center',
        }}>
          {(Object.keys(TAG_CONFIG) as PracticeTool['tag'][]).map((tag) => {
            const cfg = TAG_CONFIG[tag];
            const isActive = tagFilter === tag;
            return (
              <button
                key={tag}
                onClick={() => setTagFilter(isActive ? null : tag)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  border: '1px solid',
                  borderColor: isActive ? cfg.color : 'rgba(26,26,46,0.08)',
                  background: isActive ? cfg.color : 'transparent',
                  color: isActive ? '#fff' : cfg.color,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textTransform: 'uppercase',
                }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool grid */}
      {filtered.length === 0 ? (
        <p style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          color: 'var(--color-subtle)',
        }}>
          No tools match these filters.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: 12,
        }}>
          {filtered.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onClick={() => setSelectedTool(tool.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ToolCard({ tool, onClick }: { tool: PracticeTool; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const tagCfg = TAG_CONFIG[tool.tag];

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '16px 18px',
        borderRadius: 14,
        border: '1px solid',
        borderColor: hovered ? `${tool.accent}30` : 'rgba(26,26,46,0.06)',
        background: hovered
          ? `linear-gradient(145deg, #FFFFFF, ${tool.accent}08)`
          : '#FFFFFF',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        boxShadow: hovered
          ? `0 4px 20px ${tool.accent}10`
          : '0 1px 4px rgba(26,26,46,0.03)',
      }}
    >
      {/* Top row: chapter badge + tag pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: tool.accent,
          textTransform: 'uppercase',
          opacity: 0.8,
        }}>
          {tool.chapter > 0 ? `Ch ${tool.chapter}` : 'Lab'}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.55rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: tagCfg.color,
          textTransform: 'uppercase',
          padding: '2px 7px',
          borderRadius: 10,
          background: `${tagCfg.color}10`,
        }}>
          {tagCfg.label}
        </span>
      </div>

      {/* Name */}
      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.05rem',
        fontWeight: 700,
        color: 'var(--color-deep)',
        margin: 0,
        lineHeight: 1.3,
      }}>
        {tool.name}
      </h3>

      {/* Description */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.85rem',
        color: 'var(--color-subtle)',
        margin: 0,
        lineHeight: 1.5,
      }}>
        {tool.desc}
      </p>
    </button>
  );
}
