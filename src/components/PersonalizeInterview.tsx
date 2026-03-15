import { useState, useCallback, useRef, useEffect } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useAuth } from '../hooks/useAuth';
import { usePersona } from '../hooks/usePersona';
import { streamChat, type ChatMessage } from '../lib/claude';
import type { Persona, PersonaSelections } from '../lib/persona';
import UnlockModal from './ui/UnlockModal';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type Phase = 'intro' | 'profession' | 'experience' | 'goals' | 'challenge' | 'generating' | 'complete';

const PROFESSIONS = [
  'Student', 'Teacher', 'Executive', 'Developer', 'Designer',
  'Marketer', 'Researcher', 'Writer', 'Entrepreneur', 'Creative', 'Other',
];

const EXPERIENCE_LEVELS: { id: PersonaSelections['aiExperience']; label: string; desc: string }[] = [
  { id: 'beginner', label: 'Just starting', desc: "I've heard of ChatGPT but haven't used AI tools much" },
  { id: 'intermediate', label: 'Tried a few things', desc: "I've used AI chatbots and maybe an image generator" },
  { id: 'regular', label: 'Use it regularly', desc: 'AI tools are part of my daily workflow' },
];

const GOALS = [
  'Work smarter', 'Build something', 'Learn the landscape',
  'Stay ahead', 'Teach others', 'Just curious',
];

const SYSTEM_PROMPT = `You are a course personalization engine. Given the student's profile, generate a concise context paragraph and domain keywords.

Respond with ONLY valid JSON, no markdown formatting:
{
  "context": "2-3 sentence paragraph in third person. Include profession, AI experience, goals. Under 80 words.",
  "keywords": ["5-8 domain-specific terms for their field"]
}`;

const STEP_PHASES: Phase[] = ['profession', 'experience', 'goals', 'challenge'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PersonalizeInterview() {
  const isMobile = useIsMobile();
  const { isPaid } = useAuth();
  const { persona: existingPersona, save, clear } = usePersona();

  const [phase, setPhase] = useState<Phase>(existingPersona ? 'complete' : 'intro');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);

  // Selections
  const [profession, setProfession] = useState(existingPersona?.selections.profession || '');
  const [professionDetail, setProfessionDetail] = useState(existingPersona?.selections.professionDetail || '');
  const [aiExperience, setAiExperience] = useState<PersonaSelections['aiExperience'] | null>(
    existingPersona?.selections.aiExperience || null
  );
  const [goals, setGoals] = useState<string[]>(existingPersona?.selections.goals || []);
  const [challenge, setChallenge] = useState(existingPersona?.selections.challenge || '');

  // Generation
  const [error, setError] = useState('');
  const controllerRef = useRef<AbortController | null>(null);

  // Display persona (either existing or newly generated)
  const [displayPersona, setDisplayPersona] = useState<Persona | null>(existingPersona);

  // Cleanup on unmount
  useEffect(() => {
    return () => { controllerRef.current?.abort(); };
  }, []);

  // Phase transition with animation
  const goTo = useCallback((next: Phase, dir: 'forward' | 'back' = 'forward') => {
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setPhase(next);
      setTimeout(() => setAnimating(false), 20);
    }, 250);
  }, []);

  const currentStepIndex = STEP_PHASES.indexOf(phase);
  const totalSteps = STEP_PHASES.length;

  // Toggle a goal chip
  const toggleGoal = useCallback((g: string) => {
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  }, []);

  // Generate persona via API
  const generatePersona = useCallback(() => {
    goTo('generating');

    const userProfile = `Profession: ${profession}${professionDetail ? ` (${professionDetail})` : ''}
AI Experience: ${aiExperience}
Goals: ${goals.join(', ')}${challenge ? `\nSpecific interest: ${challenge}` : ''}`;

    let accumulated = '';

    controllerRef.current = streamChat({
      messages: [{ role: 'user', content: userProfile }] as ChatMessage[],
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 256,
      source: 'personalize',
      skipPersona: true,
      onChunk: (text) => { accumulated += text; },
      onDone: () => {
        try {
          // Try to parse JSON from accumulated text
          const jsonStr = accumulated.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(jsonStr);

          const newPersona: Persona = {
            version: 1,
            selections: {
              profession,
              professionDetail: professionDetail || undefined,
              aiExperience: aiExperience!,
              goals,
              challenge: challenge || undefined,
            },
            context: parsed.context,
            keywords: parsed.keywords || [],
            createdAt: new Date().toISOString(),
          };

          save(newPersona);
          setDisplayPersona(newPersona);
          // Small delay so user sees the generating animation
          setTimeout(() => goTo('complete'), 600);
        } catch {
          setError('Failed to parse AI response. Please try again.');
          goTo('challenge', 'back');
        }
      },
      onError: (err) => {
        setError(err);
        goTo('challenge', 'back');
      },
    });
  }, [profession, professionDetail, aiExperience, goals, challenge, save, goTo]);

  // Handle update flow
  const handleUpdate = useCallback(() => {
    clear();
    setDisplayPersona(null);
    setPhase('profession');
  }, [clear]);

  // If not paid, show unlock
  if (!isPaid && phase !== 'intro') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <UnlockModal feature="Course Personalization" accentColor="#7B61FF" />
      </div>
    );
  }

  // Slide animation styles
  const slideStyle: React.CSSProperties = {
    transition: 'transform 250ms ease, opacity 250ms ease',
    transform: animating
      ? `translateX(${direction === 'forward' ? '-30px' : '30px'})`
      : 'translateX(0)',
    opacity: animating ? 0 : 1,
  };

  return (
    <div style={{
      maxWidth: 560,
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: isMobile ? '2rem 1.25rem' : '3rem 2rem',
    }}>
      {/* Progress dots */}
      {currentStepIndex >= 0 && phase !== 'generating' && phase !== 'complete' && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 40,
        }}>
          {STEP_PHASES.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentStepIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i < currentStepIndex
                  ? '#7B61FF'
                  : i === currentStepIndex
                    ? '#7B61FF'
                    : 'rgba(26,26,46,0.1)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* ─── INTRO ─── */}
      {phase === 'intro' && (
        <div style={{ ...slideStyle, textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #7B61FF, #E94560)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.6rem' : '2rem',
            fontWeight: 800, color: '#1A1A2E', margin: '0 0 16px', lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}>
            Make this course yours
          </h1>

          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '1rem', lineHeight: 1.7,
            color: '#6B7280', margin: '0 0 20px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto',
          }}>
            Tell us a little about yourself and we'll tailor every example, scenario, and interaction to your world.
          </p>

          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.7,
            color: 'rgba(26,26,46,0.35)', margin: '0 0 32px', maxWidth: 380, marginLeft: 'auto', marginRight: 'auto',
            letterSpacing: '0.02em',
          }}>
            A teacher sees classroom problems. A developer sees code challenges. An executive sees business strategy.
          </p>

          <button
            onClick={() => {
              if (!isPaid) {
                setPhase('profession'); // Will hit the isPaid guard above
              } else {
                goTo('profession');
              }
            }}
            style={{
              padding: '14px 36px', borderRadius: 100, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600,
              letterSpacing: '0.04em', background: '#7B61FF', color: 'white',
              transition: 'all 0.25s', boxShadow: '0 4px 20px rgba(123,97,255,0.3)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(123,97,255,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(123,97,255,0.3)'; }}
          >
            Let's go
          </button>

          <div style={{ marginTop: 20 }}>
            <a
              href="/ch2"
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#6B7280',
                textDecoration: 'none', opacity: 0.7,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
            >
              Skip for now
            </a>
          </div>
        </div>
      )}

      {/* ─── STEP 1: PROFESSION ─── */}
      {phase === 'profession' && (
        <div style={slideStyle}>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : '1.7rem',
            fontWeight: 800, color: '#1A1A2E', margin: '0 0 8px', letterSpacing: '-0.02em',
          }}>
            What's your world?
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#6B7280',
            margin: '0 0 24px', lineHeight: 1.5,
          }}>
            Pick the closest match — we'll use this to pick relevant examples.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {PROFESSIONS.map((p) => (
              <button
                key={p}
                onClick={() => setProfession(p)}
                style={{
                  padding: '8px 16px', borderRadius: 100, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500,
                  border: '1.5px solid',
                  borderColor: profession === p ? '#7B61FF' : 'rgba(26,26,46,0.1)',
                  background: profession === p ? '#7B61FF0F' : 'transparent',
                  color: profession === p ? '#7B61FF' : '#1A1A2E',
                  transition: 'all 0.2s',
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {profession && (
            <div style={{ marginBottom: 24 }}>
              <input
                type="text"
                value={professionDetail}
                onChange={(e) => setProfessionDetail(e.target.value)}
                placeholder={`Tell us more (e.g., "${profession === 'Student' ? 'High school junior, interested in CS' : profession === 'Teacher' ? 'Middle school science' : 'VP of product at a fintech'}")`}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: '0.85rem',
                  fontFamily: 'var(--font-body)', border: '1.5px solid rgba(26,26,46,0.1)',
                  background: '#FEFDFB', outline: 'none', color: '#1A1A2E',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#7B61FF40'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)'; }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => goTo('intro', 'back')}
              style={{
                padding: '12px 20px', borderRadius: 10, border: '1px solid rgba(26,26,46,0.1)',
                background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem', fontWeight: 600, color: '#6B7280',
              }}
            >
              Back
            </button>
            <button
              onClick={() => profession && goTo('experience')}
              disabled={!profession}
              style={{
                flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600,
                background: profession ? '#7B61FF' : 'rgba(26,26,46,0.06)',
                color: profession ? 'white' : '#6B7280',
                transition: 'all 0.2s',
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: EXPERIENCE ─── */}
      {phase === 'experience' && (
        <div style={slideStyle}>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : '1.7rem',
            fontWeight: 800, color: '#1A1A2E', margin: '0 0 8px', letterSpacing: '-0.02em',
          }}>
            How familiar are you with AI?
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#6B7280',
            margin: '0 0 24px', lineHeight: 1.5,
          }}>
            No wrong answer — this helps us calibrate the pace.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => {
                  setAiExperience(level.id);
                  // Auto-advance after 400ms
                  setTimeout(() => goTo('goals'), 400);
                }}
                style={{
                  padding: '16px 20px', borderRadius: 12, cursor: 'pointer',
                  border: '1.5px solid',
                  borderColor: aiExperience === level.id ? '#7B61FF' : 'rgba(26,26,46,0.08)',
                  background: aiExperience === level.id ? '#7B61FF0A' : 'rgba(254,253,251,0.6)',
                  textAlign: 'left', transition: 'all 0.2s',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700,
                  color: aiExperience === level.id ? '#7B61FF' : '#1A1A2E', marginBottom: 4,
                }}>
                  {level.label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                  color: '#6B7280', lineHeight: 1.4,
                }}>
                  {level.desc}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => goTo('profession', 'back')}
            style={{
              padding: '12px 20px', borderRadius: 10, border: '1px solid rgba(26,26,46,0.1)',
              background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem', fontWeight: 600, color: '#6B7280',
            }}
          >
            Back
          </button>
        </div>
      )}

      {/* ─── STEP 3: GOALS ─── */}
      {phase === 'goals' && (
        <div style={slideStyle}>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : '1.7rem',
            fontWeight: 800, color: '#1A1A2E', margin: '0 0 8px', letterSpacing: '-0.02em',
          }}>
            What brought you here?
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#6B7280',
            margin: '0 0 24px', lineHeight: 1.5,
          }}>
            Pick all that apply.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {GOALS.map((g) => (
              <button
                key={g}
                onClick={() => toggleGoal(g)}
                style={{
                  padding: '8px 16px', borderRadius: 100, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500,
                  border: '1.5px solid',
                  borderColor: goals.includes(g) ? '#7B61FF' : 'rgba(26,26,46,0.1)',
                  background: goals.includes(g) ? '#7B61FF0F' : 'transparent',
                  color: goals.includes(g) ? '#7B61FF' : '#1A1A2E',
                  transition: 'all 0.2s',
                }}
              >
                {g}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => goTo('experience', 'back')}
              style={{
                padding: '12px 20px', borderRadius: 10, border: '1px solid rgba(26,26,46,0.1)',
                background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem', fontWeight: 600, color: '#6B7280',
              }}
            >
              Back
            </button>
            <button
              onClick={() => goals.length > 0 && goTo('challenge')}
              disabled={goals.length === 0}
              style={{
                flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600,
                background: goals.length > 0 ? '#7B61FF' : 'rgba(26,26,46,0.06)',
                color: goals.length > 0 ? 'white' : '#6B7280',
                transition: 'all 0.2s',
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 4: CHALLENGE (optional) ─── */}
      {phase === 'challenge' && (
        <div style={slideStyle}>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : '1.7rem',
            fontWeight: 800, color: '#1A1A2E', margin: '0 0 8px', letterSpacing: '-0.02em',
          }}>
            Anything specific?
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#6B7280',
            margin: '0 0 24px', lineHeight: 1.5,
          }}>
            Optional — tell us about a specific challenge or project you want to use AI for.
          </p>

          <textarea
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            placeholder="e.g., I'm building a school app and want to use AI to help with lesson planning..."
            rows={3}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: '0.88rem',
              fontFamily: 'var(--font-body)', border: '1.5px solid rgba(26,26,46,0.1)',
              background: '#FEFDFB', outline: 'none', color: '#1A1A2E', resize: 'none',
              lineHeight: 1.6, marginBottom: 24, transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#7B61FF40'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)'; }}
          />

          {error && (
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#E94560',
              margin: '0 0 16px', padding: '8px 12px', borderRadius: 8,
              background: '#E945600A', border: '1px solid #E945601A',
            }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => goTo('goals', 'back')}
              style={{
                padding: '12px 20px', borderRadius: 10, border: '1px solid rgba(26,26,46,0.1)',
                background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem', fontWeight: 600, color: '#6B7280',
              }}
            >
              Back
            </button>
            {!challenge.trim() && (
              <button
                onClick={generatePersona}
                style={{
                  flex: 1, padding: '12px 20px', borderRadius: 10, cursor: 'pointer',
                  border: '1px solid rgba(26,26,46,0.1)', background: 'transparent',
                  fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600,
                  color: '#6B7280', transition: 'all 0.2s',
                }}
              >
                Skip
              </button>
            )}
            <button
              onClick={generatePersona}
              style={{
                flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600,
                background: '#7B61FF', color: 'white', transition: 'all 0.2s',
              }}
            >
              {challenge.trim() ? "Let's go" : "Let's go"}
            </button>
          </div>
        </div>
      )}

      {/* ─── GENERATING ─── */}
      {phase === 'generating' && (
        <div style={{ ...slideStyle, textAlign: 'center', padding: '3rem 0' }}>
          {/* Animated loader */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              width: 48, height: 48, margin: '0 auto', borderRadius: '50%',
              border: '3px solid rgba(123,97,255,0.15)',
              borderTopColor: '#7B61FF',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700,
            color: '#1A1A2E', margin: '0 0 8px',
          }}>
            Personalizing your experience...
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: '#6B7280',
            margin: 0, lineHeight: 1.5,
          }}>
            Setting up examples tailored to your background
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ─── COMPLETE ─── */}
      {phase === 'complete' && displayPersona && (
        <div style={{ ...slideStyle, textAlign: 'center' }}>
          {/* Success checkmark */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%', margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #16C79A, #0EA5E9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: 800, color: '#1A1A2E', margin: '0 0 24px', letterSpacing: '-0.02em',
          }}>
            You're all set
          </h2>

          {/* Persona card */}
          <div style={{
            background: 'rgba(254,253,251,0.8)', border: '1px solid rgba(26,26,46,0.06)',
            borderRadius: 16, padding: isMobile ? '20px' : '24px', textAlign: 'left',
            marginBottom: 24,
          }}>
            {/* Profession badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{
                padding: '4px 12px', borderRadius: 100, fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em',
                background: '#7B61FF12', color: '#7B61FF', border: '1px solid #7B61FF20',
              }}>
                {displayPersona.selections.profession}
              </span>
              <span style={{
                padding: '4px 12px', borderRadius: 100, fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em',
                background: displayPersona.selections.aiExperience === 'beginner' ? '#F5A62312' :
                  displayPersona.selections.aiExperience === 'intermediate' ? '#0EA5E912' : '#16C79A12',
                color: displayPersona.selections.aiExperience === 'beginner' ? '#F5A623' :
                  displayPersona.selections.aiExperience === 'intermediate' ? '#0EA5E9' : '#16C79A',
                border: `1px solid ${displayPersona.selections.aiExperience === 'beginner' ? '#F5A62320' :
                  displayPersona.selections.aiExperience === 'intermediate' ? '#0EA5E920' : '#16C79A20'}`,
              }}>
                {displayPersona.selections.aiExperience === 'beginner' ? 'Beginner' :
                  displayPersona.selections.aiExperience === 'intermediate' ? 'Intermediate' : 'Regular user'}
              </span>
            </div>

            {/* AI-generated summary */}
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.7,
              color: '#1A1A2E', margin: '0 0 16px',
            }}>
              {displayPersona.context}
            </p>

            {/* Goal tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {displayPersona.selections.goals.map((g) => (
                <span
                  key={g}
                  style={{
                    padding: '3px 10px', borderRadius: 100, fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.04em',
                    background: 'rgba(26,26,46,0.04)', color: '#6B7280',
                  }}
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Keywords */}
            {displayPersona.keywords.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(26,26,46,0.06)' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                  color: '#6B7280', marginRight: 8,
                }}>
                  Domain terms
                </span>
                {displayPersona.keywords.map((k) => (
                  <span
                    key={k}
                    style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 4, marginRight: 4, marginBottom: 4,
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                      background: 'rgba(123,97,255,0.06)', color: '#7B61FF',
                    }}
                  >
                    {k}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <a
            href="/ch2"
            style={{
              display: 'block', padding: '14px 36px', borderRadius: 100, textDecoration: 'none',
              fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600,
              letterSpacing: '0.04em', background: '#7B61FF', color: 'white',
              transition: 'all 0.25s', boxShadow: '0 4px 20px rgba(123,97,255,0.3)',
              textAlign: 'center', marginBottom: 12,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(123,97,255,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(123,97,255,0.3)'; }}
          >
            Start Chapter 2
          </a>

          <button
            onClick={handleUpdate}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'transparent', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
              fontWeight: 600, color: '#6B7280', transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#7B61FF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
          >
            Update my profile
          </button>
        </div>
      )}
    </div>
  );
}
