import { useState, useRef, useCallback, useEffect } from 'react';

interface Round {
  task: string;
  answer: string;
  options: string[];
}

const rounds: Round[] = [
  {
    task: 'Remove the background from a product photo',
    answer: 'Image Edit',
    options: ['Image Gen', 'Image Edit', 'Video', 'Research'],
  },
  {
    task: 'Find peer-reviewed studies on sleep and memory',
    answer: 'Research',
    options: ['Research', 'Coding', 'Browser', 'Audio'],
  },
  {
    task: 'Create a 30-second promotional clip from a product image',
    answer: 'Video',
    options: ['Image Gen', 'Video', 'Music', 'Image Edit'],
  },
  {
    task: 'Write and deploy a full-stack web app from a description',
    answer: 'Coding',
    options: ['Coding', 'Browser', 'Research', 'Audio'],
  },
  {
    task: 'Generate a catchy jingle for a school project',
    answer: 'Music',
    options: ['Music', 'Audio', 'Video', 'Image Gen'],
  },
];

const categoryColors: Record<string, string> = {
  'Image Gen': '#E94560',
  'Image Edit': '#F5A623',
  Video: '#7B61FF',
  Music: '#16C79A',
  Audio: '#0F3460',
  Research: '#0EA5E9',
  Browser: '#6B7280',
  Coding: '#E94560',
};

const TOTAL = rounds.length;

export default function ToolSpeedRound() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - elapsed * 1000;
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 200);
  }, [elapsed]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const handleStart = () => {
    setStarted(true);
    startTimer();
  };

  const handlePick = (option: string) => {
    if (picked) return;
    setPicked(option);
    const correct = option === rounds[current].answer;
    if (correct) setScore((s) => s + 1);
    setResults((r) => [...r, correct]);

    // Brief pause then advance
    setTimeout(() => {
      if (current + 1 >= TOTAL) {
        stopTimer();
        setGameOver(true);
      } else {
        setCurrent((c) => c + 1);
        setPicked(null);
      }
    }, 1000);
  };

  const handleRestart = () => {
    setCurrent(0);
    setScore(0);
    setPicked(null);
    setResults([]);
    setGameOver(false);
    setStarted(false);
    setElapsed(0);
    stopTimer();
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const round = rounds[current];
  const isCorrect = picked ? picked === round.answer : null;

  // --- Start screen ---
  if (!started) {
    return (
      <div className="widget-container">
        <style>{animations}</style>
        <div
          style={{
            padding: '2.5rem 2rem',
            textAlign: 'center' as const,
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0EA5E9, #7B61FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                margin: '0 0 0.35rem',
                color: '#1A1A2E',
              }}
            >
              Tool Speed Round
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                color: '#6B7280',
                margin: 0,
                lineHeight: 1.6,
                maxWidth: '38ch',
              }}
            >
              Match each task to the right AI tool category. 5 rounds, timed.
              How fast can you go?
            </p>
          </div>
          <button
            onClick={handleStart}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              fontWeight: 600,
              padding: '0.7rem 2.5rem',
              borderRadius: 100,
              border: 'none',
              cursor: 'pointer',
              background: '#1A1A2E',
              color: '#FAF8F5',
              marginTop: '0.5rem',
              transition: 'all 0.25s',
              minHeight: 44,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = 'scale(1.03)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = 'scale(1)')
            }
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  // --- Game over screen ---
  if (gameOver) {
    const pct = Math.round((score / TOTAL) * 100);
    const message =
      pct === 100
        ? 'Perfect. You know your tools.'
        : pct >= 80
          ? 'Sharp instincts. Almost flawless.'
          : pct >= 60
            ? 'Solid. A couple tricky ones got you.'
            : 'The AI landscape is wide. Now you know where to look.';

    return (
      <div className="widget-container">
        <style>{animations}</style>
        <div
          style={{
            padding: '2.5rem 2rem',
            textAlign: 'center' as const,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '3rem',
              fontWeight: 800,
              color: pct >= 80 ? '#16C79A' : pct >= 60 ? '#F5A623' : '#E94560',
              marginBottom: '0.25rem',
              lineHeight: 1,
              animation: 'tsr-scoreUp 0.5s ease both',
            }}
          >
            {score}/{TOTAL}
          </div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#6B7280',
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              marginBottom: '0.5rem',
            }}
          >
            Time: {formatTime(elapsed)}
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
                  background: correct ? '#16C79A' : '#E94560',
                }}
              />
            ))}
          </div>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: '#1A1A2E',
              margin: '0 auto 1.5rem',
              lineHeight: 1.7,
              maxWidth: '40ch',
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
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // --- Active game ---
  return (
    <div className="widget-container">
      <style>{animations}</style>

      {/* Header */}
      <div
        style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(26,26,46,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0EA5E9, #7B61FF)',
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
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Tool Speed Round
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background:
                    i < current
                      ? results[i]
                        ? '#16C79A'
                        : '#E94560'
                      : i === current
                        ? '#1A1A2E'
                        : 'rgba(26,26,46,0.12)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
          {/* Timer */}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#0EA5E9',
              minWidth: 40,
              textAlign: 'right' as const,
            }}
          >
            {formatTime(elapsed)}
          </span>
        </div>
      </div>

      {/* Round content */}
      <div
        key={current}
        style={{
          padding: '1.5rem 1.5rem 1.75rem',
          animation: 'tsr-slideIn 0.3s ease both',
        }}
      >
        {/* Round label */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: '#6B7280',
            marginBottom: '0.75rem',
          }}
        >
          Round {current + 1} of {TOTAL}
        </div>

        {/* Task card */}
        <div
          style={{
            background: 'rgba(26,26,46,0.025)',
            border: '1px solid rgba(26,26,46,0.06)',
            borderRadius: 12,
            padding: '1.25rem 1.5rem',
            marginBottom: '1.25rem',
            transition: 'all 0.4s ease',
            ...(picked
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
              color: '#7B61FF',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#7B61FF',
                animation: !picked ? 'tsr-pulse 2s infinite' : 'none',
              }}
            />
            Task
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.05rem',
              lineHeight: 1.6,
              color: '#1A1A2E',
              margin: 0,
            }}
          >
            {round.task}
          </p>
        </div>

        {/* Category options */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          {round.options.map((option) => {
            const color = categoryColors[option] || '#6B7280';
            const isAnswer = option === round.answer;
            const isThis = option === picked;

            let bg = 'transparent';
            let borderColor = 'rgba(26,26,46,0.1)';
            let textColor = '#1A1A2E';
            let borderW = 1.5;

            if (picked) {
              if (isAnswer) {
                bg = 'rgba(22,199,154,0.1)';
                borderColor = '#16C79A';
                borderW = 2;
              } else if (isThis && !isAnswer) {
                bg = 'rgba(233,69,96,0.08)';
                borderColor = '#E94560';
                borderW = 2;
                textColor = '#E94560';
              } else {
                textColor = '#6B728060';
              }
            }

            return (
              <button
                key={option}
                onClick={() => handlePick(option)}
                disabled={!!picked}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  padding: '0.75rem 1rem',
                  borderRadius: 10,
                  border: `${borderW}px solid ${borderColor}`,
                  background: bg,
                  color: textColor,
                  cursor: picked ? 'default' : 'pointer',
                  transition: 'all 0.25s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  minHeight: 48,
                }}
                onMouseEnter={(e) => {
                  if (!picked) {
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.background = `${color}0A`;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!picked) {
                    e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: picked && !isAnswer && !isThis ? '#6B728030' : color,
                    flexShrink: 0,
                    transition: 'all 0.25s',
                  }}
                />
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback flash */}
        {picked && (
          <div
            style={{
              marginTop: '1rem',
              textAlign: 'center' as const,
              animation: 'tsr-popIn 0.3s ease both',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: isCorrect ? '#16C79A' : '#E94560',
              }}
            >
              {isCorrect ? 'Correct!' : `Nope \u2014 ${round.answer}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const animations = `
  @keyframes tsr-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes tsr-slideIn {
    from { opacity: 0; transform: translateX(12px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes tsr-popIn {
    from { opacity: 0; transform: scale(0.85); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes tsr-scoreUp {
    from { opacity: 0; transform: scale(0.8) translateY(8px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
`;
