import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { promptChallenges } from '../../../data/prompt-challenges';
import ShareCard from '../../ui/ShareCard';

function getScoreTier(score: number, total: number): string {
  const pct = Math.round((score / total) * 100);
  if (pct === 100) return 'Prompt Psychic';
  if (pct >= 80) return 'Prompt Detective';
  if (pct >= 60) return 'Prompt Reader';
  if (pct >= 40) return 'Prompt Spotter';
  return 'Prompt Rookie';
}

export default function GuessThePrompt() {
  const isMobile = useIsMobile();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const challenge = promptChallenges[round];
  const isCorrect = selected === challenge?.correctIndex;
  const totalRounds = promptChallenges.length;

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelected(index);
    setShowResult(true);
    if (index === challenge.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (round + 1 >= totalRounds) {
      setGameOver(true);
    } else {
      setRound((r) => r + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    setRound(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setGameOver(false);
  };

  if (gameOver) {
    const pct = Math.round((score / totalRounds) * 100);
    const tier = getScoreTier(score, totalRounds);
    const message = pct >= 80 ? "You've got serious prompt intuition." : pct >= 60 ? "Good eye! You're learning to read between the lines." : "The gap between vague and precise is tricky. That's exactly why this matters.";

    return (
      <div className="widget-container">
        <div style={{ padding: isMobile ? '2rem 1rem' : '3rem 2rem', textAlign: 'center' as const }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '2.25rem' : '3rem', fontWeight: 800, color: '#E94560', marginBottom: '0.5rem' }}>
            {score}/{totalRounds}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: '#1A1A2E', marginBottom: '0.5rem' }}>{message}</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#6B7280', marginBottom: '1.5rem' }}>
            The skill isn't memorizing prompts — it's recognizing what makes one <em>specific enough</em> to produce great output.
          </p>

          <div style={{ maxWidth: 400, margin: '0 auto 1.5rem', textAlign: 'left' as const }}>
            <ShareCard
              title={tier}
              metric={`${score}/${totalRounds}`}
              metricColor="#E94560"
              subtitle={message}
              accentColor="#7B61FF"
              tweetText={`I scored ${score}/${totalRounds} on Guess The Prompt \u2014 can you reverse-engineer AI output back to its prompt? \u{1F50D} ${tier}`}
              shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/ch1#guess-the-prompt` : undefined}
            />
          </div>

          <button
            onClick={handleRestart}
            style={{
              fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600,
              padding: '0.7rem 2rem', minHeight: 44, borderRadius: 100, border: 'none', cursor: 'pointer',
              background: '#1A1A2E', color: '#FAF8F5', transition: 'all 0.25s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: isMobile ? '0.5rem' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7B61FF, #7B61FF80)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>Guess the Prompt</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Which prompt produced this output?</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280' }}>
            {round + 1} / {totalRounds}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: '#16C79A' }}>
            {score} pts
          </span>
        </div>
      </div>

      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem 2rem' }}>
        {/* Output display */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#7B61FF', display: 'block', marginBottom: 8 }}>
            AI Output — {challenge.outputType}
          </span>
          <div style={{
            background: 'rgba(26,26,46,0.025)', border: '1px solid rgba(26,26,46,0.06)', borderRadius: 10,
            padding: isMobile ? '1rem' : '1.25rem 1.5rem', fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.75rem' : '0.8rem', lineHeight: 1.7,
            whiteSpace: 'pre-wrap' as const, maxHeight: isMobile ? '30dvh' : '35dvh', overflowY: 'auto' as const, color: '#1A1A2E',
            WebkitOverflowScrolling: 'touch' as any,
          }}>
            {challenge.output}
          </div>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8, marginBottom: '1.5rem' }}>
          {challenge.options.map((option, i) => {
            const isThisCorrect = i === challenge.correctIndex;
            const isThisSelected = i === selected;
            let bg = 'transparent';
            let borderColor = 'rgba(26,26,46,0.08)';
            let textColor = '#1A1A2E';

            if (showResult) {
              if (isThisCorrect) { bg = 'rgba(22,199,154,0.08)'; borderColor = '#16C79A'; }
              else if (isThisSelected && !isThisCorrect) { bg = 'rgba(233,69,96,0.06)'; borderColor = '#E94560'; textColor = '#E94560'; }
              else { textColor = '#6B728080'; }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showResult}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: isMobile ? 10 : 12, padding: isMobile ? '12px' : '12px 16px',
                  minHeight: 44,
                  borderRadius: 10, border: `1px solid ${borderColor}`, background: bg,
                  cursor: showResult ? 'default' : 'pointer', textAlign: 'left' as const,
                  transition: 'all 0.25s', color: textColor, opacity: showResult && !isThisCorrect && !isThisSelected ? 0.5 : 1,
                }}
                onMouseEnter={(e) => !showResult && (e.currentTarget.style.borderColor = '#7B61FF40')}
                onMouseLeave={(e) => !showResult && (e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)')}
              >
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                  width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: showResult && isThisCorrect ? '#16C79A' : showResult && isThisSelected ? '#E94560' : 'rgba(26,26,46,0.06)',
                  color: showResult && (isThisCorrect || isThisSelected) ? 'white' : '#6B7280',
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.8rem' : '0.85rem', lineHeight: 1.5 }}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showResult && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(123,97,255,0.04), rgba(22,199,154,0.04))',
            border: '1px solid rgba(123,97,255,0.12)', borderRadius: 10, padding: isMobile ? '1rem' : '1.25rem 1.5rem', marginBottom: '1rem',
          }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700, color: isCorrect ? '#16C79A' : '#E94560', marginBottom: 6 }}>
              {isCorrect ? 'Correct!' : 'Not quite.'}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.65, color: '#1A1A2E', margin: 0 }}>
              {challenge.explanation}
            </p>
          </div>
        )}

        {showResult && (
          <div style={{ textAlign: 'right' as const }}>
            <button
              onClick={handleNext}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                padding: '0.6rem 1.5rem', minHeight: 44, borderRadius: 100, border: 'none', cursor: 'pointer',
                background: '#1A1A2E', color: '#FAF8F5', transition: 'all 0.25s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {round + 1 >= totalRounds ? 'See Results' : 'Next Round'} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
