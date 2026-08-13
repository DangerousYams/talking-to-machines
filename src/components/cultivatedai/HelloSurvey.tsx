import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { supabase } from '../../lib/supabase';

/* ── Survey data ── */
const WORLDS = [
  { id: 'kitchen', label: 'Kitchen & production', icon: '🥐' },
  { id: 'ops', label: 'Operations & supply', icon: '📦' },
  { id: 'quickcom', label: 'Quick-commerce & listings', icon: '🛵' },
  { id: 'marketing', label: 'Marketing & content', icon: '📣' },
  { id: 'sales', label: 'Sales & growth', icon: '📈' },
  { id: 'finance', label: 'Finance & accounts', icon: '🧾' },
  { id: 'people', label: 'People & admin', icon: '🤝' },
  { id: 'design', label: 'Design & creative', icon: '🎨' },
  { id: 'tech', label: 'Tech & data', icon: '💻' },
  { id: 'leadership', label: 'Founding & leadership', icon: '🧭' },
];

const FREQUENCIES = [
  { id: 'daily', label: 'Pretty much every day' },
  { id: 'weekly', label: 'A few times a week' },
  { id: 'sometimes', label: 'Once in a while' },
  { id: 'tried', label: 'Tried it once or twice' },
  { id: 'never', label: "Never, and that's fine" },
];

const AI_TOOLS = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'claude', label: 'Claude' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'perplexity', label: 'Perplexity' },
  { id: 'copilot', label: 'Copilot / Cursor' },
  { id: 'midjourney', label: 'Midjourney / DALL-E' },
  { id: 'canva', label: 'Canva AI' },
  { id: 'notebooklm', label: 'NotebookLM' },
  { id: 'none', label: 'None yet' },
];

const LAPTOP_CHECKS = [
  { id: 'google', label: 'A Google account I can sign in with', color: '#16C79A' },
  { id: 'chrome', label: 'Chrome installed', color: '#0EA5E9' },
  { id: 'claude-login', label: 'A Claude login', color: '#7B61FF' },
  { id: 'chatgpt-login', label: 'A ChatGPT login', color: '#7B61FF' },
  { id: 'unsure', label: "Not sure, I'll check", color: '#F5A623' },
  { id: 'none', label: 'None of these yet', color: '#E94560' },
];

const HANDOVER_CHORES = [
  { id: 'reports', label: 'The weekly sales report', color: '#16C79A' },
  { id: 'customer', label: 'Answering the same customer questions', color: '#0EA5E9' },
  { id: 'listings', label: 'Updating product listings', color: '#7B61FF' },
  { id: 'captions', label: 'Writing captions & posts', color: '#E94560' },
  { id: 'sheets', label: 'Keeping spreadsheets updated', color: '#F5A623' },
  { id: 'invoices', label: 'Invoices & paperwork', color: '#16C79A' },
  { id: 'rosters', label: 'Rosters & reminders', color: '#0EA5E9' },
  { id: 'competitors', label: 'Checking competitor prices', color: '#7B61FF' },
  { id: 'minutes', label: 'Meeting notes & follow-ups', color: '#E94560' },
  { id: 'vendors', label: 'Chasing vendors & orders', color: '#F5A623' },
];

const WORRIES = [
  { id: 'madeup', label: 'It makes things up', color: '#E94560' },
  { id: 'job', label: 'What it means for my job', color: '#E94560' },
  { id: 'privacy', label: 'Where our data goes', color: '#E94560' },
  { id: 'voice', label: 'Everything it writes sounds the same', color: '#E94560' },
  { id: 'fast', label: 'It moves too fast to keep up', color: '#E94560' },
  { id: 'cheating', label: 'Using it feels like cheating', color: '#E94560' },
  { id: 'notclick', label: "I tried it and it didn't click", color: '#E94560' },
  { id: 'excited', label: 'Nothing much. Honestly, excited', color: '#E94560' },
];

const TOTAL_STEPS = 8;
const DEFAULT_COHORT = 'bakers-dozen';

/* Shared by both branches. The thank you screen needs checkDraw, so the
   keyframes cannot live only inside the step markup. */
const KEYFRAMES = `
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
`;

/* ── Component ── */
export default function HelloSurvey() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [world, setWorld] = useState<string[]>([]);
  const [frequency, setFrequency] = useState('');
  const [tools, setTools] = useState<string[]>([]);
  const [toolsOther, setToolsOther] = useState('');
  const [laptop, setLaptop] = useState<string[]>([]);
  const [handover, setHandover] = useState<string[]>([]);
  const [handoverOther, setHandoverOther] = useState('');
  const [worries, setWorries] = useState<string[]>([]);
  const [lastWord, setLastWord] = useState('');
  const [cohort, setCohort] = useState(DEFAULT_COHORT);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cohort comes from ?c= on the invite link
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const c = new URLSearchParams(window.location.search).get('c');
    if (c && c.trim()) setCohort(c.trim());
  }, []);

  // Focus inputs when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 0) nameRef.current?.focus();
      if (step === 7) textareaRef.current?.focus();
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
      case 1: return world.length > 0;
      case 2: return frequency.length > 0;
      case 3: return tools.length > 0;
      case 4: return laptop.length > 0;
      case 5: return handover.length > 0 || handoverOther.trim().length > 0;
      case 6: return worries.length > 0;
      case 7: return true; // last word is optional
      default: return false;
    }
  };

  const toggleWorld = (id: string) => {
    setWorld(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
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

  const toggleLaptop = (id: string) => {
    // 'none' clears everything else. 'unsure' sits happily alongside the rest.
    if (id === 'none') {
      setLaptop(prev => prev.includes('none') ? [] : ['none']);
      return;
    }
    setLaptop(prev => {
      const without = prev.filter(l => l !== 'none');
      return without.includes(id) ? without.filter(l => l !== id) : [...without, id];
    });
  };

  const toggleHandover = (id: string) => {
    setHandover(prev => prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]);
  };

  const toggleWorry = (id: string) => {
    setWorries(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSendFailed(false);
    try {
      if (!supabase) {
        setSendFailed(true);
        setSubmitting(false);
        return;
      }
      const { error } = await supabase.from('cultivated_survey_responses').insert({
        cohort,
        name: name.trim(),
        world,
        frequency,
        ai_tools: tools,
        ai_tools_other: toolsOther.trim() || null,
        laptop,
        handover,
        handover_other: handoverOther.trim() || null,
        worries,
        last_word: lastWord.trim() || null,
      });
      if (error) {
        setSendFailed(true);
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setSendFailed(true);
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canProceed()) {
      // Don't hijack Enter in textareas, let users type newlines
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
              That's exactly what we needed. The sessions get built around what this room
              actually does all week. See you soon, in person.
            </p>
            <p style={styles.thankSignoff}>Shalin</p>
          </div>
        </div>
        <style>{KEYFRAMES}</style>
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
              <p style={styles.eyebrow}>Nice to meet you</p>
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

          {/* ── Step 1: World ── */}
          {step === 1 && (
            <div style={styles.step}>
              <p style={styles.eyebrow}>Your world</p>
              <h2 style={styles.question}>Where does your week go?</h2>
              <p style={styles.hint}>Pick everything that's part of your job.</p>
              <div style={styles.cardGrid}>
                {WORLDS.map((w, i) => {
                  const selected = world.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      onClick={() => toggleWorld(w.id)}
                      style={{
                        ...styles.goalCard,
                        ...(selected ? styles.goalCardSelected : {}),
                        animationDelay: `${i * 0.05}s`,
                      }}
                    >
                      <span style={styles.goalIcon}>{w.icon}</span>
                      <span style={styles.goalLabel}>{w.label}</span>
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

          {/* ── Step 2: Frequency (single select) ── */}
          {step === 2 && (
            <div style={styles.step}>
              <p style={styles.eyebrow}>AI so far</p>
              <h2 style={styles.question}>How often do you use AI right now?</h2>
              <p style={styles.hint}>No wrong answer. The room will have the full range.</p>
              <div style={styles.activityList}>
                {FREQUENCIES.map((f, i) => {
                  const selected = frequency === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFrequency(f.id)}
                      style={{
                        ...styles.activityCard,
                        ...(selected ? {
                          borderColor: '#E94560',
                          background: 'linear-gradient(135deg, rgba(233,69,96,0.06), rgba(233,69,96,0.02))',
                          boxShadow: '0 0 0 1px rgba(233,69,96,0.2), 0 2px 12px rgba(233,69,96,0.06)',
                        } : {}),
                        animationDelay: `${i * 0.04}s`,
                      }}
                    >
                      <div style={{
                        ...styles.radio,
                        borderColor: selected ? '#E94560' : 'rgba(26,26,46,0.18)',
                      }}>
                        {selected && <div style={styles.radioDot} />}
                      </div>
                      <span style={styles.activityLabel}>{f.label}</span>
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
              <h2 style={styles.question}>Which of these have you tried?</h2>
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

          {/* ── Step 4: Laptop check ── */}
          {step === 4 && (
            <div style={styles.step}>
              <p style={styles.eyebrow}>The laptop you'll bring</p>
              <h2 style={styles.question}>Which of these are ready on it?</h2>
              <p style={styles.hint}>Be honest. We'll help you set up whatever's missing.</p>
              <div style={styles.activityList}>
                {LAPTOP_CHECKS.map((l, i) => {
                  const selected = laptop.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => toggleLaptop(l.id)}
                      style={{
                        ...styles.activityCard,
                        ...(selected ? {
                          borderColor: l.color,
                          background: `linear-gradient(135deg, ${l.color}08, ${l.color}03)`,
                          boxShadow: `0 0 0 1px ${l.color}25, 0 2px 12px ${l.color}0a`,
                        } : {}),
                        animationDelay: `${i * 0.04}s`,
                      }}
                    >
                      <div style={{
                        ...styles.activityCheck,
                        background: selected ? l.color : 'transparent',
                        borderColor: selected ? l.color : 'rgba(26,26,46,0.18)',
                      }}>
                        {selected && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span style={styles.activityLabel}>{l.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 5: Chores to hand over ── */}
          {step === 5 && (
            <div style={styles.step}>
              <p style={styles.eyebrow}>The good stuff</p>
              <h2 style={styles.question}>Which chores would you happily hand over forever?</h2>
              <p style={styles.hint}>These become the live demos, so pick the ones you actually do.</p>
              <div style={styles.activityList}>
                {HANDOVER_CHORES.map((h, i) => {
                  const selected = handover.includes(h.id);
                  return (
                    <button
                      key={h.id}
                      onClick={() => toggleHandover(h.id)}
                      style={{
                        ...styles.activityCard,
                        ...(selected ? {
                          borderColor: h.color,
                          background: `linear-gradient(135deg, ${h.color}08, ${h.color}03)`,
                          boxShadow: `0 0 0 1px ${h.color}25, 0 2px 12px ${h.color}0a`,
                        } : {}),
                        animationDelay: `${i * 0.04}s`,
                      }}
                    >
                      <div style={{
                        ...styles.activityCheck,
                        background: selected ? h.color : 'transparent',
                        borderColor: selected ? h.color : 'rgba(26,26,46,0.18)',
                      }}>
                        {selected && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span style={styles.activityLabel}>{h.label}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <input
                  type="text"
                  value={handoverOther}
                  onChange={e => setHandoverOther(e.target.value)}
                  placeholder="Something else? Name it..."
                  style={{ ...styles.textInput, fontSize: '0.95rem' }}
                />
              </div>
            </div>
          )}

          {/* ── Step 6: Worries ── */}
          {step === 6 && (
            <div style={styles.step}>
              <p style={styles.eyebrow}>Honestly now</p>
              <h2 style={styles.question}>What worries you about AI?</h2>
              <p style={styles.hint}>We'd rather talk about it in the room than around it.</p>
              <div style={styles.activityList}>
                {WORRIES.map((w, i) => {
                  const selected = worries.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      onClick={() => toggleWorry(w.id)}
                      style={{
                        ...styles.activityCard,
                        ...(selected ? {
                          borderColor: w.color,
                          background: `linear-gradient(135deg, ${w.color}08, ${w.color}03)`,
                          boxShadow: `0 0 0 1px ${w.color}25, 0 2px 12px ${w.color}0a`,
                        } : {}),
                        animationDelay: `${i * 0.04}s`,
                      }}
                    >
                      <div style={{
                        ...styles.activityCheck,
                        background: selected ? w.color : 'transparent',
                        borderColor: selected ? w.color : 'rgba(26,26,46,0.18)',
                      }}>
                        {selected && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span style={styles.activityLabel}>{w.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 7: Last word ── */}
          {step === 7 && (
            <div style={styles.step}>
              <p style={styles.eyebrow}>One last thing</p>
              <h2 style={styles.question}>Anything you want these four hours to cover?</h2>
              <p style={styles.hint}>A few words is plenty. Skipping is fine too.</p>
              <textarea
                ref={textareaRef}
                value={lastWord}
                onChange={e => setLastWord(e.target.value)}
                placeholder="Name it and we'll work it in..."
                style={styles.textarea}
                rows={4}
              />
            </div>
          )}
        </div>

        {/* ── Send failure notice ── */}
        {sendFailed && (
          <p style={{ ...styles.errorNote, animation: 'surveyFadeUp 0.3s ease both' }}>
            That didn't send. Try once more, or just tell Shalin your answers in person.
          </p>
        )}

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
                background: submitting ? '#6B7280' : 'linear-gradient(135deg, #F5A623, #E94560)',
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

      <style>{KEYFRAMES}</style>
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
    border: '2px solid #E94560',
    background: '#E94560',
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
    color: '#E94560',
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

  // Icon cards
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
    borderColor: '#E94560',
    background: 'linear-gradient(135deg, rgba(233,69,96,0.06), rgba(233,69,96,0.02))',
    boxShadow: '0 0 0 1px rgba(233,69,96,0.2), 0 4px 16px rgba(233,69,96,0.08)',
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
    background: '#E94560',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Checklist / choice rows
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

  // Single-select radio
  radio: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: '2px solid rgba(26,26,46,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#E94560',
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
    borderColor: '#E94560',
    background: '#E94560',
    color: 'white',
    boxShadow: '0 2px 12px rgba(233,69,96,0.25)',
  },

  // Send failure notice
  errorNote: {
    fontFamily: "var(--font-body, 'Lora', Georgia, serif)",
    fontSize: '0.9rem',
    color: '#E94560',
    lineHeight: 1.6,
    marginTop: '1.5rem',
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
