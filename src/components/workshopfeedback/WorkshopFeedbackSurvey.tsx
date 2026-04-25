import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { supabase } from '../../lib/supabase';

/* ── Survey data ── */
const TOPICS = [
  {
    id: 'principles',
    label: 'The 15 prompting principles',
    sub: 'Rate, comms, loop, frame, examples, iteration, crosscheck…',
    color: '#E94560',
  },
  {
    id: 'agents-coding',
    label: 'Agents & coding with AI',
    sub: 'Tool use, agent design, vibe coding, personal software',
    color: '#7B61FF',
  },
  {
    id: 'skills',
    label: 'Skills & the 3-phase plan',
    sub: 'Building skills, Claude Code skills, the take-home plan',
    color: '#16C79A',
  },
];

const TOTAL_STEPS = 4;

/* ── Component ── */
export default function WorkshopFeedbackSurvey() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [topic, setTopic] = useState<string>('');
  const [whatWorked, setWhatWorked] = useState('');
  const [whatToImprove, setWhatToImprove] = useState('');
  const [whatChanged, setWhatChanged] = useState('');
  const [consentShare, setConsentShare] = useState(false);
  const [consentName, setConsentName] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const workedRef = useRef<HTMLTextAreaElement>(null);
  const changedRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 0) nameRef.current?.focus();
      if (step === 2) workedRef.current?.focus();
      if (step === 3) changedRef.current?.focus();
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
      case 0: return name.trim().length > 0 && score !== null;
      case 1: return topic.length > 0;
      case 2: return true; // open-ended, optional
      case 3: return true; // open-ended + consents are optional
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (supabase) {
        await supabase.from('workshop_feedback_responses').insert({
          name: name.trim(),
          recommend_score: score,
          topic_loved: topic || null,
          what_worked: whatWorked.trim() || null,
          what_to_improve: whatToImprove.trim() || null,
          what_changed: whatChanged.trim() || null,
          consent_share_answers: consentShare,
          consent_use_name: consentName,
        });
      }
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canProceed()) {
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
            <h2 style={styles.thankTitle}>Thank you, {name.split(' ')[0]}.</h2>
            <p style={styles.thankText}>
              This is exactly what I need to make the next workshop sharper.
              I really appreciate you taking the time.
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
          {/* ── Step 0: Name + Score ── */}
          {step === 0 && (
            <div style={styles.step}>
              <p style={styles.eyebrow}>Quick feedback</p>
              <h2 style={styles.question}>How was the workshop, really?</h2>
              <p style={styles.hint}>Two quick things to start.</p>

              <label style={styles.fieldLabel}>Your name</label>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="First name is fine"
                style={styles.textInput}
                autoComplete="given-name"
              />

              <div style={{ marginTop: '2.25rem' }}>
                <label style={styles.fieldLabel}>
                  How likely are you to recommend it to a friend or colleague?
                </label>
                <p style={styles.scaleHint}>1 = not at all · 10 = absolutely</p>
                <div style={styles.scaleRow}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
                    const selected = score === n;
                    return (
                      <button
                        key={n}
                        onClick={() => setScore(n)}
                        style={{
                          ...styles.scaleBtn,
                          ...(selected ? styles.scaleBtnSelected : {}),
                        }}
                        aria-label={`Rate ${n}`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Topic ── */}
          {step === 1 && (
            <div style={styles.step}>
              <p style={styles.eyebrow}>What landed</p>
              <h2 style={styles.question}>Which topic clicked the most for you?</h2>
              <p style={styles.hint}>Pick the one you keep thinking about.</p>
              <div style={styles.topicList}>
                {TOPICS.map((t, i) => {
                  const selected = topic === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTopic(t.id)}
                      style={{
                        ...styles.topicCard,
                        ...(selected ? {
                          borderColor: t.color,
                          background: `linear-gradient(135deg, ${t.color}0c, ${t.color}03)`,
                          boxShadow: `0 0 0 1px ${t.color}30, 0 4px 18px ${t.color}10`,
                        } : {}),
                        animationDelay: `${i * 0.06}s`,
                      }}
                    >
                      <div style={{
                        ...styles.radioOuter,
                        borderColor: selected ? t.color : 'rgba(26,26,46,0.18)',
                      }}>
                        {selected && <div style={{ ...styles.radioInner, background: t.color }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={styles.topicLabel}>{t.label}</div>
                        <div style={styles.topicSub}>{t.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 2: What worked / what to improve ── */}
          {step === 2 && (
            <div style={styles.step}>
              <p style={styles.eyebrow}>The honest stuff</p>
              <h2 style={styles.question}>What worked, and what didn't?</h2>
              <p style={styles.hint}>A sentence or two each — whatever comes to mind.</p>

              <label style={styles.fieldLabel}>One thing that really worked for you</label>
              <textarea
                ref={workedRef}
                value={whatWorked}
                onChange={e => setWhatWorked(e.target.value)}
                placeholder="A moment, an idea, an exercise…"
                style={styles.textarea}
                rows={3}
              />

              <div style={{ marginTop: '1.5rem' }}>
                <label style={styles.fieldLabel}>One thing I should improve</label>
                <textarea
                  value={whatToImprove}
                  onChange={e => setWhatToImprove(e.target.value)}
                  placeholder="Something that fell flat, was confusing, or you wanted more of…"
                  style={styles.textarea}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* ── Step 3: What's changed + consents ── */}
          {step === 3 && (
            <div style={styles.step}>
              <p style={styles.eyebrow}>Looking back</p>
              <h2 style={styles.question}>Has anything actually changed in how you use AI?</h2>
              <p style={styles.hint}>The most useful thing you can tell me. Even a small shift counts.</p>

              <textarea
                ref={changedRef}
                value={whatChanged}
                onChange={e => setWhatChanged(e.target.value)}
                placeholder="A new habit, a tool you started using, a question you ask yourself now…"
                style={styles.textarea}
                rows={4}
              />

              <div style={styles.consentBlock}>
                <p style={styles.consentTitle}>One last thing</p>
                <p style={styles.consentSub}>
                  Sometimes people give such kind feedback that I'd love to share it.
                  These are independent — say yes to one, both, or neither.
                </p>

                <button
                  type="button"
                  onClick={() => setConsentShare(!consentShare)}
                  style={{
                    ...styles.consentRow,
                    ...(consentShare ? styles.consentRowOn : {}),
                  }}
                >
                  <div style={{
                    ...styles.checkBox,
                    background: consentShare ? '#16C79A' : 'transparent',
                    borderColor: consentShare ? '#16C79A' : 'rgba(26,26,46,0.2)',
                  }}>
                    {consentShare && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={styles.consentLabel}>
                    Shalin can quote my answers publicly (website, social, etc.)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setConsentName(!consentName)}
                  style={{
                    ...styles.consentRow,
                    ...(consentName ? styles.consentRowOn : {}),
                  }}
                >
                  <div style={{
                    ...styles.checkBox,
                    background: consentName ? '#16C79A' : 'transparent',
                    borderColor: consentName ? '#16C79A' : 'rgba(26,26,46,0.2)',
                  }}>
                    {consentName && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={styles.consentLabel}>
                    …and use my name with the quote
                  </span>
                </button>
              </div>
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
              {submitting ? 'Sending…' : 'Send feedback'}
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

  fieldLabel: {
    display: 'block',
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#6B7280',
    marginBottom: '0.6rem',
  },
  scaleHint: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.85rem',
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: '0.85rem',
  },

  textInput: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '1.2rem',
    padding: '0.85rem 0',
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
    fontSize: '1rem',
    padding: '1rem 1.25rem',
    border: '1px solid rgba(26,26,46,0.1)',
    borderRadius: 14,
    background: 'white',
    color: '#1A1A2E',
    outline: 'none',
    width: '100%',
    resize: 'vertical' as const,
    lineHeight: 1.6,
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
    boxSizing: 'border-box',
  },

  // 1–10 scale
  scaleRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: '6px',
  },
  scaleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: '1 / 1',
    minHeight: 40,
    borderRadius: 10,
    border: '1.5px solid rgba(26,26,46,0.1)',
    background: 'white',
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#1A1A2E',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    padding: 0,
  },
  scaleBtnSelected: {
    borderColor: '#7B61FF',
    background: '#7B61FF',
    color: 'white',
    boxShadow: '0 2px 12px rgba(123,97,255,0.3)',
    transform: 'scale(1.05)',
  },

  // Topic cards
  topicList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  topicCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1.15rem 1.35rem',
    borderRadius: 16,
    border: '1.5px solid rgba(26,26,46,0.08)',
    background: 'white',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
    animation: 'cardAppear 0.4s ease both',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: '2px solid rgba(26,26,46,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
    transition: 'border-color 0.2s ease',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  topicLabel: {
    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#1A1A2E',
    marginBottom: '0.2rem',
    lineHeight: 1.3,
  },
  topicSub: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.85rem',
    color: '#6B7280',
    lineHeight: 1.45,
  },

  // Consent block
  consentBlock: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(26,26,46,0.08)',
  },
  consentTitle: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#7B61FF',
    marginBottom: '0.5rem',
  },
  consentSub: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.92rem',
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: '1rem',
    lineHeight: 1.55,
  },
  consentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    width: '100%',
    padding: '0.85rem 1.1rem',
    borderRadius: 12,
    border: '1.5px solid rgba(26,26,46,0.08)',
    background: 'white',
    cursor: 'pointer',
    textAlign: 'left' as const,
    marginBottom: '0.6rem',
    transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
  },
  consentRowOn: {
    borderColor: '#16C79A',
    background: 'linear-gradient(135deg, rgba(22,199,154,0.05), rgba(22,199,154,0.01))',
    boxShadow: '0 0 0 1px rgba(22,199,154,0.18), 0 2px 10px rgba(22,199,154,0.06)',
  },
  checkBox: {
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
  consentLabel: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.95rem',
    color: '#1A1A2E',
    lineHeight: 1.4,
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
