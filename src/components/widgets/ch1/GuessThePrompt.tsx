import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { promptChallenges } from '../../../data/prompt-challenges';
import ShareCard from '../../ui/ShareCard';
import BottomSheet from '../../cards/BottomSheet';

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetContent, setSheetContent] = useState<'output' | 'gameover'>('output');

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
    setSheetOpen(false);
  };

  // --- GAME OVER ---
  if (gameOver) {
    const pct = Math.round((score / totalRounds) * 100);
    const tier = getScoreTier(score, totalRounds);
    const message = pct >= 80 ? "You've got serious prompt intuition." : pct >= 60 ? "Good eye! You're learning to read between the lines." : "The gap between vague and precise is tricky. That's exactly why this matters.";

    if (isMobile) {
      return (
        <div className="widget-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Compact header */}
          <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(26,26,46,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7B61FF, #7B61FF80)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, margin: 0, lineHeight: 1.3, flex: 1 }}>Guess the Prompt</h3>
          </div>

          {/* Score + message */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem 0.75rem' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: '#E94560', marginBottom: '0.25rem' }}>
              {score}/{totalRounds}
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7B61FF', margin: '0 0 0.5rem' }}>{tier}</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#1A1A2E', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>{message}</p>
          </div>

          {/* Buttons */}
          <div style={{ padding: '0 0.75rem 0.75rem', display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => { setSheetContent('gameover'); setSheetOpen(true); }}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600,
                background: '#1A1A2E', color: '#FAF8F5', minHeight: 42,
              }}
            >
              Share &amp; Play Again
            </button>
          </div>

          <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="Results">
            <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'left' as const }}>
              <ShareCard
                title={tier}
                metric={`${score}/${totalRounds}`}
                metricColor="#E94560"
                subtitle={message}
                accentColor="#7B61FF"
                tweetText={`I scored ${score}/${totalRounds} on Guess The Prompt \u2014 can you reverse-engineer AI output back to its prompt? \ud83d\udd0d ${tier}`}
                shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/ch1#guess-the-prompt` : undefined}
              />
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  onClick={handleRestart}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600,
                    padding: '0.7rem 2rem', minHeight: 44, borderRadius: 100, border: 'none', cursor: 'pointer',
                    background: '#1A1A2E', color: '#FAF8F5',
                  }}
                >
                  Play Again
                </button>
              </div>
            </div>
          </BottomSheet>
        </div>
      );
    }

    // Desktop game-over (unchanged)
    return (
      <div className="widget-container">
        <div style={{ padding: '3rem 2rem', textAlign: 'center' as const }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, color: '#E94560', marginBottom: '0.5rem' }}>
            {score}/{totalRounds}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: '#1A1A2E', marginBottom: '0.5rem' }}>{message}</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#6B7280', marginBottom: '1.5rem' }}>
            The skill isn't memorizing prompts &mdash; it's recognizing what makes one <em>specific enough</em> to produce great output.
          </p>

          <div style={{ maxWidth: 400, margin: '0 auto 1.5rem', textAlign: 'left' as const }}>
            <ShareCard
              title={tier}
              metric={`${score}/${totalRounds}`}
              metricColor="#E94560"
              subtitle={message}
              accentColor="#7B61FF"
              tweetText={`I scored ${score}/${totalRounds} on Guess The Prompt \u2014 can you reverse-engineer AI output back to its prompt? \ud83d\udd0d ${tier}`}
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

  // --- ACTIVE GAME ---
  return (
    <div className="widget-container" style={isMobile ? { display: 'flex', flexDirection: 'column', height: '100%' } : undefined}>
      {/* Header */}
      {isMobile ? (
        <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(26,26,46,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7B61FF, #7B61FF80)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, margin: 0, lineHeight: 1.3, flex: 1 }}>Guess the Prompt</h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', flexShrink: 0 }}>
            {round + 1}/{totalRounds}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: '#16C79A', flexShrink: 0 }}>
            {score}pts
          </span>
        </div>
      ) : (
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      )}

      {/* Content */}
      {isMobile ? (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0.5rem 0.75rem' }}>
          {/* Output display - compact, tappable */}
          <div style={{ marginBottom: 8, flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#7B61FF', display: 'block', marginBottom: 4 }}>
              AI Output &mdash; {challenge.outputType}
            </span>
            <div
              onClick={() => { setSheetContent('output'); setSheetOpen(true); }}
              style={{
                background: 'rgba(26,26,46,0.025)', border: '1px solid rgba(26,26,46,0.06)', borderRadius: 10,
                padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', lineHeight: 1.6,
                color: '#1A1A2E', cursor: 'pointer',
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical' as any,
              }}
            >
              {challenge.output}
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#6B7280', marginTop: 2, display: 'block' }}>Tap to read full output</span>
          </div>

          {/* Options - slim rows */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6, flex: 1, overflow: 'hidden' }}>
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
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                    minHeight: 36,
                    borderRadius: 8, border: `1px solid ${borderColor}`, background: bg,
                    cursor: showResult ? 'default' : 'pointer', textAlign: 'left' as const,
                    transition: 'all 0.25s', color: textColor, opacity: showResult && !isThisCorrect && !isThisSelected ? 0.5 : 1,
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
                    width: 20, height: 20, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: showResult && isThisCorrect ? '#16C79A' : showResult && isThisSelected ? '#E94560' : 'rgba(26,26,46,0.06)',
                    color: showResult && (isThisCorrect || isThisSelected) ? 'white' : '#6B7280',
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Explanation + Next (inline compact) */}
          {showResult && (
            <div style={{ flexShrink: 0, marginTop: 8 }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(123,97,255,0.04), rgba(22,199,154,0.04))',
                border: '1px solid rgba(123,97,255,0.12)', borderRadius: 8, padding: '0.5rem 0.75rem', marginBottom: 8,
              }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', fontWeight: 700, color: isCorrect ? '#16C79A' : '#E94560', marginBottom: 2, margin: 0 }}>
                  {isCorrect ? 'Correct!' : 'Not quite.'}
                </p>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.78rem', lineHeight: 1.5, color: '#1A1A2E', margin: 0,
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any,
                }}>
                  {challenge.explanation}
                </p>
              </div>
              <button
                onClick={handleNext}
                style={{
                  width: '100%', padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600,
                  background: '#1A1A2E', color: '#FAF8F5', minHeight: 42,
                }}
              >
                {round + 1 >= totalRounds ? 'See Results' : 'Next Round'} &rarr;
              </button>
            </div>
          )}

          {/* BottomSheet for full output */}
          <BottomSheet
            isOpen={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title={sheetContent === 'output' ? `AI Output \u2014 ${challenge.outputType}` : 'Results'}
          >
            {sheetContent === 'output' ? (
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 1.7,
                whiteSpace: 'pre-wrap' as const, color: '#1A1A2E',
              }}>
                {challenge.output}
              </div>
            ) : null}
          </BottomSheet>
        </div>
      ) : (
        /* Desktop layout (unchanged) */
        <div style={{ padding: '1.5rem 2rem' }}>
          {/* Output display */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#7B61FF', display: 'block', marginBottom: 8 }}>
              AI Output &mdash; {challenge.outputType}
            </span>
            <div style={{
              background: 'rgba(26,26,46,0.025)', border: '1px solid rgba(26,26,46,0.06)', borderRadius: 10,
              padding: '1.25rem 1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: 1.7,
              whiteSpace: 'pre-wrap' as const, maxHeight: '35dvh', overflowY: 'auto' as const, color: '#1A1A2E',
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
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px',
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
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.5 }}>
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
              border: '1px solid rgba(123,97,255,0.12)', borderRadius: 10, padding: '1.25rem 1.5rem', marginBottom: '1rem',
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
                {round + 1 >= totalRounds ? 'See Results' : 'Next Round'} &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
