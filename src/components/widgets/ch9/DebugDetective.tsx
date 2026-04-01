import { useState } from 'react';
import { debugScenarios } from '../../../data/debug-scenarios';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import BottomSheet from '../../cards/BottomSheet';

type Quality = 'best' | 'okay' | 'poor';

const ACCENT = '#E94560';
const TEAL = '#16C79A';
const AMBER = '#F5A623';
const DEEP = '#1A1A2E';
const SUBTLE = '#6B7280';
const CREAM = '#FAF8F5';

const QUALITY_COLORS: Record<Quality, string> = {
  best: TEAL,
  okay: AMBER,
  poor: ACCENT,
};

const QUALITY_LABELS: Record<Quality, string> = {
  best: 'Best approach',
  okay: 'Okay approach',
  poor: 'Poor approach',
};

const POINTS: Record<Quality, number> = {
  best: 3,
  okay: 2,
  poor: 1,
};

function getFeedback(score: number) {
  if (score >= 13) return 'Bug whisperer. You know exactly how to talk to a coding agent.';
  if (score >= 10) return 'Solid instincts. You\'ll get fixes fast with a little more specificity.';
  if (score >= 7) return 'Room to grow. The key insight: describe what you SEE, not what you think is broken.';
  return 'You\'ll get there! Remember: the agent is the expert. Your job is to describe the problem clearly.';
}

/* ──────────────────────────────────────────────────────────────
   Visual mockups — CSS-rendered "screenshots" of broken apps
   ────────────────────────────────────────────────────────────── */

function MockupBrokenLayout() {
  return (
    <div style={{
      background: '#fff', borderRadius: 8, padding: 16, fontFamily: 'var(--font-body)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700,
        color: DEEP, marginBottom: 8,
      }}>
        Create Account
      </div>
      <div style={{
        height: 6, background: 'rgba(26,26,46,0.08)', borderRadius: 3, marginBottom: 6, width: '80%',
      }} />
      <div style={{
        height: 28, background: 'rgba(26,26,46,0.05)', border: '1px solid rgba(26,26,46,0.1)',
        borderRadius: 4, marginBottom: 6,
      }} />
      <div style={{
        height: 28, background: 'rgba(26,26,46,0.05)', border: '1px solid rgba(26,26,46,0.1)',
        borderRadius: 4, marginBottom: 10,
      }} />
      <div style={{
        padding: '6px 16px', background: ACCENT, color: '#fff',
        borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, textAlign: 'center' as const,
        fontFamily: 'var(--font-mono)', opacity: 0.5,
        position: 'relative', left: 20, transform: 'translateY(4px)',
        border: `2px dashed ${ACCENT}`,
      }}>
        Submit
        <span style={{
          position: 'absolute', top: -16, right: -8, fontSize: '0.6rem',
          color: ACCENT, fontWeight: 700, fontFamily: 'var(--font-mono)',
          background: 'rgba(233,69,96,0.1)', padding: '1px 5px', borderRadius: 3,
        }}>
          no response
        </span>
      </div>
    </div>
  );
}

function MockupWrongData() {
  const items = [
    { text: 'Buy groceries', done: true, ok: true },
    { text: 'Call dentist', done: true, ok: false },
    { text: '???', done: false, ok: false },
    { text: 'Finish homework', done: false, ok: true },
    { text: 'Walk the dog', done: true, ok: false },
  ];
  return (
    <div style={{
      background: '#fff', borderRadius: 8, padding: 16, fontFamily: 'var(--font-body)',
    }}>
      <div style={{
        fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700,
        color: DEEP, marginBottom: 10,
      }}>
        My To-Dos
      </div>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 0', borderBottom: i < items.length - 1 ? '1px solid rgba(26,26,46,0.06)' : 'none',
        }}>
          <div style={{
            width: 14, height: 14, borderRadius: 3, flexShrink: 0,
            border: `1.5px solid ${item.done ? (item.ok ? TEAL : ACCENT) : 'rgba(26,26,46,0.2)'}`,
            background: item.done ? (item.ok ? `${TEAL}18` : `${ACCENT}18`) : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {item.done && (
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke={item.ok ? TEAL : ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span style={{
            fontSize: '0.72rem', color: item.ok ? DEEP : ACCENT,
            textDecoration: !item.ok && item.done ? 'line-through' : 'none',
            fontStyle: item.text === '???' ? 'italic' : 'normal',
            opacity: item.ok ? 1 : 0.7,
          }}>
            {item.text}
          </span>
          {!item.ok && (
            <span style={{
              fontSize: '0.55rem', fontFamily: 'var(--font-mono)', color: ACCENT,
              background: `${ACCENT}12`, padding: '1px 4px', borderRadius: 2, marginLeft: 'auto',
            }}>
              {item.text === '???' ? 'missing' : 'deleted?'}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function MockupDeployError() {
  return (
    <div style={{
      background: '#0D1117', borderRadius: 8, padding: 14, fontFamily: 'var(--font-mono)',
      fontSize: '0.65rem', lineHeight: 1.7, color: '#8B949E',
    }}>
      <div style={{ color: '#58A6FF', marginBottom: 2 }}>$ vercel --prod</div>
      <div style={{ color: '#8B949E' }}>Deploying... done.</div>
      <div style={{ color: '#8B949E', marginBottom: 6 }}>Build completed successfully.</div>
      <div style={{
        color: '#F85149', fontWeight: 700, padding: '6px 10px', marginBottom: 4,
        background: 'rgba(248,81,73,0.08)', borderRadius: 4, border: '1px solid rgba(248,81,73,0.2)',
      }}>
        Application Error
      </div>
      <div style={{ color: '#F85149', opacity: 0.8 }}>ReferenceError: process is not defined</div>
      <div style={{ color: '#484F58', fontSize: '0.58rem' }}>    at Object.&lt;anonymous&gt; (index-a3f2c.js:1:2847)</div>
      <div style={{ color: '#484F58', fontSize: '0.58rem' }}>    at Module._compile (module.js:652:30)</div>
    </div>
  );
}

function MockupUglyOutput() {
  return (
    <div style={{
      background: '#7B2D8E', borderRadius: 8, padding: 16,
      fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
      color: '#39FF14', border: '3px solid #FF00FF',
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 900, marginBottom: 6, color: '#FFFF00', textShadow: '1px 1px 0 #000' }}>
        My Portfolio
      </div>
      <div style={{ fontSize: '0.65rem', lineHeight: 1.5, marginBottom: 8 }}>
        Welcome to my amazing website! I am a developer and I make cool things.
      </div>
      <div style={{
        display: 'flex', gap: 6,
      }}>
        <div style={{
          padding: '4px 10px', fontSize: '0.6rem', fontWeight: 700,
          background: '#FF4500', color: '#00FFFF', borderRadius: 2, border: '1px solid #FFFF00',
        }}>Projects</div>
        <div style={{
          padding: '4px 10px', fontSize: '0.6rem', fontWeight: 700,
          background: '#00FF00', color: '#FF00FF', borderRadius: 2, border: '1px solid #00FFFF',
        }}>Contact</div>
      </div>
    </div>
  );
}

function MockupMissingFeature() {
  return (
    <div style={{
      background: '#fff', borderRadius: 8, padding: 16, fontFamily: 'var(--font-body)',
    }}>
      <div style={{
        fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700,
        color: DEEP, marginBottom: 10,
      }}>
        Landing Page
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, height: 24, background: 'rgba(26,26,46,0.06)', borderRadius: 3 }} />
        <div style={{ flex: 1, height: 24, background: 'rgba(26,26,46,0.06)', borderRadius: 3 }} />
      </div>
      <div style={{ height: 6, background: 'rgba(26,26,46,0.08)', borderRadius: 3, width: '90%', marginBottom: 4 }} />
      <div style={{ height: 6, background: 'rgba(26,26,46,0.08)', borderRadius: 3, width: '70%', marginBottom: 12 }} />
      <div style={{
        border: `2px dashed ${SUBTLE}`, borderRadius: 6, padding: '14px 16px',
        textAlign: 'center' as const, color: SUBTLE,
        fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
        background: 'rgba(107,114,128,0.04)',
      }}>
        ??? missing ???
      </div>
    </div>
  );
}

function Mockup({ visual }: { visual: string }) {
  const inner = (() => {
    switch (visual) {
      case 'broken-layout': return <MockupBrokenLayout />;
      case 'wrong-data': return <MockupWrongData />;
      case 'deploy-error': return <MockupDeployError />;
      case 'ugly-output': return <MockupUglyOutput />;
      case 'missing-feature': return <MockupMissingFeature />;
      default: return <MockupBrokenLayout />;
    }
  })();

  return (
    <div style={{
      borderRadius: 10, overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(26,26,46,0.08), 0 1px 3px rgba(26,26,46,0.06)',
      border: '1px solid rgba(26,26,46,0.08)',
    }}>
      {/* Window chrome */}
      <div style={{
        background: 'rgba(26,26,46,0.04)', padding: '6px 10px',
        display: 'flex', alignItems: 'center', gap: 5,
        borderBottom: '1px solid rgba(26,26,46,0.06)',
      }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF5F57' }} />
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFBD2E' }} />
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#28C840' }} />
        <div style={{
          marginLeft: 8, flex: 1, height: 14, background: 'rgba(26,26,46,0.04)',
          borderRadius: 3, maxWidth: 140,
        }} />
      </div>
      {inner}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Rounds-to-fix indicator
   ────────────────────────────────────────────────────────────── */

function RoundsIndicator({ rounds }: { rounds: number }) {
  const color = rounds <= 1 ? TEAL : rounds <= 3 ? AMBER : ACCENT;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 600,
        color: SUBTLE, textTransform: 'uppercase' as const, letterSpacing: '0.06em',
      }}>
        Rounds to fix:
      </span>
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {Array.from({ length: rounds }).map((_, i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: 3, background: color,
            opacity: 0.2 + (0.8 * (i + 1) / rounds),
            animation: `dd-popIn 0.25s ease both ${0.05 * i}s`,
          }} />
        ))}
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color,
      }}>
        {rounds}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Response reveal card
   ────────────────────────────────────────────────────────────── */

function ResponseReveal({ response, isSelected, index }: {
  response: { label: string; quality: Quality; message: string; agentReaction: string; rounds: number };
  isSelected: boolean;
  index: number;
}) {
  const color = QUALITY_COLORS[response.quality];
  return (
    <div style={{
      border: `2px solid ${isSelected ? color : 'rgba(26,26,46,0.08)'}`,
      borderRadius: 10, padding: '1rem 1.15rem',
      background: isSelected ? `${color}08` : 'rgba(26,26,46,0.015)',
      animation: `dd-slideUp 0.35s ease both ${0.08 * index}s`,
      transition: 'border-color 0.3s, background 0.3s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          padding: '2px 8px', borderRadius: 100, fontSize: '0.65rem',
          fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.04em',
          background: `${color}18`, color,
          textTransform: 'uppercase' as const,
        }}>
          {QUALITY_LABELS[response.quality]}
        </div>
        {isSelected && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: SUBTLE,
            fontStyle: 'italic',
          }}>
            Your choice
          </span>
        )}
      </div>

      {/* Label */}
      <div style={{
        fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 700,
        color: DEEP, marginBottom: 8,
      }}>
        {response.label}
      </div>

      {/* Message quote block */}
      <div style={{
        background: 'rgba(26,26,46,0.03)', borderRadius: 6,
        padding: '0.65rem 0.85rem', marginBottom: 8,
        borderLeft: `3px solid ${color}`,
        fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
        lineHeight: 1.6, color: DEEP,
      }}>
        "{response.message}"
      </div>

      {/* Agent reaction */}
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: '0.82rem',
        lineHeight: 1.65, color: SUBTLE,
      }}>
        <span style={{ fontWeight: 600, color: DEEP }}>Agent:</span>{' '}
        {response.agentReaction}
      </div>

      {/* Rounds indicator */}
      <RoundsIndicator rounds={response.rounds} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Progress bar
   ────────────────────────────────────────────────────────────── */

function ProgressDots({ current, total, results }: {
  current: number; total: number; results: number[];
}) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => {
        const isCompleted = i < current;
        const isCurrent = i === current;
        const score = results[i];
        const dotColor = isCompleted
          ? (score === 3 ? TEAL : score === 2 ? AMBER : ACCENT)
          : isCurrent ? DEEP : 'rgba(26,26,46,0.12)';
        return (
          <div key={i} style={{
            width: isCurrent ? 18 : 7, height: 7, borderRadius: 4,
            background: dotColor, transition: 'all 0.35s ease',
          }} />
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main component
   ────────────────────────────────────────────────────────────── */

export default function DebugDetective() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [roundScores, setRoundScores] = useState<number[]>([]);

  const isMobile = useIsMobile();

  // Mobile BottomSheet states
  const [mobileRevealOpen, setMobileRevealOpen] = useState(false);
  const [mobileGameOverOpen, setMobileGameOverOpen] = useState(false);

  const totalRounds = debugScenarios.length;
  const scenario = debugScenarios[round];
  const answered = selectedIndex !== null;

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelectedIndex(index);
    const quality = scenario.responses[index].quality;
    const pts = POINTS[quality];
    setScore((s) => s + pts);
    setRoundScores((r) => [...r, pts]);
    if (isMobile) {
      setMobileRevealOpen(true);
    }
  };

  const handleNext = () => {
    setMobileRevealOpen(false);
    if (round + 1 >= totalRounds) {
      setGameOver(true);
      if (isMobile) {
        setMobileGameOverOpen(true);
      }
    } else {
      setRound((r) => r + 1);
      setSelectedIndex(null);
    }
  };

  const handleRestart = () => {
    setRound(0);
    setScore(0);
    setSelectedIndex(null);
    setGameOver(false);
    setRoundScores([]);
    setMobileRevealOpen(false);
    setMobileGameOverOpen(false);
  };

  /* ─── Reveal content (shared between desktop inline and mobile BottomSheet) ─── */
  const renderRevealContent = () => (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12, marginBottom: 16 }}>
        {scenario.responses.map((resp, i) => (
          <ResponseReveal
            key={i}
            response={resp}
            isSelected={i === selectedIndex}
            index={i}
          />
        ))}
      </div>
      {/* Lesson callout */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(233,69,96,0.04), rgba(233,69,96,0.08))',
        border: '1px solid rgba(233,69,96,0.12)',
        borderRadius: 10, padding: '1rem 1.15rem', marginBottom: 16,
        animation: 'dd-slideUp 0.4s ease both 0.3s',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
          color: ACCENT, letterSpacing: '0.08em', textTransform: 'uppercase' as const,
          marginBottom: 6,
        }}>
          Lesson
        </div>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.88rem',
          lineHeight: 1.7, color: DEEP, margin: 0,
        }}>
          {scenario.lesson}
        </p>
      </div>
      {/* Next button */}
      <div style={{ textAlign: 'right' as const }}>
        <button
          onClick={handleNext}
          style={{
            fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
            padding: '0.6rem 1.5rem', borderRadius: 100,
            border: 'none', cursor: 'pointer',
            background: DEEP, color: CREAM, transition: 'all 0.25s', minHeight: 44,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {round + 1 >= totalRounds ? 'See Results' : 'Next Scenario'} &rarr;
        </button>
      </div>
    </div>
  );

  /* ─── Score screen content (shared) ─── */
  const renderScoreContent = () => {
    const maxScore = totalRounds * 3;
    const pct = Math.round((score / maxScore) * 100);
    const feedbackColor = score >= 13 ? TEAL : score >= 10 ? AMBER : ACCENT;
    return (
      <div style={{ textAlign: 'center' as const }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontSize: isMobile ? '2.5rem' : '3.5rem',
          fontWeight: 800, color: feedbackColor,
          marginBottom: '0.25rem', lineHeight: 1,
          animation: 'dd-scoreUp 0.5s ease both',
        }}>
          {score}/{maxScore}
        </div>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: SUBTLE,
          letterSpacing: '0.08em', textTransform: 'uppercase' as const,
          marginBottom: '1.25rem',
        }}>
          Bug communication score: {pct}%
        </p>

        {/* Round-by-round dots */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 6, marginBottom: '1.5rem',
        }}>
          {roundScores.map((pts, i) => (
            <div key={i} style={{
              width: 12, height: 12, borderRadius: '50%',
              background: pts === 3 ? TEAL : pts === 2 ? AMBER : ACCENT,
              animation: `dd-popIn 0.3s ease both ${0.06 * i}s`,
            }} />
          ))}
        </div>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.95rem' : '1.05rem',
          color: DEEP, marginBottom: '0.75rem', lineHeight: 1.7,
          maxWidth: '45ch', marginLeft: 'auto', marginRight: 'auto',
        }}>
          {getFeedback(score)}
        </p>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.82rem' : '0.88rem',
          color: SUBTLE, marginBottom: '2rem', lineHeight: 1.65,
          maxWidth: '48ch', marginLeft: 'auto', marginRight: 'auto',
        }}>
          How you describe a bug determines how fast it gets fixed.
          Be specific, share what you see, and let the agent figure out why.
        </p>

        <button
          onClick={handleRestart}
          style={{
            fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600,
            padding: '0.7rem 2rem', borderRadius: 100,
            border: 'none', cursor: 'pointer',
            background: DEEP, color: CREAM, transition: 'all 0.25s', minHeight: 44,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Try Again
        </button>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     MOBILE LAYOUT
     ═══════════════════════════════════════════════════════════ */
  if (isMobile) {
    return (
      <div className="widget-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Compact header */}
        <div style={{
          padding: '0.75rem 1rem', borderBottom: '1px solid rgba(26,26,46,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}80)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: TEAL,
            }}>
              {score} pts
            </span>
          </div>
          <ProgressDots current={round} total={totalRounds} results={roundScores} />
        </div>

        {/* Scrollable content area */}
        <div style={{
          flex: 1, minHeight: 0, overflowY: 'auto', padding: '0.75rem 1rem',
          WebkitOverflowScrolling: 'touch' as any,
        }}>
          {/* Round label */}
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            color: SUBTLE, marginBottom: '0.5rem', textAlign: 'center' as const,
          }}>
            Scenario {round + 1} of {totalRounds}
          </div>

          {/* Scenario title */}
          <div style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700,
            color: DEEP, marginBottom: '0.75rem', textAlign: 'center' as const,
          }}>
            {scenario.title}
          </div>

          {/* Mockup */}
          <div style={{ marginBottom: '0.75rem' }}>
            <Mockup visual={scenario.mockup.visual} />
          </div>

          {/* Bug description */}
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.65,
            color: DEEP, margin: '0 0 1rem', textAlign: 'center' as const,
          }}>
            {scenario.mockup.description}
          </p>

          {/* Question prompt */}
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase' as const,
            color: ACCENT, marginBottom: '0.75rem', textAlign: 'center' as const,
          }}>
            How would you report this bug?
          </div>

          {/* Response options */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8, marginBottom: '1rem' }}>
            {scenario.responses.map((resp, i) => {
              const isChosen = selectedIndex === i;
              const borderColor = answered
                ? (isChosen ? QUALITY_COLORS[resp.quality] : 'rgba(26,26,46,0.06)')
                : 'rgba(26,26,46,0.1)';
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 600,
                    padding: '0.85rem 1rem', borderRadius: 10,
                    border: `2px solid ${borderColor}`,
                    background: answered
                      ? (isChosen ? `${QUALITY_COLORS[resp.quality]}08` : 'rgba(26,26,46,0.02)')
                      : 'rgba(26,26,46,0.02)',
                    color: DEEP, cursor: answered ? 'default' : 'pointer',
                    textAlign: 'left' as const, transition: 'all 0.25s',
                    opacity: answered && !isChosen ? 0.5 : 1,
                    minHeight: 48,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${answered && isChosen ? QUALITY_COLORS[resp.quality] : 'rgba(26,26,46,0.15)'}`,
                    background: answered && isChosen ? `${QUALITY_COLORS[resp.quality]}18` : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.25s',
                  }}>
                    {answered && isChosen && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke={QUALITY_COLORS[resp.quality]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  {resp.label}
                </button>
              );
            })}
          </div>

          {/* Tap to see explanation */}
          {answered && (
            <button
              onClick={() => setMobileRevealOpen(true)}
              style={{
                width: '100%', padding: '0.65rem', borderRadius: 10,
                fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: QUALITY_COLORS[scenario.responses[selectedIndex!].quality],
                color: CREAM, minHeight: 44,
              }}
            >
              See how the agent reacts &rarr;
            </button>
          )}
        </div>

        {/* Reveal BottomSheet */}
        <BottomSheet
          isOpen={mobileRevealOpen}
          onClose={() => setMobileRevealOpen(false)}
          title={scenario.title}
        >
          {renderRevealContent()}
        </BottomSheet>

        {/* Game Over BottomSheet */}
        <BottomSheet
          isOpen={mobileGameOverOpen}
          onClose={() => setMobileGameOverOpen(false)}
          title="Your Score"
        >
          {renderScoreContent()}
        </BottomSheet>

        <style>{`
          @keyframes dd-slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes dd-popIn { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
          @keyframes dd-scoreUp { from { opacity: 0; transform: scale(0.8) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        `}</style>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     DESKTOP — Game Over
     ═══════════════════════════════════════════════════════════ */
  if (gameOver) {
    return (
      <div className="widget-container">
        <div style={{ padding: '3rem 2rem' }}>
          {renderScoreContent()}
        </div>
        <style>{`
          @keyframes dd-popIn { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
          @keyframes dd-scoreUp { from { opacity: 0; transform: scale(0.8) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        `}</style>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     DESKTOP — Active Round
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{
        padding: '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap' as const,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}80)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700,
              margin: 0, lineHeight: 1.3,
            }}>
              Debug Detective
            </h3>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: SUBTLE,
              margin: 0, letterSpacing: '0.05em',
            }}>
              How would you report this bug?
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ProgressDots current={round} total={totalRounds} results={roundScores} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: TEAL,
          }}>
            {score} pts
          </span>
        </div>
      </div>

      <div style={{ padding: '1.75rem 2rem' }}>
        {/* Round indicator */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase' as const,
          color: SUBTLE, marginBottom: '0.75rem',
        }}>
          Scenario {round + 1} of {totalRounds}
        </div>

        {/* Scenario title */}
        <h4 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700,
          color: DEEP, margin: '0 0 1rem',
        }}>
          {scenario.title}
        </h4>

        {/* Two-column: mockup + description */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20,
          marginBottom: '1.5rem', alignItems: 'start',
        }}>
          <Mockup visual={scenario.mockup.visual} />
          <div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.92rem', lineHeight: 1.7,
              color: DEEP, margin: '0 0 0.75rem',
            }}>
              {scenario.mockup.description}
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 100,
              background: `${ACCENT}10`, border: `1px solid ${ACCENT}20`,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                color: ACCENT,
              }}>
                {scenario.mockup.bugDescription}
              </span>
            </div>
          </div>
        </div>

        {/* Response options — before answering */}
        {!answered && (
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase' as const,
              color: ACCENT, marginBottom: '0.75rem',
            }}>
              Choose your approach
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
            }}>
              {scenario.responses.map((resp, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.92rem', fontWeight: 600,
                    padding: '1.15rem 1rem', borderRadius: 10,
                    border: '2px solid rgba(26,26,46,0.1)',
                    background: 'rgba(26,26,46,0.02)', color: DEEP,
                    cursor: 'pointer', transition: 'all 0.25s',
                    textAlign: 'center' as const, minHeight: 48,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = ACCENT;
                    e.currentTarget.style.background = `${ACCENT}06`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(233,69,96,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)';
                    e.currentTarget.style.background = 'rgba(26,26,46,0.02)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {resp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reveal — after answering (desktop inline) */}
        {answered && renderRevealContent()}
      </div>

      <style>{`
        @keyframes dd-slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dd-popIn { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
        @keyframes dd-scoreUp { from { opacity: 0; transform: scale(0.8) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}
