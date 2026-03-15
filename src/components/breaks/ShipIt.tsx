import { useState, useRef } from 'react';
import { streamChat } from '../../lib/claude';
import ShareCard from '../ui/ShareCard';

type Phase = 'input' | 'loading' | 'result';

interface ShipResult {
  score: number;
  tier: string;
  bestLine: string;
  withAI: string;
  withoutAI: string;
  assessment: string;
}

const SYSTEM_PROMPT = `You are a brutally honest but secretly supportive Silicon Valley VC evaluating a teenager's app/game/website idea. Give them the VC treatment — part hype, part reality check, all quotable.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "score": 67,
  "tier": "Seed Round Maybe",
  "bestLine": "A quotable VC-style one-liner about their idea, under 80 characters",
  "withAI": "2 weeks with Claude Code + Cursor",
  "withoutAI": "3 months of weekend coding",
  "assessment": "2 sentences. What's genuinely promising and what needs work."
}

Tier labels by score:
- 0-19: "Back to the Whiteboard"
- 20-39: "Hackathon Entry"
- 40-59: "Side Project with Potential"
- 60-79: "Seed Round Maybe"
- 80-89: "Y Combinator Material"
- 90-100: "Unicorn Alert"

Rules:
- The bestLine should sound like something a VC would actually say — punchy, memorable, slightly dramatic
- Time estimates (withAI/withoutAI) should be realistic and show the dramatic difference AI makes
- Be encouraging about ambitious ideas even if they're raw
- Score based on: originality, market potential, and how fun it sounds
- ONLY output the JSON object, nothing else`;

function getScoreColor(score: number): string {
  if (score < 40) return '#E94560';
  if (score < 70) return '#F5A623';
  return '#16C79A';
}

function getTierForScore(score: number): string {
  if (score < 20) return 'Back to the Whiteboard';
  if (score < 40) return 'Hackathon Entry';
  if (score < 60) return 'Side Project with Potential';
  if (score < 80) return 'Seed Round Maybe';
  if (score < 90) return 'Y Combinator Material';
  return 'Unicorn Alert';
}

export default function ShipIt() {
  const [phase, setPhase] = useState<Phase>('input');
  const [idea, setIdea] = useState('');
  const [result, setResult] = useState<ShipResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const handlePitch = () => {
    const text = idea.trim();
    if (!text) return;

    setPhase('loading');
    setError(null);
    setResult(null);

    let accumulated = '';

    controllerRef.current?.abort();
    controllerRef.current = streamChat({
      messages: [{ role: 'user', content: text }],
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 512,
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
          const parsed: ShipResult = JSON.parse(cleaned);

          if (!parsed.tier) parsed.tier = getTierForScore(parsed.score);
          if (!parsed.bestLine) parsed.bestLine = parsed.assessment?.slice(0, 80) || '';

          setResult(parsed);
          setPhase('result');
        } catch {
          setError('The VCs were so excited they forgot to write their verdict. Try again!');
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
    setIdea('');
    setResult(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handlePitch();
    }
  };

  const animStyle = `
    @keyframes si-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes si-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    @keyframes si-scoreReveal { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
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
          background: 'linear-gradient(135deg, #7B61FF, #0F3460)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
            Ship It
          </h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
            Pitch your app idea. Get the VC treatment.
          </p>
        </div>
      </div>

      <div style={{ padding: '1.5rem 1.75rem' }}>

        {/* --- INPUT PHASE --- */}
        {phase === 'input' && (
          <div style={{ animation: 'si-fadeIn 0.3s ease both' }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: '#1A1A2E',
              margin: '0 0 1rem',
              lineHeight: 1.6,
            }}>
              Describe your app, game, or website idea in one sentence. The VCs are waiting.
            </p>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`e.g. "A multiplayer game where you debate AI ethics with a chatbot judge"`}
              style={{
                width: '100%',
                minHeight: 80,
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
              onFocus={(e) => { e.currentTarget.style.borderColor = '#7B61FF40'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
            />

            {error && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#E94560', marginTop: 8 }}>{error}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <button
                onClick={handlePitch}
                disabled={!idea.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: !idea.trim() ? 'default' : 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  background: !idea.trim() ? 'rgba(26,26,46,0.08)' : 'linear-gradient(135deg, #7B61FF, #0F3460)',
                  color: !idea.trim() ? '#6B7280' : '#FFFFFF',
                  minHeight: 44,
                  transition: 'all 0.25s',
                }}
                onMouseEnter={(e) => { if (idea.trim()) e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Pitch It
              </button>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#B0B0B0' }}>Cmd+Enter</span>
            </div>
          </div>
        )}

        {/* --- LOADING PHASE --- */}
        {phase === 'loading' && (
          <div style={{ padding: '2rem', textAlign: 'center' as const, animation: 'si-fadeIn 0.3s ease both' }}>
            <div style={{ marginBottom: '0.5rem', animation: 'si-pulse 1.2s ease-in-out infinite' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#6B7280' }}>The VCs are deliberating...</p>
          </div>
        )}

        {/* --- RESULT PHASE --- */}
        {phase === 'result' && result && (
          <div style={{ animation: 'si-fadeIn 0.4s ease both' }}>
            {/* Score + Tier */}
            <div style={{ textAlign: 'center' as const, marginBottom: '1.5rem' }}>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '4.5rem',
                fontWeight: 800,
                color: getScoreColor(result.score),
                lineHeight: 1,
                marginBottom: '0.25rem',
                animation: 'si-scoreReveal 0.5s ease both',
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

            {/* VC Quote */}
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

            {/* Assessment */}
            <div style={{
              background: 'rgba(26,26,46,0.03)',
              border: '1px solid rgba(26,26,46,0.06)',
              borderRadius: 10,
              padding: '1rem 1.25rem',
              marginBottom: '1rem',
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

            {/* Time comparison */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: '1.5rem',
            }}>
              {/* With AI */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(123,97,255,0.06), rgba(123,97,255,0.02))',
                border: '1px solid rgba(123,97,255,0.15)',
                borderRadius: 10,
                padding: '1rem',
                textAlign: 'center' as const,
              }}>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  color: '#7B61FF',
                  margin: '0 0 0.35rem',
                }}>
                  With AI
                </p>
                <p style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#1A1A2E',
                  margin: 0,
                  lineHeight: 1.3,
                }}>
                  {result.withAI}
                </p>
              </div>

              {/* Without AI */}
              <div style={{
                background: 'rgba(26,26,46,0.03)',
                border: '1px solid rgba(26,26,46,0.06)',
                borderRadius: 10,
                padding: '1rem',
                textAlign: 'center' as const,
              }}>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  color: '#6B7280',
                  margin: '0 0 0.35rem',
                }}>
                  Without AI
                </p>
                <p style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#1A1A2E',
                  margin: 0,
                  lineHeight: 1.3,
                }}>
                  {result.withoutAI}
                </p>
              </div>
            </div>

            {/* ShareCard */}
            <ShareCard
              title={result.tier}
              metric={`${result.score}/100`}
              metricColor={getScoreColor(result.score)}
              subtitle={result.bestLine}
              accentColor={getScoreColor(result.score)}
              tweetText={`My app idea scored ${result.score}/100 — ${result.tier}. "${result.bestLine}"`}
              shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/toolbox?tool=ship-it` : undefined}
            />

            {/* Pitch Another Idea */}
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
                  background: 'linear-gradient(135deg, #7B61FF, #0F3460)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  minHeight: 44,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Pitch Another Idea
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
