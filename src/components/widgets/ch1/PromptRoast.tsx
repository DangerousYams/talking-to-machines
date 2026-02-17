import { useState, useRef } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { streamChat } from '../../../lib/claude';
import ShareCard from '../../ui/ShareCard';
import BottomSheet from '../../cards/BottomSheet';

interface RoastResult {
  score: number;
  tier: string;
  roast: string;
  bestLine: string;
  tips: string[];
}

const SYSTEM_PROMPT = `You are a brutally funny prompt critic. The user will give you a prompt they've written for an AI. Rate it 0-100 and roast it.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "score": 23,
  "tier": "Copy-Paste Connoisseur",
  "roast": "2-3 sentence roast of the prompt. Be funny but educational. Point out what's wrong.",
  "bestLine": "Single most quotable roast line, under 80 characters",
  "tips": ["Specific improvement tip 1", "Specific improvement tip 2", "Specific improvement tip 3"]
}

Tier titles by score range:
- 0-19: "Copy-Paste Connoisseur"
- 20-39: "Vague Vibes Vendor"
- 40-59: "Getting Somewhere"
- 60-79: "Prompt Padawan"
- 80-89: "Prompt Architect"
- 90-100: "Prompt Wizard"

Rules:
- Be genuinely funny, not mean-spirited. Think roast comedy, not bullying.
- The bestLine should be the kind of thing someone would want to share on Twitter
- Tips should be specific and actionable, referencing the actual prompt
- Score honestly \u2014 most casual prompts should land 15-45
- A truly great prompt with role, task, format, constraints, and examples deserves 80+
- ONLY output the JSON object, nothing else`;

function getScoreColor(score: number): string {
  if (score < 40) return '#E94560';
  if (score < 80) return '#F5A623';
  return '#16C79A';
}

function getTierForScore(score: number): string {
  if (score < 20) return 'Copy-Paste Connoisseur';
  if (score < 40) return 'Vague Vibes Vendor';
  if (score < 60) return 'Getting Somewhere';
  if (score < 80) return 'Prompt Padawan';
  if (score < 90) return 'Prompt Architect';
  return 'Prompt Wizard';
}

export default function PromptRoast() {
  const isMobile = useIsMobile();
  const [prompt, setPrompt] = useState('');
  const [phase, setPhase] = useState<'input' | 'loading' | 'result'>('input');
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [throttled, setThrottled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const handleRoast = () => {
    const text = prompt.trim();
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
      source: 'prompt-roast',
      onChunk: (chunk) => {
        accumulated += chunk;
      },
      onDone: () => {
        try {
          // Strip markdown fences if present
          let cleaned = accumulated.trim();
          if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
          }
          const parsed: RoastResult = JSON.parse(cleaned);

          // Validate and fix tier
          if (!parsed.tier) parsed.tier = getTierForScore(parsed.score);
          if (!parsed.tips) parsed.tips = [];
          if (!parsed.bestLine) parsed.bestLine = parsed.roast?.slice(0, 80) || '';

          setResult(parsed);
          setPhase('result');
        } catch {
          setError('The AI got so roasted by your prompt it forgot how to respond. Try again!');
          setPhase('input');
        }
        controllerRef.current = null;
      },
      onError: (err) => {
        if (err.includes('5 free roasts') || err.includes('Daily limit')) {
          setThrottled(true);
        }
        setError(err);
        setPhase('input');
        controllerRef.current = null;
      },
    });
  };

  const handleReset = () => {
    controllerRef.current?.abort();
    setPhase('input');
    setPrompt('');
    setResult(null);
    setError(null);
    setSheetOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleRoast();
    }
  };

  return (
    <div className="widget-container" style={isMobile ? { display: 'flex', flexDirection: 'column', height: '100%' } : undefined}>
      {/* Header */}
      {isMobile ? (
        <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(26,26,46,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #E94560, #F5A623)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
            <span role="img" aria-label="fire">&#128293;</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, margin: 0, lineHeight: 1.3, flex: 1 }}>Prompt Roast</h3>
        </div>
      ) : (
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #E94560, #F5A623)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
              <span role="img" aria-label="fire">&#128293;</span>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>Prompt Roast</h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Paste any prompt. Get brutally honest feedback.</p>
            </div>
          </div>
        </div>
      )}

      {/* --- MOBILE LAYOUT --- */}
      {isMobile ? (
        <>
          {/* Input phase */}
          {phase === 'input' && (
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0.5rem 0.75rem' }}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Paste your prompt here... e.g. "write me a story"'
                style={{
                  width: '100%', flex: 1, minHeight: 80, padding: '0.75rem',
                  fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 1.6,
                  background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.08)', borderRadius: 10,
                  resize: 'none' as const, outline: 'none', color: '#1A1A2E',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#E9456040'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
              />

              {throttled && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(233,69,96,0.06), rgba(245,166,35,0.04))',
                  border: '1px solid rgba(233,69,96,0.15)',
                  borderRadius: 8, padding: '0.6rem 0.75rem', marginTop: 8, textAlign: 'center' as const, flexShrink: 0,
                }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600, color: '#1A1A2E', margin: '0 0 0.15rem' }}>Daily roasts used up!</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', margin: 0 }}>Unlock full access for unlimited roasts</p>
                </div>
              )}

              {error && !throttled && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#E94560', marginTop: 4, flexShrink: 0 }}>{error}</p>
              )}

              <button
                onClick={handleRoast}
                disabled={!prompt.trim() || throttled}
                style={{
                  width: '100%', padding: '12px 24px', borderRadius: 10, border: 'none',
                  cursor: (!prompt.trim() || throttled) ? 'default' : 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600,
                  background: (!prompt.trim() || throttled) ? 'rgba(26,26,46,0.08)' : 'linear-gradient(135deg, #E94560, #F5A623)',
                  color: (!prompt.trim() || throttled) ? '#6B7280' : '#FFFFFF',
                  minHeight: 44, marginTop: 8, flexShrink: 0,
                }}
              >
                Roast My Prompt
              </button>
            </div>
          )}

          {/* Loading phase */}
          {phase === 'loading' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem', animation: 'pulse 1s ease-in-out infinite' }}>&#128293;</div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#6B7280' }}>Analyzing your prompt...</p>
            </div>
          )}

          {/* Result phase */}
          {phase === 'result' && result && (
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0.5rem 0.75rem' }}>
              {/* Score + Tier */}
              <div style={{ textAlign: 'center' as const, marginBottom: 8, flexShrink: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800,
                  color: getScoreColor(result.score), lineHeight: 1, marginBottom: '0.15rem',
                }}>
                  {result.score}
                  <span style={{ fontSize: '0.4em', color: '#6B7280', fontWeight: 600 }}>/100</span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                  color: getScoreColor(result.score), margin: 0,
                }}>
                  {result.tier}
                </p>
              </div>

              {/* Roast text - clamped */}
              <div style={{
                background: 'rgba(26,26,46,0.03)', border: '1px solid rgba(26,26,46,0.06)',
                borderRadius: 10, padding: '0.6rem 0.75rem', marginBottom: 8, flexShrink: 0,
              }}>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.6,
                  color: '#1A1A2E', margin: 0,
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical' as any,
                }}>
                  {result.roast}
                </p>
              </div>

              {/* "See Tips & Share" button */}
              <div style={{ marginTop: 'auto', flexShrink: 0, display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setSheetOpen(true)}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600,
                    background: '#1A1A2E', color: '#FAF8F5', minHeight: 42,
                  }}
                >
                  See Tips &amp; Share
                </button>
              </div>

              {/* BottomSheet with full roast, bestLine, tips, ShareCard, Roast Another */}
              <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="Roast Details">
                {/* Full roast */}
                <div style={{
                  background: 'rgba(26,26,46,0.03)', border: '1px solid rgba(26,26,46,0.06)',
                  borderRadius: 10, padding: '0.85rem 1rem', marginBottom: 12,
                }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', lineHeight: 1.65, color: '#1A1A2E', margin: 0 }}>
                    {result.roast}
                  </p>
                </div>

                {/* Best line */}
                <div style={{
                  background: `linear-gradient(135deg, ${getScoreColor(result.score)}08, ${getScoreColor(result.score)}04)`,
                  border: `1px solid ${getScoreColor(result.score)}20`,
                  borderRadius: 10, padding: '0.75rem 1rem', marginBottom: 12,
                }}>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 600,
                    fontStyle: 'italic', color: '#1A1A2E', margin: 0, lineHeight: 1.5,
                  }}>
                    &ldquo;{result.bestLine}&rdquo;
                  </p>
                </div>

                {/* Tips */}
                {result.tips.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                      letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                      color: '#6B7280', marginBottom: 6,
                    }}>
                      How to improve
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                      {result.tips.map((tip, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: '#16C79A', flexShrink: 0 }}>{i + 1}.</span>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.5, color: '#1A1A2E', margin: 0, opacity: 0.8 }}>{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ShareCard */}
                <ShareCard
                  title={result.tier}
                  metric={`${result.score}/100`}
                  metricColor={getScoreColor(result.score)}
                  subtitle={result.bestLine}
                  accentColor={getScoreColor(result.score)}
                  tweetText={`My prompt scored ${result.score}/100 on the Prompt Roast \u{1F480} "${result.bestLine}" Can yours do better?`}
                  shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/ch1#prompt-roast` : undefined}
                />

                {/* Roast Another */}
                <div style={{ textAlign: 'center' as const, marginTop: '1rem' }}>
                  <button
                    onClick={handleReset}
                    style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                      padding: '0.6rem 1.5rem', borderRadius: 100, border: '1px solid rgba(26,26,46,0.15)',
                      background: 'transparent', color: '#6B7280', cursor: 'pointer', minHeight: 44,
                    }}
                  >
                    Roast Another Prompt
                  </button>
                </div>
              </BottomSheet>
            </div>
          )}
        </>
      ) : (
        /* --- DESKTOP LAYOUT (unchanged) --- */
        <>
          {/* Input phase */}
          {phase === 'input' && (
            <div style={{ padding: '1.5rem 2rem' }}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Paste your prompt here... e.g. "write me a story"'
                style={{
                  width: '100%', minHeight: 140, padding: '1rem 1.25rem',
                  fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.7,
                  background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.08)', borderRadius: 10,
                  resize: 'vertical' as const, outline: 'none', color: '#1A1A2E', transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#E9456040'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
              />

              {throttled && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(233,69,96,0.06), rgba(245,166,35,0.04))',
                  border: '1px solid rgba(233,69,96,0.15)', borderRadius: 10,
                  padding: '1rem 1.25rem', marginTop: 12, textAlign: 'center' as const,
                }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: '#1A1A2E', margin: '0 0 0.25rem' }}>Daily roasts used up!</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>Unlock full access for unlimited roasts + all chapters</p>
                </div>
              )}

              {error && !throttled && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#E94560', marginTop: 8 }}>{error}</p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                <button
                  onClick={handleRoast}
                  disabled={!prompt.trim() || throttled}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 24px', borderRadius: 10, border: 'none',
                    cursor: (!prompt.trim() || throttled) ? 'default' : 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.25s',
                    background: (!prompt.trim() || throttled) ? 'rgba(26,26,46,0.08)' : 'linear-gradient(135deg, #E94560, #F5A623)',
                    color: (!prompt.trim() || throttled) ? '#6B7280' : '#FFFFFF', minHeight: 44,
                  }}
                  onMouseEnter={(e) => { if (prompt.trim() && !throttled) e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  Roast My Prompt
                </button>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#B0B0B0' }}>Cmd+Enter to roast</span>
              </div>
            </div>
          )}

          {/* Loading phase */}
          {phase === 'loading' && (
            <div style={{ padding: '3rem 2rem', textAlign: 'center' as const }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', animation: 'pulse 1s ease-in-out infinite' }}>&#128293;</div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#6B7280' }}>Analyzing your prompt...</p>
            </div>
          )}

          {/* Result phase */}
          {phase === 'result' && result && (
            <div style={{ padding: '1.5rem 2rem' }}>
              {/* Score + Tier */}
              <div style={{ textAlign: 'center' as const, marginBottom: '1.5rem' }}>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontSize: '4.5rem', fontWeight: 800,
                  color: getScoreColor(result.score), lineHeight: 1, marginBottom: '0.25rem',
                }}>
                  {result.score}
                  <span style={{ fontSize: '0.4em', color: '#6B7280', fontWeight: 600 }}>/100</span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                  color: getScoreColor(result.score), margin: 0,
                }}>
                  {result.tier}
                </p>
              </div>

              {/* Roast text */}
              <div style={{
                background: 'rgba(26,26,46,0.03)', border: '1px solid rgba(26,26,46,0.06)',
                borderRadius: 10, padding: '1.25rem 1.5rem', marginBottom: '1rem',
              }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', lineHeight: 1.7, color: '#1A1A2E', margin: 0 }}>
                  {result.roast}
                </p>
              </div>

              {/* Best line highlight */}
              <div style={{
                background: `linear-gradient(135deg, ${getScoreColor(result.score)}08, ${getScoreColor(result.score)}04)`,
                border: `1px solid ${getScoreColor(result.score)}20`,
                borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.25rem',
              }}>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '1.05rem', fontWeight: 600,
                  fontStyle: 'italic', color: '#1A1A2E', margin: 0, lineHeight: 1.5,
                }}>
                  &ldquo;{result.bestLine}&rdquo;
                </p>
              </div>

              {/* Tips */}
              {result.tips.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                    letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                    color: '#6B7280', marginBottom: 8,
                  }}>
                    How to improve
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                    {result.tips.map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: '#16C79A', flexShrink: 0, marginTop: 2 }}>{i + 1}.</span>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.6, color: '#1A1A2E', margin: 0, opacity: 0.8 }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ShareCard */}
              <ShareCard
                title={result.tier}
                metric={`${result.score}/100`}
                metricColor={getScoreColor(result.score)}
                subtitle={result.bestLine}
                accentColor={getScoreColor(result.score)}
                tweetText={`My prompt scored ${result.score}/100 on the Prompt Roast \u{1F480} "${result.bestLine}" Can yours do better?`}
                shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/ch1#prompt-roast` : undefined}
              />

              {/* Try again */}
              <div style={{ textAlign: 'center' as const, marginTop: '1.25rem' }}>
                <button
                  onClick={handleReset}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                    padding: '0.6rem 1.5rem', borderRadius: 100,
                    border: '1px solid rgba(26,26,46,0.15)', background: 'transparent',
                    color: '#6B7280', cursor: 'pointer', transition: 'all 0.25s', minHeight: 44,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1A1A2E'; e.currentTarget.style.color = '#1A1A2E'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.15)'; e.currentTarget.style.color = '#6B7280'; }}
                >
                  Roast Another Prompt
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
