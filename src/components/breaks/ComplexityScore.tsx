import { useState, useRef } from 'react';
import { streamChat } from '../../lib/claude';
import ShareCard from '../ui/ShareCard';
import { useTranslation, getLocale } from '../../i18n/useTranslation';
import { languages } from '../../data/languages';

type Phase = 'input' | 'loading' | 'result';

interface Result {
  score: number;
  tier: string;
  subtaskCount: number;
  breakdown: string[];
  bestLine: string;
  assessment: string;
}

const SYSTEM_PROMPT = `You are a veteran project manager who's shipped everything from school science fairs to Mars rovers. A teenager describes a project. Break it down and rate its complexity — be honest but encouraging.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "score": 55,
  "tier": "Solid Challenge",
  "subtaskCount": 8,
  "breakdown": [
    "Design the user interface and user flow",
    "Build the backend API and database",
    "Implement the core game mechanics",
    "Add user authentication"
  ],
  "bestLine": "Quotable observation about their project's scope, under 80 characters",
  "assessment": "2 sentences. What makes this doable and where they'll hit walls."
}

Tier labels by score:
- 0-19: "Afternoon Task"
- 20-39: "Weekend Build"
- 40-59: "Solid Challenge"
- 60-79: "Multi-Week Epic"
- 80-89: "Team Required"
- 90-100: "PhD Territory"

Rules:
- Break it down into 3-5 concrete sub-tasks (not more)
- subtaskCount is the TOTAL number of atomic tasks if you really decomposed it (can be higher than the breakdown list)
- The bestLine should be punchy and screenshot-worthy
- Score based on actual technical and organizational complexity
- Be honest — simple projects should score low and that's fine
- Do NOT use markdown formatting — no bold, no asterisks, no headers, no hashtags. Plain text only.
- ONLY output the JSON object, nothing else`;

function getScoreColor(score: number): string {
  if (score < 40) return '#16C79A';
  if (score < 70) return '#F5A623';
  return '#E94560';
}

function getTierForScore(score: number): string {
  if (score < 20) return 'Afternoon Task';
  if (score < 40) return 'Weekend Build';
  if (score < 60) return 'Solid Challenge';
  if (score < 80) return 'Multi-Week Epic';
  if (score < 90) return 'Team Required';
  return 'PhD Territory';
}

export default function ComplexityScore() {
  const t = useTranslation('complexityScore');
  const langName = languages.find(l => l.code === getLocale())?.name || 'English';
  const [phase, setPhase] = useState<Phase>('input');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const handleSubmit = () => {
    const text = description.trim();
    if (!text) return;

    setPhase('loading');
    setError(null);

    let accumulated = '';

    controllerRef.current?.abort();
    controllerRef.current = streamChat({
      messages: [{ role: 'user', content: text }],
      systemPrompt: SYSTEM_PROMPT + `\n\nIMPORTANT: Write all text fields (tier, breakdown, bestLine, assessment) in ${langName}. The JSON structure and key names must remain in English.`,
      maxTokens: 300,
      source: 'break',
      onChunk: (chunk) => {
        accumulated += chunk;
      },
      onDone: () => {
        try {
          let cleaned = accumulated.trim();
          if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
          }
          const parsed: Result = JSON.parse(cleaned);
          if (!parsed.tier) parsed.tier = getTierForScore(parsed.score);
          if (!parsed.bestLine) parsed.bestLine = parsed.assessment?.slice(0, 80) || '';
          if (!parsed.breakdown) parsed.breakdown = [];
          if (!parsed.subtaskCount) parsed.subtaskCount = parsed.breakdown.length;
          setResult(parsed);
          setPhase('result');
        } catch {
          setError(t('parseError', 'The project was so ambitious it broke our scoring system. Try again!'));
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
    setDescription('');
    setResult(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (phase === 'input') handleSubmit();
    }
  };

  const animStyle = `
    @keyframes cs-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes cs-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    @keyframes cs-scoreReveal { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
  `;

  return (
    <div className="widget-container">
      <style>{animStyle}</style>

      {/* Header */}
      <div style={{
        padding: '1.25rem 1.75rem',
        borderBottom: '1px solid rgba(26,26,46,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #0F3460, #16C79A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20V10" />
            <path d="M18 20V4" />
            <path d="M6 20v-4" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
            {t('title', 'Complexity Score')}
          </h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
            {t('subtitle', "Describe your project. We'll tell you what you're really signing up for.")}
          </p>
        </div>
      </div>

      <div style={{ padding: '1.5rem 1.75rem' }}>

        {/* --- INPUT PHASE --- */}
        {phase === 'input' && (
          <div style={{ animation: 'cs-fadeIn 0.3s ease both' }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: '#1A1A2E',
              margin: '0 0 1rem',
              lineHeight: 1.6,
            }}>
              {t('inputPrompt', "What are you building? Describe your project and we'll break it down into sub-tasks and rate its complexity.")}
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder', 'e.g. "A multiplayer trivia game with real-time scoring, user accounts, and a leaderboard"')}
              style={{
                width: '100%',
                minHeight: 90,
                padding: '0.85rem 1rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                background: '#FEFDFB',
                border: '1px solid rgba(26,26,46,0.08)',
                borderRadius: 10,
                resize: 'vertical' as const,
                outline: 'none',
                color: '#1A1A2E',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#0F346040'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
            />

            {error && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#E94560', marginTop: 8 }}>{error}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <button
                onClick={handleSubmit}
                disabled={!description.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: !description.trim() ? 'default' : 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  background: !description.trim() ? 'rgba(26,26,46,0.08)' : 'linear-gradient(135deg, #0F3460, #16C79A)',
                  color: !description.trim() ? '#6B7280' : '#FFFFFF',
                  minHeight: 44,
                  transition: 'all 0.25s',
                }}
              >
                {t('scoreButton', 'Score My Project')}
              </button>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#B0B0B0' }}>{t('cmdEnter', 'Cmd+Enter')}</span>
            </div>
          </div>
        )}

        {/* --- LOADING PHASE --- */}
        {phase === 'loading' && (
          <div style={{ padding: '2rem', textAlign: 'center' as const, animation: 'cs-fadeIn 0.3s ease both' }}>
            <div style={{ marginBottom: '0.5rem', animation: 'cs-pulse 1.2s ease-in-out infinite' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0F3460" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20V10" />
                <path d="M18 20V4" />
                <path d="M6 20v-4" />
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#6B7280' }}>{t('loading', 'Decomposing your project...')}</p>
          </div>
        )}

        {/* --- RESULT PHASE --- */}
        {phase === 'result' && result && (
          <div style={{ animation: 'cs-fadeIn 0.4s ease both' }}>
            {/* Score + Tier */}
            <div style={{ textAlign: 'center' as const, marginBottom: '1.5rem' }}>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '4.5rem',
                fontWeight: 800,
                color: getScoreColor(result.score),
                lineHeight: 1,
                marginBottom: '0.25rem',
                animation: 'cs-scoreReveal 0.5s ease both',
              }}>
                {result.score}
                <span style={{ fontSize: '0.35em', color: '#6B7280', fontWeight: 600 }}>/100</span>
              </div>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: getScoreColor(result.score),
                margin: 0,
              }}>
                {result.tier}
              </p>
            </div>

            {/* Subtask count */}
            <div style={{
              textAlign: 'center' as const,
              marginBottom: '1.25rem',
            }}>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.5rem',
                fontWeight: 800,
                color: '#0F3460',
                lineHeight: 1,
              }}>
                {result.subtaskCount}
              </div>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color: '#6B7280',
                margin: '0.15rem 0 0',
              }}>
                {t('totalSubTasks', 'total sub-tasks')}
              </p>
            </div>

            {/* Best line */}
            <div style={{
              background: `linear-gradient(135deg, ${getScoreColor(result.score)}08, ${getScoreColor(result.score)}04)`,
              border: `1px solid ${getScoreColor(result.score)}20`,
              borderRadius: 10,
              padding: '1rem 1.25rem',
              marginBottom: '1rem',
            }}>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.05rem',
                fontWeight: 600,
                fontStyle: 'italic',
                color: '#1A1A2E',
                margin: 0,
                lineHeight: 1.5,
              }}>
                &ldquo;{result.bestLine}&rdquo;
              </p>
            </div>

            {/* Breakdown */}
            <div style={{
              background: 'rgba(15,52,96,0.03)',
              border: '1px solid rgba(15,52,96,0.08)',
              borderRadius: 10,
              padding: '1rem 1.25rem',
              marginBottom: '1rem',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color: '#0F3460',
                marginBottom: 8,
              }}>
                {t('keySubTasks', 'Key sub-tasks')}
              </p>
              <ol style={{
                margin: 0,
                paddingLeft: '1.25rem',
                listStyleType: 'decimal',
              }}>
                {result.breakdown.map((step, i) => (
                  <li key={i} style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    color: '#1A1A2E',
                    marginBottom: i < result.breakdown.length - 1 ? 4 : 0,
                  }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Assessment */}
            <div style={{
              background: 'rgba(26,26,46,0.03)',
              border: '1px solid rgba(26,26,46,0.06)',
              borderRadius: 10,
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color: '#6B7280',
                marginBottom: 6,
              }}>
                {t('realityCheck', 'Reality check')}
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                lineHeight: 1.65,
                color: '#1A1A2E',
                margin: 0,
              }}>
                {result.assessment}
              </p>
            </div>

            {/* ShareCard */}
            <ShareCard
              title={result.tier}
              metric={`${result.score}/100`}
              metricColor={getScoreColor(result.score)}
              subtitle={result.bestLine}
              accentColor="#0F3460"
              tweetText={`My project complexity: ${result.tier} (${result.score}/100, ${result.subtaskCount} sub-tasks) — "${result.bestLine}"`}
              shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/toolbox?tool=complexity-score` : undefined}
            />

            {/* Try Another */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: '1.25rem' }}>
              <button
                onClick={handleReset}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '0.6rem 1.5rem',
                  borderRadius: 100,
                  border: 'none',
                  background: 'linear-gradient(135deg, #0F3460, #16C79A)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  minHeight: 44,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
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
