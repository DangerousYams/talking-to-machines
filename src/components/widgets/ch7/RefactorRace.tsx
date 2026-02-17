import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import BottomSheet from '../../cards/BottomSheet';
import { dvhValue } from '../../../lib/css-compat';

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

  const [mobileCodeTab, setMobileCodeTab] = useState<'user' | 'ai'>('user');
  const [comparisonSheetOpen, setComparisonSheetOpen] = useState(false);

  return (
    <div className="widget-container" style={isMobile ? { display: 'flex', flexDirection: 'column', height: '100%' } : undefined}>
      {/* Header */}
      <div style={{ padding: isMobile ? '0.75rem 1rem 0' : '1.5rem 2rem 0', borderBottom: '1px solid rgba(26,26,46,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: isMobile ? '0.75rem' : '1.25rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7B61FF, #7B61FF80)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>Refactor Race</h3>
            {!isMobile && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>You vs. Claude Code -- clean up this messy function</p>}
          </div>
          {/* Timer */}
          {phase !== 'ready' && (
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: isMobile ? '1rem' : '1.1rem',
              fontWeight: 700,
              color: phase === 'racing' ? '#7B61FF' : '#6B7280',
              minWidth: 50,
              textAlign: 'right',
            }}>
              {formatTime(timer)}
            </div>
          )}
        </div>
      </div>

      {/* READY phase */}
      {phase === 'ready' && (
        <div style={isMobile ? { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '0.75rem 1rem' } : { padding: '2rem' }}>
          {!isMobile && (
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
          )}

          {/* Messy code preview */}
          <div style={{
            background: '#1A1A2E',
            borderRadius: isMobile ? 8 : 10,
            padding: isMobile ? '0.75rem' : '1.25rem 1.5rem',
            marginBottom: isMobile ? '0.75rem' : '1.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: isMobile ? '0.68rem' : '0.8rem',
            lineHeight: 1.65,
            color: '#e2e8f0',
            whiteSpace: 'pre-wrap',
            overflowX: isMobile ? 'hidden' as const : 'auto' as const,
            overflowY: 'hidden',
            maxHeight: isMobile ? undefined : undefined,
            flex: isMobile ? 1 : undefined,
            minHeight: isMobile ? 0 : undefined,
          }}>
            {isMobile ? messyCode.split('\n').slice(0, 12).join('\n') + (messyCode.split('\n').length > 12 ? '\n...' : '') : messyCode}
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
              width: isMobile ? '100%' : undefined,
              flexShrink: 0,
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

      {/* RACING phase */}
      {phase === 'racing' && !isMobile && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, minHeight: 0 }}>
            {/* Left: User's turn */}
            <div style={{ padding: '1.25rem 1.5rem', borderRight: '1px solid rgba(26,26,46,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0F3460',
                }}>
                  Your Turn
                </span>
                {userTime === null ? (
                  <button
                    onClick={userDone}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                      color: '#16C79A', background: 'rgba(22, 199, 154, 0.08)',
                      border: '1px solid rgba(22, 199, 154, 0.25)', borderRadius: 6,
                      padding: '4px 12px', minHeight: 44, cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(22, 199, 154, 0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(22, 199, 154, 0.08)'; }}
                  >
                    Done
                  </button>
                ) : (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#16C79A', fontWeight: 600 }}>
                    Finished at {formatTime(userTime)}
                  </span>
                )}
              </div>
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                disabled={userTime !== null}
                style={{
                  width: '100%', height: 340,
                  fontFamily: 'var(--font-mono)', fontSize: '0.76rem', lineHeight: 1.6,
                  color: '#1A1A2E', background: userTime !== null ? 'rgba(26,26,46,0.02)' : '#FEFDFB',
                  border: '1px solid rgba(26,26,46,0.08)', borderRadius: 8,
                  padding: '14px 16px', resize: 'none', outline: 'none', boxSizing: 'border-box',
                  opacity: userTime !== null ? 0.6 : 1,
                }}
                onFocus={(e) => { if (userTime === null) { e.currentTarget.style.borderColor = 'rgba(15, 52, 96, 0.3)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15, 52, 96, 0.06)'; } }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Right: Claude Code */}
            <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(26,26,46,0.015)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7B61FF' }}>Claude Code</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: aiProgress < 100 ? '#7B61FF' : '#16C79A', animation: aiProgress < 100 ? 'pulse 1s infinite' : 'none' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: aiProgress < 100 ? '#7B61FF' : '#16C79A', fontWeight: 600 }}>
                    {aiProgress < 100 ? `${aiProgress}%` : 'Done'}
                  </span>
                </div>
              </div>
              <div style={{
                width: '100%', height: 340,
                fontFamily: 'var(--font-mono)', fontSize: '0.76rem', lineHeight: 1.6,
                color: '#e2e8f0', background: '#1A1A2E',
                border: '1px solid rgba(123, 97, 255, 0.15)', borderRadius: 8,
                padding: '14px 16px', overflowY: 'auto', whiteSpace: 'pre-wrap', boxSizing: 'border-box',
              }}>
                {aiText}
                {aiProgress < 100 && (
                  <span style={{ display: 'inline-block', width: 2, height: '1em', background: '#7B61FF', marginLeft: 1, animation: 'blink 1s infinite', verticalAlign: 'text-bottom' }} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RACING phase - MOBILE: tabbed */}
      {phase === 'racing' && isMobile && (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Code tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(26,26,46,0.06)', flexShrink: 0 }}>
            <button
              onClick={() => setMobileCodeTab('user')}
              style={{
                flex: 1, padding: '0.5rem', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                color: mobileCodeTab === 'user' ? '#0F3460' : '#6B7280',
                background: mobileCodeTab === 'user' ? 'rgba(15,52,96,0.04)' : 'transparent',
                borderBottom: mobileCodeTab === 'user' ? '2px solid #0F3460' : '2px solid transparent',
              }}
            >
              Your Code {userTime !== null && `(${formatTime(userTime)})`}
            </button>
            <button
              onClick={() => setMobileCodeTab('ai')}
              style={{
                flex: 1, padding: '0.5rem', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                color: mobileCodeTab === 'ai' ? '#7B61FF' : '#6B7280',
                background: mobileCodeTab === 'ai' ? 'rgba(123,97,255,0.04)' : 'transparent',
                borderBottom: mobileCodeTab === 'ai' ? '2px solid #7B61FF' : '2px solid transparent',
              }}
            >
              AI {aiProgress < 100 ? `${aiProgress}%` : 'Done'}
            </button>
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '0.5rem 1rem' }}>
            {mobileCodeTab === 'user' ? (
              <>
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  disabled={userTime !== null}
                  style={{
                    width: '100%', flex: 1, minHeight: 0,
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', lineHeight: 1.6,
                    color: '#1A1A2E', background: userTime !== null ? 'rgba(26,26,46,0.02)' : '#FEFDFB',
                    border: '1px solid rgba(26,26,46,0.08)', borderRadius: 8,
                    padding: '10px 12px', resize: 'none', outline: 'none', boxSizing: 'border-box',
                    opacity: userTime !== null ? 0.6 : 1,
                  }}
                  onFocus={(e) => { if (userTime === null) { e.currentTarget.style.borderColor = 'rgba(15, 52, 96, 0.3)'; } }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
                />
                {userTime === null && (
                  <button
                    onClick={userDone}
                    style={{
                      marginTop: 8, width: '100%', padding: '0.6rem', borderRadius: 8, border: 'none',
                      fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 700,
                      cursor: 'pointer', background: '#16C79A', color: 'white',
                      minHeight: 44, flexShrink: 0,
                    }}
                  >
                    I'm Done
                  </button>
                )}
              </>
            ) : (
              <div style={{
                flex: 1, minHeight: 0, overflowY: 'auto',
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', lineHeight: 1.6,
                color: '#e2e8f0', background: '#1A1A2E',
                border: '1px solid rgba(123, 97, 255, 0.15)', borderRadius: 8,
                padding: '10px 12px', whiteSpace: 'pre-wrap', boxSizing: 'border-box',
              }}>
                {aiText}
                {aiProgress < 100 && (
                  <span style={{ display: 'inline-block', width: 2, height: '1em', background: '#7B61FF', marginLeft: 1, animation: 'blink 1s infinite', verticalAlign: 'text-bottom' }} />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DONE phase - DESKTOP */}
      {phase === 'done' && !isMobile && (
        <div style={{ padding: '1.5rem 2rem' }}>
          {/* Comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0F3460', display: 'block', marginBottom: 8 }}>
                Your Version {userTime && `(${formatTime(userTime)})`}
              </span>
              <div style={{ background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.08)', borderRadius: 8, padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: dvhValue(40), overflowY: 'auto', color: '#1A1A2E' }}>
                {userCode}
              </div>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7B61FF', display: 'block', marginBottom: 8 }}>
                Claude Code Version (~5.5s)
              </span>
              <div style={{ background: '#1A1A2E', border: '1px solid rgba(123, 97, 255, 0.15)', borderRadius: 8, padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: dvhValue(40), overflowY: 'auto', color: '#e2e8f0' }}>
                {finalRefactored}
              </div>
            </div>
          </div>

          {/* Comparison metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Readability', user: 'You decide', ai: 'Types + comments' },
              { label: 'Lines of Code', user: `${userCode.split('\n').length} lines`, ai: `${finalRefactored.split('\n').length} lines` },
              { label: 'Naming', user: 'Your choice', ai: 'Descriptive names' },
            ].map((metric) => (
              <div key={metric.label} style={{ background: 'rgba(123, 97, 255, 0.03)', border: '1px solid rgba(123, 97, 255, 0.08)', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 8 }}>{metric.label}</div>
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
          <div style={{ background: 'linear-gradient(135deg, rgba(123, 97, 255, 0.04), rgba(22, 199, 154, 0.04))', border: '1px solid rgba(123, 97, 255, 0.12)', borderRadius: 10, padding: '1.25rem 1.5rem', position: 'relative', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'linear-gradient(to bottom, #7B61FF, #16C79A)', borderRadius: '3px 0 0 3px' }} />
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700, color: '#7B61FF', margin: '0 0 0.4rem' }}>
              The point is not who finishes first.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.7, color: '#1A1A2E', margin: 0, maxWidth: '55ch' }}>
              Claude Code is fast, but speed is not the skill. The skill is looking at both versions and judging which one you would actually ship. Can you read it? Does it handle edge cases? Would your teammate understand it at 2 AM? That judgment is yours alone.
            </p>
          </div>

          <button
            onClick={reset}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: '#7B61FF', background: 'rgba(123, 97, 255, 0.06)', border: '1px solid rgba(123, 97, 255, 0.2)', borderRadius: 8, padding: '8px 18px', minHeight: 44, cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(123, 97, 255, 0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(123, 97, 255, 0.06)'; }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* DONE phase - MOBILE: compact score card */}
      {phase === 'done' && isMobile && (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0.75rem 1rem' }}>
          {/* Metrics row */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {[
              { label: 'Lines', user: `${userCode.split('\n').length}`, ai: `${finalRefactored.split('\n').length}` },
              { label: 'Time', user: userTime ? formatTime(userTime) : '-', ai: '~5.5s' },
              { label: 'Names', user: '?', ai: 'Typed' },
            ].map((m) => (
              <div key={m.label} style={{
                flex: 1, background: 'rgba(123,97,255,0.03)', border: '1px solid rgba(123,97,255,0.08)',
                borderRadius: 8, padding: '8px 6px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>{m.label}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#0F3460', fontWeight: 600 }}>{m.user}</span>
                  <span style={{ color: 'rgba(26,26,46,0.15)' }}>|</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#7B61FF', fontWeight: 600 }}>{m.ai}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Key insight */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(123, 97, 255, 0.04), rgba(22, 199, 154, 0.04))',
            border: '1px solid rgba(123, 97, 255, 0.12)',
            borderRadius: 10, padding: '0.75rem', position: 'relative', overflow: 'hidden', marginBottom: 10,
          }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'linear-gradient(to bottom, #7B61FF, #16C79A)' }} />
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 700, color: '#7B61FF', margin: '0 0 0.3rem' }}>
              The point is not who finishes first.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.6, color: '#1A1A2E', margin: 0 }}>
              Speed is not the skill. The skill is judging which version you would ship. That judgment is yours alone.
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setComparisonSheetOpen(true)}
              style={{
                flex: 1, padding: '0.6rem', borderRadius: 8, border: 'none',
                fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700,
                cursor: 'pointer', background: 'linear-gradient(135deg, #7B61FF, #5B41DF)',
                color: 'white', minHeight: 44,
              }}
            >
              Compare Code
            </button>
            <button
              onClick={reset}
              style={{
                padding: '0.6rem 1rem', borderRadius: 8,
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                color: '#7B61FF', background: 'rgba(123,97,255,0.06)',
                border: '1px solid rgba(123,97,255,0.2)', cursor: 'pointer', minHeight: 44,
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Mobile BottomSheet for full comparison */}
      {isMobile && (
        <BottomSheet
          isOpen={comparisonSheetOpen}
          onClose={() => setComparisonSheetOpen(false)}
          title="Code Comparison"
        >
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: '#0F3460', display: 'block', marginBottom: 6 }}>
              Your Version {userTime && `(${formatTime(userTime)})`}
            </span>
            <div style={{
              background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.08)', borderRadius: 8,
              padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
              lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#1A1A2E',
            }}>
              {userCode}
            </div>
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: '#7B61FF', display: 'block', marginBottom: 6 }}>
              Claude Code (~5.5s)
            </span>
            <div style={{
              background: '#1A1A2E', border: '1px solid rgba(123,97,255,0.15)', borderRadius: 8,
              padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
              lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#e2e8f0',
            }}>
              {finalRefactored}
            </div>
          </div>
        </BottomSheet>
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
