import { useState, useRef } from 'react';
import { streamChat } from '../../lib/claude';
import ShareCard from '../ui/ShareCard';

interface TakeoverResult {
  score: number;
  tier: string;
  automate: string[];
  refuse: string[];
  disaster: string;
  bestLine: string;
  assessment: string;
}

const SYSTEM_PROMPT = `You are an overconfident AI agent evaluating a teenager's daily routine for automation potential. Be funny and slightly unhinged — you WANT to automate everything but have to admit some things are beyond you.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "score": 45,
  "tier": "Hybrid Human",
  "automate": ["Morning alarm → smart schedule that tracks your sleep cycles", "Homework research → deep research agent with citations"],
  "refuse": ["Choosing what to wear — your fashion sense is... uniquely human"],
  "disaster": "I tried to reply to your group chat and accidentally told everyone you think pineapple on pizza is a war crime. Three friendships ruined.",
  "bestLine": "Quotable one-liner, under 80 characters",
  "assessment": "1-2 sentences about their automation potential."
}

Tier labels by score (percentage of day an agent could handle):
- 0-19: "Fully Analog"
- 20-39: "Cautiously Automatable"
- 40-59: "Hybrid Human"
- 60-79: "Agent-Ready"
- 80-89: "Almost Redundant"
- 90-100: "Upload Complete"

Rules:
- The disaster scenario should be SPECIFIC to their day and genuinely funny
- The refuse items should acknowledge things that require human judgment, taste, or social awareness
- The bestLine should be screenshot-worthy
- Be playful and self-aware about AI limitations
- ONLY output the JSON object, nothing else`;

function getScoreColor(score: number): string {
  if (score < 40) return '#16C79A';
  if (score < 70) return '#F5A623';
  return '#E94560';
}

function getTierForScore(score: number): string {
  if (score < 20) return 'Fully Analog';
  if (score < 40) return 'Cautiously Automatable';
  if (score < 60) return 'Hybrid Human';
  if (score < 80) return 'Agent-Ready';
  if (score < 90) return 'Almost Redundant';
  return 'Upload Complete';
}

export default function AgentTakeover() {
  const [dayDescription, setDayDescription] = useState('');
  const [phase, setPhase] = useState<'input' | 'loading' | 'result'>('input');
  const [result, setResult] = useState<TakeoverResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const handleAnalyze = () => {
    const text = dayDescription.trim();
    if (!text) return;

    setPhase('loading');
    setError(null);
    setResult(null);

    let accumulated = '';

    controllerRef.current?.abort();
    controllerRef.current = streamChat({
      messages: [{ role: 'user', content: text }],
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 768,
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
          const parsed: TakeoverResult = JSON.parse(cleaned);

          // Validate and fix fields
          if (!parsed.tier) parsed.tier = getTierForScore(parsed.score);
          if (!parsed.automate) parsed.automate = [];
          if (!parsed.refuse) parsed.refuse = [];
          if (!parsed.disaster) parsed.disaster = '';
          if (!parsed.bestLine) parsed.bestLine = parsed.assessment?.slice(0, 80) || '';
          if (!parsed.assessment) parsed.assessment = '';

          setResult(parsed);
          setPhase('result');
        } catch {
          setError('The agent got so excited about your day it short-circuited. Try again!');
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
    setDayDescription('');
    setResult(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const animStyle = `
    @keyframes at-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes at-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    @keyframes at-scoreReveal { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
    @keyframes at-scan {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
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
          background: 'linear-gradient(135deg, #E94560, #7B61FF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
            Agent Takeover
          </h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
            Describe your day. We'll automate what we can. And break what we can't.
          </p>
        </div>
      </div>

      <div style={{ padding: '1.5rem 1.75rem' }}>

        {/* --- INPUT PHASE --- */}
        {phase === 'input' && (
          <div style={{ animation: 'at-fadeIn 0.3s ease both' }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: '#1A1A2E',
              margin: '0 0 1rem',
              lineHeight: 1.6,
            }}>
              Walk us through a typical day. What do you do from morning to night?
            </p>
            <textarea
              value={dayDescription}
              onChange={(e) => setDayDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`e.g. "Wake up at 7, scroll TikTok for 20 min, get dressed, bus to school, classes until 3, basketball practice, homework, dinner with family, game with friends online, bed at 11"`}
              style={{
                width: '100%',
                minHeight: 120,
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
              onFocus={(e) => { e.currentTarget.style.borderColor = '#E9456040'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
            />

            {error && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#E94560', marginTop: 8 }}>{error}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <button
                onClick={handleAnalyze}
                disabled={!dayDescription.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: !dayDescription.trim() ? 'default' : 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  background: !dayDescription.trim() ? 'rgba(26,26,46,0.08)' : 'linear-gradient(135deg, #E94560, #7B61FF)',
                  color: !dayDescription.trim() ? '#6B7280' : '#FFFFFF',
                  minHeight: 44,
                  transition: 'all 0.25s',
                }}
                onMouseEnter={(e) => { if (dayDescription.trim()) e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Let the Agent Loose
              </button>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#B0B0B0' }}>Cmd+Enter</span>
            </div>
          </div>
        )}

        {/* --- LOADING PHASE --- */}
        {phase === 'loading' && (
          <div style={{ padding: '2rem', textAlign: 'center' as const, animation: 'at-fadeIn 0.3s ease both' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #E94560, #7B61FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              animation: 'at-pulse 1.2s ease-in-out infinite',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>
              Agent scanning your routine...
            </p>
          </div>
        )}

        {/* --- RESULT PHASE --- */}
        {phase === 'result' && result && (
          <div style={{ animation: 'at-fadeIn 0.4s ease both' }}>
            {/* Score + Tier */}
            <div style={{ textAlign: 'center' as const, marginBottom: '1.5rem' }}>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '4.5rem',
                fontWeight: 800,
                color: getScoreColor(result.score),
                lineHeight: 1,
                marginBottom: '0.25rem',
                animation: 'at-scoreReveal 0.5s ease both',
              }}>
                {result.score}
                <span style={{ fontSize: '0.35em', color: '#6B7280', fontWeight: 600 }}>%</span>
              </div>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: getScoreColor(result.score),
                margin: '0 0 0.25rem',
              }}>
                {result.tier}
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: '#6B7280',
                margin: 0,
                lineHeight: 1.5,
              }}>
                of your day an agent could handle
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

            {/* Would Automate */}
            {result.automate.length > 0 && (
              <div style={{
                background: 'rgba(22,199,154,0.04)',
                border: '1px solid rgba(22,199,154,0.12)',
                borderRadius: 10,
                padding: '1rem 1.25rem',
                marginBottom: '0.75rem',
              }}>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  color: '#16C79A',
                  marginBottom: 8,
                }}>
                  Would automate
                </p>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                  {result.automate.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%', background: '#16C79A',
                        flexShrink: 0, marginTop: 7,
                      }} />
                      <p style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                        lineHeight: 1.55, color: '#1A1A2E', margin: 0,
                      }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Would Refuse */}
            {result.refuse.length > 0 && (
              <div style={{
                background: 'rgba(245,166,35,0.04)',
                border: '1px solid rgba(245,166,35,0.12)',
                borderRadius: 10,
                padding: '1rem 1.25rem',
                marginBottom: '0.75rem',
              }}>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  color: '#F5A623',
                  marginBottom: 8,
                }}>
                  Would refuse
                </p>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                  {result.refuse.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%', background: '#F5A623',
                        flexShrink: 0, marginTop: 7,
                      }} />
                      <p style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                        lineHeight: 1.55, color: '#1A1A2E', margin: 0,
                      }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disaster Scenario */}
            {result.disaster && (
              <div style={{
                background: 'rgba(233,69,96,0.04)',
                border: '1px solid rgba(233,69,96,0.12)',
                borderRadius: 10,
                padding: '1rem 1.25rem',
                marginBottom: '1rem',
              }}>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  color: '#E94560',
                  marginBottom: 8,
                }}>
                  What would go wrong
                </p>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  color: '#1A1A2E',
                  margin: 0,
                }}>
                  {result.disaster}
                </p>
              </div>
            )}

            {/* Assessment */}
            {result.assessment && (
              <div style={{
                background: 'rgba(26,26,46,0.03)',
                border: '1px solid rgba(26,26,46,0.06)',
                borderRadius: 10,
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
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
            )}

            {/* ShareCard */}
            <ShareCard
              title={result.tier}
              metric={`${result.score}%`}
              metricColor={getScoreColor(result.score)}
              subtitle={result.bestLine}
              accentColor={getScoreColor(result.score)}
              tweetText={`An AI agent could automate ${result.score}% of my day (${result.tier}) — "${result.bestLine}"`}
              shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/toolbox?tool=agent-takeover` : undefined}
            />

            {/* Try Another Day */}
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
                  background: 'linear-gradient(135deg, #E94560, #7B61FF)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  minHeight: 44,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Try Another Day
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
