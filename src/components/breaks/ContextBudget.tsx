import { useState } from 'react';

/* ─── Types ─── */
interface Doc {
  id: string;
  name: string;
  tokens: number;
  relevance: 'high' | 'medium' | 'low';
  label: string;
}

/* ─── Data ─── */
const BUDGET = 1000;

const documents: Doc[] = [
  { id: 'login',    name: 'Login component code (LoginPage.tsx)', tokens: 350, relevance: 'high',   label: 'ESSENTIAL' },
  { id: 'auth',     name: 'Authentication API route (auth.ts)',   tokens: 280, relevance: 'high',   label: 'ESSENTIAL' },
  { id: 'readme',   name: 'Project README',                      tokens: 200, relevance: 'medium', label: 'HELPFUL' },
  { id: 'css',      name: 'CSS stylesheet (styles.css)',          tokens: 150, relevance: 'low',    label: 'LOW VALUE' },
  { id: 'schema',   name: 'Database schema',                     tokens: 320, relevance: 'medium', label: 'HELPFUL' },
  { id: 'pkg',      name: 'Package.json',                        tokens: 100, relevance: 'low',    label: 'LOW VALUE' },
];

const relevanceColors: Record<string, { bg: string; text: string; border: string }> = {
  high:   { bg: 'rgba(22,199,154,0.08)',  text: '#16C79A', border: 'rgba(22,199,154,0.2)' },
  medium: { bg: 'rgba(245,166,35,0.08)',  text: '#F5A623', border: 'rgba(245,166,35,0.2)' },
  low:    { bg: 'rgba(233,69,96,0.08)',   text: '#E94560', border: 'rgba(233,69,96,0.2)' },
};

function computeScore(selected: string[]): number {
  let score = 0;
  for (const id of selected) {
    const doc = documents.find(d => d.id === id);
    if (!doc) continue;
    if (doc.relevance === 'high')   score += 40;
    if (doc.relevance === 'medium') score += 15;
    if (doc.relevance === 'low')    score -= 5;
  }
  return Math.max(0, Math.min(100, score));
}

function meterColor(pct: number): string {
  if (pct > 90) return '#E94560';
  if (pct > 75) return '#F5A623';
  return '#16C79A';
}

/* ─── Component ─── */
export default function ContextBudget() {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const totalTokens = selected.reduce((sum, id) => {
    const doc = documents.find(d => d.id === id);
    return sum + (doc?.tokens || 0);
  }, 0);

  const fillPct = Math.min((totalTokens / BUDGET) * 100, 100);
  const overBudget = totalTokens > BUDGET;

  const toggleDoc = (id: string) => {
    if (submitted) return;
    if (selected.includes(id)) {
      setSelected(prev => prev.filter(s => s !== id));
    } else {
      setSelected(prev => [...prev, id]);
    }
  };

  const handleSubmit = () => {
    if (overBudget || selected.length === 0) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelected([]);
    setSubmitted(false);
  };

  const score = computeScore(selected);

  return (
    <div className="widget-container" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem 1rem',
        borderBottom: '1px solid rgba(26,26,46,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7, flexShrink: 0,
            background: 'linear-gradient(135deg, #7B61FF, #0F3460)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 7V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3" />
            </svg>
          </div>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.05rem',
            fontWeight: 700, margin: 0, color: '#1A1A2E',
          }}>
            Context Budget
          </h3>
        </div>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.85rem',
          color: '#6B7280', margin: 0, lineHeight: 1.55,
        }}>
          You have <strong style={{ color: '#7B61FF', fontWeight: 700 }}>1,000 tokens</strong> to help an AI debug a React login page. Pick the files that matter most.
        </p>
      </div>

      {/* Task card */}
      <div style={{
        margin: '1rem 1.5rem 0.75rem',
        padding: '0.75rem 1rem', borderRadius: 10,
        background: 'rgba(123,97,255,0.04)',
        border: '1px solid rgba(123,97,255,0.12)',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase' as const,
          color: '#7B61FF', marginBottom: 4,
        }}>
          Task
        </div>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.88rem',
          color: '#1A1A2E', margin: 0, lineHeight: 1.55, fontWeight: 500,
        }}>
          "Help me debug why my React app's login page isn't working"
        </p>
      </div>

      {/* Token meter */}
      <div style={{ padding: '0 1.5rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280',
          }}>
            {totalTokens.toLocaleString()} / {BUDGET.toLocaleString()} tokens
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
            color: overBudget ? '#E94560' : meterColor(fillPct),
          }}>
            {overBudget ? 'OVER BUDGET' : `${Math.round(fillPct)}%`}
          </span>
        </div>
        <div style={{
          height: 10, borderRadius: 5, background: 'rgba(26,26,46,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 5,
            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            width: `${Math.min(fillPct, 100)}%`,
            background: overBudget
              ? '#E94560'
              : fillPct > 90
                ? 'linear-gradient(90deg, #F5A623, #E94560)'
                : fillPct > 75
                  ? 'linear-gradient(90deg, #16C79A, #F5A623)'
                  : 'linear-gradient(90deg, #7B61FF, #0EA5E9)',
          }} />
        </div>
      </div>

      {/* Document list */}
      <div style={{ padding: '0 1.5rem', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {documents.map(doc => {
            const isSelected = selected.includes(doc.id);
            const rel = relevanceColors[doc.relevance];
            const wouldOverflow = !isSelected && (totalTokens + doc.tokens > BUDGET);

            return (
              <div
                key={doc.id}
                onClick={() => !submitted && toggleDoc(doc.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0.6rem 0.75rem', borderRadius: 9,
                  border: `1px solid ${
                    submitted
                      ? rel.border
                      : isSelected
                        ? 'rgba(123,97,255,0.25)'
                        : 'rgba(26,26,46,0.06)'
                  }`,
                  background: submitted
                    ? rel.bg
                    : isSelected
                      ? 'rgba(123,97,255,0.04)'
                      : 'transparent',
                  cursor: submitted ? 'default' : 'pointer',
                  opacity: (!submitted && wouldOverflow && !isSelected) ? 0.45 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                  border: `2px solid ${
                    submitted
                      ? rel.text
                      : isSelected ? '#7B61FF' : 'rgba(26,26,46,0.15)'
                  }`,
                  background: isSelected
                    ? (submitted ? rel.text : '#7B61FF')
                    : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>

                {/* Doc info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                    color: '#1A1A2E', lineHeight: 1.3,
                    whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {doc.name}
                  </div>
                  {submitted && (
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700,
                      color: rel.text, letterSpacing: '0.04em',
                    }}>
                      {doc.label}
                    </span>
                  )}
                </div>

                {/* Token cost */}
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                  color: (!submitted && wouldOverflow && !isSelected) ? '#E94560' : '#6B7280',
                  flexShrink: 0,
                }}>
                  {doc.tokens}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action area */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(26,26,46,0.06)' }}>
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={overBudget || selected.length === 0}
            style={{
              width: '100%', padding: '0.7rem', borderRadius: 9,
              fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700,
              border: 'none',
              cursor: (overBudget || selected.length === 0) ? 'not-allowed' : 'pointer',
              background: (overBudget || selected.length === 0)
                ? 'rgba(26,26,46,0.06)'
                : '#7B61FF',
              color: (overBudget || selected.length === 0) ? '#6B7280' : '#FAF8F5',
              transition: 'all 0.2s',
              minHeight: 44,
            }}
          >
            {overBudget ? 'Over budget — remove something' : selected.length === 0 ? 'Select files to include' : `Submit (${selected.length} file${selected.length !== 1 ? 's' : ''})`}
          </button>
        ) : (
          <>
            {/* Score */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
              padding: '0.75rem', borderRadius: 10,
              background: score >= 70
                ? 'rgba(22,199,154,0.06)'
                : score >= 40
                  ? 'rgba(245,166,35,0.06)'
                  : 'rgba(233,69,96,0.06)',
              border: `1px solid ${
                score >= 70
                  ? 'rgba(22,199,154,0.15)'
                  : score >= 40
                    ? 'rgba(245,166,35,0.15)'
                    : 'rgba(233,69,96,0.15)'
              }`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: score >= 70 ? '#16C79A' : score >= 40 ? '#F5A623' : '#E94560',
                animation: 'cb-popIn 0.4s ease both',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '1.05rem',
                  fontWeight: 800, color: '#FEFDFB',
                }}>
                  {score}
                </span>
              </div>
              <div>
                <p style={{
                  fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 700,
                  margin: 0,
                  color: score >= 70 ? '#16C79A' : score >= 40 ? '#F5A623' : '#E94560',
                }}>
                  {score >= 70 ? 'Great context selection!' : score >= 40 ? 'Decent, but could be sharper.' : 'Needs work.'}
                </p>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                  color: '#6B7280', margin: 0,
                }}>
                  Score: {score}/100
                </p>
              </div>
            </div>

            {/* Insight */}
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.8rem',
              color: '#1A1A2E', margin: '0 0 12px', lineHeight: 1.65,
              fontStyle: 'italic',
            }}>
              <span style={{ fontWeight: 600, color: '#7B61FF', fontStyle: 'normal' }}>Insight: </span>
              The best context isn't <em>everything</em> — it's the <em>right</em> things.
              The login component and auth route are essential.
              The README and schema help.
              The CSS and package.json are noise.
            </p>

            <button
              onClick={handleReset}
              style={{
                width: '100%', padding: '0.6rem', borderRadius: 9,
                fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700,
                border: '1px solid #7B61FF', cursor: 'pointer',
                background: 'transparent', color: '#7B61FF',
                transition: 'all 0.2s', minHeight: 44,
              }}
            >
              Try Again
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes cb-popIn {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
