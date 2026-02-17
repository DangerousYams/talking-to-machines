import { useState } from 'react';
import { factOrFiction } from '../../../data/fact-or-fiction';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import BottomSheet from '../../cards/BottomSheet';

export default function FactOrFabrication() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const isMobile = useIsMobile();

  const item = factOrFiction[round];
  const totalRounds = factOrFiction.length;
  const isCorrect = userAnswer === item?.isTrue;

  // Mobile BottomSheet states
  const [mobileExplanationOpen, setMobileExplanationOpen] = useState(false);
  const [mobileGameOverOpen, setMobileGameOverOpen] = useState(false);

  const handleAnswer = (answer: boolean) => {
    if (answered) return;
    setUserAnswer(answer);
    setAnswered(true);
    const correct = answer === item.isTrue;
    if (correct) setScore((s) => s + 1);
    setResults((r) => [...r, correct]);
    if (isMobile) {
      setMobileExplanationOpen(true);
    }
  };

  const handleNext = () => {
    setMobileExplanationOpen(false);
    if (round + 1 >= totalRounds) {
      setGameOver(true);
      if (isMobile) {
        setMobileGameOverOpen(true);
      }
    } else {
      setRound((r) => r + 1);
      setAnswered(false);
      setUserAnswer(null);
    }
  };

  const handleRestart = () => {
    setRound(0);
    setScore(0);
    setAnswered(false);
    setUserAnswer(null);
    setGameOver(false);
    setResults([]);
    setMobileExplanationOpen(false);
    setMobileGameOverOpen(false);
  };

  const accent = '#E94560';
  const teal = '#16C79A';

  /* ─── MOBILE LAYOUT ─── */
  if (isMobile) {
    const pct = totalRounds > 0 ? Math.round((score / totalRounds) * 100) : 0;
    const message =
      pct >= 90
        ? "Exceptional. You have a finely tuned BS detector."
        : pct >= 70
          ? "Strong instincts. You caught most of the fabrications."
          : pct >= 50
            ? "Not bad, but AI fooled you more than you'd like. That's exactly why this matters."
            : "AI's confident tone got the better of you. The good news: awareness is the first step to building a better filter.";

    return (
      <div className="widget-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Compact header with progress dots */}
        <div style={{
          padding: '0.75rem 1rem', borderBottom: '1px solid rgba(26,26,46,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              background: `linear-gradient(135deg, ${accent}, ${accent}80)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4M12 17h.01" />
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: teal }}>
              {score} pts
            </span>
          </div>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {Array.from({ length: totalRounds }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i < round
                    ? results[i] ? teal : accent
                    : i === round ? '#1A1A2E' : 'rgba(26,26,46,0.12)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Statement card - centered in available space */}
        <div style={{
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '0.75rem 1rem',
        }}>
          {/* Round indicator */}
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            color: '#6B7280', marginBottom: '0.5rem', textAlign: 'center' as const,
          }}>
            Round {round + 1} of {totalRounds}
            {round >= 7 && <span style={{ color: accent, marginLeft: 6 }}>Hard</span>}
            {round >= 5 && round < 7 && <span style={{ color: '#F5A623', marginLeft: 6 }}>Medium</span>}
          </div>

          <div style={{
            background: 'rgba(26,26,46,0.025)', border: '1px solid rgba(26,26,46,0.06)',
            borderRadius: 12, padding: '1rem',
            transition: 'all 0.4s ease',
            ...(answered ? {
              borderColor: isCorrect ? 'rgba(22,199,154,0.3)' : 'rgba(233,69,96,0.3)',
              background: isCorrect ? 'rgba(22,199,154,0.04)' : 'rgba(233,69,96,0.04)',
            } : {}),
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase' as const,
              color: '#7B61FF', marginBottom: '0.5rem',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%', background: '#7B61FF',
                animation: !answered ? 'pulse 2s infinite' : 'none',
              }} />
              AI Output
            </div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.92rem',
              lineHeight: 1.65, color: '#1A1A2E', margin: 0,
            }}>
              "{item.statement}"
            </p>
            {answered && (
              <div style={{
                marginTop: '0.75rem', padding: '0.3rem 0.7rem', borderRadius: 100,
                display: 'inline-block', fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)', fontWeight: 600,
                background: item.isTrue ? 'rgba(22,199,154,0.12)' : 'rgba(233,69,96,0.12)',
                color: item.isTrue ? teal : accent,
              }}>
                {item.isTrue ? 'TRUE' : 'FABRICATION'}
              </div>
            )}
          </div>
        </div>

        {/* Bottom buttons */}
        <div style={{ padding: '0.6rem 1rem', borderTop: '1px solid rgba(26,26,46,0.06)' }}>
          {!answered ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={() => handleAnswer(true)}
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 600,
                  padding: '0.75rem', borderRadius: 10,
                  border: `2px solid rgba(22,199,154,0.25)`,
                  background: 'rgba(22,199,154,0.04)', color: teal,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 6, minHeight: 48,
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>&#10003;</span> Fact
              </button>
              <button
                onClick={() => handleAnswer(false)}
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 600,
                  padding: '0.75rem', borderRadius: 10,
                  border: `2px solid rgba(233,69,96,0.25)`,
                  background: 'rgba(233,69,96,0.04)', color: accent,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 6, minHeight: 48,
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>&#10007;</span> Fabrication
              </button>
            </div>
          ) : (
            <button
              onClick={() => setMobileExplanationOpen(true)}
              style={{
                width: '100%', padding: '0.65rem', borderRadius: 10,
                fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: isCorrect ? teal : accent, color: '#FAF8F5',
                minHeight: 44,
              }}
            >
              {isCorrect ? 'Correct!' : 'Not quite.'} View explanation
            </button>
          )}
        </div>

        {/* Explanation BottomSheet */}
        <BottomSheet
          isOpen={mobileExplanationOpen}
          onClose={() => setMobileExplanationOpen(false)}
          title={isCorrect ? 'Correct!' : 'Not quite.'}
        >
          <div>
            <div style={{
              padding: '0.85rem', borderRadius: 10, marginBottom: 14,
              background: isCorrect
                ? 'linear-gradient(135deg, rgba(22,199,154,0.04), rgba(22,199,154,0.08))'
                : 'linear-gradient(135deg, rgba(233,69,96,0.04), rgba(233,69,96,0.08))',
              border: `1px solid ${isCorrect ? 'rgba(22,199,154,0.15)' : 'rgba(233,69,96,0.15)'}`,
            }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.88rem',
                lineHeight: 1.7, color: '#1A1A2E', margin: 0,
              }}>
                {item.explanation}
              </p>
              {item.source && (
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                  color: '#6B7280', marginTop: '0.75rem', marginBottom: 0,
                }}>
                  Source: {item.source}
                </p>
              )}
            </div>
            <button
              onClick={handleNext}
              style={{
                width: '100%', padding: '0.65rem', borderRadius: 100,
                fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: '#1A1A2E', color: '#FAF8F5', minHeight: 44,
              }}
            >
              {round + 1 >= totalRounds ? 'See Results' : 'Next Round'} &rarr;
            </button>
          </div>
        </BottomSheet>

        {/* Game Over BottomSheet */}
        <BottomSheet
          isOpen={mobileGameOverOpen}
          onClose={() => setMobileGameOverOpen(false)}
          title="Final Score"
        >
          <div style={{ textAlign: 'center' as const }}>
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: '2.5rem',
              fontWeight: 800, color: pct >= 70 ? teal : accent,
              marginBottom: '0.25rem', lineHeight: 1,
            }}>
              {score}/{totalRounds}
            </div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280',
              letterSpacing: '0.08em', textTransform: 'uppercase' as const,
              marginBottom: '1rem',
            }}>
              Accuracy: {pct}%
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: '1rem' }}>
              {results.map((correct, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: correct ? teal : accent,
                }} />
              ))}
            </div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: '#1A1A2E',
              marginBottom: '0.75rem', lineHeight: 1.7,
            }}>
              {message}
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#6B7280',
              marginBottom: '1.5rem', lineHeight: 1.65,
            }}>
              AI doesn't know what's true. It knows what sounds true. Your verification habit is the only thing standing between you and confidently-stated nonsense.
            </p>
            <button
              onClick={handleRestart}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600,
                padding: '0.7rem 2rem', borderRadius: 100,
                border: 'none', cursor: 'pointer',
                background: '#1A1A2E', color: '#FAF8F5', minHeight: 44,
              }}
            >
              Play Again
            </button>
          </div>
        </BottomSheet>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    );
  }

  /* ─── DESKTOP LAYOUT (unchanged) ─── */

  // Final score screen
  if (gameOver) {
    const pct = Math.round((score / totalRounds) * 100);
    const message =
      pct >= 90
        ? "Exceptional. You have a finely tuned BS detector."
        : pct >= 70
          ? "Strong instincts. You caught most of the fabrications."
          : pct >= 50
            ? "Not bad, but AI fooled you more than you'd like. That's exactly why this matters."
            : "AI's confident tone got the better of you. The good news: awareness is the first step to building a better filter.";

    return (
      <div className="widget-container">
        <div style={{ padding: '3rem 2rem', textAlign: 'center' as const }}>
          {/* Score */}
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '3.5rem',
              fontWeight: 800,
              color: pct >= 70 ? teal : accent,
              marginBottom: '0.25rem',
              lineHeight: 1,
            }}
          >
            {score}/{totalRounds}
          </div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: '#6B7280',
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              marginBottom: '1.5rem',
            }}
          >
            Accuracy: {pct}%
          </p>

          {/* Result dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 6,
              marginBottom: '1.5rem',
            }}
          >
            {results.map((correct, i) => (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: correct ? teal : accent,
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.05rem',
              color: '#1A1A2E',
              marginBottom: '0.75rem',
              maxWidth: '45ch',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.7,
            }}
          >
            {message}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.88rem',
              color: '#6B7280',
              marginBottom: '2rem',
              maxWidth: '48ch',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.65,
            }}
          >
            AI doesn't know what's true. It knows what sounds true. Your verification habit is the only thing standing between you and confidently-stated nonsense.
          </p>

          <button
            onClick={handleRestart}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              fontWeight: 600,
              padding: '0.7rem 2rem',
              borderRadius: 100,
              border: 'none',
              cursor: 'pointer',
              background: '#1A1A2E',
              color: '#FAF8F5',
              transition: 'all 0.25s',
              minHeight: 44,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
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
      <div
        style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(26,26,46,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap' as const,
          gap: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              flexShrink: 0,
              background: `linear-gradient(135deg, ${accent}, ${accent}80)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.1rem',
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Fact or Fabrication?
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: '#6B7280',
                margin: 0,
                letterSpacing: '0.05em',
              }}
            >
              Can you spot what AI gets wrong?
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: totalRounds }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background:
                    i < round
                      ? results[i]
                        ? teal
                        : accent
                      : i === round
                        ? '#1A1A2E'
                        : 'rgba(26,26,46,0.12)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: teal,
            }}
          >
            {score} pts
          </span>
        </div>
      </div>

      <div style={{ padding: '1.75rem 2rem' }}>
        {/* Round indicator */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            color: '#6B7280',
            marginBottom: '0.75rem',
          }}
        >
          Round {round + 1} of {totalRounds}
          {round >= 7 && (
            <span style={{ color: accent, marginLeft: 8 }}>Hard</span>
          )}
          {round >= 5 && round < 7 && (
            <span style={{ color: '#F5A623', marginLeft: 8 }}>Medium</span>
          )}
        </div>

        {/* Statement card */}
        <div
          style={{
            position: 'relative',
            background: 'rgba(26,26,46,0.025)',
            border: '1px solid rgba(26,26,46,0.06)',
            borderRadius: 12,
            padding: '1.75rem 2rem',
            marginBottom: '1.5rem',
            transition: 'all 0.4s ease',
            ...(answered
              ? {
                  borderColor: isCorrect
                    ? 'rgba(22,199,154,0.3)'
                    : 'rgba(233,69,96,0.3)',
                  background: isCorrect
                    ? 'rgba(22,199,154,0.04)'
                    : 'rgba(233,69,96,0.04)',
                }
              : {}),
          }}
        >
          {/* AI output badge */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: '#7B61FF',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#7B61FF',
                animation: !answered ? 'pulse 2s infinite' : 'none',
              }}
            />
            AI Output
          </div>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.1rem',
              lineHeight: 1.7,
              color: '#1A1A2E',
              margin: 0,
            }}
          >
            "{item.statement}"
          </p>

          {/* Truth badge (shown after answering) */}
          {answered && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 100,
                display: 'inline-block',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                background: item.isTrue
                  ? 'rgba(22,199,154,0.12)'
                  : 'rgba(233,69,96,0.12)',
                color: item.isTrue ? teal : accent,
              }}
            >
              {item.isTrue ? 'TRUE' : 'FABRICATION'}
            </div>
          )}
        </div>

        {/* Answer buttons */}
        {!answered && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: '1rem',
            }}
          >
            <button
              onClick={() => handleAnswer(true)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                fontWeight: 600,
                padding: '1rem',
                borderRadius: 12,
                border: `2px solid rgba(22,199,154,0.25)`,
                background: 'rgba(22,199,154,0.04)',
                color: teal,
                cursor: 'pointer',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: 48,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = teal;
                e.currentTarget.style.background = 'rgba(22,199,154,0.08)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(22,199,154,0.25)';
                e.currentTarget.style.background = 'rgba(22,199,154,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>&#10003;</span> Fact
            </button>
            <button
              onClick={() => handleAnswer(false)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                fontWeight: 600,
                padding: '1rem',
                borderRadius: 12,
                border: `2px solid rgba(233,69,96,0.25)`,
                background: 'rgba(233,69,96,0.04)',
                color: accent,
                cursor: 'pointer',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: 48,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = accent;
                e.currentTarget.style.background = 'rgba(233,69,96,0.08)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(233,69,96,0.25)';
                e.currentTarget.style.background = 'rgba(233,69,96,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>&#10007;</span> Fabrication
            </button>
          </div>
        )}

        {/* Result + Explanation */}
        {answered && (
          <>
            <div
              style={{
                background: isCorrect
                  ? 'linear-gradient(135deg, rgba(22,199,154,0.04), rgba(22,199,154,0.08))'
                  : 'linear-gradient(135deg, rgba(233,69,96,0.04), rgba(233,69,96,0.08))',
                border: `1px solid ${isCorrect ? 'rgba(22,199,154,0.15)' : 'rgba(233,69,96,0.15)'}`,
                borderRadius: 10,
                padding: '1.25rem 1.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: isCorrect ? teal : accent,
                  marginBottom: 6,
                }}
              >
                {isCorrect ? 'Correct!' : 'Not quite.'}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem',
                  lineHeight: 1.7,
                  color: '#1A1A2E',
                  margin: 0,
                }}
              >
                {item.explanation}
              </p>
              {item.source && (
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: '#6B7280',
                    marginTop: '0.75rem',
                    marginBottom: 0,
                  }}
                >
                  Source: {item.source}
                </p>
              )}
            </div>

            <div style={{ textAlign: 'right' as const }}>
              <button
                onClick={handleNext}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '0.6rem 1.5rem',
                  borderRadius: 100,
                  border: 'none',
                  cursor: 'pointer',
                  background: '#1A1A2E',
                  color: '#FAF8F5',
                  transition: 'all 0.25s',
                  minHeight: 44,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = 'scale(1.02)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = 'scale(1)')
                }
              >
                {round + 1 >= totalRounds ? 'See Results' : 'Next Round'}{' '}
                &rarr;
              </button>
            </div>
          </>
        )}
      </div>

      {/* Inline pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
