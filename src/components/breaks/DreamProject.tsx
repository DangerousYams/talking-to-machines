import { useState, useRef } from 'react';
import { streamChat } from '../../lib/claude';
import ShareCard from '../ui/ShareCard';
import { useTranslation, getLocale } from '../../i18n/useTranslation';
import { languages } from '../../data/languages';

type Phase = 'input' | 'loading' | 'result';

interface ToolSuggestion {
  name: string;
  role: string;
}

interface DreamResult {
  score: number;
  tier: string;
  bestLine: string;
  tools: ToolSuggestion[];
  assessment: string;
}

const SYSTEM_PROMPT = `You are a creative director who's seen every wild idea and loves the ambitious ones. A teenager describes their dream project. Rate their ambition and suggest the AI tools to make it real.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "score": 82,
  "tier": "Spielberg-in-Training",
  "bestLine": "Quotable one-liner about their creative ambition, under 80 characters",
  "tools": [
    {"name": "Midjourney", "role": "Concept art and visual development"},
    {"name": "Claude", "role": "Script writing and world-building"},
    {"name": "Suno", "role": "Original soundtrack generation"}
  ],
  "assessment": "2 sentences. What makes this idea exciting and what would make it legendary."
}

Tier labels by score:
- 0-19: "Napkin Doodle"
- 20-39: "Weekend Project"
- 40-59: "Passion Project"
- 60-79: "Spielberg-in-Training"
- 80-89: "Future Founder"
- 90-100: "Needs a TED Talk"

Rules:
- Be enthusiastic and encouraging, never dismissive
- Suggest REAL AI tools (Midjourney, DALL-E, Suno, Claude, Cursor, Runway, ElevenLabs, Stable Diffusion, Replit, etc.)
- The tool suggestions should form a logical pipeline for their specific project
- The bestLine should make them want to screenshot it
- Score based on ambition and creativity, not feasibility
- Do NOT use markdown formatting — no bold, no asterisks, no headers, no hashtags. Plain text only.
- ONLY output the JSON object, nothing else`;

function getScoreColor(score: number): string {
  if (score < 40) return '#E94560';
  if (score < 70) return '#F5A623';
  return '#16C79A';
}

function getTierForScore(score: number): string {
  if (score < 20) return 'Napkin Doodle';
  if (score < 40) return 'Weekend Project';
  if (score < 60) return 'Passion Project';
  if (score < 80) return 'Spielberg-in-Training';
  if (score < 90) return 'Future Founder';
  return 'Needs a TED Talk';
}

export default function DreamProject() {
  const t = useTranslation('dreamProject');
  const langName = languages.find(l => l.code === getLocale())?.name || 'English';
  const [phase, setPhase] = useState<Phase>('input');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<DreamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const handleSubmit = () => {
    const text = description.trim();
    if (!text) return;

    setPhase('loading');
    setError(null);
    setResult(null);

    let accumulated = '';

    controllerRef.current?.abort();
    controllerRef.current = streamChat({
      messages: [{ role: 'user', content: text }],
      systemPrompt: SYSTEM_PROMPT + `\n\nIMPORTANT: Write all text fields (tier, bestLine, tools role descriptions, assessment) in ${langName}. The JSON structure and key names must remain in English.`,
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
          const parsed: DreamResult = JSON.parse(cleaned);
          if (!parsed.tier) parsed.tier = getTierForScore(parsed.score);
          if (!parsed.bestLine) parsed.bestLine = parsed.assessment?.slice(0, 80) || '';
          if (!parsed.tools || !Array.isArray(parsed.tools)) parsed.tools = [];
          setResult(parsed);
          setPhase('result');
        } catch {
          setError(t('parseError', 'Your dream was so wild it broke the scoring algorithm. Try again!'));
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

  const accentColor = '#0EA5E9';

  const animStyle = `
    @keyframes dp-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes dp-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    @keyframes dp-scoreReveal { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
    @keyframes dp-pipelineIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
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
          background: `linear-gradient(135deg, ${accentColor}, #7B61FF)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
            {t('title', 'Dream Project')}
          </h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
            {t('subtitle', "Describe your wildest creative idea. We'll build the toolkit.")}
          </p>
        </div>
      </div>

      <div style={{ padding: '1.5rem 1.75rem' }}>

        {/* --- INPUT PHASE --- */}
        {phase === 'input' && (
          <div style={{ animation: 'dp-fadeIn 0.3s ease both' }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: '#1A1A2E',
              margin: '0 0 1rem',
              lineHeight: 1.6,
            }}>
              {t('inputPrompt', 'What would you build if you had every AI tool at your fingertips?')}
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder', 'e.g. "An animated short film about a robot who learns to paint, with original music and voice acting"')}
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
              onFocus={(e) => { e.currentTarget.style.borderColor = `${accentColor}40`; }}
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
                  background: !description.trim() ? 'rgba(26,26,46,0.08)' : `linear-gradient(135deg, ${accentColor}, #7B61FF)`,
                  color: !description.trim() ? '#6B7280' : '#FFFFFF',
                  minHeight: 44,
                  transition: 'all 0.25s',
                }}
              >
                {t('rateButton', 'Rate My Dream')}
              </button>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#B0B0B0' }}>{t('cmdEnter', 'Cmd+Enter')}</span>
            </div>
          </div>
        )}

        {/* --- LOADING PHASE --- */}
        {phase === 'loading' && (
          <div style={{ padding: '2rem', textAlign: 'center' as const, animation: 'dp-fadeIn 0.3s ease both' }}>
            <div style={{ marginBottom: '0.5rem', animation: 'dp-pulse 1.2s ease-in-out infinite' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#6B7280' }}>{t('loading', 'Evaluating your ambition...')}</p>
          </div>
        )}

        {/* --- RESULT PHASE --- */}
        {phase === 'result' && result && (
          <div style={{ animation: 'dp-fadeIn 0.4s ease both' }}>
            {/* Score + Tier */}
            <div style={{ textAlign: 'center' as const, marginBottom: '1.5rem' }}>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '4.5rem',
                fontWeight: 800,
                color: getScoreColor(result.score),
                lineHeight: 1,
                marginBottom: '0.25rem',
                animation: 'dp-scoreReveal 0.5s ease both',
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

            {/* Tool Pipeline */}
            {result.tools.length > 0 && (
              <div style={{
                background: 'rgba(26,26,46,0.03)',
                border: '1px solid rgba(26,26,46,0.06)',
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
                  color: '#6B7280',
                  marginBottom: 12,
                }}>
                  {t('yourAIToolkit', 'Your AI Toolkit')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 0 }}>
                  {result.tools.map((tool, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      animation: `dp-pipelineIn 0.4s ease ${0.15 * (i + 1)}s both`,
                    }}>
                      {/* Step number + connector */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column' as const,
                        alignItems: 'center',
                        flexShrink: 0,
                      }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${accentColor}, #7B61FF)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#FFFFFF',
                        }}>
                          {i + 1}
                        </div>
                        {i < result.tools.length - 1 && (
                          <div style={{
                            width: 2,
                            height: 20,
                            background: `linear-gradient(to bottom, ${accentColor}40, ${accentColor}10)`,
                          }} />
                        )}
                      </div>

                      {/* Tool info */}
                      <div style={{ paddingTop: 2, paddingBottom: i < result.tools.length - 1 ? 12 : 0 }}>
                        <p style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#1A1A2E',
                          margin: 0,
                          lineHeight: 1.3,
                        }}>
                          {tool.name}
                        </p>
                        <p style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.82rem',
                          color: '#6B7280',
                          margin: '2px 0 0',
                          lineHeight: 1.4,
                        }}>
                          {tool.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assessment */}
            <div style={{
              background: 'rgba(26,26,46,0.03)',
              border: '1px solid rgba(26,26,46,0.06)',
              borderRadius: 10,
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
            }}>
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
              accentColor={getScoreColor(result.score)}
              tweetText={`My dream project ambition: ${result.tier} (${result.score}/100) — "${result.bestLine}"`}
              shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/toolbox?tool=dream-project` : undefined}
            />

            {/* Try again */}
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
                  background: `linear-gradient(135deg, ${accentColor}, #7B61FF)`,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  minHeight: 44,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {t('tryAnother', 'Try Another Idea')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
