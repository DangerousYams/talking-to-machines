import { useState, useCallback } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';

/* ─── Types ─── */
interface Document {
  id: string;
  name: string;
  tokens: number;
  category: 'code' | 'docs' | 'context' | 'data';
  description: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  optimalDocs: string[];
  criticalDocs: string[];
  results: Record<string, TaskResult>;
}

interface TaskResult {
  quality: 'great' | 'okay' | 'poor';
  score: number;
  feedback: string;
}

/* ─── Data ─── */
const MAX_TOKENS = 8000;

const documents: Document[] = [
  { id: 'readme', name: 'Project README', tokens: 800, category: 'docs', description: 'Overview of the project structure, goals, and setup instructions.' },
  { id: 'codebase', name: 'Full codebase', tokens: 12000, category: 'code', description: 'The entire source code of the application. Way too large to fit.' },
  { id: 'styleguide', name: 'Style guide summary', tokens: 200, category: 'docs', description: 'Coding conventions, naming patterns, and formatting rules.' },
  { id: 'apidocs', name: 'API documentation', tokens: 3000, category: 'docs', description: 'Endpoint specifications, request/response formats, authentication.' },
  { id: 'conversation', name: 'Previous conversation', tokens: 2500, category: 'context', description: 'Your last chat with the AI about this project, including decisions made.' },
  { id: 'errors', name: 'Error logs', tokens: 1200, category: 'data', description: 'Recent error stack traces and warnings from the application.' },
  { id: 'tests', name: 'Test results', tokens: 600, category: 'data', description: 'Which tests pass, which fail, and the failure messages.' },
  { id: 'requirements', name: 'User requirements', tokens: 400, category: 'docs', description: 'What the user originally asked for and the acceptance criteria.' },
  { id: 'schema', name: 'Database schema', tokens: 500, category: 'code', description: 'Table definitions, relationships, indexes, and constraints.' },
  { id: 'competitor', name: 'Competitor analysis', tokens: 1800, category: 'context', description: 'Research on how competitors handle similar features.' },
];

const tasks: Task[] = [
  {
    id: 'auth-bug',
    name: 'Fix the authentication bug',
    description: 'Users are getting logged out after 5 minutes. The session token refresh seems broken.',
    optimalDocs: ['errors', 'apidocs', 'schema', 'tests'],
    criticalDocs: ['errors', 'apidocs'],
    results: {
      'errors+apidocs+schema+tests': {
        quality: 'great', score: 95,
        feedback: 'Perfect context selection! The error logs showed the exact failure point, the API docs explained the token refresh flow, the schema confirmed the session table structure, and the test results pinpointed which auth tests were failing. The AI identified the bug immediately: the refresh token endpoint was returning a 401 because the session table\'s "expires_at" column was being compared in UTC while the server was using local time.',
      },
      'errors+apidocs': {
        quality: 'great', score: 82,
        feedback: 'Good core selection. The error logs and API docs were the most critical pieces. The AI found the timing issue but had to make some assumptions about the database schema that turned out to be correct.',
      },
      'errors': {
        quality: 'okay', score: 55,
        feedback: 'The error logs helped, but without the API docs, the AI had to guess how the token refresh flow works. It suggested three possible causes instead of pinpointing one.',
      },
      '_fallback_has_errors': {
        quality: 'okay', score: 50,
        feedback: 'You included the error logs, which is good. But you\'re missing the API documentation that explains how authentication actually works. The AI made reasonable guesses but couldn\'t be precise.',
      },
      '_fallback_has_apidocs': {
        quality: 'okay', score: 45,
        feedback: 'The API docs explain the auth flow, but without the actual error logs, the AI doesn\'t know what\'s going wrong. It gave generic troubleshooting advice instead of a specific fix.',
      },
      '_fallback_no_critical': {
        quality: 'poor', score: 20,
        feedback: 'Without the error logs or API documentation, the AI had to fabricate plausible-sounding debugging steps. It hallucinated an endpoint that doesn\'t exist and suggested checking a config file that isn\'t relevant. This is what happens when AI lacks the right context.',
      },
    },
  },
  {
    id: 'new-feature',
    name: 'Add a dark mode toggle',
    description: 'Implement a dark mode that respects system preferences and persists the user\'s choice.',
    optimalDocs: ['styleguide', 'readme', 'requirements', 'schema'],
    criticalDocs: ['styleguide', 'requirements'],
    results: {
      'styleguide+readme+requirements+schema': {
        quality: 'great', score: 92,
        feedback: 'Excellent context pack! The style guide told the AI exactly which CSS variables to use, the README explained the theming system, the requirements specified the toggle behavior, and the schema showed where to persist preferences. Clean, ready-to-ship code.',
      },
      'styleguide+requirements': {
        quality: 'great', score: 85,
        feedback: 'The two most important docs. The AI produced working dark mode code that follows your conventions and meets the user requirements. It assumed localStorage for persistence since no schema was provided.',
      },
      'styleguide': {
        quality: 'okay', score: 55,
        feedback: 'The AI followed your coding conventions but had to guess what the actual requirements were. It implemented a basic toggle but missed the "respect system preferences" part.',
      },
      '_fallback_has_styleguide': {
        quality: 'okay', score: 50,
        feedback: 'Having the style guide helped the AI follow your conventions, but missing the requirements means it guessed at some behaviors. The code works but needs adjustments.',
      },
      '_fallback_has_requirements': {
        quality: 'okay', score: 45,
        feedback: 'The AI knows what to build but not how your codebase is structured. The code it produced works but doesn\'t follow your patterns and will need refactoring.',
      },
      '_fallback_no_critical': {
        quality: 'poor', score: 18,
        feedback: 'Without knowing your coding conventions or requirements, the AI generated generic dark mode code that doesn\'t match your project at all. It used inline styles when you use CSS variables, and missed the system preference detection entirely.',
      },
    },
  },
  {
    id: 'perf-audit',
    name: 'Optimize the slow dashboard query',
    description: 'The main dashboard takes 8 seconds to load. The database query needs optimization.',
    optimalDocs: ['schema', 'errors', 'conversation', 'tests'],
    criticalDocs: ['schema', 'errors'],
    results: {
      'schema+errors+conversation+tests': {
        quality: 'great', score: 96,
        feedback: 'Outstanding context! The schema revealed missing indexes on frequently-joined columns, the error logs showed query timeouts, the previous conversation had performance benchmarks, and tests confirmed which dashboard widgets were slowest. The AI produced an optimized query with proper indexing that reduced load time from 8s to 0.3s.',
      },
      'schema+errors': {
        quality: 'great', score: 80,
        feedback: 'The essential pair for debugging performance. The schema showed table structure and the errors revealed the timeout patterns. The AI identified the missing index and suggested query restructuring.',
      },
      'schema': {
        quality: 'okay', score: 50,
        feedback: 'The schema alone lets the AI reason about query structure, but without knowing which queries are actually slow, it could only offer general optimization advice.',
      },
      '_fallback_has_schema': {
        quality: 'okay', score: 48,
        feedback: 'The database schema helps, but without error logs showing the actual bottleneck, the AI suggested optimizations that might not target the real problem.',
      },
      '_fallback_has_errors': {
        quality: 'okay', score: 42,
        feedback: 'The error logs show what\'s timing out, but without the schema, the AI can\'t suggest specific index or query changes. It gave high-level advice instead of actionable SQL.',
      },
      '_fallback_no_critical': {
        quality: 'poor', score: 15,
        feedback: 'Without the database schema or error logs, the AI invented a plausible but completely wrong table structure. It optimized queries for tables that don\'t exist. This is a textbook hallucination caused by insufficient context.',
      },
    },
  },
];

/* ─── Helpers ─── */
const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  code: { bg: 'rgba(123,97,255,0.08)', text: '#7B61FF', label: 'Code' },
  docs: { bg: 'rgba(15,52,96,0.08)', text: '#0F3460', label: 'Docs' },
  context: { bg: 'rgba(245,166,35,0.08)', text: '#F5A623', label: 'Context' },
  data: { bg: 'rgba(22,199,154,0.08)', text: '#16C79A', label: 'Data' },
};

function evaluateSelection(task: Task, selectedIds: string[]): TaskResult {
  const sortedKey = [...selectedIds].sort().join('+');

  // Check exact matches first
  if (task.results[sortedKey]) return task.results[sortedKey];

  // Check if selection contains optimal docs in any order
  const optimalKey = [...task.optimalDocs].sort().join('+');
  if (sortedKey === optimalKey && task.results[optimalKey]) return task.results[optimalKey];

  // Check critical-only
  const criticalKey = [...task.criticalDocs].sort().join('+');
  if (sortedKey === criticalKey && task.results[criticalKey]) return task.results[criticalKey];

  // Fallback: check what critical docs are present
  const hasCritical = task.criticalDocs.filter(d => selectedIds.includes(d));
  if (hasCritical.length === task.criticalDocs.length) {
    // Has all critical docs plus extras
    const critResult = task.results[criticalKey];
    if (critResult) {
      return {
        ...critResult,
        score: Math.max(critResult.score - 5, 40),
        feedback: critResult.feedback + ' (Some of the extra documents you included weren\'t relevant to this task, but having the critical ones carried you.)',
      };
    }
  }

  // Partial critical docs
  for (const docId of task.criticalDocs) {
    const key = `_fallback_has_${docId}`;
    if (selectedIds.includes(docId) && task.results[key]) {
      return task.results[key];
    }
  }

  // No critical docs at all
  return task.results['_fallback_no_critical'] || {
    quality: 'poor', score: 10,
    feedback: 'The AI didn\'t have the right context and produced unhelpful output.',
  };
}

/* ─── Component ─── */
export default function ContextPacking() {
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [packed, setPacked] = useState<string[]>([]);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const task = tasks[activeTaskIndex];
  const totalPacked = packed.reduce((sum, id) => {
    const doc = documents.find(d => d.id === id);
    return sum + (doc?.tokens || 0);
  }, 0);

  const isMobile = useIsMobile();
  const accent = '#0F3460';

  const toggleDocument = useCallback((docId: string) => {
    if (hasRun) return; // Lock during results
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    if (packed.includes(docId)) {
      setPacked(prev => prev.filter(id => id !== docId));
    } else {
      if (totalPacked + doc.tokens <= MAX_TOKENS) {
        setPacked(prev => [...prev, docId]);
      }
    }
  }, [packed, totalPacked, hasRun]);

  const runTask = () => {
    if (packed.length === 0) return;
    const evaluation = evaluateSelection(task, packed);
    setResult(evaluation);
    setHasRun(true);
  };

  const resetTask = () => {
    setPacked([]);
    setResult(null);
    setHasRun(false);
  };

  const switchTask = (index: number) => {
    setActiveTaskIndex(index);
    setPacked([]);
    setResult(null);
    setHasRun(false);
  };

  const fillPercent = Math.min((totalPacked / MAX_TOKENS) * 100, 100);
  const isOverflowing = totalPacked > MAX_TOKENS;

  return (
    <div className="widget-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(135deg, ${accent}, #7B61FF)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 7V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
              Context Packing
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
              Pack the right context. Too little and the AI hallucinates. Too much and nothing fits.
            </p>
          </div>
        </div>
      </div>

      {/* Task selector */}
      <div style={{
        padding: isMobile ? '0.75rem 1rem' : '0.75rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)',
        background: 'rgba(26,26,46,0.015)', display: 'flex', gap: 6,
        overflowX: 'auto' as const, WebkitOverflowScrolling: 'touch' as const,
      }}>
        {tasks.map((t, i) => (
          <button
            key={t.id}
            onClick={() => switchTask(i)}
            style={{
              padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid',
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
              background: activeTaskIndex === i ? accent : 'transparent',
              color: activeTaskIndex === i ? '#FAF8F5' : '#6B7280',
              borderColor: activeTaskIndex === i ? accent : 'rgba(26,26,46,0.1)',
              whiteSpace: 'nowrap' as const, flexShrink: 0,
              minHeight: 44,
            }}
          >
            Task {i + 1}
          </button>
        ))}
      </div>

      {/* Task description */}
      <div style={{ padding: isMobile ? '1rem' : '1rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, color: accent, margin: '0 0 4px' }}>
          {task.name}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
          {task.description}
        </p>
      </div>

      {/* Main content: Suitcase + Documents */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', flex: 1, minHeight: 0 }}>
        {/* Left: The Suitcase */}
        <div style={{ padding: isMobile ? '1rem' : '1.25rem 1.5rem', borderRight: isMobile ? 'none' : '1px solid rgba(26,26,46,0.06)', borderBottom: isMobile ? '1px solid rgba(26,26,46,0.06)' : 'none' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            color: accent, marginBottom: 12,
          }}>
            Your Context Suitcase
          </div>

          {/* Capacity meter */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280' }}>
                {totalPacked.toLocaleString()} / {MAX_TOKENS.toLocaleString()} tokens
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
                color: fillPercent > 90 ? '#E94560' : fillPercent > 70 ? '#F5A623' : '#16C79A',
              }}>
                {Math.round(fillPercent)}%
              </span>
            </div>
            <div style={{
              height: 10, borderRadius: 5, background: 'rgba(26,26,46,0.06)',
              overflow: 'hidden', position: 'relative',
            }}>
              <div style={{
                height: '100%', borderRadius: 5, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                width: `${fillPercent}%`,
                background: fillPercent > 90
                  ? 'linear-gradient(90deg, #F5A623, #E94560)'
                  : fillPercent > 70
                    ? 'linear-gradient(90deg, #16C79A, #F5A623)'
                    : `linear-gradient(90deg, ${accent}, #0EA5E9)`,
              }} />
            </div>
          </div>

          {/* Packed documents */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {packed.length === 0 ? (
              <div style={{
                padding: '2rem 1rem', textAlign: 'center' as const,
                border: '2px dashed rgba(26,26,46,0.08)', borderRadius: 10,
              }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#6B7280', fontStyle: 'italic', margin: 0 }}>
                  {isMobile ? 'Click documents below to pack them' : 'Click documents on the right to pack them'}
                </p>
              </div>
            ) : packed.map(docId => {
              const doc = documents.find(d => d.id === docId)!;
              const cat = categoryColors[doc.category];
              return (
                <div key={docId} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '0.5rem 0.75rem', borderRadius: 8,
                  background: cat.bg, border: `1px solid ${cat.text}15`,
                  cursor: hasRun ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                }} onClick={() => toggleDocument(docId)}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                    color: cat.text, padding: '1px 4px', borderRadius: 3,
                    background: `${cat.text}12`,
                  }}>
                    {cat.label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#1A1A2E', flex: 1 }}>
                    {doc.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280' }}>
                    {doc.tokens.toLocaleString()}
                  </span>
                  {!hasRun && (
                    <span style={{ fontSize: '0.7rem', color: '#E94560', fontWeight: 700, cursor: 'pointer' }}>
                      x
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action button */}
          {!hasRun ? (
            <button
              onClick={runTask}
              disabled={packed.length === 0}
              style={{
                width: '100%', padding: '0.65rem', borderRadius: 8,
                fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700,
                border: 'none', cursor: packed.length === 0 ? 'not-allowed' : 'pointer',
                background: packed.length === 0 ? 'rgba(26,26,46,0.06)' : accent,
                color: packed.length === 0 ? '#6B7280' : '#FAF8F5',
                transition: 'all 0.2s',
                minHeight: 44,
              }}
            >
              Run Task with This Context
            </button>
          ) : (
            <button
              onClick={resetTask}
              style={{
                width: '100%', padding: '0.65rem', borderRadius: 8,
                fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700,
                border: `1px solid ${accent}`, cursor: 'pointer',
                background: 'transparent', color: accent,
                transition: 'all 0.2s',
                minHeight: 44,
              }}
            >
              Try Again
            </button>
          )}
        </div>

        {/* Right: Available documents or results */}
        <div style={{ padding: isMobile ? '1rem' : '1.25rem 1.5rem', background: 'rgba(26,26,46,0.015)' }}>
          {!hasRun ? (
            <>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                color: '#6B7280', marginBottom: 12,
              }}>
                Available Documents
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {documents.map(doc => {
                  const isPacked = packed.includes(doc.id);
                  const wouldOverflow = !isPacked && (totalPacked + doc.tokens > MAX_TOKENS);
                  const cat = categoryColors[doc.category];
                  return (
                    <div
                      key={doc.id}
                      onClick={() => !wouldOverflow && toggleDocument(doc.id)}
                      style={{
                        padding: '0.6rem 0.75rem', borderRadius: 8,
                        border: `1px solid ${isPacked ? `${cat.text}30` : wouldOverflow ? 'rgba(233,69,96,0.15)' : 'rgba(26,26,46,0.06)'}`,
                        background: isPacked ? cat.bg : wouldOverflow ? 'rgba(233,69,96,0.03)' : '#FEFDFB',
                        cursor: wouldOverflow ? 'not-allowed' : 'pointer',
                        opacity: isPacked ? 0.5 : wouldOverflow ? 0.5 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                          color: cat.text, padding: '1px 4px', borderRadius: 3,
                          background: cat.bg,
                        }}>
                          {cat.label}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 700,
                          color: '#1A1A2E', flex: 1,
                        }}>
                          {doc.name}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                          color: wouldOverflow ? '#E94560' : '#6B7280',
                        }}>
                          {doc.tokens.toLocaleString()}
                          {wouldOverflow && ' (too big!)'}
                        </span>
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#6B7280',
                        margin: 0, lineHeight: 1.5,
                      }}>
                        {doc.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          ) : result && (
            <>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                color: result.quality === 'great' ? '#16C79A' : result.quality === 'okay' ? '#F5A623' : '#E94560',
                marginBottom: 12,
              }}>
                AI Output Quality
              </div>

              {/* Score */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
                padding: '1rem', borderRadius: 10,
                background: result.quality === 'great'
                  ? 'rgba(22,199,154,0.06)'
                  : result.quality === 'okay'
                    ? 'rgba(245,166,35,0.06)'
                    : 'rgba(233,69,96,0.06)',
                border: `1px solid ${
                  result.quality === 'great' ? 'rgba(22,199,154,0.15)'
                    : result.quality === 'okay' ? 'rgba(245,166,35,0.15)'
                    : 'rgba(233,69,96,0.15)'
                }`,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: result.quality === 'great' ? '#16C79A'
                    : result.quality === 'okay' ? '#F5A623' : '#E94560',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '1.2rem',
                    fontWeight: 800, color: '#FEFDFB',
                  }}>
                    {result.score}
                  </span>
                </div>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700,
                    margin: '0 0 2px',
                    color: result.quality === 'great' ? '#16C79A'
                      : result.quality === 'okay' ? '#F5A623' : '#E94560',
                  }}>
                    {result.quality === 'great' ? 'Excellent output!'
                      : result.quality === 'okay' ? 'Partial success'
                      : 'Poor output'}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                    color: '#6B7280', margin: 0,
                  }}>
                    {packed.length} document{packed.length !== 1 ? 's' : ''} packed,{' '}
                    {totalPacked.toLocaleString()} tokens used
                  </p>
                </div>
              </div>

              {/* Feedback */}
              <div style={{
                padding: '1rem', borderRadius: 10,
                background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.06)',
                marginBottom: 16,
              }}>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#1A1A2E',
                  margin: 0, lineHeight: 1.7,
                }}>
                  {result.feedback}
                </p>
              </div>

              {/* Optimal selection hint */}
              <div style={{
                padding: '0.75rem', borderRadius: 8,
                background: 'rgba(15,52,96,0.04)', border: '1px solid rgba(15,52,96,0.08)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                  color: accent, margin: '0 0 4px',
                }}>
                  OPTIMAL SELECTION:
                </p>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#6B7280',
                  margin: 0, lineHeight: 1.5,
                }}>
                  {task.optimalDocs.map(id => documents.find(d => d.id === id)?.name).join(' + ')}
                  {' = '}
                  {task.optimalDocs.reduce((sum, id) => sum + (documents.find(d => d.id === id)?.tokens || 0), 0).toLocaleString()} tokens
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Insight bar */}
      <div style={{
        padding: isMobile ? '1rem' : '1rem 2rem', borderTop: '1px solid rgba(26,26,46,0.06)',
        background: `linear-gradient(135deg, rgba(15,52,96,0.04), rgba(123,97,255,0.04))`,
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontStyle: 'italic', color: '#1A1A2E', margin: 0 }}>
          <span style={{ fontWeight: 600, color: accent, fontStyle: 'normal' }}>Key insight: </span>
          Context is not "more is better." It's about choosing the right information for the task. The best AI users think like editors: what does the AI <em>need to know</em> to do this specific job?
        </p>
      </div>
    </div>
  );
}
