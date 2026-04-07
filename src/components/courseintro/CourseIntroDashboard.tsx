import { useState, useEffect, type CSSProperties } from 'react';
import { supabase } from '../../lib/supabase';

const PASSWORD = 'ttmlive';

const DOMAIN_LABELS: Record<string, string> = {
  'marketing': 'Marketing & content',
  'research': 'Research & analysis',
  'coding': 'Coding & development',
  'automation': 'Workflow automation',
  'creative': 'Creative',
  'writing': 'Writing & editing',
  'education': 'Teaching & learning',
  'data': 'Data & spreadsheets',
  'business': 'Strategy & planning',
  'personal': 'Personal productivity',
};

const ACTIVITY_LABELS: Record<string, { label: string; color: string }> = {
  'official-text': { label: 'AI text in official comms', color: '#16C79A' },
  'brainstorm': { label: 'Brainstormed with AI', color: '#16C79A' },
  'summarize': { label: 'Summarized docs', color: '#0EA5E9' },
  'image-gen': { label: 'Generated images', color: '#0EA5E9' },
  'presentations': { label: 'Made slides', color: '#0EA5E9' },
  'code': { label: 'Written/debugged code', color: '#7B61FF' },
  'data-analysis': { label: 'Analyzed data', color: '#7B61FF' },
  'research': { label: 'Deep research', color: '#7B61FF' },
  'automated': { label: 'Automated a task', color: '#E94560' },
  'agents': { label: 'Built/used an agent', color: '#E94560' },
};

interface Response {
  id: string;
  name: string;
  domains: string[];
  activities: string[];
  ai_tools: string[];
  ai_tools_other: string | null;
  top_of_mind: string | null;
  created_at: string;
}

export default function CourseIntroDashboard() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  useEffect(() => {
    if (!authed || !supabase) return;
    setLoading(true);
    supabase
      .from('course_survey_responses')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setResponses((data as Response[]) || []);
        setLoading(false);
      });
  }, [authed]);

  // ── Password gate ──
  if (!authed) {
    return (
      <div style={s.gateWrap}>
        <div style={s.gateCard}>
          <div style={s.gateIcon}>🔒</div>
          <h2 style={s.gateTitle}>Dashboard</h2>
          <p style={s.gateHint}>Enter the password to view responses.</p>
          <form onSubmit={handleLogin} style={s.gateForm}>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setPwError(false); }}
              placeholder="Password"
              style={{
                ...s.gateInput,
                ...(pwError ? { borderColor: '#E94560' } : {}),
              }}
              autoFocus
            />
            <button type="submit" style={s.gateBtn}>Enter</button>
          </form>
          {pwError && <p style={s.gateError}>Nope, try again.</p>}
        </div>
      </div>
    );
  }

  // ── Aggregate stats ──
  const totalResponses = responses.length;
  const domainCounts = responses.reduce<Record<string, number>>((acc, r) => {
    r.domains.forEach(d => { acc[d] = (acc[d] || 0) + 1; });
    return acc;
  }, {});
  const activityCounts = responses.reduce<Record<string, number>>((acc, r) => {
    r.activities.forEach(a => { acc[a] = (acc[a] || 0) + 1; });
    return acc;
  }, {});
  const toolCounts = responses.reduce<Record<string, number>>((acc, r) => {
    r.ai_tools.forEach(t => { acc[t] = (acc[t] || 0) + 1; });
    return acc;
  }, {});

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <h1 style={s.title}>Responses</h1>
        <span style={s.count}>{totalResponses} {totalResponses === 1 ? 'response' : 'responses'}</span>
      </div>

      {loading ? (
        <p style={s.loading}>Loading...</p>
      ) : totalResponses === 0 ? (
        <div style={s.empty}>
          <p style={s.emptyText}>No responses yet. Share the link!</p>
          <code style={s.emptyCode}>talkingtomachines.xyz/courseintro</code>
        </div>
      ) : (
        <>
          {/* ── Summary cards ── */}
          <div style={s.statsRow}>
            {/* Where they want to use AI */}
            <div style={s.statCard}>
              <h3 style={s.statLabel}>Where they want to use AI</h3>
              <div style={s.barList}>
                {Object.entries(domainCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, count]) => {
                    const pct = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
                    return (
                      <div key={key} style={s.barRow}>
                        <div style={s.barLabel}>{DOMAIN_LABELS[key] || key}</div>
                        <div style={s.barTrack}>
                          <div style={{ ...s.barFill, width: `${Math.max(pct, 2)}%`, background: '#7B61FF' }} />
                        </div>
                        <div style={s.barCount}>{count}</div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* What they've tried */}
            <div style={s.statCard}>
              <h3 style={s.statLabel}>What they've tried</h3>
              <div style={s.barList}>
                {Object.entries(activityCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, count]) => {
                    const info = ACTIVITY_LABELS[key] || { label: key, color: '#6B7280' };
                    const pct = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
                    return (
                      <div key={key} style={s.barRow}>
                        <div style={s.barLabel}>{info.label}</div>
                        <div style={s.barTrack}>
                          <div style={{ ...s.barFill, width: `${Math.max(pct, 2)}%`, background: info.color }} />
                        </div>
                        <div style={s.barCount}>{count}</div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Tool popularity */}
            <div style={s.statCard}>
              <h3 style={s.statLabel}>Tools used</h3>
              <div style={s.pillWrap}>
                {Object.entries(toolCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, count]) => (
                    <span key={key} style={s.toolPill}>
                      {key} <span style={s.toolPillCount}>{count}</span>
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* ── Individual responses ── */}
          <h2 style={s.sectionTitle}>Individual responses</h2>
          <div style={s.responseList}>
            {responses.map((r, i) => {
              return (
                <div key={r.id} style={{ ...s.responseCard, animationDelay: `${i * 0.05}s` }}>
                  <div style={s.responseHeader}>
                    <h3 style={s.responseName}>{r.name}</h3>
                    <span style={s.responseDate}>
                      {new Date(r.created_at).toLocaleDateString('en-IN', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div style={s.responseRow}>
                    <span style={s.responseLabel}>Wants AI for</span>
                    <div style={s.tagWrap}>
                      {r.domains.map(d => (
                        <span key={d} style={s.tag}>{DOMAIN_LABELS[d] || d}</span>
                      ))}
                    </div>
                  </div>

                  <div style={s.responseRow}>
                    <span style={s.responseLabel}>Has tried</span>
                    <div style={s.tagWrap}>
                      {r.activities.map(a => {
                        const info = ACTIVITY_LABELS[a] || { label: a, color: '#6B7280' };
                        return (
                          <span key={a} style={{
                            ...s.tag,
                            background: `${info.color}10`,
                            color: info.color,
                          }}>{info.label}</span>
                        );
                      })}
                    </div>
                  </div>

                  <div style={s.responseRow}>
                    <span style={s.responseLabel}>Tools</span>
                    <div style={s.tagWrap}>
                      {r.ai_tools.map(t => (
                        <span key={t} style={s.tag}>{t}</span>
                      ))}
                      {r.ai_tools_other && <span style={s.tag}>{r.ai_tools_other}</span>}
                    </div>
                  </div>

                  {r.top_of_mind && (
                    <div style={{ ...s.responseRow, flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={s.responseLabel}>What's on their mind</span>
                      <p style={s.responseText}>{r.top_of_mind}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <style>{`
        @keyframes dashFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ── Styles ── */
const s: Record<string, CSSProperties> = {
  // Gate
  gateWrap: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  gateCard: {
    textAlign: 'center',
    maxWidth: 360,
    width: '100%',
  },
  gateIcon: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  gateTitle: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: '1.8rem',
    fontWeight: 800,
    color: '#1A1A2E',
    marginBottom: '0.5rem',
  },
  gateHint: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.95rem',
    color: '#6B7280',
    marginBottom: '1.5rem',
  },
  gateForm: {
    display: 'flex',
    gap: '0.5rem',
  },
  gateInput: {
    flex: 1,
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.95rem',
    padding: '0.75rem 1rem',
    borderRadius: 12,
    border: '1.5px solid rgba(26,26,46,0.12)',
    background: 'white',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  gateBtn: {
    padding: '0.75rem 1.5rem',
    borderRadius: 12,
    border: 'none',
    background: '#1A1A2E',
    color: 'white',
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  gateError: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.78rem',
    color: '#E94560',
    marginTop: '0.75rem',
  },

  // Dashboard
  wrap: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '2rem 1.5rem 4rem',
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '1rem',
    marginBottom: '2rem',
  },
  title: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
    fontWeight: 800,
    color: '#1A1A2E',
  },
  count: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.78rem',
    color: '#6B7280',
    background: 'rgba(26,26,46,0.05)',
    padding: '0.25rem 0.75rem',
    borderRadius: 100,
  },
  loading: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    color: '#6B7280',
    fontStyle: 'italic',
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  emptyText: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '1.1rem',
    color: '#6B7280',
    marginBottom: '1rem',
  },
  emptyCode: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.88rem',
    background: 'white',
    padding: '0.5rem 1rem',
    borderRadius: 8,
    border: '1px solid rgba(26,26,46,0.08)',
    color: '#7B61FF',
  },

  // Stats
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    background: 'white',
    borderRadius: 16,
    padding: '1.5rem',
    border: '1px solid rgba(26,26,46,0.06)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
  },
  statLabel: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#6B7280',
    marginBottom: '1rem',
  },
  barList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.6rem',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  barLabel: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.82rem',
    color: '#1A1A2E',
    minWidth: 120,
    flexShrink: 0,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    background: 'rgba(26,26,46,0.04)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  barCount: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#6B7280',
    minWidth: 20,
    textAlign: 'right' as const,
  },
  pillWrap: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  toolPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.35rem 0.85rem',
    borderRadius: 100,
    background: 'rgba(123,97,255,0.06)',
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.82rem',
    color: '#1A1A2E',
  },
  toolPillCount: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#7B61FF',
  },

  // Individual responses
  sectionTitle: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#1A1A2E',
    marginBottom: '1.25rem',
  },
  responseList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  responseCard: {
    background: 'white',
    borderRadius: 16,
    padding: '1.5rem',
    border: '1px solid rgba(26,26,46,0.06)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    animation: 'dashFadeIn 0.4s ease both',
  },
  responseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  responseName: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#1A1A2E',
  },
  responseDate: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.7rem',
    color: '#6B7280',
  },
  responseRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.6rem',
    flexWrap: 'wrap' as const,
  },
  responseLabel: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.68rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#6B7280',
    minWidth: 75,
    flexShrink: 0,
  },
  tagWrap: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.35rem',
  },
  tag: {
    display: 'inline-block',
    padding: '0.2rem 0.7rem',
    borderRadius: 100,
    background: 'rgba(26,26,46,0.04)',
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.8rem',
    color: '#1A1A2E',
  },
  responseText: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.95rem',
    color: '#1A1A2E',
    lineHeight: 1.6,
    marginTop: '0.35rem',
    fontStyle: 'italic',
    paddingLeft: '1rem',
    borderLeft: '2px solid rgba(123,97,255,0.2)',
  },
};
