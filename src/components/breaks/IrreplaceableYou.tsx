import { useState, useRef } from 'react';
import { streamChat } from '../../lib/claude';
import ShareCard from '../ui/ShareCard';

interface IrreplaceableResult {
  score: number;
  tier: string;
  canHelp: string[];
  cantReplace: string[];
  bestLine: string;
  assessment: string;
}

const SYSTEM_PROMPT = `You are a thoughtful futurist who genuinely believes in the human edge. A teenager describes who they are and what they do. Evaluate their irreplaceability — what makes them uniquely human that no AI can touch.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "score": 78,
  "tier": "Distinctly Human",
  "canHelp": ["Research and draft your history essays 3x faster", "Generate beat variations to spark new ideas"],
  "cantReplace": ["Your court vision in basketball — reading defenders is pure human instinct", "The specific anime references only YOU would weave into a beat drop"],
  "bestLine": "Quotable observation about their unique human edge, under 80 characters",
  "assessment": "2 sentences celebrating what makes them irreplaceable."
}

Tier labels by score (irreplaceability — HIGHER = MORE irreplaceable = better):
- 0-29: "Easily Augmented" (but frame positively — AI helps you do MORE)
- 30-49: "AI-Assisted"
- 50-69: "Hybrid Talent"
- 70-84: "Distinctly Human"
- 85-94: "One of a Kind"
- 95-100: "Irreplaceable"

Rules:
- canHelp: 2 specific things AI could assist with, based on THEIR actual activities
- cantReplace: 2 specific things that are uniquely human about THEM — be specific, not generic
- The bestLine should make them feel powerful about being human
- Be warm, specific, and empowering — this should make teens feel GOOD
- Even low scores should feel positive ("AI frees you up to do the things only you can do")
- ONLY output the JSON object, nothing else`;

function getScoreColor(score: number): string {
  if (score >= 70) return '#16C79A';
  if (score >= 40) return '#F5A623';
  return '#16C79A'; // Always positive — even lower scores use teal, never red
}

function getTierForScore(score: number): string {
  if (score >= 95) return 'Irreplaceable';
  if (score >= 85) return 'One of a Kind';
  if (score >= 70) return 'Distinctly Human';
  if (score >= 50) return 'Hybrid Talent';
  if (score >= 30) return 'AI-Assisted';
  return 'Easily Augmented';
}

export default function IrreplaceableYou() {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'input' | 'loading' | 'result'>('input');
  const [result, setResult] = useState<IrreplaceableResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [throttled, setThrottled] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const handleCheck = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setPhase('loading');
    setError(null);
    setResult(null);

    let accumulated = '';

    controllerRef.current?.abort();
    controllerRef.current = streamChat({
      messages: [{ role: 'user', content: trimmed }],
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
          const parsed: IrreplaceableResult = JSON.parse(cleaned);

          // Validate and fix fields
          if (!parsed.tier) parsed.tier = getTierForScore(parsed.score);
          if (!parsed.canHelp || !Array.isArray(parsed.canHelp)) parsed.canHelp = [];
          if (!parsed.cantReplace || !Array.isArray(parsed.cantReplace)) parsed.cantReplace = [];
          if (!parsed.bestLine) parsed.bestLine = parsed.assessment?.slice(0, 80) || '';
          if (!parsed.assessment) parsed.assessment = '';

          setResult(parsed);
          setPhase('result');
        } catch {
          setError('Your uniqueness broke the algorithm. Try again!');
          setPhase('input');
        }
        controllerRef.current = null;
      },
      onError: (err) => {
        if (err.includes('free') || err.includes('Daily limit')) {
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
    setText('');
    setResult(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleCheck();
    }
  };

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #16C79A, #F5A623)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
          }}>
            <span role="img" aria-label="fingerprint">&#128310;</span>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
              Irreplaceable You
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
              Describe yourself. We'll tell you what no AI can touch.
            </p>
          </div>
        </div>
      </div>

      {/* Input phase */}
      {phase === 'input' && (
        <div style={{ padding: '1.5rem 2rem' }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="I'm a high school junior who plays basketball, makes beats, and is obsessed with anime"
            style={{
              width: '100%', minHeight: 140, padding: '1rem 1.25rem',
              fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.7,
              background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.08)', borderRadius: 10,
              resize: 'vertical' as const, outline: 'none', color: '#1A1A2E', transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#16C79A40'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
          />

          {throttled && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(22,199,154,0.06), rgba(245,166,35,0.04))',
              border: '1px solid rgba(22,199,154,0.15)', borderRadius: 10,
              padding: '1rem 1.25rem', marginTop: 12, textAlign: 'center' as const,
            }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: '#1A1A2E', margin: '0 0 0.25rem' }}>
                Daily checks used up!
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                Unlock full access for unlimited irreplaceability checks
              </p>
            </div>
          )}

          {error && !throttled && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#E94560', marginTop: 8 }}>{error}</p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <button
              onClick={handleCheck}
              disabled={!text.trim() || throttled}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 10, border: 'none',
                cursor: (!text.trim() || throttled) ? 'default' : 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.25s',
                background: (!text.trim() || throttled) ? 'rgba(26,26,46,0.08)' : 'linear-gradient(135deg, #16C79A, #0F3460)',
                color: (!text.trim() || throttled) ? '#6B7280' : '#FFFFFF', minHeight: 44,
              }}
              onMouseEnter={(e) => { if (text.trim() && !throttled) e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              Am I Replaceable?
            </button>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#B0B0B0' }}>Cmd+Enter</span>
          </div>
        </div>
      )}

      {/* Loading phase */}
      {phase === 'loading' && (
        <div style={{ padding: '3rem 2rem', textAlign: 'center' as const }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', animation: 'pulse 1s ease-in-out infinite' }}>
            &#128310;
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#6B7280' }}>
            Evaluating your irreplaceability...
          </p>
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
              color: '#16C79A', margin: 0,
            }}>
              {result.tier}
            </p>
          </div>

          {/* Best line highlight */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(22,199,154,0.08), rgba(245,166,35,0.04))',
            border: '1px solid rgba(22,199,154,0.20)',
            borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1rem',
          }}>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '1.05rem', fontWeight: 600,
              fontStyle: 'italic', color: '#1A1A2E', margin: 0, lineHeight: 1.5,
            }}>
              &ldquo;{result.bestLine}&rdquo;
            </p>
          </div>

          {/* Assessment */}
          <div style={{
            background: 'rgba(26,26,46,0.03)', border: '1px solid rgba(26,26,46,0.06)',
            borderRadius: 10, padding: '1.25rem 1.5rem', marginBottom: '1rem',
          }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', lineHeight: 1.7, color: '#1A1A2E', margin: 0 }}>
              {result.assessment}
            </p>
          </div>

          {/* AI Can Help / Can't Replace sections */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {/* AI Can Help */}
            <div style={{
              background: 'rgba(22,199,154,0.04)', border: '1px solid rgba(22,199,154,0.12)',
              borderRadius: 10, padding: '1rem 1.25rem',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                color: '#16C79A', marginBottom: 10, marginTop: 0,
              }}>
                AI can help with
              </p>
              {result.canHelp.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < result.canHelp.length - 1 ? 8 : 0 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#16C79A',
                    marginTop: 7, flexShrink: 0,
                  }} />
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.5,
                    color: '#1A1A2E', margin: 0,
                  }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>

            {/* Only You */}
            <div style={{
              background: 'rgba(245,166,35,0.04)', border: '1px solid rgba(245,166,35,0.12)',
              borderRadius: 10, padding: '1rem 1.25rem',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                color: '#F5A623', marginBottom: 10, marginTop: 0,
              }}>
                Only you can do this
              </p>
              {result.cantReplace.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < result.cantReplace.length - 1 ? 8 : 0 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#F5A623',
                    marginTop: 7, flexShrink: 0,
                  }} />
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.5,
                    color: '#1A1A2E', margin: 0,
                  }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ShareCard */}
          <ShareCard
            title="Irreplaceable You"
            metric={`${result.score}/100`}
            metricColor={getScoreColor(result.score)}
            subtitle={`${result.tier} — "${result.bestLine}"`}
            accentColor="#16C79A"
            tweetText={`My irreplaceability score: ${result.score}/100 (${result.tier}) — "${result.bestLine}"`}
            shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/toolbox?tool=irreplaceable-you` : undefined}
          />

          {/* Try Again */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1.25rem' }}>
            <button
              onClick={handleReset}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                padding: '0.6rem 1.5rem', borderRadius: 100,
                border: '1px solid rgba(26,26,46,0.15)', background: 'transparent',
                color: '#6B7280', cursor: 'pointer', transition: 'all 0.25s', minHeight: 44,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#16C79A'; e.currentTarget.style.color = '#16C79A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.15)'; e.currentTarget.style.color = '#6B7280'; }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
