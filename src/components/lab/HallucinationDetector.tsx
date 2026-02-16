import { useState, useEffect, useRef } from 'react';

/*
 * HallucinationDetector
 * ---------------------
 * Ch9 — "When AI Gets It Wrong"
 * A typewriter animation of AI-generated text followed by a scanning
 * pass that reveals which statements are factual and which are
 * hallucinated. A circular accuracy gauge and summary appear after
 * the scan completes. Cycles between two statement sets.
 */

interface Statement {
  text: string;
  hallucinated: boolean;
  errorSpan?: string; // The specific substring that's wrong
}

const STATEMENT_SETS: Statement[][] = [
  [
    { text: 'The Great Wall of China was built in 1487', hallucinated: false },
    { text: 'by Emperor Zhu Yuanzhang of the Ming Dynasty.', hallucinated: false },
    { text: 'It spans exactly 13,171 miles across northern China.', hallucinated: true, errorSpan: 'exactly 13,171 miles' },
    { text: 'The wall is visible from space with the naked eye.', hallucinated: true, errorSpan: 'visible from space with the naked eye' },
    { text: 'Construction took approximately 2,000 years.', hallucinated: false },
  ],
  [
    { text: 'Python was created by Guido van Rossum in 1991.', hallucinated: false },
    { text: 'It was named after the TV show Monty Python.', hallucinated: false },
    { text: 'Python 4.0 was released in March 2024.', hallucinated: true, errorSpan: 'Python 4.0 was released in March 2024' },
    { text: 'It is the most popular programming language worldwide.', hallucinated: false },
    { text: 'Python was originally written in Java.', hallucinated: true, errorSpan: 'originally written in Java' },
  ],
];

const COLORS = {
  deep: '#1A1A2E',
  red: '#E94560',
  teal: '#16C79A',
  amber: '#F5A623',
  subtle: '#6B7280',
  cream: '#FAF8F5',
  lavender: '#EEF2FF',
};

const TYPEWRITER_CHAR_MS = 28;
const LINE_PAUSE_MS = 600;
const SCAN_DURATION_MS = 2800;
const POST_SCAN_HOLD_MS = 4500;

export default function HallucinationDetector() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [setIndex, setSetIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'scanning' | 'results'>('typing');
  const [typedLines, setTypedLines] = useState<number>(0);
  const [typedChars, setTypedChars] = useState<number>(0);
  const [scanProgress, setScanProgress] = useState<number>(0); // 0 to 1
  const [scannedLines, setScannedLines] = useState<Set<number>>(new Set());
  const [gaugeValue, setGaugeValue] = useState<number>(0);
  const mountedRef = useRef(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafRef = useRef<number>(0);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const currentSet = STATEMENT_SETS[setIndex];
  const correctCount = currentSet.filter(s => !s.hallucinated).length;
  const errorCount = currentSet.filter(s => s.hallucinated).length;
  const accuracyPct = Math.round((correctCount / currentSet.length) * 100);

  // Run the entire animation cycle
  useEffect(() => {
    mountedRef.current = true;

    if (reducedMotion) return;

    const runCycle = () => {
      if (!mountedRef.current) return;
      clearTimers();

      // Reset
      setPhase('typing');
      setTypedLines(0);
      setTypedChars(0);
      setScanProgress(0);
      setScannedLines(new Set());
      setGaugeValue(0);

      const statements = STATEMENT_SETS[setIndex];
      let cumulativeDelay = 400;

      // Phase 1: Typewriter
      for (let lineIdx = 0; lineIdx < statements.length; lineIdx++) {
        const line = statements[lineIdx];
        for (let charIdx = 0; charIdx <= line.text.length; charIdx++) {
          const delay = cumulativeDelay + charIdx * TYPEWRITER_CHAR_MS;
          const t = setTimeout(() => {
            if (!mountedRef.current) return;
            setTypedLines(lineIdx);
            setTypedChars(charIdx);
          }, delay);
          timersRef.current.push(t);
        }
        cumulativeDelay += line.text.length * TYPEWRITER_CHAR_MS + LINE_PAUSE_MS;
      }

      // Phase 2: Scanning (after typing finishes)
      const scanStart = cumulativeDelay + 600;
      const t1 = setTimeout(() => {
        if (!mountedRef.current) return;
        setPhase('scanning');

        const scanStartTime = performance.now();
        const animateScan = (now: number) => {
          if (!mountedRef.current) return;
          const elapsed = now - scanStartTime;
          const progress = Math.min(elapsed / SCAN_DURATION_MS, 1);
          setScanProgress(progress);

          // Determine which lines the scanner has passed
          const linesPassed = Math.floor(progress * (statements.length + 0.5));
          setScannedLines(prev => {
            const next = new Set(prev);
            for (let i = 0; i < Math.min(linesPassed, statements.length); i++) {
              next.add(i);
            }
            return next;
          });

          if (progress < 1) {
            rafRef.current = requestAnimationFrame(animateScan);
          } else {
            // Phase 3: Results
            const t2 = setTimeout(() => {
              if (!mountedRef.current) return;
              setPhase('results');

              // Animate gauge
              const gaugeTarget = (correctCount / statements.length) * 100;
              let current = 0;
              const gaugeStep = () => {
                if (!mountedRef.current) return;
                current += 1.5;
                if (current >= gaugeTarget) {
                  setGaugeValue(gaugeTarget);
                } else {
                  setGaugeValue(current);
                  rafRef.current = requestAnimationFrame(gaugeStep);
                }
              };
              rafRef.current = requestAnimationFrame(gaugeStep);

              // Hold, then cycle to next set
              const t3 = setTimeout(() => {
                if (!mountedRef.current) return;
                setSetIndex(prev => (prev + 1) % STATEMENT_SETS.length);
              }, POST_SCAN_HOLD_MS);
              timersRef.current.push(t3);
            }, 400);
            timersRef.current.push(t2);
          }
        };
        rafRef.current = requestAnimationFrame(animateScan);
      }, scanStart);
      timersRef.current.push(t1);
    };

    runCycle();

    return () => {
      mountedRef.current = false;
      clearTimers();
    };
  }, [setIndex, reducedMotion]);

  // Render a single statement line
  const renderLine = (stmt: Statement, index: number) => {
    const isTypingThisLine = phase === 'typing' && typedLines === index;
    const isTyped = phase === 'typing' ? (index < typedLines || (index === typedLines && typedChars >= stmt.text.length)) : true;
    const isPartial = isTypingThisLine && typedChars < stmt.text.length;
    const isScanned = scannedLines.has(index);
    const showResult = (phase === 'scanning' && isScanned) || phase === 'results';

    const displayText = isPartial ? stmt.text.slice(0, typedChars) : (isTyped || phase !== 'typing') ? stmt.text : '';

    // Highlight the error span if scanned and hallucinated
    let renderedText: React.ReactNode = displayText;
    if (showResult && stmt.hallucinated && stmt.errorSpan && displayText.includes(stmt.errorSpan)) {
      const parts = displayText.split(stmt.errorSpan);
      renderedText = (
        <>
          {parts[0]}
          <span style={{
            background: 'rgba(233, 69, 96, 0.12)',
            borderBottom: `2px wavy ${COLORS.red}`,
            padding: '0 2px',
            borderRadius: 2,
          }}>
            {stmt.errorSpan}
          </span>
          {parts[1]}
        </>
      );
    }

    const borderColor = showResult
      ? stmt.hallucinated ? COLORS.red : COLORS.teal
      : 'transparent';

    const shouldShow = phase === 'typing' ? index <= typedLines : true;
    if (!shouldShow && phase === 'typing') return null;

    return (
      <div
        key={`${setIndex}-${index}`}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          padding: '8px 12px',
          borderLeft: `3px solid ${borderColor}`,
          marginBottom: 4,
          borderRadius: '0 6px 6px 0',
          background: showResult && stmt.hallucinated
            ? 'rgba(233, 69, 96, 0.04)'
            : showResult && !stmt.hallucinated
              ? 'rgba(22, 199, 154, 0.03)'
              : 'transparent',
          transition: reducedMotion ? 'none' : 'all 0.4s ease',
          minHeight: 28,
        }}
      >
        <div style={{
          flex: 1,
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 14,
          lineHeight: 1.65,
          color: COLORS.deep,
          letterSpacing: '0.01em',
        }}>
          {renderedText}
          {isPartial && (
            <span style={{
              display: 'inline-block',
              width: 2,
              height: 16,
              background: COLORS.deep,
              marginLeft: 1,
              verticalAlign: 'text-bottom',
              animation: reducedMotion ? 'none' : 'hallDetectorBlink 0.8s step-end infinite',
            }} />
          )}
        </div>

        {/* Result badge */}
        {showResult && (
          <div style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            opacity: isScanned ? 1 : 0,
            transform: isScanned ? 'translateX(0)' : 'translateX(8px)',
            transition: reducedMotion ? 'none' : 'all 0.35s ease',
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              color: stmt.hallucinated ? COLORS.red : COLORS.teal,
            }}>
              {stmt.hallucinated ? '\u2717' : '\u2713'}
            </span>
            {stmt.hallucinated && (
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                fontWeight: 600,
                color: COLORS.red,
                background: 'rgba(233, 69, 96, 0.08)',
                padding: '2px 6px',
                borderRadius: 4,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>
                Hallucination
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  // Scanner line position (maps scanProgress to Y position over the text area)
  const scannerTop = phase === 'scanning' ? scanProgress * 100 : -10;

  // Gauge SVG (circular)
  const gaugeRadius = 32;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeStroke = gaugeCircumference * (1 - gaugeValue / 100);

  // Reduced motion static fallback
  if (reducedMotion) {
    const staticSet = STATEMENT_SETS[0];
    const staticCorrect = staticSet.filter(s => !s.hallucinated).length;
    const staticPct = Math.round((staticCorrect / staticSet.length) * 100);

    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span style={headerDotStyle} />
          <span style={headerDotStyle} />
          <span style={headerDotStyle} />
          <span style={headerLabelStyle}>AI Response</span>
        </div>
        <div style={{ padding: '16px 4px 8px' }}>
          {staticSet.map((stmt, i) => (
            <div key={i} style={{
              padding: '8px 12px',
              borderLeft: `3px solid ${stmt.hallucinated ? COLORS.red : COLORS.teal}`,
              marginBottom: 4,
              borderRadius: '0 6px 6px 0',
              background: stmt.hallucinated ? 'rgba(233, 69, 96, 0.04)' : 'rgba(22, 199, 154, 0.03)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}>
              <span style={{
                flex: 1,
                fontFamily: "'Lora', Georgia, serif",
                fontSize: 14,
                lineHeight: 1.65,
                color: COLORS.deep,
              }}>
                {stmt.text}
              </span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                fontWeight: 700,
                color: stmt.hallucinated ? COLORS.red : COLORS.teal,
              }}>
                {stmt.hallucinated ? '\u2717' : '\u2713'}
              </span>
            </div>
          ))}
        </div>
        <div style={summaryContainerStyle}>
          <div style={summaryTextStyle}>
            {staticSet.length - staticCorrect} of {staticSet.length} statements contain errors
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: COLORS.subtle,
            textAlign: 'center',
          }}>
            Accuracy: {staticPct}%
          </div>
        </div>
        <div style={tipContainerStyle}>
          <span style={tipTextStyle}>Always verify specific numbers and widely-repeated claims</span>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Blink keyframes */}
      <style>{`
        @keyframes hallDetectorBlink {
          50% { opacity: 0; }
        }
      `}</style>

      {/* Terminal-style header bar */}
      <div style={headerStyle}>
        <span style={headerDotStyle} />
        <span style={headerDotStyle} />
        <span style={headerDotStyle} />
        <span style={headerLabelStyle}>AI Response</span>
      </div>

      {/* Text area with scanner */}
      <div style={{
        position: 'relative',
        padding: '16px 4px 8px',
        minHeight: 200,
      }}>
        {/* Scanner line */}
        {phase === 'scanning' && (
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${scannerTop}%`,
            height: 3,
            background: `linear-gradient(90deg, transparent 0%, ${COLORS.red} 20%, ${COLORS.red} 80%, transparent 100%)`,
            boxShadow: `0 0 12px ${COLORS.red}40, 0 0 4px ${COLORS.red}30`,
            zIndex: 2,
            transition: 'top 0.05s linear',
            borderRadius: 2,
          }} />
        )}

        {/* Statement lines */}
        {currentSet.map((stmt, i) => renderLine(stmt, i))}
      </div>

      {/* Results summary (slides in after scan) */}
      <div style={{
        overflow: 'hidden',
        maxHeight: phase === 'results' ? 200 : 0,
        opacity: phase === 'results' ? 1 : 0,
        transition: 'max-height 0.6s ease, opacity 0.5s ease 0.1s',
      }}>
        <div style={{
          height: 1,
          background: 'rgba(26, 26, 46, 0.06)',
          margin: '8px 12px 16px',
        }} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          padding: '0 12px 12px',
        }}>
          {/* Circular gauge */}
          <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
            <svg viewBox="0 0 80 80" style={{ width: 80, height: 80, transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle
                cx={40}
                cy={40}
                r={gaugeRadius}
                fill="none"
                stroke="rgba(26, 26, 46, 0.06)"
                strokeWidth={6}
              />
              {/* Fill circle */}
              <circle
                cx={40}
                cy={40}
                r={gaugeRadius}
                fill="none"
                stroke={COLORS.amber}
                strokeWidth={6}
                strokeDasharray={gaugeCircumference}
                strokeDashoffset={gaugeStroke}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.05s linear' }}
              />
            </svg>
            {/* Percentage text in center */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.amber,
                lineHeight: 1,
              }}>
                {Math.round(gaugeValue)}%
              </span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 8,
                color: COLORS.subtle,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: 2,
              }}>
                accurate
              </span>
            </div>
          </div>

          {/* Summary text */}
          <div>
            <div style={summaryTextStyle}>
              {errorCount} of {currentSet.length} statements contain errors
            </div>
            <div style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 12,
              color: COLORS.subtle,
              marginTop: 4,
              lineHeight: 1.5,
            }}>
              {correctCount} verified &middot; {errorCount} hallucinated
            </div>
          </div>
        </div>

        {/* Tip */}
        <div style={tipContainerStyle}>
          <span style={tipTextStyle}>
            Always verify specific numbers and widely-repeated claims
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Styles ---

const containerStyle: React.CSSProperties = {
  maxWidth: 650,
  margin: '0 auto',
  background: '#FFFFFF',
  borderRadius: 16,
  border: '1px solid rgba(26, 26, 46, 0.06)',
  boxShadow: '0 4px 32px rgba(26, 26, 46, 0.06)',
  padding: '0 20px 20px',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '16px 4px 12px',
  borderBottom: '1px solid rgba(26, 26, 46, 0.05)',
};

const headerDotStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: 'rgba(26, 26, 46, 0.08)',
};

const headerLabelStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  fontWeight: 600,
  color: COLORS.subtle,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  marginLeft: 8,
};

const summaryContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '8px 0',
};

const summaryTextStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 15,
  fontWeight: 700,
  color: COLORS.deep,
  lineHeight: 1.4,
};

const tipContainerStyle: React.CSSProperties = {
  background: COLORS.cream,
  borderRadius: 8,
  padding: '10px 14px',
  margin: '8px 4px 4px',
  textAlign: 'center',
};

const tipTextStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  color: COLORS.subtle,
  letterSpacing: '0.02em',
  lineHeight: 1.5,
};
