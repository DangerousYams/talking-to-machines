import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import BottomSheet from '../../cards/BottomSheet';

interface PipelineNode {
  id: string;
  role: string;
  label: string;
  color: string;
  desc: string;
  input: string;
  output: string;
}

interface Pipeline {
  name: string;
  desc: string;
  nodes: PipelineNode[];
}

const availableNodes: Omit<PipelineNode, 'input' | 'output'>[] = [
  { id: 'research', role: 'Research', label: 'Search & gather information', color: '#0EA5E9', desc: 'Use Perplexity or Elicit to find sources, data, and background.' },
  { id: 'write', role: 'Write', label: 'Draft text content', color: '#0F3460', desc: 'Use Claude or GPT to write prose, scripts, or documentation.' },
  { id: 'image', role: 'Illustrate', label: 'Generate visuals', color: '#E94560', desc: 'Use Midjourney, DALL-E, or Flux to create images and artwork.' },
  { id: 'code', role: 'Code', label: 'Build & implement', color: '#7B61FF', desc: 'Use Claude Code, Cursor, or Copilot to write and run code.' },
  { id: 'design', role: 'Design', label: 'Layout & compose', color: '#F5A623', desc: 'Use Canva, Figma AI, or CSS tools to arrange the final output.' },
  { id: 'edit', role: 'Edit', label: 'Refine & polish', color: '#16C79A', desc: 'Use AI to review, fact-check, or improve quality of drafts.' },
];

const prebuiltPipelines: Pipeline[] = [
  {
    name: 'Blog Post',
    desc: 'Research a topic, write an article, illustrate it, format for publishing.',
    nodes: [
      { id: 'research', role: 'Research', label: 'Perplexity', color: '#0EA5E9', desc: 'Search for sources and data',
        input: '"Find recent statistics and expert opinions on how teens use AI tools for homework"',
        output: '5 cited sources, key statistics (67% of teens have used AI tools), 3 expert quotes, links to studies.' },
      { id: 'write', role: 'Write', label: 'Claude', color: '#0F3460', desc: 'Draft the article',
        input: 'Research notes + "Write a 1200-word blog post for a teen audience about AI study tools, conversational tone"',
        output: 'Full article draft with introduction, 4 sections, conclusion, and suggested pull quotes.' },
      { id: 'image', role: 'Illustrate', label: 'Midjourney', color: '#E94560', desc: 'Create header image',
        input: '"A warm, editorial illustration of a teenager studying with a glowing AI assistant, watercolor style, soft blues and oranges"',
        output: 'Hero image (1200x630), 2 section illustrations, social sharing thumbnail.' },
      { id: 'design', role: 'Layout', label: 'Canva / CSS', color: '#F5A623', desc: 'Format for web',
        input: 'Article text + images + "Format as a responsive blog post with pull quotes, image captions, and metadata"',
        output: 'Published blog post with responsive layout, SEO metadata, and Open Graph images.' },
    ],
  },
  {
    name: 'Game Asset',
    desc: 'Concept an art style, generate assets, edit them, export for a game engine.',
    nodes: [
      { id: 'write', role: 'Concept', label: 'Claude', color: '#0F3460', desc: 'Define the art direction',
        input: '"Design the art direction for a pixel art roguelike set in a haunted library. Define the color palette, character style, and tile sizes."',
        output: 'Art bible: 5-color palette, 32x32 tile spec, character proportions, 3 mood references, naming conventions for files.' },
      { id: 'image', role: 'Generate', label: 'Stable Diffusion', color: '#E94560', desc: 'Generate raw assets',
        input: 'Art bible + "Generate 16 character sprites: 4 player classes x 4 directions, pixel art, consistent palette, transparent background"',
        output: '16 character sprites, 24 environment tiles, 8 item icons, 4 UI elements -- all in consistent pixel art style.' },
      { id: 'edit', role: 'Edit', label: 'Photoshop AI', color: '#16C79A', desc: 'Clean up and refine',
        input: 'Raw sprites + "Fix inconsistent outlines, align to pixel grid, ensure transparent backgrounds, batch resize to 32x32"',
        output: 'Production-ready sprite sheets, properly aligned, consistent style, with alpha channels.' },
      { id: 'code', role: 'Export', label: 'Claude Code', color: '#7B61FF', desc: 'Build the asset pipeline',
        input: '"Write a Python script that takes the sprite sheets, slices them into individual frames, generates a JSON atlas, and exports for Godot"',
        output: 'Automated pipeline script, JSON atlas files, organized folder structure, import-ready for game engine.' },
    ],
  },
  {
    name: 'Research Report',
    desc: 'Search for sources, analyze findings, write up results, format for presentation.',
    nodes: [
      { id: 'research', role: 'Search', label: 'Elicit + Consensus', color: '#0EA5E9', desc: 'Academic literature search',
        input: '"Find peer-reviewed papers on the effectiveness of spaced repetition for language learning, published 2020-2025"',
        output: '23 relevant papers, sorted by citation count, with extracted methodology, sample sizes, and key findings.' },
      { id: 'write', role: 'Analyze', label: 'Claude', color: '#0F3460', desc: 'Synthesize findings',
        input: 'Paper summaries + "Identify consensus findings, contradictions, gaps in research, and methodological strengths/weaknesses"',
        output: 'Analysis document: 3 consensus findings, 2 areas of disagreement, 4 research gaps, methodology comparison table.' },
      { id: 'write', role: 'Write', label: 'Claude', color: '#0F3460', desc: 'Draft the report',
        input: 'Analysis + "Write a 2000-word literature review with APA citations, structured as: Introduction, Methods, Findings, Discussion, Conclusion"',
        output: 'Complete literature review draft with 15 inline citations, formatted tables, and a reference list.' },
      { id: 'design', role: 'Format', label: 'NotebookLM', color: '#F5A623', desc: 'Create presentation materials',
        input: 'Report + source papers + "Generate a summary briefing, key slides content, and an audio overview for the team"',
        output: 'Executive summary, 10-slide outline with speaker notes, 8-minute audio podcast overview.' },
    ],
  },
];

export default function WorkflowBuilder() {
  const isMobile = useIsMobile();
  const [activePipeline, setActivePipeline] = useState(0);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [customPipeline, setCustomPipeline] = useState<PipelineNode[]>([]);
  const [mode, setMode] = useState<'prebuilt' | 'custom'>('prebuilt');
  const [sheetNodeIndex, setSheetNodeIndex] = useState<number | null>(null);

  const pipeline = prebuiltPipelines[activePipeline];
  const displayNodes = mode === 'prebuilt' ? pipeline.nodes : customPipeline;

  const addCustomNode = (nodeTemplate: typeof availableNodes[0]) => {
    if (customPipeline.length >= 6) return;
    const newNode: PipelineNode = {
      ...nodeTemplate,
      id: `${nodeTemplate.id}-${Date.now()}`,
      input: 'Your input here...',
      output: 'Expected output...',
    };
    setCustomPipeline([...customPipeline, newNode]);
    setSelectedNode(customPipeline.length);
  };

  const removeCustomNode = (index: number) => {
    const next = customPipeline.filter((_, i) => i !== index);
    setCustomPipeline(next);
    setSelectedNode(null);
  };

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    const sheetNode = sheetNodeIndex !== null && sheetNodeIndex < displayNodes.length
      ? displayNodes[sheetNodeIndex]
      : null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Compact header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '8px 12px', flexShrink: 0,
          borderBottom: '1px solid rgba(26,26,46,0.06)',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: 'linear-gradient(135deg, #7B61FF, #7B61FF80)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
          </div>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 700,
            color: '#1A1A2E', margin: 0, flex: 1,
          }}>
            Workflow Builder
          </h3>
        </div>

        {/* Mode toggle + pipeline presets */}
        <div style={{ padding: '8px 12px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '8px' }}>
            <button
              onClick={() => { setMode('prebuilt'); setSelectedNode(null); setSheetNodeIndex(null); }}
              style={{
                padding: '0.35rem 0.65rem', borderRadius: 6,
                border: `1px solid ${mode === 'prebuilt' ? '#7B61FF40' : 'rgba(26,26,46,0.08)'}`,
                background: mode === 'prebuilt' ? '#7B61FF12' : 'transparent',
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
                color: mode === 'prebuilt' ? '#7B61FF' : '#6B7280',
                cursor: 'pointer', textTransform: 'uppercase' as const, letterSpacing: '0.04em',
              }}
            >
              Examples
            </button>
            <button
              onClick={() => { setMode('custom'); setSelectedNode(null); setSheetNodeIndex(null); }}
              style={{
                padding: '0.35rem 0.65rem', borderRadius: 6,
                border: `1px solid ${mode === 'custom' ? '#7B61FF40' : 'rgba(26,26,46,0.08)'}`,
                background: mode === 'custom' ? '#7B61FF12' : 'transparent',
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
                color: mode === 'custom' ? '#7B61FF' : '#6B7280',
                cursor: 'pointer', textTransform: 'uppercase' as const, letterSpacing: '0.04em',
              }}
            >
              Build
            </button>
          </div>

          {mode === 'prebuilt' && (
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' as const, paddingBottom: '4px' }}>
              {prebuiltPipelines.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => { setActivePipeline(i); setSheetNodeIndex(null); }}
                  style={{
                    padding: '0.35rem 0.65rem', borderRadius: 6,
                    border: `1px solid ${i === activePipeline ? '#0EA5E940' : 'rgba(26,26,46,0.08)'}`,
                    background: i === activePipeline ? '#0EA5E90A' : 'transparent',
                    fontFamily: 'var(--font-heading)', fontSize: '0.78rem',
                    fontWeight: i === activePipeline ? 700 : 500,
                    color: i === activePipeline ? '#0EA5E9' : '#6B7280',
                    cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' as const,
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {mode === 'custom' && (
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' as const, paddingBottom: '4px' }}>
              {availableNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => addCustomNode(node)}
                  disabled={customPipeline.length >= 6}
                  style={{
                    padding: '0.3rem 0.55rem', borderRadius: 5,
                    border: `1px solid ${node.color}30`, background: `${node.color}08`,
                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600,
                    color: node.color, cursor: customPipeline.length >= 6 ? 'not-allowed' : 'pointer',
                    opacity: customPipeline.length >= 6 ? 0.4 : 1,
                  }}
                >
                  + {node.role}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vertical pipeline */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {displayNodes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {displayNodes.map((node, i) => (
                <div key={node.id + i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  {/* Node button */}
                  <button
                    onClick={() => setSheetNodeIndex(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      width: '100%', padding: '8px 10px', borderRadius: 8,
                      border: `1.5px solid ${node.color}30`,
                      background: 'white', cursor: 'pointer',
                      textAlign: 'left' as const, position: 'relative' as const,
                    }}
                  >
                    {/* Step number bubble */}
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${node.color}, ${node.color}90)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', color: 'white', fontWeight: 700,
                      fontFamily: 'var(--font-mono)', flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontFamily: 'var(--font-heading)', fontSize: '0.78rem', fontWeight: 700,
                        color: node.color, display: 'block',
                      }}>
                        {node.role}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#6B7280',
                      }}>
                        {node.label}
                      </span>
                    </div>
                    {/* Chevron */}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                    {/* Remove button for custom */}
                    {mode === 'custom' && (
                      <span
                        onClick={(e) => { e.stopPropagation(); removeCustomNode(i); }}
                        style={{
                          position: 'absolute' as const, top: -5, right: -5,
                          width: 16, height: 16, borderRadius: '50%',
                          background: '#E94560', color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', lineHeight: 1,
                        }}
                      >
                        x
                      </span>
                    )}
                  </button>

                  {/* Arrow connector */}
                  {i < displayNodes.length - 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0' }}>
                      <div style={{ width: 2, height: 12, background: 'rgba(26,26,46,0.12)' }} />
                      <div style={{
                        width: 0, height: 0,
                        borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
                        borderTop: '5px solid rgba(26,26,46,0.15)',
                      }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center' as const, padding: '1.5rem 1rem',
              border: '2px dashed rgba(26,26,46,0.08)', borderRadius: 10,
            }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#6B7280', margin: 0,
              }}>
                Tap the buttons above to add steps.
              </p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div style={{
          padding: '6px 12px', borderTop: '1px solid rgba(26,26,46,0.04)',
          textAlign: 'center' as const, flexShrink: 0,
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            color: 'rgba(26,26,46,0.3)', letterSpacing: '0.04em', margin: 0,
          }}>
            Tap any step for details
          </p>
        </div>

        {/* BottomSheet for node detail */}
        <BottomSheet
          isOpen={sheetNode !== null}
          onClose={() => setSheetNodeIndex(null)}
          title={sheetNode ? `Step ${sheetNodeIndex! + 1}: ${sheetNode.role}` : ''}
        >
          {sheetNode && (
            <div>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.6,
                color: '#6B7280', margin: '0 0 1rem',
              }}>
                {sheetNode.desc}
              </p>

              {/* Input */}
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                  color: '#16C79A', display: 'block', marginBottom: '0.3rem',
                }}>
                  Input
                </span>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.72rem', lineHeight: 1.65,
                  color: '#1A1A2E', background: 'rgba(22,199,154,0.04)',
                  border: '1px solid rgba(22,199,154,0.1)', borderRadius: 6,
                  padding: '0.6rem 0.75rem', wordBreak: 'break-word' as const,
                }}>
                  {sheetNode.input}
                </div>
              </div>

              {/* Output */}
              <div>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                  color: '#7B61FF', display: 'block', marginBottom: '0.3rem',
                }}>
                  Output
                </span>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.72rem', lineHeight: 1.65,
                  color: '#1A1A2E', background: 'rgba(123,97,255,0.04)',
                  border: '1px solid rgba(123,97,255,0.1)', borderRadius: 6,
                  padding: '0.6rem 0.75rem', wordBreak: 'break-word' as const,
                }}>
                  {sheetNode.output}
                </div>
              </div>
            </div>
          )}
        </BottomSheet>
      </div>
    );
  }

  // --- DESKTOP LAYOUT (unchanged) ---
  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem 0', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.25rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #7B61FF, #7B61FF80)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>
              Workflow Builder
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
              Chain tools into multi-step pipelines
            </p>
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ padding: '1rem 2rem 0', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => { setMode('prebuilt'); setSelectedNode(null); }}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: 6,
            border: `1px solid ${mode === 'prebuilt' ? '#7B61FF40' : 'rgba(26,26,46,0.08)'}`,
            background: mode === 'prebuilt' ? '#7B61FF12' : 'transparent',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: mode === 'prebuilt' ? '#7B61FF' : '#6B7280',
            cursor: 'pointer',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.04em',
          }}
        >
          Examples
        </button>
        <button
          onClick={() => { setMode('custom'); setSelectedNode(null); }}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: 6,
            border: `1px solid ${mode === 'custom' ? '#7B61FF40' : 'rgba(26,26,46,0.08)'}`,
            background: mode === 'custom' ? '#7B61FF12' : 'transparent',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: mode === 'custom' ? '#7B61FF' : '#6B7280',
            cursor: 'pointer',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.04em',
          }}
        >
          Build Your Own
        </button>
      </div>

      <div style={{ padding: '1.25rem 2rem' }}>
        {mode === 'prebuilt' && (
          <>
            {/* Pipeline tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' as const }}>
              {prebuiltPipelines.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => { setActivePipeline(i); setSelectedNode(null); }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 8,
                    border: `1px solid ${i === activePipeline ? '#0EA5E940' : 'rgba(26,26,46,0.08)'}`,
                    background: i === activePipeline ? '#0EA5E90A' : 'transparent',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.85rem',
                    fontWeight: i === activePipeline ? 700 : 500,
                    color: i === activePipeline ? '#0EA5E9' : '#6B7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              color: 'rgba(26,26,46,0.5)',
              margin: '0 0 1.5rem',
              lineHeight: 1.6,
            }}>
              {pipeline.desc}
            </p>
          </>
        )}

        {mode === 'custom' && (
          <>
            {/* Available nodes to add */}
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: '#6B7280',
              marginBottom: '0.75rem',
            }}>
              Click to add a step (max 6)
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' as const }}>
              {availableNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => addCustomNode(node)}
                  disabled={customPipeline.length >= 6}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: 6,
                    border: `1px solid ${node.color}30`,
                    background: `${node.color}08`,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: node.color,
                    cursor: customPipeline.length >= 6 ? 'not-allowed' : 'pointer',
                    opacity: customPipeline.length >= 6 ? 0.4 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  + {node.role}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Pipeline visualization */}
        {displayNodes.length > 0 ? (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row' as const,
              alignItems: 'center',
              gap: 0,
              overflowX: 'auto' as const,
              paddingBottom: '0.5rem',
            }}>
              {displayNodes.map((node, i) => (
                <div key={node.id + i} style={{ display: 'flex', flexDirection: 'row' as const, alignItems: 'center', flexShrink: 0 }}>
                  {/* Node */}
                  <button
                    onClick={() => setSelectedNode(selectedNode === i ? null : i)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column' as const,
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 10,
                      border: `2px solid ${selectedNode === i ? node.color : node.color + '30'}`,
                      background: selectedNode === i ? `${node.color}10` : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      minWidth: 90,
                      position: 'relative' as const,
                      textAlign: 'center' as const,
                    }}
                  >
                    {/* Step number */}
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: node.color,
                      opacity: 0.5,
                      letterSpacing: '0.08em',
                    }}>
                      STEP {i + 1}
                    </span>
                    {/* Role bubble */}
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${node.color}, ${node.color}90)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      color: 'white',
                      fontWeight: 700,
                      fontFamily: 'var(--font-heading)',
                    }}>
                      {node.role.charAt(0)}
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: node.color,
                    }}>
                      {node.role}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: '#6B7280',
                    }}>
                      {node.label}
                    </span>

                    {/* Remove button for custom */}
                    {mode === 'custom' && (
                      <span
                        onClick={(e) => { e.stopPropagation(); removeCustomNode(i); }}
                        style={{
                          position: 'absolute' as const,
                          top: -6,
                          right: -6,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: '#E94560',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          lineHeight: 1,
                        }}
                      >
                        x
                      </span>
                    )}
                  </button>

                  {/* Arrow connector */}
                  {i < displayNodes.length - 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.25rem' }}>
                      <div style={{ width: 20, height: 2, background: 'rgba(26,26,46,0.12)' }} />
                      <div style={{
                        width: 0, height: 0,
                        borderTop: '5px solid transparent',
                        borderBottom: '5px solid transparent',
                        borderLeft: '6px solid rgba(26,26,46,0.15)',
                      }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center' as const,
            padding: '2rem 1rem',
            border: '2px dashed rgba(26,26,46,0.08)',
            borderRadius: 12,
            marginBottom: '1.5rem',
          }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              color: '#6B7280',
              margin: 0,
            }}>
              Click the buttons above to add steps to your pipeline.
            </p>
          </div>
        )}

        {/* Selected node detail */}
        {selectedNode !== null && selectedNode < displayNodes.length && (
          <div style={{
            background: '#FEFDFB',
            border: `1px solid ${displayNodes[selectedNode].color}20`,
            borderRadius: 10,
            padding: '1.25rem 1.5rem',
            transition: 'all 0.3s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: displayNodes[selectedNode].color,
              }} />
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: displayNodes[selectedNode].color,
              }}>
                Step {selectedNode + 1}: {displayNodes[selectedNode].role}
              </span>
            </div>

            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              lineHeight: 1.6,
              color: '#6B7280',
              margin: '0 0 1rem',
            }}>
              {displayNodes[selectedNode].desc}
            </p>

            {/* Input */}
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color: '#16C79A',
                display: 'block',
                marginBottom: '0.35rem',
              }}>
                Input
              </span>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                lineHeight: 1.65,
                color: '#1A1A2E',
                background: 'rgba(22,199,154,0.04)',
                border: '1px solid rgba(22,199,154,0.1)',
                borderRadius: 6,
                padding: '0.75rem 1rem',
                wordBreak: 'break-word' as const,
              }}>
                {displayNodes[selectedNode].input}
              </div>
            </div>

            {/* Output */}
            <div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color: '#7B61FF',
                display: 'block',
                marginBottom: '0.35rem',
              }}>
                Output
              </span>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                lineHeight: 1.65,
                color: '#1A1A2E',
                background: 'rgba(123,97,255,0.04)',
                border: '1px solid rgba(123,97,255,0.1)',
                borderRadius: 6,
                padding: '0.75rem 1rem',
                wordBreak: 'break-word' as const,
              }}>
                {displayNodes[selectedNode].output}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '1rem 2rem',
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
          Click any step to see its input and output in detail
        </p>
      </div>
    </div>
  );
}
