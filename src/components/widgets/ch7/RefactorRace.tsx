import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';

const messyCode = `function d(a,b) {
  let r = [];
  for(let i=0;i<a.length;i++) {
    if(a[i].x > b) {
      r.push({n: a[i].n, v: a[i].x});
    }
  }
  for(let i=0;i<r.length-1;i++) {
    for(let j=0;j<r.length-i-1;j++) {
      if(r[j].v < r[j+1].v) {
        let t=r[j];
        r[j]=r[j+1];
        r[j+1]=t;
      }
    }
  }
  return r;
}`;

const refactoredSteps = [
  { text: `/**
 * Filters items above a threshold and sorts
 * them by value in descending order.
 */`, delay: 800 },
  { text: `
interface Item {
  n: string;
  x: number;
}

interface RankedItem {
  name: string;
  value: number;
}`, delay: 1200 },
  { text: `
function filterAndRankItems(
  items: Item[],
  threshold: number,
): RankedItem[] {`, delay: 1000 },
  { text: `
  // Step 1: Keep only items above the threshold
  const filtered = items
    .filter((item) => item.x > threshold)
    .map((item) => ({
      name: item.n,
      value: item.x,
    }));`, delay: 1500 },
  { text: `
  // Step 2: Sort by value, highest first
  return filtered.sort(
    (a, b) => b.value - a.value
  );
}`, delay: 1000 },
];

const finalRefactored = `/**
 * Filters items above a threshold and sorts
 * them by value in descending order.
 */

interface Item {
  n: string;
  x: number;
}

interface RankedItem {
  name: string;
  value: number;
}

function filterAndRankItems(
  items: Item[],
  threshold: number,
): RankedItem[] {

  // Step 1: Keep only items above the threshold
  const filtered = items
    .filter((item) => item.x > threshold)
    .map((item) => ({
      name: item.n,
      value: item.x,
    }));

  // Step 2: Sort by value, highest first
  return filtered.sort(
    (a, b) => b.value - a.value
  );
}`;

export default function RefactorRace() {
  const [phase, setPhase] = useState<'ready' | 'racing' | 'done'>('ready');
  const [userCode, setUserCode] = useState(messyCode);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiText, setAiText] = useState('');
  const [timer, setTimer] = useState(0);
  const [userTime, setUserTime] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useIsMobile();

  // Timer
  useEffect(() => {
    if (phase === 'racing') {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 100);
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // AI refactoring animation
  useEffect(() => {
    if (phase !== 'racing') return;

    let stepIndex = 0;
    let accumulated = '';

    const runStep = () => {
      if (stepIndex >= refactoredSteps.length) {
        setAiProgress(100);
        // Auto-finish: check if user already clicked Done
        if (!userTime) {
          // AI finishes at around 5.5 seconds total
        }
        return;
      }

      const step = refactoredSteps[stepIndex];
      accumulated += step.text;
      setAiText(accumulated);
      setAiProgress(Math.round(((stepIndex + 1) / refactoredSteps.length) * 100));
      stepIndex++;

      aiTimerRef.current = setTimeout(runStep, step.delay);
    };

    aiTimerRef.current = setTimeout(runStep, 600);

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [phase]);

  const startRace = () => {
    setPhase('racing');
    setTimer(0);
    setAiProgress(0);
    setAiText('');
    setUserTime(null);
    setUserCode(messyCode);
  };

  const userDone = () => {
    setUserTime(timer);
    if (aiProgress >= 100) {
      finishRace();
    }
  };

  // Watch for both sides finishing
  useEffect(() => {
    if (aiProgress >= 100 && userTime !== null) {
      finishRace();
    }
  }, [aiProgress, userTime]);

  // Also auto-finish the race if AI is done and user hasn't clicked done within 15s
  useEffect(() => {
    if (aiProgress >= 100 && phase === 'racing' && userTime === null) {
      const autoFinish = setTimeout(() => {
        setUserTime(timer);
        finishRace();
      }, 15000);
      return () => clearTimeout(autoFinish);
    }
  }, [aiProgress, phase, userTime, timer]);

  const finishRace = () => {
    setPhase('done');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const reset = () => {
    setPhase('ready');
    setTimer(0);
    setAiProgress(0);
    setAiText('');
    setUserTime(null);
    setUserCode(messyCode);
    if (timerRef.current) clearInterval(timerRef.current);
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${s}.${tenths}s`;
  };

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '1.25rem 1rem 0' : '1.5rem 2rem 0', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.25rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7B61FF, #7B61FF80)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>Refactor Race</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>You vs. Claude Code -- clean up this messy function</p>
          </div>
          {/* Timer */}
          {phase !== 'ready' && (
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: phase === 'racing' ? '#7B61FF' : '#6B7280',
              minWidth: 60,
              textAlign: 'right',
            }}>
              {formatTime(timer)}
            </div>
          )}
        </div>
      </div>

      {phase === 'ready' && (
        <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            color: '#1A1A2E',
            lineHeight: 1.75,
            marginBottom: '1rem',
            maxWidth: '55ch',
          }}>
            Below is a function with cryptic variable names, no types, and a hand-written bubble sort. Your job: refactor it into something readable. Claude Code will be doing the same thing beside you.
          </p>

          {/* Messy code preview */}
          <div style={{
            background: '#1A1A2E',
            borderRadius: 10,
            padding: isMobile ? '1rem' : '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: isMobile ? '0.7rem' : '0.8rem',
            lineHeight: 1.65,
            color: '#e2e8f0',
            whiteSpace: 'pre-wrap',
            overflowX: 'auto',
          }}>
            {messyCode}
          </div>

          <button
            onClick={startRace}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'white',
              background: 'linear-gradient(135deg, #7B61FF, #5B41DF)',
              border: 'none',
              borderRadius: 10,
              padding: '12px 28px',
              minHeight: 44,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: '0 2px 12px rgba(123, 97, 255, 0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(123, 97, 255, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(123, 97, 255, 0.25)';
            }}
          >
            Start Refactoring
          </button>
        </div>
      )}

      {phase === 'racing' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', flex: 1, minHeight: 0 }}>
            {/* Left: User's turn */}
            <div style={{ padding: isMobile ? '1rem' : '1.25rem 1.5rem', borderRight: isMobile ? 'none' : '1px solid rgba(26,26,46,0.06)', borderBottom: isMobile ? '1px solid rgba(26,26,46,0.06)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#0F3460',
                }}>
                  Your Turn
                </span>
                {userTime === null ? (
                  <button
                    onClick={userDone}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#16C79A',
                      background: 'rgba(22, 199, 154, 0.08)',
                      border: '1px solid rgba(22, 199, 154, 0.25)',
                      borderRadius: 6,
                      padding: isMobile ? '8px 14px' : '4px 12px',
                      minHeight: 44,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(22, 199, 154, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(22, 199, 154, 0.08)';
                    }}
                  >
                    Done
                  </button>
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#16C79A',
                    fontWeight: 600,
                  }}>
                    Finished at {formatTime(userTime)}
                  </span>
                )}
              </div>
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                disabled={userTime !== null}
                style={{
                  width: '100%',
                  height: isMobile ? 220 : 340,
                  fontFamily: 'var(--font-mono)',
                  fontSize: isMobile ? '0.7rem' : '0.76rem',
                  lineHeight: 1.6,
                  color: '#1A1A2E',
                  background: userTime !== null ? 'rgba(26,26,46,0.02)' : '#FEFDFB',
                  border: '1px solid rgba(26,26,46,0.08)',
                  borderRadius: 8,
                  padding: '14px 16px',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  opacity: userTime !== null ? 0.6 : 1,
                }}
                onFocus={(e) => {
                  if (userTime === null) {
                    e.currentTarget.style.borderColor = 'rgba(15, 52, 96, 0.3)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15, 52, 96, 0.06)';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Right: Claude Code */}
            <div style={{ padding: isMobile ? '1rem' : '1.25rem 1.5rem', background: 'rgba(26,26,46,0.015)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#7B61FF',
                }}>
                  Claude Code
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: aiProgress < 100 ? '#7B61FF' : '#16C79A',
                    transition: 'background 0.3s',
                    animation: aiProgress < 100 ? 'pulse 1s infinite' : 'none',
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: aiProgress < 100 ? '#7B61FF' : '#16C79A',
                    fontWeight: 600,
                  }}>
                    {aiProgress < 100 ? `${aiProgress}%` : 'Done'}
                  </span>
                </div>
              </div>
              <div style={{
                width: '100%',
                height: isMobile ? 220 : 340,
                fontFamily: 'var(--font-mono)',
                fontSize: isMobile ? '0.7rem' : '0.76rem',
                lineHeight: 1.6,
                color: '#e2e8f0',
                background: '#1A1A2E',
                border: '1px solid rgba(123, 97, 255, 0.15)',
                borderRadius: 8,
                padding: isMobile ? '10px 12px' : '14px 16px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
              }}>
                {aiText}
                {aiProgress < 100 && (
                  <span style={{
                    display: 'inline-block',
                    width: 2,
                    height: '1em',
                    background: '#7B61FF',
                    marginLeft: 1,
                    animation: 'blink 1s infinite',
                    verticalAlign: 'text-bottom',
                  }} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem' }}>
          {/* Comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0F3460',
                display: 'block',
                marginBottom: 8,
              }}>
                Your Version {userTime && `(${formatTime(userTime)})`}
              </span>
              <div style={{
                background: '#FEFDFB',
                border: '1px solid rgba(26,26,46,0.08)',
                borderRadius: 8,
                padding: isMobile ? '10px 12px' : '12px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                maxHeight: isMobile ? '35dvh' : '40dvh',
                overflowY: 'auto',
                color: '#1A1A2E',
              }}>
                {userCode}
              </div>
            </div>
            <div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#7B61FF',
                display: 'block',
                marginBottom: 8,
              }}>
                Claude Code Version (~5.5s)
              </span>
              <div style={{
                background: '#1A1A2E',
                border: '1px solid rgba(123, 97, 255, 0.15)',
                borderRadius: 8,
                padding: isMobile ? '10px 12px' : '12px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                maxHeight: isMobile ? '35dvh' : '40dvh',
                overflowY: 'auto',
                color: '#e2e8f0',
              }}>
                {finalRefactored}
              </div>
            </div>
          </div>

          {/* Comparison metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
            gap: isMobile ? '0.75rem' : '1rem',
            marginBottom: '1.5rem',
          }}>
            {[
              { label: 'Readability', user: 'You decide', ai: 'Types + comments', icon: 'eye' },
              { label: 'Lines of Code', user: `${userCode.split('\n').length} lines`, ai: `${finalRefactored.split('\n').length} lines`, icon: 'list' },
              { label: 'Naming', user: 'Your choice', ai: 'Descriptive names', icon: 'tag' },
            ].map((metric) => (
              <div key={metric.label} style={{
                background: 'rgba(123, 97, 255, 0.03)',
                border: '1px solid rgba(123, 97, 255, 0.08)',
                borderRadius: 8,
                padding: '12px 14px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#6B7280',
                  marginBottom: 8,
                }}>
                  {metric.label}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#0F3460', fontWeight: 600 }}>You</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280' }}>{metric.user}</div>
                  </div>
                  <div style={{ width: 1, background: 'rgba(26,26,46,0.08)' }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#7B61FF', fontWeight: 600 }}>AI</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280' }}>{metric.ai}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Key insight */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(123, 97, 255, 0.04), rgba(22, 199, 154, 0.04))',
            border: '1px solid rgba(123, 97, 255, 0.12)',
            borderRadius: 10,
            padding: isMobile ? '1rem' : '1.25rem 1.5rem',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '1rem',
          }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              background: 'linear-gradient(to bottom, #7B61FF, #16C79A)',
              borderRadius: '3px 0 0 3px',
            }} />
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#7B61FF',
              margin: '0 0 0.4rem',
            }}>
              The point is not who finishes first.
            </p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              color: '#1A1A2E',
              margin: 0,
              maxWidth: '55ch',
            }}>
              Claude Code is fast, but speed is not the skill. The skill is looking at both versions and judging which one you would actually ship. Can you read it? Does it handle edge cases? Would your teammate understand it at 2 AM? That judgment is yours alone.
            </p>
          </div>

          <button
            onClick={reset}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#7B61FF',
              background: 'rgba(123, 97, 255, 0.06)',
              border: '1px solid rgba(123, 97, 255, 0.2)',
              borderRadius: 8,
              padding: '8px 18px',
              minHeight: 44,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(123, 97, 255, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(123, 97, 255, 0.06)';
            }}
          >
            Try Again
          </button>
        </div>
      )}

      <style>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
