import { useState, useRef } from 'react';
import { streamChat } from '../../lib/claude';
import ShareCard from '../ui/ShareCard';
import { useTranslation, getLocale } from '../../i18n/useTranslation';
import { languages } from '../../data/languages';

interface VibeResult {
  score: number;
  vibe: string;
  bestLine: string;
  assessment: string;
  traits: string[];
}

const SYSTEM_PROMPT = `You are a literary psychoanalyst with the wit of a late-night talk show host. The user will paste something they've written. Analyze their writing style and personality.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "score": 73,
  "vibe": "Academic Overthinker",
  "bestLine": "Single most quotable observation about their writing, under 80 characters",
  "assessment": "2-3 sentences analyzing their voice, word choices, and what it reveals about how they think.",
  "traits": ["precise", "cautious", "secretly funny"]
}

Vibe labels should be creative and specific — NOT generic. Examples:
"Chaotic Creative", "Corporate in Training", "Poetic Overthinker", "Chill Philosopher", "Anxious Perfectionist", "Main Character Energy", "Reply Guy in the Making", "Quiet Storm", "Unhinged Genius"

Rules:
- Be genuinely funny and insightful, not mean
- The bestLine should be the kind of thing someone screenshots
- Traits should be 3 specific adjectives that capture their voice
- Score 0-100 represents "vibe intensity" — how distinctive their voice is
- Do NOT use markdown formatting — no bold, no asterisks, no headers, no hashtags. Plain text only.
- ONLY output the JSON object, nothing else`;

function getScoreColor(score: number): string {
  if (score < 40) return '#E94560';
  if (score < 70) return '#F5A623';
  return '#16C79A';
}

function getVibeForScore(score: number): string {
  if (score < 20) return 'Wallflower Energy';
  if (score < 40) return 'Finding Your Voice';
  if (score < 60) return 'Developing Character';
  if (score < 80) return 'Distinct Voice';
  return 'Unmistakable Presence';
}

export default function VibeCheck() {
  const t = useTranslation('vibeCheck');
  const langName = languages.find(l => l.code === getLocale())?.name || 'English';
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'input' | 'loading' | 'result'>('input');
  const [result, setResult] = useState<VibeResult | null>(null);
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
      systemPrompt: SYSTEM_PROMPT + `\n\nIMPORTANT: Write all text fields (vibe, bestLine, assessment, traits) in ${langName}. The JSON structure and key names must remain in English.`,
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
          const parsed: VibeResult = JSON.parse(cleaned);

          // Validate and fix fields
          if (!parsed.vibe) parsed.vibe = getVibeForScore(parsed.score);
          if (!parsed.bestLine) parsed.bestLine = parsed.assessment?.slice(0, 80) || '';
          if (!parsed.traits) parsed.traits = [];
          if (!parsed.assessment) parsed.assessment = '';

          setResult(parsed);
          setPhase('result');
        } catch {
          setError(t('parseError', 'Your writing was so unique it broke the analyzer. Try again!'));
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
            background: 'linear-gradient(135deg, #7B61FF, #0EA5E9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
          }}>
            <span role="img" aria-label="sparkles">&#10024;</span>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
              {t('title', 'Vibe Check')}
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
              {t('subtitle', "Paste anything you've written. We'll read between the lines.")}
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
            placeholder={t('placeholder', "Paste a text message, tweet, essay paragraph, email, journal entry \u2014 anything you've written...")}
            style={{
              width: '100%', minHeight: 140, padding: '1rem 1.25rem',
              fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.7,
              background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.08)', borderRadius: 10,
              resize: 'vertical' as const, outline: 'none', color: '#1A1A2E', transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#7B61FF40'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
          />

          {throttled && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(123,97,255,0.06), rgba(14,165,233,0.04))',
              border: '1px solid rgba(123,97,255,0.15)', borderRadius: 10,
              padding: '1rem 1.25rem', marginTop: 12, textAlign: 'center' as const,
            }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: '#1A1A2E', margin: '0 0 0.25rem' }}>
                {t('dailyUsedUp', 'Daily vibe checks used up!')}
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                {t('unlockAccess', 'Unlock full access for unlimited vibe checks')}
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
                background: (!text.trim() || throttled) ? 'rgba(26,26,46,0.08)' : 'linear-gradient(135deg, #7B61FF, #0EA5E9)',
                color: (!text.trim() || throttled) ? '#6B7280' : '#FFFFFF', minHeight: 44,
              }}
              onMouseEnter={(e) => { if (text.trim() && !throttled) e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {t('checkButton', 'Check My Vibe')}
            </button>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#B0B0B0' }}>{t('cmdEnter', 'Cmd+Enter')}</span>
          </div>
        </div>
      )}

      {/* Loading phase */}
      {phase === 'loading' && (
        <div style={{ padding: '3rem 2rem', textAlign: 'center' as const }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', animation: 'pulse 1s ease-in-out infinite' }}>
            &#10024;
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#6B7280' }}>
            {t('loading', 'Reading between your lines...')}
          </p>
        </div>
      )}

      {/* Result phase */}
      {phase === 'result' && result && (
        <div style={{ padding: '1.5rem 2rem' }}>
          {/* Score + Vibe */}
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
              color: '#7B61FF', margin: 0,
            }}>
              {result.vibe}
            </p>
          </div>

          {/* Best line highlight */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(123,97,255,0.08), rgba(14,165,233,0.04))',
            border: '1px solid rgba(123,97,255,0.20)',
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

          {/* Traits */}
          {result.traits.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                color: '#6B7280', marginBottom: 8,
              }}>
                {t('voiceIn3Words', 'Your voice in 3 words')}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                {result.traits.map((trait, i) => (
                  <span key={i} style={{
                    display: 'inline-block', padding: '6px 14px', borderRadius: 100,
                    background: 'linear-gradient(135deg, rgba(123,97,255,0.08), rgba(14,165,233,0.06))',
                    border: '1px solid rgba(123,97,255,0.15)',
                    fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600,
                    color: '#7B61FF', letterSpacing: '0.03em',
                  }}>
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ShareCard */}
          <ShareCard
            title={result.vibe}
            metric={`${result.score}/100`}
            metricColor={getScoreColor(result.score)}
            subtitle={result.bestLine}
            accentColor="#7B61FF"
            tweetText={`My writing vibe: "${result.vibe}" (${result.score}/100) — "${result.bestLine}"`}
            shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/toolbox?tool=vibe-check` : undefined}
          />

          {/* Try Another Text */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1.25rem' }}>
            <button
              onClick={handleReset}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                padding: '0.6rem 1.5rem', borderRadius: 100,
                border: '1px solid rgba(26,26,46,0.15)', background: 'transparent',
                color: '#6B7280', cursor: 'pointer', transition: 'all 0.25s', minHeight: 44,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7B61FF'; e.currentTarget.style.color = '#7B61FF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.15)'; e.currentTarget.style.color = '#6B7280'; }}
            >
              {t('tryAnother', 'Try Another Text')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
