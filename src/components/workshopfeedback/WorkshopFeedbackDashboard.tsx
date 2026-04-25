import { useState, useEffect, type CSSProperties } from 'react';
import { supabase } from '../../lib/supabase';

const PASSWORD = 'ttmlive';

const TOPIC_LABELS: Record<string, { label: string; color: string }> = {
  'principles': { label: '15 prompting principles', color: '#E94560' },
  'agents-coding': { label: 'Agents & coding', color: '#7B61FF' },
  'skills': { label: 'Skills & 3-phase plan', color: '#16C79A' },
};

interface Response {
  id: string;
  name: string;
  recommend_score: number | null;
  topic_loved: string | null;
  what_worked: string | null;
  what_to_improve: string | null;
  what_changed: string | null;
  consent_share_answers: boolean;
  consent_use_name: boolean;
  created_at: string;
}

export default function WorkshopFeedbackDashboard() {
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
      .from('workshop_feedback_responses')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setResponses((data as Response[]) || []);
        setLoading(false);
      });
  }, [authed]);

  // Password gate
  if (!authed) {
    return (
      <div style={s.gateWrap}>
        <div style={s.gateCard}>
          <div style={s.gateIcon}>🔒</div>
          <h2 style={s.gateTitle}>Workshop feedback</h2>
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

  // Aggregates
  const total = responses.length;
  const scores = responses.map(r => r.recommend_score).filter((n): n is number => n != null);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const promoters = scores.filter(n => n >= 9).length;
  const detractors = scores.filter(n => n <= 6).length;
  const passives = scores.length - promoters - detractors;
  const nps = scores.length ? Math.round(((promoters - detractors) / scores.length) * 100) : 0;

  const topicCounts = responses.reduce<Record<string, number>>((acc, r) => {
    if (r.topic_loved) acc[r.topic_loved] = (acc[r.topic_loved] || 0) + 1;
    return acc;
  }, {});

  const shareable = responses.filter(r => r.consent_share_answers);

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <h1 style={s.title}>Workshop feedback</h1>
        <span style={s.count}>{total} {total === 1 ? 'response' : 'responses'}</span>
      </div>

      {loading ? (
        <p style={s.loading}>Loading…</p>
      ) : total === 0 ? (
        <div style={s.empty}>
          <p style={s.emptyText}>No responses yet. Share the link!</p>
          <code style={s.emptyCode}>talkingtomachines.xyz/workshopfeedback</code>
        </div>
      ) : (
        <>
          {/* Score summary */}
          <div style={s.scoreRow}>
            <div style={s.scoreCard}>
              <div style={s.scoreNum}>{avgScore.toFixed(1)}</div>
              <div style={s.scoreLabel}>avg score / 10</div>
            </div>
            <div style={s.scoreCard}>
              <div style={{ ...s.scoreNum, color: nps >= 50 ? '#16C79A' : nps >= 0 ? '#F5A623' : '#E94560' }}>
                {nps > 0 ? '+' : ''}{nps}
              </div>
              <div style={s.scoreLabel}>NPS</div>
            </div>
            <div style={s.scoreCard}>
              <div style={s.scoreSplit}>
                <span style={{ color: '#16C79A' }}>{promoters}</span>
                <span style={s.scoreSplitDiv}>·</span>
                <span style={{ color: '#F5A623' }}>{passives}</span>
                <span style={s.scoreSplitDiv}>·</span>
                <span style={{ color: '#E94560' }}>{detractors}</span>
              </div>
              <div style={s.scoreLabel}>promoter · passive · detractor</div>
            </div>
            <div style={s.scoreCard}>
              <div style={s.scoreNum}>{shareable.length}</div>
              <div style={s.scoreLabel}>quotable for marketing</div>
            </div>
          </div>

          {/* Topic split */}
          <div style={s.topicCard}>
            <h3 style={s.statLabel}>Which topic clicked most</h3>
            <div style={s.barList}>
              {Object.keys(TOPIC_LABELS).map(key => {
                const info = TOPIC_LABELS[key];
                const count = topicCounts[key] || 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
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

          {/* Marketing-ready quotes */}
          {shareable.length > 0 && (
            <>
              <h2 style={s.sectionTitle}>Quotable for marketing</h2>
              <p style={s.sectionHint}>
                These respondents said yes to public sharing.
                {' '}
                <strong>{shareable.filter(r => r.consent_use_name).length}</strong> also OK'd using their name.
              </p>
              <div style={s.quoteList}>
                {shareable.map(r => (
                  <div key={r.id} style={s.quoteCard}>
                    <div style={s.quoteAttribution}>
                      {r.consent_use_name ? r.name : 'Anonymous'}
                      {r.recommend_score != null && (
                        <span style={s.quoteScore}>· rated {r.recommend_score}/10</span>
                      )}
                      {!r.consent_use_name && (
                        <span style={s.anonTag}>name redacted by their request</span>
                      )}
                    </div>
                    {r.what_changed && (
                      <p style={s.quoteText}>"{r.what_changed}"</p>
                    )}
                    {r.what_worked && (
                      <p style={s.quoteSecondary}>
                        <span style={s.quoteLabel}>What worked:</span> {r.what_worked}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* All responses */}
          <h2 style={s.sectionTitle}>All responses</h2>
          <div style={s.responseList}>
            {responses.map((r, i) => {
              const topicInfo = r.topic_loved ? TOPIC_LABELS[r.topic_loved] : null;
              return (
                <div key={r.id} style={{ ...s.responseCard, animationDelay: `${i * 0.04}s` }}>
                  <div style={s.responseHeader}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                      <h3 style={s.responseName}>{r.name}</h3>
                      {r.recommend_score != null && (
                        <span style={{
                          ...s.scoreBadge,
                          background: r.recommend_score >= 9 ? 'rgba(22,199,154,0.12)' :
                                      r.recommend_score >= 7 ? 'rgba(245,166,35,0.12)' : 'rgba(233,69,96,0.12)',
                          color: r.recommend_score >= 9 ? '#16C79A' :
                                 r.recommend_score >= 7 ? '#F5A623' : '#E94560',
                        }}>
                          {r.recommend_score}/10
                        </span>
                      )}
                    </div>
                    <span style={s.responseDate}>
                      {new Date(r.created_at).toLocaleDateString('en-IN', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {topicInfo && (
                    <div style={s.responseRow}>
                      <span style={s.responseLabel}>Topic loved</span>
                      <span style={{
                        ...s.tag,
                        background: `${topicInfo.color}10`,
                        color: topicInfo.color,
                      }}>{topicInfo.label}</span>
                    </div>
                  )}

                  {r.what_worked && (
                    <div style={s.fieldBlock}>
                      <span style={s.fieldLabel}>What worked</span>
                      <p style={s.fieldText}>{r.what_worked}</p>
                    </div>
                  )}

                  {r.what_to_improve && (
                    <div style={s.fieldBlock}>
                      <span style={s.fieldLabel}>To improve</span>
                      <p style={s.fieldText}>{r.what_to_improve}</p>
                    </div>
                  )}

                  {r.what_changed && (
                    <div style={s.fieldBlock}>
                      <span style={s.fieldLabel}>What's changed</span>
                      <p style={s.fieldText}>{r.what_changed}</p>
                    </div>
                  )}

                  <div style={s.consentRow}>
                    <span style={{
                      ...s.consentChip,
                      background: r.consent_share_answers ? 'rgba(22,199,154,0.1)' : 'rgba(26,26,46,0.04)',
                      color: r.consent_share_answers ? '#16C79A' : '#6B7280',
                    }}>
                      {r.consent_share_answers ? '✓' : '✗'} share answers
                    </span>
                    <span style={{
                      ...s.consentChip,
                      background: r.consent_use_name ? 'rgba(22,199,154,0.1)' : 'rgba(26,26,46,0.04)',
                      color: r.consent_use_name ? '#16C79A' : '#6B7280',
                    }}>
                      {r.consent_use_name ? '✓' : '✗'} use name
                    </span>
                  </div>
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

const s: Record<string, CSSProperties> = {
  // Gate
  gateWrap: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  gateCard: { textAlign: 'center', maxWidth: 360, width: '100%' },
  gateIcon: { fontSize: '2rem', marginBottom: '1rem' },
  gateTitle: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: '1.8rem', fontWeight: 800, color: '#1A1A2E', marginBottom: '0.5rem',
  },
  gateHint: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.95rem', color: '#6B7280', marginBottom: '1.5rem',
  },
  gateForm: { display: 'flex', gap: '0.5rem' },
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
    padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none', background: '#1A1A2E', color: 'white',
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
  },
  gateError: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.78rem', color: '#E94560', marginTop: '0.75rem',
  },

  // Dashboard
  wrap: { maxWidth: 920, margin: '0 auto', padding: '2rem 1.5rem 4rem' },
  header: { display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '2rem' },
  title: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#1A1A2E',
  },
  count: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.78rem', color: '#6B7280',
    background: 'rgba(26,26,46,0.05)', padding: '0.25rem 0.75rem', borderRadius: 100,
  },
  loading: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    color: '#6B7280', fontStyle: 'italic',
  },
  empty: { textAlign: 'center', padding: '4rem 2rem' },
  emptyText: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '1.1rem', color: '#6B7280', marginBottom: '1rem',
  },
  emptyCode: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.88rem', background: 'white', padding: '0.5rem 1rem', borderRadius: 8,
    border: '1px solid rgba(26,26,46,0.08)', color: '#7B61FF',
  },

  // Score summary
  scoreRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  scoreCard: {
    background: 'white',
    borderRadius: 16,
    padding: '1.5rem 1.25rem',
    border: '1px solid rgba(26,26,46,0.06)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
    textAlign: 'center' as const,
  },
  scoreNum: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: '2.4rem',
    fontWeight: 800,
    color: '#1A1A2E',
    lineHeight: 1,
    marginBottom: '0.4rem',
    letterSpacing: '-0.03em',
  },
  scoreSplit: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: '1.6rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.4rem',
    display: 'flex', justifyContent: 'center', gap: '0.4rem',
  },
  scoreSplitDiv: { color: 'rgba(26,26,46,0.2)' },
  scoreLabel: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.65rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#6B7280',
  },

  topicCard: {
    background: 'white',
    borderRadius: 16,
    padding: '1.5rem',
    border: '1px solid rgba(26,26,46,0.06)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
    marginBottom: '2.5rem',
  },
  statLabel: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em',
    textTransform: 'uppercase' as const, color: '#6B7280', marginBottom: '1rem',
  },
  barList: { display: 'flex', flexDirection: 'column' as const, gap: '0.6rem' },
  barRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  barLabel: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.88rem', color: '#1A1A2E', minWidth: 180, flexShrink: 0,
  },
  barTrack: {
    flex: 1, height: 6, borderRadius: 3,
    background: 'rgba(26,26,46,0.04)', overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3, transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)' },
  barCount: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.75rem', fontWeight: 600, color: '#6B7280',
    minWidth: 20, textAlign: 'right' as const,
  },

  // Quotable for marketing
  sectionTitle: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: '1.3rem', fontWeight: 700, color: '#1A1A2E',
    marginBottom: '0.5rem', marginTop: '0.5rem',
  },
  sectionHint: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.92rem', color: '#6B7280', marginBottom: '1.25rem', fontStyle: 'italic',
  },
  quoteList: {
    display: 'flex', flexDirection: 'column' as const, gap: '0.85rem', marginBottom: '2.5rem',
  },
  quoteCard: {
    background: 'linear-gradient(135deg, rgba(22,199,154,0.04), rgba(123,97,255,0.02))',
    borderRadius: 16,
    padding: '1.5rem 1.75rem',
    border: '1px solid rgba(22,199,154,0.18)',
    animation: 'dashFadeIn 0.4s ease both',
  },
  quoteAttribution: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#16C79A',
    marginBottom: '0.75rem',
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    alignItems: 'baseline',
  },
  quoteScore: { color: '#6B7280', fontWeight: 500 },
  anonTag: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    color: '#6B7280', fontStyle: 'italic', textTransform: 'none' as const,
    letterSpacing: 'normal', fontSize: '0.75rem',
  },
  quoteText: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: '1.15rem', lineHeight: 1.55, color: '#1A1A2E',
    fontStyle: 'italic', marginBottom: '0.75rem',
  },
  quoteSecondary: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.92rem', color: '#1A1A2E', lineHeight: 1.55,
  },
  quoteLabel: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase' as const, color: '#6B7280', marginRight: '0.4rem',
  },

  // All responses
  responseList: { display: 'flex', flexDirection: 'column' as const, gap: '1rem' },
  responseCard: {
    background: 'white',
    borderRadius: 16,
    padding: '1.5rem',
    border: '1px solid rgba(26,26,46,0.06)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    animation: 'dashFadeIn 0.4s ease both',
  },
  responseHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' as const, gap: '0.5rem',
  },
  responseName: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: '1.15rem', fontWeight: 700, color: '#1A1A2E',
  },
  scoreBadge: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 100,
  },
  responseDate: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.7rem', color: '#6B7280',
  },
  responseRow: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    marginBottom: '0.85rem', flexWrap: 'wrap' as const,
  },
  responseLabel: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase' as const, color: '#6B7280',
    minWidth: 90, flexShrink: 0,
  },
  tag: {
    display: 'inline-block', padding: '0.2rem 0.7rem', borderRadius: 100,
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.8rem',
  },

  fieldBlock: {
    marginBottom: '0.85rem',
    paddingTop: '0.4rem',
  },
  fieldLabel: {
    display: 'block',
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em',
    textTransform: 'uppercase' as const, color: '#6B7280',
    marginBottom: '0.3rem',
  },
  fieldText: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.95rem', color: '#1A1A2E', lineHeight: 1.6,
    paddingLeft: '0.85rem',
    borderLeft: '2px solid rgba(123,97,255,0.18)',
  },

  consentRow: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
    paddingTop: '0.85rem',
    borderTop: '1px solid rgba(26,26,46,0.05)',
    flexWrap: 'wrap' as const,
  },
  consentChip: {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '0.25rem 0.7rem',
    borderRadius: 100,
    letterSpacing: '0.04em',
  },
};
