import { useState } from 'react';

type Round = {
  description: string;
  isAgent: boolean;
  explanation: string;
};

const rounds: Round[] = [
  {
    description:
      'You ask it to plan a trip. It searches for flights, compares prices, checks your calendar for conflicts, and books the cheapest option.',
    isAgent: true,
    explanation:
      'It used multiple tools, made decisions, and took actions across systems \u2014 that\u2019s an agent.',
  },
  {
    description:
      'You ask "What\u2019s the capital of France?" and it says "Paris."',
    isAgent: false,
    explanation:
      'Single question, single answer, no tools, no planning \u2014 classic chatbot.',
  },
  {
    description:
      'You say "Fix the bug in my code." It reads the file, runs the tests, identifies the error, writes a fix, and re-runs the tests to verify.',
    isAgent: true,
    explanation:
      'It followed a plan with multiple steps, used tools (file read, test runner), and verified its own work.',
  },
  {
    description:
      'You paste an article and ask "Summarize this in 3 bullet points." It gives you 3 bullet points.',
    isAgent: false,
    explanation:
      'It processed your input and generated output, but it didn\u2019t use tools, plan steps, or take actions.',
  },
];

const purple = '#7B61FF';
const navy = '#0F3460';
const teal = '#16C79A';
const red = '#E94560';
const deep = '#1A1A2E';
const subtle = '#6B7280';

export default function AgentOrNot() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const totalRounds = rounds.length;
  const item = rounds[round];
  const isCorrect = userAnswer === item?.isAgent;

  const handleAnswer = (pickedAgent: boolean) => {
    if (answered) return;
    setUserAnswer(pickedAgent);
    setAnswered(true);
    const correct = pickedAgent === item.isAgent;
    if (correct) setScore((s) => s + 1);
    setResults((r) => [...r, correct]);
  };

  const handleNext = () => {
    if (round + 1 >= totalRounds) {
      setGameOver(true);
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
  };

  // --- GAME OVER ---
  if (gameOver) {
    const pct = Math.round((score / totalRounds) * 100);
    const message =
      pct === 100
        ? 'You nailed every one. You know exactly what makes an agent tick.'
        : pct >= 75
          ? 'Strong instincts. You can tell when AI is just talking vs. actually doing.'
          : pct >= 50
            ? 'Not bad \u2014 the line between chatbot and agent is blurrier than it looks.'
            : 'Tricky, right? The difference comes down to tools, planning, and action.';

    return (
      <div className="widget-container">
        <style>{animStyles}</style>
        <div style={{ padding: '2.5rem 2rem', textAlign: 'center' as const }}>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '3rem',
              fontWeight: 800,
              color: pct >= 75 ? teal : red,
              marginBottom: '0.25rem',
              lineHeight: 1,
              animation: 'aon-scoreUp 0.5s ease both',
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
            Accuracy: {pct}%
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
                  background: correct ? teal : red,
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
              <path d="M12 2a4 4 0 014 4v2H8V6a4 4 0 014-4z" />
              <rect x="4" y="8" width="16" height="12" rx="2" />
              <circle cx="9" cy="14" r="1.5" />
              <circle cx="15" cy="14" r="1.5" />
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
              Agent or Not?
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
              Can you spot a real agent?
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
                        : red
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

      {/* Body */}
      <div style={{ padding: '1.5rem' }}>
        {/* Round indicator */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            color: subtle,
            marginBottom: '0.75rem',
          }}
        >
          Round {round + 1} of {totalRounds}
        </div>

        {/* Scenario card */}
        <div
          style={{
            background: 'rgba(26,26,46,0.025)',
            border: '1px solid rgba(26,26,46,0.06)',
            borderRadius: 12,
            padding: '1.5rem',
            marginBottom: '1.25rem',
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
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: purple,
              marginBottom: '0.6rem',
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
                background: purple,
                animation: !answered ? 'aon-pulse 2s infinite' : 'none',
              }}
            />
            Scenario
          </div>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: deep,
              margin: 0,
            }}
          >
            {item.description}
          </p>

          {/* Verdict badge after answering */}
          {answered && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 100,
                display: 'inline-block',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                background: item.isAgent
                  ? 'rgba(123,97,255,0.12)'
                  : 'rgba(15,52,96,0.12)',
                color: item.isAgent ? purple : navy,
                animation: 'aon-popIn 0.35s ease both',
              }}
            >
              {item.isAgent ? 'AGENT' : 'CHATBOT'}
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
                border: `2px solid rgba(123,97,255,0.25)`,
                background: 'rgba(123,97,255,0.04)',
                color: purple,
                cursor: 'pointer',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: 48,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = purple;
                e.currentTarget.style.background = 'rgba(123,97,255,0.08)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(123,97,255,0.25)';
                e.currentTarget.style.background = 'rgba(123,97,255,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Agent
            </button>
            <button
              onClick={() => handleAnswer(false)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                fontWeight: 600,
                padding: '1rem',
                borderRadius: 12,
                border: `2px solid rgba(15,52,96,0.25)`,
                background: 'rgba(15,52,96,0.04)',
                color: navy,
                cursor: 'pointer',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: 48,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = navy;
                e.currentTarget.style.background = 'rgba(15,52,96,0.08)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(15,52,96,0.25)';
                e.currentTarget.style.background = 'rgba(15,52,96,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Just a Chatbot
            </button>
          </div>
        )}

        {/* Explanation after answering */}
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
                animation: 'aon-slideUp 0.4s ease both 0.15s',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: isCorrect ? teal : red,
                  marginBottom: 6,
                  animation: 'aon-popIn 0.3s ease both 0.25s',
                }}
              >
                {isCorrect ? 'Correct!' : 'Not quite.'}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem',
                  lineHeight: 1.7,
                  color: deep,
                  margin: 0,
                }}
              >
                {item.explanation}
              </p>
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
  @keyframes aon-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes aon-slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes aon-popIn {
    from { opacity: 0; transform: scale(0.7); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes aon-scoreUp {
    from { opacity: 0; transform: scale(0.8) translateY(8px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
`;
