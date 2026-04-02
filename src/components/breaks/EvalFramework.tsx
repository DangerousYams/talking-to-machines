import { useState, useEffect, useRef } from 'react';
import { streamChat } from '../../lib/claude';
import { useAuth } from '../../hooks/useAuth';
import UnlockModal from '../ui/UnlockModal';
import { useTranslation, getLocale } from '../../i18n/useTranslation';
import { languages } from '../../data/languages';

type Phase = 'input' | 'loading' | 'result';

interface EvalResult {
  bestLine: string;
  criteria: string[];
  firstTest: string;
  assessment: string;
}

const SYSTEM_PROMPT = `You are a senior engineering mentor helping someone define evaluation criteria for their project. Given a project description, create a practical verification framework they can use to judge if their AI-generated code actually works.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "bestLine": "A punchy, encouraging one-liner about their project, under 80 characters",
  "criteria": [
    "Does the main feature work when you click through it?",
    "Does the data persist when you refresh the page?",
    "Does it look right on a phone screen?",
    "Does it handle empty states gracefully?",
    "Does the error message make sense to a human?"
  ],
  "firstTest": "The single most important automated test to write, described in plain English",
  "assessment": "2 sentences. What's uniquely tricky to verify about this project and one specific thing to watch out for."
}

Rules:
- Generate 5-7 specific, actionable verification criteria tailored to the project
- Each criterion should be a yes/no question a non-coder can answer by using the app
- The firstTest should be something they can ask their coding agent to write in plain English
- Be practical, specific, and encouraging — not academic
- Tailor everything to the specific project, not generic software advice
- Do NOT use markdown formatting — no bold, no asterisks, no headers, no hashtags. Plain text only.
- ONLY output the JSON object, nothing else`;

const ACCENT = '#E94560';
const COLORS = ['#16C79A', '#7B61FF', '#0EA5E9', '#F5A623', '#E94560', '#0F3460', '#16C79A'];

export default function EvalFramework() {
  const t = useTranslation('evalFramework');
  const langName = languages.find(l => l.code === getLocale())?.name || 'English';
  const { isPaid } = useAuth();
  const [phase, setPhase] = useState<Phase>('input');
  const [project, setProject] = useState('');
  const [result, setResult] = useState<EvalResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUnlock, setShowUnlock] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ttm_my_project_idea');
      if (saved) setProject(saved);
    } catch { /* localStorage unavailable */ }
  }, []);

  const handleGenerate = () => {
    const text = project.trim();
    if (!text) return;
    if (!isPaid) { setShowUnlock(true); return; }

    setPhase('loading');
    setError(null);
    setResult(null);

    let accumulated = '';

    controllerRef.current?.abort();
    controllerRef.current = streamChat({
      messages: [{ role: 'user', content: text }],
      systemPrompt: SYSTEM_PROMPT + `\n\nIMPORTANT: Write all text fields (bestLine, criteria, firstTest, assessment) in ${langName}. The JSON structure and key names must remain in English.`,
      maxTokens: 500,
      source: 'break',
      onChunk: (chunk) => { accumulated += chunk; },
      onDone: () => {
        try {
          let cleaned = accumulated.trim();
          if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
          }
          const parsed: EvalResult = JSON.parse(cleaned);
          if (!parsed.bestLine) parsed.bestLine = parsed.assessment?.slice(0, 80) || '';
          if (!parsed.criteria) parsed.criteria = [];
          if (!parsed.firstTest) parsed.firstTest = '';
          setResult(parsed);
          setPhase('result');
        } catch {
          setError(t('parseError', 'Something went wrong parsing the response. Try again!'));
          setPhase('input');
        }
        controllerRef.current = null;
      },
      onError: (err) => {
        setError(err);
        setPhase('input');
        controllerRef.current = null;
      },
    });
  };

  const handleReset = () => {
    controllerRef.current?.abort();
    setPhase('input');
    setProject('');
    setResult(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="widget-container">
      <style>{`
        @keyframes ef-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ef-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '1.25rem 1.75rem',
        borderBottom: '1px solid rgba(26,26,46,0.06)',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #E94560, #0F3460)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
            {t('title', 'Eval Framework')}
          </h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
            {t('subtitle', 'Describe your project. Get a verification checklist.')}
          </p>
        </div>
      </div>

      <div style={{ padding: '1.5rem 1.75rem' }}>

        {/* --- INPUT --- */}
        {phase === 'input' && (
          <div style={{ animation: 'ef-fadeIn 0.3s ease both' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: '#1A1A2E', margin: '0 0 1rem', lineHeight: 1.6 }}>
              {t('inputPrompt', "Describe your project and we'll build you a verification checklist \u2014 the questions to ask and the first test to write.")}
            </p>
            <textarea
              value={project}
              onChange={(e) => setProject(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder', 'A flashcard app that quizzes me on my class notes...')}
              style={{
                width: '100%', minHeight: 80, padding: '0.85rem 1rem',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.6,
                background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.08)',
                borderRadius: 10, resize: 'vertical' as const, outline: 'none',
                color: '#1A1A2E', transition: 'border-color 0.2s', boxSizing: 'border-box' as const,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#E9456040'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
            />

            {error && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#E94560', marginTop: 8 }}>{error}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <button
                onClick={handleGenerate}
                disabled={!project.trim()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', borderRadius: 10, border: 'none',
                  cursor: !project.trim() ? 'default' : 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600,
                  background: !project.trim() ? 'rgba(26,26,46,0.08)' : 'linear-gradient(135deg, #E94560, #0F3460)',
                  color: !project.trim() ? '#6B7280' : '#FFFFFF',
                  minHeight: 44, transition: 'all 0.25s',
                }}
              >
                {t('generateButton', 'Generate My Eval Framework')}
              </button>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#B0B0B0' }}>{t('cmdEnter', 'Cmd+Enter')}</span>
            </div>

            {showUnlock && !isPaid && (
              <div style={{ marginTop: '1rem' }}>
                <UnlockModal feature="Eval Framework" accentColor="#E94560" />
              </div>
            )}
          </div>
        )}

        {/* --- LOADING --- */}
        {phase === 'loading' && (
          <div style={{ padding: '2rem', textAlign: 'center' as const, animation: 'ef-fadeIn 0.3s ease both' }}>
            <div style={{ marginBottom: '0.5rem', animation: 'ef-pulse 1.2s ease-in-out infinite' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E94560" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#6B7280' }}>{t('loading', 'Building your verification checklist...')}</p>
          </div>
        )}

        {/* --- RESULT --- */}
        {phase === 'result' && result && (
          <div style={{ animation: 'ef-fadeIn 0.4s ease both' }}>

            {/* Best Line */}
            <div style={{
              background: 'rgba(22,199,154,0.05)', border: '1px solid rgba(22,199,154,0.15)',
              borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.25rem',
            }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '1.05rem', fontWeight: 600,
                fontStyle: 'italic', color: '#1A1A2E', margin: 0, lineHeight: 1.5,
              }}>
                &ldquo;{result.bestLine}&rdquo;
              </p>
            </div>

            {/* Eval Checklist */}
            <div style={{
              background: 'rgba(26,26,46,0.02)', border: '1px solid rgba(26,26,46,0.06)',
              borderRadius: 10, padding: '1.25rem', marginBottom: '1.25rem',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                color: ACCENT, margin: '0 0 0.75rem',
              }}>
                {t('checklistTitle', 'Your Verification Checklist')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                {result.criteria.map((criterion, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '0.6rem 0.75rem', borderRadius: 8,
                    background: `${COLORS[i % COLORS.length]}06`,
                    border: `1px solid ${COLORS[i % COLORS.length]}15`,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                      color: COLORS[i % COLORS.length], minWidth: 20, lineHeight: 1.65,
                    }}>
                      {i + 1}.
                    </span>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.88rem',
                      lineHeight: 1.65, color: '#1A1A2E', margin: 0,
                    }}>
                      {criterion}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* First Test */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(123,97,255,0.06), rgba(123,97,255,0.02))',
              border: '1px solid rgba(123,97,255,0.15)',
              borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.25rem',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                color: '#7B61FF', margin: '0 0 0.5rem',
              }}>
                {t('firstTestTitle', 'First Test to Write')}
              </p>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                lineHeight: 1.65, color: '#1A1A2E', margin: '0 0 0.5rem',
              }}>
                {result.firstTest}
              </p>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                color: '#6B7280', margin: 0, fontStyle: 'italic',
              }}>
                {t('firstTestHint', "Tell your coding agent this in plain English \u2014 it'll write the test for you.")}
              </p>
            </div>

            {/* Assessment */}
            <div style={{
              background: 'rgba(26,26,46,0.02)', border: '1px solid rgba(26,26,46,0.06)',
              borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                color: '#6B7280', margin: '0 0 0.5rem',
              }}>
                {t('watchOutFor', 'Watch Out For')}
              </p>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                lineHeight: 1.65, color: '#1A1A2E', margin: 0,
              }}>
                {result.assessment}
              </p>
            </div>

            {/* Try Another */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                onClick={handleReset}
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                  padding: '0.6rem 1.5rem', borderRadius: 100, border: 'none',
                  background: 'linear-gradient(135deg, #E94560, #0F3460)',
                  color: '#FFFFFF', cursor: 'pointer', transition: 'all 0.25s', minHeight: 44,
                }}
              >
                {t('tryAnother', 'Try Another Project')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
