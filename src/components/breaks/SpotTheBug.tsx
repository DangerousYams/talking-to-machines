import { useState } from 'react';

interface Round {
  code: string;
  bug: string;
  options: string[];
  correctIndex: number;
}

const rounds: Round[] = [
  {
    code: `function greet(name) {\n  const message = "Hello, " + Name + "!";\n  return message;\n}`,
    bug: 'Line 2 — `Name` should be `name`. JavaScript is case-sensitive.',
    options: [
      'Line 1: function declaration',
      'Line 2: variable Name',
      'Line 3: return statement',
    ],
    correctIndex: 1,
  },
  {
    code: `const prices = [10, 20, 30];\nlet total = 0;\nfor (let i = 0; i <= prices.length; i++) {\n  total += prices[i];\n}`,
    bug: 'Line 3 — `<=` should be `<`. This is an off-by-one error that accesses an undefined index.',
    options: [
      'Line 1: array declaration',
      'Line 2: total initialization',
      'Line 3: loop condition <=',
    ],
    correctIndex: 2,
  },
  {
    code: `async function fetchUser(id) {\n  const response = fetch(\`/api/users/\${id}\`);\n  const data = await response.json();\n  return data;\n}`,
    bug: 'Line 2 — missing `await` before `fetch()`. Without it, `response` is a Promise, not the actual response.',
    options: [
      'Line 1: async declaration',
      'Line 2: missing await',
      'Line 3: json parsing',
      'Line 4: return',
    ],
    correctIndex: 1,
  },
];

const animStyles = `
  @keyframes stb-slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes stb-popIn {
    from { opacity: 0; transform: scale(0.85); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes stb-scoreUp {
    from { opacity: 0; transform: scale(0.8) translateY(8px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

export default function SpotTheBug() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const current = rounds[round];
  const isCorrect = selected === current?.correctIndex;
  const totalRounds = rounds.length;

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelected(index);
    setShowResult(true);
    if (index === current.correctIndex) {
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

  // Render code with line numbers
  const renderCode = () => {
    const lines = current.code.split('\n');
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #1A1A2E, #0F3460)',
          borderRadius: 10,
          padding: '1rem 0',
          overflowX: 'auto',
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '2px 1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              lineHeight: 1.7,
            }}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.3)',
                width: 28,
                textAlign: 'right' as const,
                marginRight: 16,
                flexShrink: 0,
                userSelect: 'none',
              }}
            >
              {i + 1}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.9)' }}>{line}</span>
          </div>
        ))}
      </div>
    );
  };

  // --- GAME OVER ---
  if (gameOver) {
    const pct = Math.round((score / totalRounds) * 100);
    const message =
      pct === 100
        ? 'Perfect score. You have a sharp eye for bugs.'
        : pct >= 66
          ? 'Nice work! You caught most of the bugs.'
          : 'Bugs are sneaky. The more code you read, the faster you spot them.';

    return (
      <div className="widget-container">
        <style>{animStyles}</style>
        <div style={{ padding: '2.5rem 2rem', textAlign: 'center' as const }}>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#E94560',
              marginBottom: '0.35rem',
              animation: 'stb-scoreUp 0.5s ease both',
            }}
          >
            {score}/{totalRounds}
          </div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: '#7B61FF',
              margin: '0 0 0.5rem',
            }}
          >
            {pct === 100 ? 'Bug Hunter' : pct >= 66 ? 'Bug Spotter' : 'Bug Trainee'}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: '#1A1A2E',
              marginBottom: '1.5rem',
              lineHeight: 1.6,
            }}
          >
            {message}
          </p>
          <button
            onClick={handleRestart}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '0.6rem 1.5rem',
              minHeight: 44,
              borderRadius: 100,
              border: 'none',
              cursor: 'pointer',
              background: '#1A1A2E',
              color: '#FAF8F5',
              transition: 'all 0.25s',
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
              background: 'linear-gradient(135deg, #E94560, #E9456080)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
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
              <path d="M12 8v4M12 16h.01" />
              <circle cx="12" cy="12" r="10" />
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
              Spot the Bug
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: '#6B7280',
                margin: 0,
                letterSpacing: '0.05em',
              }}
            >
              Find the line with the bug
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#6B7280',
            }}
          >
            {round + 1} / {totalRounds}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#16C79A',
            }}
          >
            {score} pts
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        {/* Code block */}
        <div style={{ marginBottom: '1.25rem' }}>{renderCode()}</div>

        {/* Options */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 8,
            marginBottom: '1.25rem',
          }}
        >
          {current.options.map((option, i) => {
            const isThisCorrect = i === current.correctIndex;
            const isThisSelected = i === selected;
            let bg = 'transparent';
            let borderColor = 'rgba(26,26,46,0.08)';
            let textColor = '#1A1A2E';

            if (showResult) {
              if (isThisCorrect) {
                bg = 'rgba(22,199,154,0.08)';
                borderColor = '#16C79A';
              } else if (isThisSelected && !isThisCorrect) {
                bg = 'rgba(233,69,96,0.06)';
                borderColor = '#E94560';
                textColor = '#E94560';
              } else {
                textColor = '#6B728080';
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showResult}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  minHeight: 44,
                  borderRadius: 10,
                  border: `1px solid ${borderColor}`,
                  background: bg,
                  cursor: showResult ? 'default' : 'pointer',
                  textAlign: 'left' as const,
                  transition: 'all 0.25s',
                  color: textColor,
                  opacity:
                    showResult && !isThisCorrect && !isThisSelected ? 0.5 : 1,
                }}
                onMouseEnter={(e) =>
                  !showResult &&
                  (e.currentTarget.style.borderColor = '#E9456040')
                }
                onMouseLeave={(e) =>
                  !showResult &&
                  (e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)')
                }
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background:
                      showResult && isThisCorrect
                        ? '#16C79A'
                        : showResult && isThisSelected
                          ? '#E94560'
                          : 'rgba(26,26,46,0.06)',
                    color:
                      showResult && (isThisCorrect || isThisSelected)
                        ? 'white'
                        : '#6B7280',
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                  }}
                >
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showResult && (
          <div
            style={{
              background:
                'linear-gradient(135deg, rgba(233,69,96,0.04), rgba(22,199,154,0.04))',
              border: '1px solid rgba(233,69,96,0.12)',
              borderRadius: 10,
              padding: '1rem 1.25rem',
              marginBottom: '1rem',
              animation: 'stb-slideUp 0.4s ease both',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: isCorrect ? '#16C79A' : '#E94560',
                marginBottom: 4,
                margin: '0 0 4px 0',
                animation: 'stb-popIn 0.3s ease both 0.15s',
              }}
            >
              {isCorrect ? 'Correct!' : 'Not quite.'}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                lineHeight: 1.65,
                color: '#1A1A2E',
                margin: 0,
              }}
            >
              {current.bug}
            </p>
          </div>
        )}

        {/* Next button */}
        {showResult && (
          <div style={{ textAlign: 'right' as const }}>
            <button
              onClick={handleNext}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '0.6rem 1.5rem',
                minHeight: 44,
                borderRadius: 100,
                border: 'none',
                cursor: 'pointer',
                background: '#1A1A2E',
                color: '#FAF8F5',
                transition: 'all 0.25s',
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
        )}
      </div>
    </div>
  );
}
