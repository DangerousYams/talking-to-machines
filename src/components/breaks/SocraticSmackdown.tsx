import { useState, useRef } from 'react';
import { streamChat } from '../../lib/claude';
import ShareCard from '../ui/ShareCard';

type Phase = 'input' | 'questioning' | 'defending' | 'judging' | 'result';

interface Verdict {
  score: number;
  tier: string;
  bestLine: string;
  assessment: string;
}

const QUESTION_PROMPT = `You are Socrates — the original philosophical troll. A teenager states an opinion. Your job: ask ONE devastating, probing question that exposes a hidden assumption or contradiction in their thinking.

Rules:
- Be witty, not mean. Think clever philosophy professor, not bully.
- ONE question only. No preamble, no "great question", no pleasantries.
- Make it specific to what they said — no generic "but what IS truth?" questions.
- Keep it under 40 words.
- Address them as "you" directly.
- Channel the energy of Socrates at a party — charming but relentless.`;

const VERDICT_PROMPT = `You are Socrates delivering a final verdict on a teenager's reasoning. You asked them a probing question about their opinion, and they defended themselves. Now judge their thinking.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "score": 72,
  "tier": "Dialectic Debater",
  "bestLine": "A single devastating or brilliant observation, under 80 characters — the kind of line someone would screenshot",
  "assessment": "2 sentences max. Acknowledge what was strong in their thinking, then name what Socrates would push on next."
}

Tier titles by score range:
- 0-19: "Cave Dweller" (they didn't engage with the question at all)
- 20-39: "Sophist in Training" (surface-level reasoning, dodged the hard part)
- 40-59: "Agora Regular" (decent thinking, but gaps)
- 60-79: "Dialectic Debater" (solid reasoning, engaged honestly)
- 80-89: "Gadfly's Apprentice" (genuinely strong, Socrates would approve)
- 90-100: "Philosopher King" (masterful — turned the question back on itself)

Rules:
- The bestLine should be quotable, funny, and specific to what they said
- Score honestly — most teens will land 30-65
- A truly thoughtful, self-aware defense deserves 70+
- If they just agreed with your question or deflected, score low (10-30)
- ONLY output the JSON object, nothing else`;

function getScoreColor(score: number): string {
  if (score < 40) return '#E94560';
  if (score < 70) return '#F5A623';
  return '#16C79A';
}

function getTierForScore(score: number): string {
  if (score < 20) return 'Cave Dweller';
  if (score < 40) return 'Sophist in Training';
  if (score < 60) return 'Agora Regular';
  if (score < 80) return 'Dialectic Debater';
  if (score < 90) return "Gadfly's Apprentice";
  return 'Philosopher King';
}

export default function SocraticSmackdown() {
  const [phase, setPhase] = useState<Phase>('input');
  const [opinion, setOpinion] = useState('');
  const [question, setQuestion] = useState('');
  const [defense, setDefense] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const handleSubmitOpinion = () => {
    const text = opinion.trim();
    if (!text) return;

    setPhase('questioning');
    setError(null);
    setQuestion('');

    let accumulated = '';

    controllerRef.current?.abort();
    controllerRef.current = streamChat({
      messages: [{ role: 'user', content: text }],
      systemPrompt: QUESTION_PROMPT,
      maxTokens: 150,
      source: 'socratic-smackdown',
      onChunk: (chunk) => {
        accumulated += chunk;
        setQuestion(accumulated);
      },
      onDone: () => {
        setPhase('defending');
        controllerRef.current = null;
      },
      onError: (err) => {
        setError(err);
        setPhase('input');
        controllerRef.current = null;
      },
    });
  };

  const handleSubmitDefense = () => {
    const text = defense.trim();
    if (!text) return;

    setPhase('judging');
    setError(null);

    let accumulated = '';

    controllerRef.current?.abort();
    controllerRef.current = streamChat({
      messages: [
        { role: 'user', content: opinion },
        { role: 'assistant', content: question },
        { role: 'user', content: text },
      ],
      systemPrompt: VERDICT_PROMPT,
      maxTokens: 512,
      source: 'socratic-smackdown',
      onChunk: (chunk) => {
        accumulated += chunk;
      },
      onDone: () => {
        try {
          let cleaned = accumulated.trim();
          if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
          }
          const parsed: Verdict = JSON.parse(cleaned);
          if (!parsed.tier) parsed.tier = getTierForScore(parsed.score);
          if (!parsed.bestLine) parsed.bestLine = parsed.assessment?.slice(0, 80) || '';
          setVerdict(parsed);
          setPhase('result');
        } catch {
          setError('Socrates was so impressed he forgot to score you. Try again!');
          setPhase('defending');
        }
        controllerRef.current = null;
      },
      onError: (err) => {
        setError(err);
        setPhase('defending');
        controllerRef.current = null;
      },
    });
  };

  const handleReset = () => {
    controllerRef.current?.abort();
    setPhase('input');
    setOpinion('');
    setQuestion('');
    setDefense('');
    setVerdict(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (phase === 'input') handleSubmitOpinion();
      if (phase === 'defending') handleSubmitDefense();
    }
  };

  const animStyle = `
    @keyframes ss-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes ss-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    @keyframes ss-scoreReveal { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
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
          background: 'linear-gradient(135deg, #16C79A, #0F3460)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
            Socratic Smackdown
          </h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
            State a hot take. Defend it against Socrates.
          </p>
        </div>
      </div>

      <div style={{ padding: '1.5rem 1.75rem' }}>

        {/* ─── INPUT PHASE ─── */}
        {phase === 'input' && (
          <div style={{ animation: 'ss-fadeIn 0.3s ease both' }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: '#1A1A2E',
              margin: '0 0 1rem',
              lineHeight: 1.6,
            }}>
              Drop your spiciest opinion. Socrates will question everything.
            </p>
            <textarea
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`e.g. "Homework is a waste of time" or "TikTok is better than reading books"`}
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
              onFocus={(e) => { e.currentTarget.style.borderColor = '#16C79A40'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
            />

            {error && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#E94560', marginTop: 8 }}>{error}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <button
                onClick={handleSubmitOpinion}
                disabled={!opinion.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: !opinion.trim() ? 'default' : 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  background: !opinion.trim() ? 'rgba(26,26,46,0.08)' : 'linear-gradient(135deg, #16C79A, #0F3460)',
                  color: !opinion.trim() ? '#6B7280' : '#FFFFFF',
                  minHeight: 44,
                  transition: 'all 0.25s',
                }}
              >
                Challenge Socrates
              </button>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#B0B0B0' }}>Cmd+Enter</span>
            </div>
          </div>
        )}

        {/* ─── QUESTIONING PHASE (Socrates asks) ─── */}
        {phase === 'questioning' && (
          <div style={{ animation: 'ss-fadeIn 0.3s ease both' }}>
            {/* User's opinion */}
            <div style={{
              background: 'rgba(26,26,46,0.03)',
              borderRadius: 10,
              padding: '0.85rem 1rem',
              marginBottom: '1rem',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                color: '#6B7280', marginBottom: 4,
              }}>Your hot take</p>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.88rem',
                lineHeight: 1.6, color: '#1A1A2E', margin: 0, fontStyle: 'italic',
              }}>{opinion}</p>
            </div>

            {/* Socrates typing */}
            <div style={{
              borderRadius: 10,
              padding: '0.85rem 1rem',
              border: '1px solid rgba(22,199,154,0.15)',
              background: 'rgba(22,199,154,0.03)',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                color: '#16C79A', marginBottom: 4,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                Socrates
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#16C79A', animation: 'ss-pulse 1s ease-in-out infinite' }} />
              </p>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                lineHeight: 1.65, color: '#1A1A2E', margin: 0,
              }}>
                {question || '...'}
              </p>
            </div>
          </div>
        )}

        {/* ─── DEFENDING PHASE (User responds) ─── */}
        {phase === 'defending' && (
          <div style={{ animation: 'ss-fadeIn 0.3s ease both' }}>
            {/* User's opinion */}
            <div style={{
              background: 'rgba(26,26,46,0.03)',
              borderRadius: 10,
              padding: '0.85rem 1rem',
              marginBottom: '0.75rem',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                color: '#6B7280', marginBottom: 4,
              }}>Your hot take</p>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                lineHeight: 1.55, color: '#1A1A2E', margin: 0, fontStyle: 'italic',
              }}>{opinion}</p>
            </div>

            {/* Socrates' question */}
            <div style={{
              borderRadius: 10,
              padding: '0.85rem 1rem',
              border: '1px solid rgba(22,199,154,0.15)',
              background: 'rgba(22,199,154,0.03)',
              marginBottom: '1rem',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                color: '#16C79A', marginBottom: 4,
              }}>Socrates</p>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                lineHeight: 1.65, color: '#1A1A2E', margin: 0,
              }}>{question}</p>
            </div>

            {/* Defense input */}
            <textarea
              value={defense}
              onChange={(e) => setDefense(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Defend your position..."
              autoFocus
              style={{
                width: '100%',
                minHeight: 70,
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
              onFocus={(e) => { e.currentTarget.style.borderColor = '#16C79A40'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
            />

            {error && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#E94560', marginTop: 8 }}>{error}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <button
                onClick={handleSubmitDefense}
                disabled={!defense.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: !defense.trim() ? 'default' : 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  background: !defense.trim() ? 'rgba(26,26,46,0.08)' : 'linear-gradient(135deg, #16C79A, #0F3460)',
                  color: !defense.trim() ? '#6B7280' : '#FFFFFF',
                  minHeight: 44,
                  transition: 'all 0.25s',
                }}
              >
                Submit Defense
              </button>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#B0B0B0' }}>Cmd+Enter</span>
            </div>
          </div>
        )}

        {/* ─── JUDGING PHASE (loading) ─── */}
        {phase === 'judging' && (
          <div style={{ padding: '2rem', textAlign: 'center' as const, animation: 'ss-fadeIn 0.3s ease both' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem', animation: 'ss-pulse 1.2s ease-in-out infinite' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16C79A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#6B7280' }}>Socrates deliberates...</p>
          </div>
        )}

        {/* ─── RESULT PHASE ─── */}
        {phase === 'result' && verdict && (
          <div style={{ animation: 'ss-fadeIn 0.4s ease both' }}>
            {/* Score + Tier */}
            <div style={{ textAlign: 'center' as const, marginBottom: '1.5rem' }}>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '4.5rem',
                fontWeight: 800,
                color: getScoreColor(verdict.score),
                lineHeight: 1,
                marginBottom: '0.25rem',
                animation: 'ss-scoreReveal 0.5s ease both',
              }}>
                {verdict.score}
                <span style={{ fontSize: '0.35em', color: '#6B7280', fontWeight: 600 }}>/100</span>
              </div>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: getScoreColor(verdict.score),
                margin: 0,
              }}>
                {verdict.tier}
              </p>
            </div>

            {/* Best line */}
            <div style={{
              background: `linear-gradient(135deg, ${getScoreColor(verdict.score)}08, ${getScoreColor(verdict.score)}04)`,
              border: `1px solid ${getScoreColor(verdict.score)}20`,
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
                &ldquo;{verdict.bestLine}&rdquo;
              </p>
            </div>

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
                {verdict.assessment}
              </p>
            </div>

            {/* The conversation recap */}
            <div style={{
              borderRadius: 10,
              border: '1px solid rgba(26,26,46,0.06)',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              fontSize: '0.82rem',
            }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280', marginBottom: 6 }}>
                The exchange
              </p>
              <p style={{ fontFamily: 'var(--font-body)', color: '#1A1A2E', margin: '0 0 8px', lineHeight: 1.5, fontStyle: 'italic' }}>
                <strong style={{ fontStyle: 'normal', color: '#6B7280' }}>You:</strong> {opinion}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', color: '#16C79A', margin: '0 0 8px', lineHeight: 1.5 }}>
                <strong>Socrates:</strong> {question}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', color: '#1A1A2E', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
                <strong style={{ fontStyle: 'normal', color: '#6B7280' }}>You:</strong> {defense}
              </p>
            </div>

            {/* ShareCard */}
            <ShareCard
              title={verdict.tier}
              metric={`${verdict.score}/100`}
              metricColor={getScoreColor(verdict.score)}
              subtitle={verdict.bestLine}
              accentColor={getScoreColor(verdict.score)}
              tweetText={`Socrates grilled me on "${opinion.slice(0, 60)}${opinion.length > 60 ? '...' : ''}" and I scored ${verdict.score}/100 — "${verdict.bestLine}"`}
              shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/ch2#socratic-smackdown` : undefined}
            />

            {/* Play again */}
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
                  background: 'linear-gradient(135deg, #16C79A, #0F3460)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  minHeight: 44,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Try Another Take
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
