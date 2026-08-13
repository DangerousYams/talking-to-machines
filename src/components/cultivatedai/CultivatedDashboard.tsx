import { useState, useEffect, type CSSProperties } from 'react';
import { supabase } from '../../lib/supabase';
import {
  WORLDS,
  FREQUENCIES,
  AI_TOOLS,
  LAPTOP_CHECKS,
  HANDOVER_CHORES,
  WORRIES,
  labelFor,
  colorFor,
  type SurveyOption,
} from './surveyData';

const PASSWORD = 'ttmlive';
const CORAL = '#E94560';
const TEAL = '#16C79A';

interface Response {
  id: string;
  cohort: string;
  name: string;
  world: string[];
  frequency: string | null;
  ai_tools: string[];
  ai_tools_other: string | null;
  laptop: string[];
  handover: string[];
  handover_other: string | null;
  worries: string[];
  last_word: string | null;
  created_at: string;
}

/** Array columns are NOT NULL in the table, but a hand-edited row should not
    take the whole page down. */
const list = (v: string[] | null | undefined): string[] => (Array.isArray(v) ? v : []);

const tally = (rows: Response[], pick: (r: Response) => string[]): Record<string, number> =>
  rows.reduce<Record<string, number>>((acc, r) => {
    pick(r).forEach(id => { acc[id] = (acc[id] || 0) + 1; });
    return acc;
  }, {});

const relativeTime = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(then).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

export default function CultivatedDashboard() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(false);
  const [cohort, setCohort] = useState('all');

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
      .from('cultivated_survey_responses')
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
                ...(pwError ? { borderColor: CORAL } : {}),
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

  // ── Cohorts ──
  const cohorts = Array.from(new Set(responses.map(r => r.cohort).filter(Boolean)));
  const multiCohort = cohorts.length > 1;
  const rows = cohort === 'all' ? responses : responses.filter(r => r.cohort === cohort);

  // ── Aggregates ──
  const total = rows.length;
  const laptopsReady = rows.filter(r => {
    const l = list(r.laptop);
    return l.includes('google') && l.includes('chrome');
  }).length;
  const needSetup = rows.filter(r => {
    const l = list(r.laptop);
    return l.includes('none') || l.includes('unsure') || !l.includes('google');
  }).length;

  const laptopCounts = tally(rows, r => list(r.laptop));
  const worldCounts = tally(rows, r => list(r.world));
  const frequencyCounts = tally(rows, r => (r.frequency ? [r.frequency] : []));
  const toolCounts = tally(rows, r => list(r.ai_tools));
  const choreCounts = tally(rows, r => list(r.handover));
  const worryCounts = tally(rows, r => list(r.worries));

  const toolsOther = rows.map(r => r.ai_tools_other).filter((v): v is string => !!v);
  const choresOther = rows.map(r => r.handover_other).filter((v): v is string => !!v);

  const pct = (count: number) => (total > 0 ? (count / total) * 100 : 0);

  const barSection = (
    title: string,
    counts: Record<string, number>,
    options: readonly SurveyOption[],
    color: string,
  ) => (
    <div style={s.sectionCard}>
      <h3 style={s.statLabel}>{title}</h3>
      <div style={s.barList}>
        {Object.entries(counts)
          .sort(([, a], [, b]) => b - a)
          .map(([key, count]) => (
            <div key={key} style={s.barRow}>
              <div style={s.barLabel}>{labelFor(options, key)}</div>
              <div style={s.barTrack}>
                <div style={{ ...s.barFill, width: `${Math.max(pct(count), 2)}%`, background: color }} />
              </div>
              <div style={s.barCount}>{count}</div>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <h1 style={s.title}>Responses</h1>
        <span style={s.count}>{total} {total === 1 ? 'response' : 'responses'}</span>
      </div>

      {multiCohort && (
        <div style={s.cohortRow}>
          <button
            onClick={() => setCohort('all')}
            style={{ ...s.cohortPill, ...(cohort === 'all' ? s.cohortPillActive : {}) }}
          >
            All
          </button>
          {cohorts.map(c => (
            <button
              key={c}
              onClick={() => setCohort(c)}
              style={{ ...s.cohortPill, ...(cohort === c ? s.cohortPillActive : {}) }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p style={s.loading}>Loading...</p>
      ) : total === 0 ? (
        <div style={s.empty}>
          <p style={s.emptyText}>No responses yet. Share the link!</p>
          <code style={s.emptyCode}>talkingtomachines.xyz/cultivated-ai/hello</code>
        </div>
      ) : (
        <>
          {/* ── Stat cards ── */}
          <div style={s.statsRow}>
            <div style={s.statCard}>
              <h3 style={s.statLabel}>Responses</h3>
              <div style={s.statNumber}>{total}</div>
            </div>
            <div style={s.statCard}>
              <h3 style={s.statLabel}>Laptops ready</h3>
              <div style={{ ...s.statNumber, color: TEAL }}>{laptopsReady}</div>
            </div>
            <div style={s.statCard}>
              <h3 style={s.statLabel}>Need setup help</h3>
              <div style={{ ...s.statNumber, color: CORAL }}>{needSetup}</div>
            </div>
          </div>

          {/* ── Laptop check: the list Shalin works through before the room ── */}
          <div style={s.sectionCard}>
            <h3 style={s.statLabel}>Laptop check</h3>
            <div style={s.barList}>
              {LAPTOP_CHECKS.map(opt => {
                const count = laptopCounts[opt.id] || 0;
                return (
                  <div key={opt.id} style={s.barRow}>
                    <div style={s.barLabel}>{opt.label}</div>
                    <div style={s.barTrack}>
                      <div style={{ ...s.barFill, width: `${Math.max(pct(count), 2)}%`, background: opt.color }} />
                    </div>
                    <div style={s.barCount}>{count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {barSection('Where their weeks go', worldCounts, WORLDS, CORAL)}
          {barSection('How often they use AI', frequencyCounts, FREQUENCIES, CORAL)}

          <div style={s.sectionCard}>
            <h3 style={s.statLabel}>Tools tried</h3>
            <div style={s.barList}>
              {Object.entries(toolCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([key, count]) => (
                  <div key={key} style={s.barRow}>
                    <div style={s.barLabel}>{labelFor(AI_TOOLS, key)}</div>
                    <div style={s.barTrack}>
                      <div style={{ ...s.barFill, width: `${Math.max(pct(count), 2)}%`, background: CORAL }} />
                    </div>
                    <div style={s.barCount}>{count}</div>
                  </div>
                ))}
            </div>
            {toolsOther.length > 0 && (
              <div style={s.otherList}>
                {toolsOther.map((t, i) => <p key={i} style={s.otherItem}>{t}</p>)}
              </div>
            )}
          </div>

          <div style={s.sectionCard}>
            <h3 style={s.statLabel}>Chores they'd hand over</h3>
            <div style={s.barList}>
              {Object.entries(choreCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([key, count]) => (
                  <div key={key} style={s.barRow}>
                    <div style={s.barLabel}>{labelFor(HANDOVER_CHORES, key)}</div>
                    <div style={s.barTrack}>
                      <div style={{
                        ...s.barFill,
                        width: `${Math.max(pct(count), 2)}%`,
                        background: colorFor(HANDOVER_CHORES, key, CORAL),
                      }} />
                    </div>
                    <div style={s.barCount}>{count}</div>
                  </div>
                ))}
            </div>
            {choresOther.length > 0 && (
              <div style={s.otherList}>
                {choresOther.map((c, i) => <p key={i} style={s.otherItem}>{c}</p>)}
              </div>
            )}
          </div>

          {barSection('Worries', worryCounts, WORRIES, CORAL)}

          {/* ── Individual responses ── */}
          <h2 style={s.sectionTitle}>Individual responses</h2>
          <div style={s.responseList}>
            {rows.map((r, i) => (
              <div key={r.id} style={{ ...s.responseCard, animationDelay: `${i * 0.05}s` }}>
                <div style={s.responseHeader}>
                  <h3 style={s.responseName}>{r.name}</h3>
                  <div style={s.responseMeta}>
                    {multiCohort && <span style={s.cohortChip}>{r.cohort}</span>}
                    <span style={s.responseDate}>{relativeTime(r.created_at)}</span>
                  </div>
                </div>

                <div style={s.responseRow}>
                  <span style={s.responseLabel}>Worlds</span>
                  <div style={s.tagWrap}>
                    {list(r.world).map(w => (
                      <span key={w} style={s.tag}>{labelFor(WORLDS, w)}</span>
                    ))}
                  </div>
                </div>

                {r.frequency && (
                  <div style={s.responseRow}>
                    <span style={s.responseLabel}>Frequency</span>
                    <div style={s.tagWrap}>
                      <span style={s.tag}>{labelFor(FREQUENCIES, r.frequency)}</span>
                    </div>
                  </div>
                )}

                <div style={s.responseRow}>
                  <span style={s.responseLabel}>Tools</span>
                  <div style={s.tagWrap}>
                    {list(r.ai_tools).map(t => (
                      <span key={t} style={s.tag}>{labelFor(AI_TOOLS, t)}</span>
                    ))}
                    {r.ai_tools_other && <span style={s.tag}>{r.ai_tools_other}</span>}
                  </div>
                </div>

                <div style={s.responseRow}>
                  <span style={s.responseLabel}>Laptop</span>
                  <div style={s.tagWrap}>
                    {list(r.laptop).map(l => {
                      const color = colorFor(LAPTOP_CHECKS, l);
                      return (
                        <span key={l} style={{ ...s.tag, background: `${color}12`, color }}>
                          {labelFor(LAPTOP_CHECKS, l)}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div style={s.responseRow}>
                  <span style={s.responseLabel}>Chores</span>
                  <div style={s.tagWrap}>
                    {list(r.handover).map(h => {
                      const color = colorFor(HANDOVER_CHORES, h);
                      return (
                        <span key={h} style={{ ...s.tag, background: `${color}12`, color }}>
                          {labelFor(HANDOVER_CHORES, h)}
                        </span>
                      );
                    })}
                    {r.handover_other && <span style={s.tag}>{r.handover_other}</span>}
                  </div>
                </div>

                <div style={s.responseRow}>
                  <span style={s.responseLabel}>Worries</span>
                  <div style={s.tagWrap}>
                    {list(r.worries).map(w => (
                      <span key={w} style={s.tag}>{labelFor(WORRIES, w)}</span>
                    ))}
                  </div>
                </div>

                {r.last_word && <p style={s.quote}>{r.last_word}</p>}
              </div>
            ))}
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
    marginBottom: '1.25rem',
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

  // Cohort filter
  cohortRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    marginBottom: '1.75rem',
  },
  cohortPill: {
    padding: '0.35rem 0.9rem',
    borderRadius: 100,
    border: '1.5px solid rgba(26,26,46,0.1)',
    background: 'white',
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.72rem',
    color: '#6B7280',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  cohortPillActive: {
    borderColor: '#E94560',
    background: '#E94560',
    color: 'white',
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
    color: '#E94560',
  },

  // Stats
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  statCard: {
    background: 'white',
    borderRadius: 16,
    padding: '1.5rem',
    border: '1px solid rgba(26,26,46,0.06)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
  },
  statNumber: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: '2.2rem',
    fontWeight: 800,
    lineHeight: 1,
    color: '#1A1A2E',
  },
  sectionCard: {
    background: 'white',
    borderRadius: 16,
    padding: '1.5rem',
    border: '1px solid rgba(26,26,46,0.06)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
    marginBottom: '1rem',
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
    // Holds 200px where there is room, wraps instead of crushing the bar on phones.
    flex: '0 1 200px',
    minWidth: 0,
  },
  barTrack: {
    flex: 1,
    minWidth: 60,
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
  otherList: {
    marginTop: '1rem',
    paddingTop: '0.85rem',
    borderTop: '1px solid rgba(26,26,46,0.06)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.3rem',
  },
  otherItem: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.85rem',
    fontStyle: 'italic',
    color: '#6B7280',
    lineHeight: 1.5,
  },

  // Individual responses
  sectionTitle: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#1A1A2E',
    margin: '2rem 0 1.25rem',
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
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  responseName: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#1A1A2E',
  },
  responseMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  cohortChip: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.62rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: '#E94560',
    background: 'rgba(233,69,96,0.08)',
    padding: '0.2rem 0.6rem',
    borderRadius: 100,
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
  quote: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.95rem',
    color: '#1A1A2E',
    lineHeight: 1.6,
    marginTop: '0.75rem',
    fontStyle: 'italic',
    paddingLeft: '1rem',
    borderLeft: '2px solid rgba(233,69,96,0.25)',
    whiteSpace: 'pre-wrap' as const,
  },
};
