import { useState, useMemo } from 'react';

interface Round {
  sentence: string;
  tokens: number;
  explanation: string;
}

const ROUNDS: Round[] = [
  {
    sentence: 'Hello',
    tokens: 1,
    explanation: 'Single common words are usually one token.',
  },
  {
    sentence: 'I love eating pizza on Fridays',
    tokens: 7,
    explanation: 'Most common English words map to one token each.',
  },
  {
    sentence: 'supercalifragilisticexpialidocious',
    tokens: 9,
    explanation: 'Unusual words get split into smaller pieces.',
  },
  {
    sentence: '\u3053\u3093\u306B\u3061\u306F\u4E16\u754C',
    tokens: 5,
    explanation: 'Non-Latin scripts often need more tokens per character.',
  },
  {
    sentence: 'The mitochondria is the powerhouse of the cell',
    tokens: 10,
    explanation:
      "Technical terms like 'mitochondria' get split into sub-word tokens.",
  },
];

function generateOptions(correct: number): number[] {
  const lower = Math.max(1, correct - Math.ceil(Math.random() * 3 + 1));
  let higher = correct + Math.ceil(Math.random() * 3 + 1);
  // Ensure all three values are distinct
  if (lower === correct) {
    higher = correct + 2;
  }
  const options = [correct, lower, higher];
  // Deterministic shuffle using a simple approach
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

const teal = '#16C79A';
const accentRed = '#E94560';
const purple = '#7B61FF';
const deep = '#1A1A2E';
const subtle = '#6B7280';
const amber = '#F5A623';

export default function TokenTetris() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const totalRounds = ROUNDS.length;
  const currentRound = ROUNDS[round];
  const isCorrect = selected === currentRound?.tokens;

  // Generate options once per round using useMemo keyed on round index
  const options = useMemo(() => generateOptions(ROUNDS[round].tokens), [round]);

  const handleSelect = (value: number) => {
    if (answered) return;
    setSelected(value);
    setAnswered(true);
    const correct = value === currentRound.tokens;
    if (correct) setScore((s) => s + 1);
    setResults((r) => [...r, correct]);
  };

  const handleNext = () => {
    if (round + 1 >= totalRounds) {
      setGameOver(true);
    } else {
      setRound((r) => r + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleRestart = () => {
    setRound(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setGameOver(false);
    setResults([]);
  };

  // --- GAME OVER ---
  if (gameOver) {
    const pct = Math.round((score / totalRounds) * 100);
    const message =
      pct === 100
        ? 'Perfect score. You think in tokens.'
        : pct >= 60
          ? 'Nice intuition! Tokenization is tricky and you handled it well.'
          : "Tokenization is weirder than it looks. Now you know why AI doesn't 'see' text the way you do.";

    return (
      <div className="widget-container">
        <style>{animStyles}</style>
        <div style={{ padding: '2.5rem 2rem', textAlign: 'center' as const }}>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '3rem',
              fontWeight: 800,
              color: pct >= 60 ? teal : amber,
              marginBottom: '0.25rem',
              lineHeight: 1,
              animation: 'tt-scoreUp 0.5s ease both',
            }}
          >
            {score}/{totalRounds}
          </div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: subtle,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              marginBottom: '1.25rem',
            }}
          >
            Token Accuracy: {pct}%
          </p>

          {/* Result dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 6,
              marginBottom: '1.25rem',
            }}
          >
            {results.map((correct, i) => (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: correct ? teal : accentRed,
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: deep,
              marginBottom: '1.5rem',
              maxWidth: '42ch',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.7,
            }}
          >
            {message}
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
              background: deep,
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
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // --- ACTIVE GAME ---
  return (
    <div className="widget-container">
      <style>{animStyles}</style>

      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(26,26,46,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              flexShrink: 0,
              background: `linear-gradient(135deg, ${purple}, ${purple}80)`,
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
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <path d="M7 7h4v4H7zM13 7h4v4h-4zM7 13h4v4H7z" />
            </svg>
          </div>
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.05rem',
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Token Tetris
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: subtle,
                margin: 0,
                letterSpacing: '0.05em',
              }}
            >
              How many tokens is this?
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
                        : accentRed
                      : i === round
                        ? deep
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

      <div style={{ padding: '1.5rem' }}>
        {/* Round indicator */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            color: subtle,
            marginBottom: '0.75rem',
          }}
        >
          Round {round + 1} of {totalRounds}
        </div>

        {/* Sentence display */}
        <div
          style={{
            background: 'rgba(26,26,46,0.025)',
            border: '1px solid rgba(26,26,46,0.06)',
            borderRadius: 12,
            padding: '1.25rem 1.5rem',
            marginBottom: '1.25rem',
            textAlign: 'center' as const,
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
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: purple,
              marginBottom: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: purple,
                animation: !answered ? 'tt-pulse 2s infinite' : 'none',
              }}
            />
            Text
          </div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.1rem',
              lineHeight: 1.6,
              color: deep,
              margin: 0,
              wordBreak: 'break-word' as const,
            }}
          >
            &ldquo;{currentRound.sentence}&rdquo;
          </p>

          {/* Show actual token count after answering */}
          {answered && (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 100,
                display: 'inline-block',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                background: 'rgba(123,97,255,0.1)',
                color: purple,
                animation: 'tt-popIn 0.35s ease both',
              }}
            >
              {currentRound.tokens} {currentRound.tokens === 1 ? 'token' : 'tokens'}
            </div>
          )}
        </div>

        {/* Options */}
        {!answered && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 10,
              marginBottom: '1rem',
            }}
          >
            {options.map((value, i) => (
              <button
                key={i}
                onClick={() => handleSelect(value)}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  padding: '1rem 0.5rem',
                  borderRadius: 12,
                  border: '2px solid rgba(26,26,46,0.08)',
                  background: 'transparent',
                  color: deep,
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  gap: 4,
                  minHeight: 48,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${purple}60`;
                  e.currentTarget.style.background = `${purple}08`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {value}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    fontWeight: 500,
                    color: subtle,
                    letterSpacing: '0.05em',
                  }}
                >
                  {value === 1 ? 'token' : 'tokens'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* After answering: show which was selected and explanation */}
        {answered && (
          <>
            {/* Selected vs correct */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 10,
                marginBottom: '1.25rem',
              }}
            >
              {options.map((value, i) => {
                const isThisCorrect = value === currentRound.tokens;
                const isThisSelected = value === selected;
                let bg = 'transparent';
                let borderColor = 'rgba(26,26,46,0.06)';
                let textColor = `${subtle}80`;

                if (isThisCorrect) {
                  bg = 'rgba(22,199,154,0.08)';
                  borderColor = teal;
                  textColor = teal;
                } else if (isThisSelected && !isThisCorrect) {
                  bg = 'rgba(233,69,96,0.06)';
                  borderColor = accentRed;
                  textColor = accentRed;
                }

                return (
                  <div
                    key={i}
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      padding: '1rem 0.5rem',
                      borderRadius: 12,
                      border: `2px solid ${borderColor}`,
                      background: bg,
                      color: textColor,
                      display: 'flex',
                      flexDirection: 'column' as const,
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.3s',
                      opacity:
                        !isThisCorrect && !isThisSelected ? 0.4 : 1,
                    }}
                  >
                    {value}
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {isThisCorrect
                        ? 'correct'
                        : isThisSelected
                          ? 'your pick'
                          : value === 1
                            ? 'token'
                            : 'tokens'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <div
              style={{
                background: isCorrect
                  ? 'linear-gradient(135deg, rgba(22,199,154,0.04), rgba(22,199,154,0.08))'
                  : 'linear-gradient(135deg, rgba(233,69,96,0.04), rgba(233,69,96,0.08))',
                border: `1px solid ${isCorrect ? 'rgba(22,199,154,0.15)' : 'rgba(233,69,96,0.15)'}`,
                borderRadius: 10,
                padding: '1rem 1.25rem',
                marginBottom: '1.25rem',
                animation: 'tt-slideUp 0.4s ease both 0.1s',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: isCorrect ? teal : accentRed,
                  marginBottom: 4,
                  animation: 'tt-popIn 0.3s ease both 0.2s',
                }}
              >
                {isCorrect ? 'Correct!' : 'Not quite.'}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem',
                  lineHeight: 1.65,
                  color: deep,
                  margin: 0,
                }}
              >
                {currentRound.explanation}
              </p>
            </div>

            {/* Next button */}
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
                  background: deep,
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
    </div>
  );
}

const animStyles = `
  @keyframes tt-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes tt-slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes tt-popIn {
    from { opacity: 0; transform: scale(0.7); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes tt-scoreUp {
    from { opacity: 0; transform: scale(0.8) translateY(8px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
`;
