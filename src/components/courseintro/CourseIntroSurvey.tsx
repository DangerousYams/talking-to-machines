import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { supabase } from '../../lib/supabase';

/* ── Survey data ── */
const DOMAINS = [
  { id: 'marketing', label: 'Marketing & content', icon: '📣' },
  { id: 'research', label: 'Research & analysis', icon: '🔍' },
  { id: 'coding', label: 'Coding & development', icon: '💻' },
  { id: 'automation', label: 'Workflow automation', icon: '⚡' },
  { id: 'creative', label: 'Creative — design, video, music', icon: '🎨' },
  { id: 'writing', label: 'Writing & editing', icon: '✍️' },
  { id: 'education', label: 'Teaching & learning', icon: '📚' },
  { id: 'data', label: 'Data & spreadsheets', icon: '📊' },
  { id: 'business', label: 'Strategy & planning', icon: '🧭' },
  { id: 'personal', label: 'Personal productivity', icon: '✨' },
];

const ACTIVITIES = [
  { id: 'official-text', label: 'Used AI-generated text in an official communication', cat: 'basics', color: '#16C79A' },
  { id: 'brainstorm', label: 'Brainstormed with AI', cat: 'basics', color: '#16C79A' },
  { id: 'summarize', label: 'Summarized a document or article', cat: 'basics', color: '#0EA5E9' },
  { id: 'image-gen', label: 'Generated an image', cat: 'creative', color: '#0EA5E9' },
  { id: 'presentations', label: 'Made slides or a presentation', cat: 'creative', color: '#0EA5E9' },
  { id: 'code', label: 'Written or debugged code', cat: 'technical', color: '#7B61FF' },
  { id: 'data-analysis', label: 'Analyzed data or built a spreadsheet', cat: 'technical', color: '#7B61FF' },
  { id: 'research', label: 'Done deep research with AI', cat: 'technical', color: '#7B61FF' },
  { id: 'automated', label: 'Automated a repetitive task', cat: 'advanced', color: '#E94560' },
  { id: 'agents', label: 'Built or used an AI agent', cat: 'advanced', color: '#E94560' },
];

const AI_TOOLS = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'claude', label: 'Claude' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'copilot', label: 'Copilot / Cursor' },
  { id: 'midjourney', label: 'Midjourney / DALL-E' },
  { id: 'perplexity', label: 'Perplexity' },
  { id: 'canva', label: 'Canva AI' },
  { id: 'notebooklm', label: 'NotebookLM' },
  { id: 'none', label: 'None yet' },
];

const TOTAL_STEPS = 5;

/* ── Component ── */
export default function CourseIntroSurvey() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [domains, setDomains] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [toolsOther, setToolsOther] = useState('');
  const [topOfMind, setTopOfMind] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus inputs when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 0) nameRef.current?.focus();
      if (step === 4) textareaRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, [step]);

  const goTo = (next: number) => {
    if (animating || next === step) return;
    setDir(next > step ? 'forward' : 'back');
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 300);
  };

  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);

  const canProceed = () => {
    switch (step) {
      case 0: return name.trim().length > 0;
      case 1: return domains.length > 0;
      case 2: return true; // activities are optional — some people haven't tried any
      case 3: return tools.length > 0;
      case 4: return true; // text is optional
      default: return false;
    }
  };

  const toggleDomain = (id: string) => {
    setDomains(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const toggleActivity = (id: string) => {
    setActivities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const toggleTool = (id: string) => {
    if (id === 'none') {
      setTools(prev => prev.includes('none') ? [] : ['none']);
      return;
    }
    setTools(prev => {
      const without = prev.filter(t => t !== 'none');
      return without.includes(id) ? without.filter(t => t !== id) : [...without, id];
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (supabase) {
        await supabase.from('course_survey_responses').insert({
          name: name.trim(),
          domains,
          activities,
          ai_tools: tools,
          ai_tools_other: toolsOther.trim() || null,
          top_of_mind: topOfMind.trim() || null,
        });
      }
      setSubmitted(true);
    } catch {
      // Still show success — don't block the user
      setSubmitted(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canProceed()) {
      // Don't hijack Enter in textareas — let users type newlines
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
      e.preventDefault();
      if (step < TOTAL_STEPS - 1) next();
      else handleSubmit();
    }
  };

  // ── Thank you screen ──
  if (submitted) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <div style={{ ...styles.thankYou, animation: 'surveyFadeUp 0.6s ease both' }}>
            <div style={styles.checkCircle}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M10 18L16 24L26 12" stroke="#16C79A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: 'checkDraw 0.5s ease 0.3s forwards' }} />
              </svg>
            </div>
            <h2 style={styles.thankTitle}>Thanks, {name.split(' ')[0]}!</h2>
            <p style={styles.thankText}>
              Your answers will help shape the sessions around what actually matters to this group.
              Looking forward to meeting you on Zoom.
            </p>
            <p style={styles.thankSignoff}>— Shalin</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper} onKeyDown={handleKeyDown}>
      {/* Progress dots */}
      <div style={styles.progressRow}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <button
            key={i}
            onClick={() => { if (i < step) goTo(i); }}
            style={{
              ...styles.dot,
              ...(i === step ? styles.dotActive : {}),
              ...(i < step ? styles.dotDone : {}),
              cursor: i < step ? 'pointer' : 'default',
            }}
            aria-label={`Step ${i + 1}`}
          />
        ))}
      </div>

      <div style={styles.container}>
        <div
          key={step}
          style={{
            ...styles.stepWrap,
            animation: animating
              ? `surveyFadeOut 0.3s ease forwards`
              : `surveyFadeUp 0.5s ease both`,
          }}
        >
          {/* ── Step 0: Name ── */}
          {step === 0 && (
            <div style={styles.step}>
              <p style={styles.eyebrow}>Before we meet</p>
              <h2 style={styles.question}>What should we call you?</h2>
              <p style={styles.hint}>First name is perfect.</p>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                style={styles.textInput}
                autoComplete="given-name"
              />
            </div>
          )}

          {/* ── Step 1: Domains ── */}
          {step === 1 && (
            <div style={styles.step}>
              <p style={styles.eyebrow}>Your world</p>
              <h2 style={styles.question}>Where do you want to use AI?</h2>
              <p style={styles.hint}>Pick all the areas that matter to you.</p>
              <div style={styles.cardGrid}>
                {DOMAINS.map((d, i) => {
                  const selected = domains.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      onClick={() => toggleDomain(d.id)}
                      style={{
                        ...styles.goalCard,
                        ...(selected ? styles.goalCardSelected : {}),
                        animationDelay: `${i * 0.05}s`,
                      }}
                    >
                      <span style={styles.goalIcon}>{d.icon}</span>
                      <span style={styles.goalLabel}>{d.label}</span>
                      {selected && (
                        <span style={styles.checkBadge}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 2: Activities ── */}
          {step === 2 && (
            <div style={styles.step}>
              <p style={styles.eyebrow}>Your experience</p>
              <h2 style={styles.question}>What have you already tried doing with AI?</h2>
              <p style={styles.hint}>No wrong answers — this helps us know where to start.</p>
              <div style={styles.activityList}>
                {ACTIVITIES.map((a, i) => {
                  const selected = activities.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleActivity(a.id)}
                      style={{
                        ...styles.activityCard,
                        ...(selected ? {
                          borderColor: a.color,
                          background: `linear-gradient(135deg, ${a.color}08, ${a.color}03)`,
                          boxShadow: `0 0 0 1px ${a.color}25, 0 2px 12px ${a.color}0a`,
                        } : {}),
                        animationDelay: `${i * 0.04}s`,
                      }}
                    >
                      <div style={{
                        ...styles.activityCheck,
                        background: selected ? a.color : 'transparent',
                        borderColor: selected ? a.color : 'rgba(26,26,46,0.18)',
                      }}>
                        {selected && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span style={styles.activityLabel}>{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 3: Tools ── */}
          {step === 3 && (
            <div style={styles.step}>
              <p style={styles.eyebrow}>Your toolkit</p>
              <h2 style={styles.question}>Which AI tools have you tried?</h2>
              <p style={styles.hint}>Select all that apply.</p>
              <div style={styles.pillGrid}>
                {AI_TOOLS.map((t, i) => {
                  const selected = tools.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTool(t.id)}
                      style={{
                        ...styles.pill,
                        ...(selected ? styles.pillSelected : {}),
                        animationDelay: `${i * 0.04}s`,
                      }}
                    >
                      {selected && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: 6, flexShrink: 0 }}>
                          <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {t.label}
                    </button>
                  );
                })}
              </div>
              {!tools.includes('none') && (
                <div style={{ marginTop: '1.25rem', animation: 'surveyFadeUp 0.3s ease both' }}>
                  <input
                    type="text"
                    value={toolsOther}
                    onChange={e => setToolsOther(e.target.value)}
                    placeholder="Others? Type here..."
                    style={{ ...styles.textInput, fontSize: '0.95rem' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Top of mind ── */}
          {step === 4 && (
            <div style={styles.step}>
              <p style={styles.eyebrow}>One last thing</p>
              <h2 style={styles.question}>What problems are on your mind right now?</h2>
              <p style={styles.hint}>AI-related or not. Even a few words help.</p>
              <textarea
                ref={textareaRef}
                value={topOfMind}
                onChange={e => setTopOfMind(e.target.value)}
                placeholder="What's been keeping you up at night..."
                style={styles.textarea}
                rows={4}
              />
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <div style={styles.navRow}>
          {step > 0 ? (
            <button onClick={back} style={styles.backBtn}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: 6 }}>
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
          ) : <div />}

          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={next}
              disabled={!canProceed()}
              style={{
                ...styles.nextBtn,
                ...(canProceed() ? {} : styles.nextBtnDisabled),
              }}
            >
              Continue
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 6 }}>
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                ...styles.nextBtn,
                background: submitting ? '#6B7280' : 'linear-gradient(135deg, #16C79A, #0EA5E9)',
              }}
            >
              {submitting ? 'Sending...' : 'Send it!'}
              {!submitting && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 6 }}>
                  <path d="M2 8L13 8M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Keyboard hint */}
        <div style={styles.keyHint}>
          {canProceed() && (
            <span style={{ animation: 'surveyFadeUp 0.3s ease both' }}>
              press <kbd style={styles.kbd}>Enter ↵</kbd>
            </span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes surveyFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes surveyFadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-12px); }
        }
        @keyframes checkDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes cardAppear {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Styles ── */
const styles: Record<string, CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '3rem 1.5rem 2rem',
    position: 'relative',
  },

  progressRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '3rem',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: '2px solid rgba(26,26,46,0.15)',
    background: 'transparent',
    padding: 0,
    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  dotActive: {
    width: 32,
    borderRadius: 6,
    border: '2px solid #7B61FF',
    background: '#7B61FF',
  },
  dotDone: {
    border: '2px solid #16C79A',
    background: '#16C79A',
  },

  container: {
    width: '100%',
    maxWidth: 580,
  },
  stepWrap: {
    minHeight: 360,
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
  },

  eyebrow: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#7B61FF',
    marginBottom: '0.75rem',
  },
  question: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    color: '#1A1A2E',
    marginBottom: '0.5rem',
  },
  hint: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '1rem',
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: '2rem',
    lineHeight: 1.5,
  },

  textInput: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '1.2rem',
    padding: '1rem 0',
    border: 'none',
    borderBottom: '2px solid rgba(26,26,46,0.12)',
    background: 'transparent',
    color: '#1A1A2E',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.3s ease',
  },
  textarea: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '1.05rem',
    padding: '1.25rem 1.5rem',
    border: '1px solid rgba(26,26,46,0.1)',
    borderRadius: 16,
    background: 'white',
    color: '#1A1A2E',
    outline: 'none',
    width: '100%',
    resize: 'vertical' as const,
    lineHeight: 1.7,
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
  },

  // Goal cards
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '0.75rem',
  },
  goalCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    borderRadius: 14,
    border: '1.5px solid rgba(26,26,46,0.08)',
    background: 'white',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
    position: 'relative' as const,
    overflow: 'hidden',
    animation: 'cardAppear 0.4s ease both',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  goalCardSelected: {
    borderColor: '#7B61FF',
    background: 'linear-gradient(135deg, rgba(123,97,255,0.06), rgba(123,97,255,0.02))',
    boxShadow: '0 0 0 1px rgba(123,97,255,0.2), 0 4px 16px rgba(123,97,255,0.08)',
  },
  goalIcon: {
    fontSize: '1.3rem',
    flexShrink: 0,
  },
  goalLabel: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.95rem',
    color: '#1A1A2E',
    lineHeight: 1.4,
  },
  checkBadge: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: '#7B61FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Activity cards
  activityList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  activityCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.85rem 1.25rem',
    borderRadius: 12,
    border: '1.5px solid rgba(26,26,46,0.08)',
    background: 'white',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
    animation: 'cardAppear 0.35s ease both',
    boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
  },
  activityCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    border: '2px solid rgba(26,26,46,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  activityLabel: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.95rem',
    color: '#1A1A2E',
    lineHeight: 1.3,
  },

  // Tool pills
  pillGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.6rem',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.6rem 1.2rem',
    borderRadius: 100,
    border: '1.5px solid rgba(26,26,46,0.1)',
    background: 'white',
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.95rem',
    color: '#1A1A2E',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
    animation: 'cardAppear 0.35s ease both',
    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
  },
  pillSelected: {
    borderColor: '#7B61FF',
    background: '#7B61FF',
    color: 'white',
    boxShadow: '0 2px 12px rgba(123,97,255,0.25)',
  },

  // Navigation
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '2.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(26,26,46,0.06)',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.6rem 1rem',
    borderRadius: 100,
    border: '1.5px solid rgba(26,26,46,0.12)',
    background: 'transparent',
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.9rem',
    color: '#6B7280',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  nextBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.75rem 1.75rem',
    borderRadius: 100,
    border: 'none',
    background: '#1A1A2E',
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
    boxShadow: '0 4px 16px rgba(26,26,46,0.15)',
  },
  nextBtnDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },

  keyHint: {
    textAlign: 'center' as const,
    marginTop: '1.25rem',
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.72rem',
    color: '#6B7280',
    letterSpacing: '0.04em',
    minHeight: 20,
  },
  kbd: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 5,
    border: '1px solid rgba(26,26,46,0.15)',
    background: 'white',
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.72rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
    marginLeft: 4,
  },

  // Thank you
  thankYou: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    paddingTop: '4rem',
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'rgba(22,199,154,0.08)',
    border: '2px solid rgba(22,199,154,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  thankTitle: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
    fontWeight: 800,
    color: '#1A1A2E',
    marginBottom: '1rem',
    letterSpacing: '-0.03em',
  },
  thankText: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '1.05rem',
    color: '#6B7280',
    lineHeight: 1.7,
    maxWidth: '40ch',
  },
  thankSignoff: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: '1.1rem',
    fontStyle: 'italic',
    color: '#1A1A2E',
    marginTop: '1.5rem',
  },
};
