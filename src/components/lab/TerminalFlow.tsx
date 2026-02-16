import { useState, useEffect, useRef, useCallback } from 'react';

/*
 * TerminalFlow
 * ------------
 * A simulated terminal that types out a Claude Code interaction,
 * showing the Specify -> Generate -> Verify -> Fix -> Verify loop.
 * Character-by-character typewriter effect with syntax highlighting.
 *
 * Chapter 7: Mastering Claude Code
 * Accent: #7B61FF (purple)
 */

// Colors
const PURPLE = '#7B61FF';
const GREEN = '#16C79A';
const RED = '#E94560';
const SKY = '#0EA5E9';
const AMBER = '#F5A623';
const SUBTLE = '#6B7280';
const WHITE = '#E8E6E3';
const DIM = 'rgba(255,255,255,0.35)';

// A terminal line with typed characters and styling info
interface TermLine {
  text: string;
  color: string;
  prefix?: string;
  prefixColor?: string;
  italic?: boolean;
  speed?: number; // ms per char override
  pause?: number; // ms pause before this line starts
  noType?: boolean; // appear instantly (for blank lines, etc.)
}

const SCRIPT: TermLine[] = [
  // 1. User prompt
  { text: '', color: WHITE, pause: 400, noType: true },
  { text: 'create a countdown timer component', color: WHITE, prefix: '$ ', prefixColor: GREEN, speed: 28 },
  // 2. Thinking
  { text: '', color: WHITE, pause: 600, noType: true },
  { text: 'Thinking...', color: SUBTLE, italic: true, speed: 40, pause: 300 },
  // 3. File creation
  { text: '', color: WHITE, pause: 500, noType: true },
  { text: 'Creating src/Timer.tsx', color: PURPLE, speed: 22, pause: 200 },
  { text: '', color: WHITE, pause: 100, noType: true },
  // Code lines (syntax highlighted via segments, but we type them as single colored lines)
  { text: 'import { useState, useEffect } from \'react\';', color: WHITE, speed: 18, pause: 150 },
  { text: '', color: WHITE, pause: 80, noType: true },
  { text: 'export default function Timer({ seconds }: Props) {', color: WHITE, speed: 18 },
  { text: '  const [remaining, setRemaining] = useState(seconds);', color: WHITE, speed: 16 },
  { text: '  // Tick down every second', color: SUBTLE, speed: 20, italic: true },
  { text: '  useEffect(() => {', color: WHITE, speed: 16 },
  { text: '    const id = setInterval(() => {', color: WHITE, speed: 16 },
  { text: '      setRemaining(r => Math.max(0, r - 1));', color: WHITE, speed: 16 },
  { text: '    }, 1000);', color: WHITE, speed: 16 },
  { text: '    return () => clearInterval(id);', color: WHITE, speed: 16 },
  { text: '  }, []);', color: WHITE, speed: 16 },
  { text: '  return <div>{remaining}s</div>;', color: WHITE, speed: 18 },
  { text: '}', color: WHITE, speed: 18 },
  // 4. Build
  { text: '', color: WHITE, pause: 500, noType: true },
  { text: 'Running npm run build...', color: SKY, speed: 24, pause: 300 },
  { text: '', color: WHITE, pause: 600, noType: true },
  { text: '\u2713 Build passed', color: GREEN, speed: 30, pause: 200 },
  // 5. Tests
  { text: '', color: WHITE, pause: 400, noType: true },
  { text: 'Running tests...', color: SKY, speed: 24, pause: 300 },
  { text: '', color: WHITE, pause: 700, noType: true },
  { text: '\u2717 1 test failed: timer doesn\'t stop at zero', color: RED, speed: 26, pause: 200 },
  // 6. Fix
  { text: '', color: WHITE, pause: 500, noType: true },
  { text: 'Fixing Timer.tsx...', color: PURPLE, speed: 24, pause: 300 },
  { text: '', color: WHITE, pause: 400, noType: true },
  { text: '  // Clear interval when remaining hits 0', color: SUBTLE, italic: true, speed: 20, pause: 200 },
  { text: '  useEffect(() => {', color: WHITE, speed: 18 },
  { text: '    if (remaining <= 0) return;', color: WHITE, speed: 18 },
  { text: '    const id = setInterval(() => ...', color: WHITE, speed: 18 },
  // 7. Re-test
  { text: '', color: WHITE, pause: 500, noType: true },
  { text: 'Running tests...', color: SKY, speed: 24, pause: 300 },
  { text: '', color: WHITE, pause: 600, noType: true },
  { text: '\u2713 All tests passed', color: GREEN, speed: 28, pause: 200 },
  // 8. Summary
  { text: '', color: WHITE, pause: 600, noType: true },
  { text: 'Specify \u2192 Generate \u2192 Verify \u2192 Fix \u2192 Verify \u2713', color: PURPLE, speed: 32, pause: 400 },
];

// Syntax highlight a code-like line by coloring keywords, strings, numbers, comments
function highlightSegments(line: TermLine): Array<{ text: string; color: string; italic?: boolean }> {
  const { text, color, italic } = line;

  // If the line is not white/code, just return as-is
  if (color !== WHITE) {
    return [{ text, color, italic }];
  }

  const segments: Array<{ text: string; color: string; italic?: boolean }> = [];
  // Simple tokenizer
  let remaining = text;

  // Check if it's a comment line
  if (remaining.trimStart().startsWith('//')) {
    return [{ text, color: SUBTLE, italic: true }];
  }

  const keywords = ['import', 'export', 'default', 'function', 'const', 'let', 'from', 'return', 'if', 'useEffect', 'useState', 'setInterval', 'clearInterval'];
  const tokenRegex = /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\/\/.*$|\b\d+\b|\b(?:import|export|default|function|const|let|from|return|if|useEffect|useState|setInterval|clearInterval)\b|[^'"\d\w]+|\w+)/g;

  let match;
  while ((match = tokenRegex.exec(remaining)) !== null) {
    const token = match[0];
    if (token.startsWith("'") || token.startsWith('"')) {
      segments.push({ text: token, color: GREEN });
    } else if (token.startsWith('//')) {
      segments.push({ text: token, color: SUBTLE, italic: true });
    } else if (/^\d+$/.test(token)) {
      segments.push({ text: token, color: AMBER });
    } else if (keywords.includes(token)) {
      segments.push({ text: token, color: PURPLE });
    } else {
      segments.push({ text: token, color: WHITE });
    }
  }

  return segments.length > 0 ? segments : [{ text, color, italic }];
}

const CHAR_SPEED_DEFAULT = 24;
const RESTART_DELAY = 3500;
const FADE_DURATION = 1000;

export default function TerminalFlow() {
  const [lines, setLines] = useState<Array<{ segments: Array<{ text: string; color: string; italic?: boolean }>; typed: number; total: number }>>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [masterOpacity, setMasterOpacity] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const mountedRef = useRef(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, delay: number) => {
    const t = setTimeout(() => {
      if (mountedRef.current) fn();
    }, delay);
    timersRef.current.push(t);
    return t;
  }, []);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Cursor blink
  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      if (mountedRef.current) setShowCursor(c => !c);
    }, 530);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, currentChar]);

  // Main animation loop
  useEffect(() => {
    mountedRef.current = true;

    if (reducedMotion) {
      // Show everything at once
      const allLines = SCRIPT.map(line => {
        const segs = highlightSegments(line);
        const total = segs.reduce((sum, s) => sum + s.text.length, 0);
        return { segments: segs, typed: total, total };
      });
      setLines(allLines);
      setCurrentLine(SCRIPT.length);
      return;
    }

    const runCycle = () => {
      if (!mountedRef.current) return;
      clearTimers();
      setLines([]);
      setCurrentLine(0);
      setCurrentChar(0);
      setMasterOpacity(1);

      let totalDelay = 200; // initial pause

      SCRIPT.forEach((scriptLine, lineIndex) => {
        const pause = scriptLine.pause || 0;
        totalDelay += pause;

        const lineDelay = totalDelay;
        const segs = highlightSegments(scriptLine);
        const totalChars = segs.reduce((sum, s) => sum + s.text.length, 0);
        const charSpeed = scriptLine.speed || CHAR_SPEED_DEFAULT;

        if (scriptLine.noType || totalChars === 0) {
          // Instant line
          addTimer(() => {
            setLines(prev => [...prev, { segments: segs, typed: totalChars, total: totalChars }]);
            setCurrentLine(lineIndex + 1);
          }, lineDelay);
          totalDelay += 50;
        } else {
          // Start the line with 0 typed chars
          addTimer(() => {
            setLines(prev => [...prev, { segments: segs, typed: 0, total: totalChars }]);
            setCurrentLine(lineIndex);
            setCurrentChar(0);
          }, lineDelay);

          // Type each character
          for (let c = 1; c <= totalChars; c++) {
            const charDelay = lineDelay + c * charSpeed;
            addTimer(() => {
              setLines(prev => {
                const updated = [...prev];
                const targetIdx = updated.length - 1;
                if (targetIdx >= 0) {
                  updated[targetIdx] = { ...updated[targetIdx], typed: c };
                }
                return updated;
              });
              setCurrentChar(c);
            }, charDelay);
          }

          totalDelay += totalChars * charSpeed;

          // Mark line complete
          addTimer(() => {
            setCurrentLine(lineIndex + 1);
          }, totalDelay + 20);
        }
      });

      // Fade out and restart
      totalDelay += RESTART_DELAY;
      addTimer(() => {
        setMasterOpacity(0);
        addTimer(() => runCycle(), FADE_DURATION + 400);
      }, totalDelay);
    };

    runCycle();

    return () => {
      mountedRef.current = false;
      clearTimers();
    };
  }, [reducedMotion, clearTimers, addTimer]);

  // Render a line's typed content with syntax highlighting
  const renderLine = (line: typeof lines[number], lineIdx: number, isCurrentLine: boolean) => {
    const { segments, typed, total } = line;
    const elements: React.ReactElement[] = [];
    let charCount = 0;

    for (let si = 0; si < segments.length; si++) {
      const seg = segments[si];
      const segStart = charCount;
      const segEnd = charCount + seg.text.length;

      if (segStart >= typed) {
        // This segment hasn't started being typed
        break;
      }

      const visibleEnd = Math.min(typed, segEnd);
      const visibleText = seg.text.slice(0, visibleEnd - segStart);

      elements.push(
        <span
          key={`${lineIdx}-${si}`}
          style={{
            color: seg.color,
            fontStyle: seg.italic ? 'italic' : 'normal',
          }}
        >
          {visibleText}
        </span>
      );

      charCount = segEnd;
    }

    return elements;
  };

  // Get prefix for a given script line index
  const getPrefix = (scriptIdx: number) => {
    if (scriptIdx >= 0 && scriptIdx < SCRIPT.length) {
      const s = SCRIPT[scriptIdx];
      if (s.prefix) {
        return { text: s.prefix, color: s.prefixColor || WHITE };
      }
    }
    return null;
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 650,
    margin: '0 auto',
    background: 'linear-gradient(145deg, #1A1A2E 0%, #0F3460 100%)',
    borderRadius: 16,
    border: '1px solid rgba(123, 97, 255, 0.15)',
    boxShadow: '0 4px 32px rgba(26, 26, 46, 0.2)',
    overflow: 'hidden',
    opacity: masterOpacity,
    transition: reducedMotion ? 'none' : `opacity ${FADE_DURATION}ms ease`,
  };

  const chromeBarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    background: 'rgba(0,0,0,0.25)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  };

  const dotStyle = (color: string): React.CSSProperties => ({
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: color,
  });

  const titleStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.4)',
    marginLeft: 8,
    letterSpacing: '0.02em',
  };

  const terminalBodyStyle: React.CSSProperties = {
    padding: '16px 20px 20px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    lineHeight: 1.7,
    maxHeight: 380,
    overflowY: 'auto',
    scrollbarWidth: 'thin' as const,
  };

  const lineStyle: React.CSSProperties = {
    minHeight: '1.7em',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  };

  const cursorStyle: React.CSSProperties = {
    display: 'inline-block',
    width: 7,
    height: 14,
    backgroundColor: PURPLE,
    opacity: showCursor ? 0.8 : 0,
    marginLeft: 1,
    verticalAlign: 'text-bottom',
    transition: 'opacity 0.1s ease',
  };

  // Flow label at bottom
  const flowBarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '10px 16px',
    background: 'rgba(0,0,0,0.2)',
    borderTop: '1px solid rgba(255,255,255,0.04)',
  };

  const flowStepStyle = (active: boolean, color: string): React.CSSProperties => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: active ? color : 'rgba(255,255,255,0.15)',
    transition: reducedMotion ? 'none' : 'color 0.4s ease',
  });

  const arrowStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: active ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)',
    transition: reducedMotion ? 'none' : 'color 0.4s ease',
  });

  // Determine which phase is active based on how many lines have appeared
  const lineCount = lines.length;
  const specifyDone = lineCount >= 2;
  const generateDone = lineCount >= 19;
  const verify1Done = lineCount >= 23;
  const fixDone = lineCount >= 30;
  const verify2Done = lineCount >= 34;

  return (
    <div style={containerStyle}>
      {/* Terminal chrome */}
      <div style={chromeBarStyle}>
        <div style={dotStyle('#E94560')} />
        <div style={dotStyle('#F5A623')} />
        <div style={dotStyle('#16C79A')} />
        <span style={titleStyle}>~/my-project</span>
      </div>

      {/* Terminal body */}
      <div ref={scrollRef} style={terminalBodyStyle}>
        {lines.map((line, idx) => {
          // Find the matching script index
          // Since we push lines in order, idx maps to script index
          const prefix = getPrefix(idx);
          const isLast = idx === lines.length - 1;
          const isCurrentlyTyping = isLast && line.typed < line.total;

          return (
            <div key={idx} style={lineStyle}>
              {prefix && (
                <span style={{ color: prefix.color, fontWeight: 700 }}>
                  {prefix.text}
                </span>
              )}
              {renderLine(line, idx, isCurrentlyTyping)}
              {isCurrentlyTyping && <span style={cursorStyle} />}
            </div>
          );
        })}
        {/* Show cursor on empty line when all is typed and no more lines coming */}
        {lines.length > 0 && lines[lines.length - 1].typed >= lines[lines.length - 1].total && currentLine < SCRIPT.length && (
          <div style={lineStyle}>
            <span style={cursorStyle} />
          </div>
        )}
      </div>

      {/* Flow progress bar */}
      <div style={flowBarStyle}>
        <span style={flowStepStyle(specifyDone, GREEN)}>Specify</span>
        <span style={arrowStyle(specifyDone)}>{'\u2192'}</span>
        <span style={flowStepStyle(generateDone, PURPLE)}>Generate</span>
        <span style={arrowStyle(generateDone)}>{'\u2192'}</span>
        <span style={flowStepStyle(verify1Done, verify1Done && !fixDone ? RED : SKY)}>Verify</span>
        <span style={arrowStyle(verify1Done)}>{'\u2192'}</span>
        <span style={flowStepStyle(fixDone, PURPLE)}>Fix</span>
        <span style={arrowStyle(fixDone)}>{'\u2192'}</span>
        <span style={flowStepStyle(verify2Done, GREEN)}>Verify</span>
        {verify2Done && (
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: GREEN,
            marginLeft: 2,
          }}>{'\u2713'}</span>
        )}
      </div>
    </div>
  );
}
