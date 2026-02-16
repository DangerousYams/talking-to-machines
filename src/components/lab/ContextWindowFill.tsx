import { useState, useEffect, useRef, useCallback } from 'react';

/*
 * ContextWindowFill
 * -----------------
 * An SVG animation showing a tall "context window" container that fills
 * with colored message blocks (user vs AI). A purple system prompt is
 * pinned at the top. When capacity nears ~90%, oldest messages fade out
 * and slide away, demonstrating how context windows overflow.
 */

interface MessageBlock {
  id: number;
  role: 'user' | 'ai';
  tokens: number;
  label: string;
  opacity: number;
  offsetY: number;
  forgotten: boolean;
}

const SYSTEM_PROMPT_TOKENS = 280;
const MAX_TOKENS = 8192;
const CONTAINER_WIDTH = 220;
const CONTAINER_HEIGHT = 380;
const CONTAINER_X = 90;
const CONTAINER_Y = 40;
const SYSTEM_BLOCK_HEIGHT = 32;
const BLOCK_GAP = 4;
const BLOCK_INSET = 6;
const INNER_WIDTH = CONTAINER_WIDTH - BLOCK_INSET * 2;
const USABLE_HEIGHT = CONTAINER_HEIGHT - SYSTEM_BLOCK_HEIGHT - BLOCK_GAP * 2 - 12;
const FILL_BAR_X = 60;
const FILL_BAR_WIDTH = 6;

const PURPLE = '#7B61FF';
const CORAL = '#E94560';
const SKY = '#0EA5E9';
const DEEP = '#1A1A2E';
const SUBTLE = '#6B7280';

// Pre-scripted messages to cycle through
const MESSAGE_SCRIPT: Array<{ role: 'user' | 'ai'; tokens: number; label: string }> = [
  { role: 'user', tokens: 142, label: 'User' },
  { role: 'ai', tokens: 386, label: 'AI' },
  { role: 'user', tokens: 98, label: 'User' },
  { role: 'ai', tokens: 512, label: 'AI' },
  { role: 'user', tokens: 210, label: 'User' },
  { role: 'ai', tokens: 648, label: 'AI' },
  { role: 'user', tokens: 176, label: 'User' },
  { role: 'ai', tokens: 890, label: 'AI' },
  { role: 'user', tokens: 124, label: 'User' },
  { role: 'ai', tokens: 720, label: 'AI' },
  { role: 'user', tokens: 308, label: 'User' },
  { role: 'ai', tokens: 564, label: 'AI' },
];

// Map token count to proportional block height (within the usable area)
function tokenToHeight(tokens: number): number {
  const maxMsgTokens = 900;
  const minH = 22;
  const maxH = 58;
  return minH + (tokens / maxMsgTokens) * (maxH - minH);
}

export default function ContextWindowFill() {
  const [messages, setMessages] = useState<MessageBlock[]>([]);
  const [totalTokens, setTotalTokens] = useState(SYSTEM_PROMPT_TOKENS);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showBracket, setShowBracket] = useState(false);
  const mountedRef = useRef(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const messageIdRef = useRef(0);
  const scriptIndexRef = useRef(0);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Calculate visible messages and which ones overflow
  const computeLayout = useCallback((msgs: MessageBlock[]) => {
    let usedTokens = SYSTEM_PROMPT_TOKENS;
    const updated: MessageBlock[] = [];

    // Calculate total token usage for all active messages
    for (const m of msgs) {
      usedTokens += m.tokens;
    }

    // If over threshold, mark oldest as forgotten
    const threshold = MAX_TOKENS * 0.88;
    let runningTokens = SYSTEM_PROMPT_TOKENS;
    let forgottenCount = 0;

    if (usedTokens > threshold) {
      // Find how many from the start need to be forgotten
      let excess = usedTokens - threshold;
      for (let i = 0; i < msgs.length; i++) {
        if (excess > 0) {
          forgottenCount++;
          excess -= msgs[i].tokens;
        }
      }
    }

    for (let i = 0; i < msgs.length; i++) {
      const isForgotten = i < forgottenCount;
      runningTokens += msgs[i].tokens;
      updated.push({
        ...msgs[i],
        forgotten: isForgotten,
        opacity: isForgotten ? 0 : 1,
        offsetY: isForgotten ? 30 : 0,
      });
    }

    return { updated, totalTokens: usedTokens };
  }, []);

  const runCycle = useCallback(() => {
    if (!mountedRef.current) return;
    clearTimers();

    // Reset state
    messageIdRef.current = 0;
    scriptIndexRef.current = 0;
    setMessages([]);
    setTotalTokens(SYSTEM_PROMPT_TOKENS);
    setShowBracket(false);

    const addMessage = (index: number) => {
      if (!mountedRef.current) return;
      if (index >= MESSAGE_SCRIPT.length) {
        // Hold for a moment, then restart
        const t = setTimeout(() => {
          if (!mountedRef.current) return;
          runCycle();
        }, 3000);
        timersRef.current.push(t);
        return;
      }

      const script = MESSAGE_SCRIPT[index];
      const newMsg: MessageBlock = {
        id: messageIdRef.current++,
        role: script.role,
        tokens: script.tokens,
        label: script.label,
        opacity: 1,
        offsetY: 0,
        forgotten: false,
      };

      setMessages(prev => {
        const next = [...prev, newMsg];
        const { updated, totalTokens: tt } = computeLayout(next);
        setTotalTokens(tt);

        // Show bracket after 3rd message
        if (updated.length >= 3) {
          setShowBracket(true);
        }

        // Remove forgotten messages after animation delay
        const hasForgotten = updated.some(m => m.forgotten);
        if (hasForgotten) {
          const t = setTimeout(() => {
            if (!mountedRef.current) return;
            setMessages(current => {
              const filtered = current.filter(m => !m.forgotten);
              const { updated: recomputed, totalTokens: tt2 } = computeLayout(filtered);
              setTotalTokens(tt2);
              return recomputed;
            });
          }, 800);
          timersRef.current.push(t);
        }

        return updated;
      });

      // Schedule next message
      const delay = 1500 + Math.random() * 500;
      const t = setTimeout(() => addMessage(index + 1), delay);
      timersRef.current.push(t);
    };

    // Start adding messages after a brief pause
    const t0 = setTimeout(() => addMessage(0), 800);
    timersRef.current.push(t0);
  }, [clearTimers, computeLayout]);

  useEffect(() => {
    mountedRef.current = true;

    if (reducedMotion) {
      // Show a static state with several messages
      const staticMsgs: MessageBlock[] = MESSAGE_SCRIPT.slice(0, 6).map((s, i) => ({
        id: i,
        role: s.role,
        tokens: s.tokens,
        label: s.label,
        opacity: 1,
        offsetY: 0,
        forgotten: false,
      }));
      setMessages(staticMsgs);
      setTotalTokens(SYSTEM_PROMPT_TOKENS + staticMsgs.reduce((a, m) => a + m.tokens, 0));
      setShowBracket(true);
      return;
    }

    runCycle();

    return () => {
      mountedRef.current = false;
      clearTimers();
    };
  }, [reducedMotion, runCycle, clearTimers]);

  // Compute block positions (stacking from bottom of container upward)
  const blockPositions = (() => {
    const positions: Array<{ msg: MessageBlock; x: number; y: number; w: number; h: number }> = [];
    let stackBottom = CONTAINER_Y + CONTAINER_HEIGHT - BLOCK_INSET;
    const activeMessages = messages.filter(m => !m.forgotten);

    // Stack from bottom upward
    for (let i = activeMessages.length - 1; i >= 0; i--) {
      const msg = activeMessages[i];
      const h = tokenToHeight(msg.tokens);
      const y = stackBottom - h;
      positions.unshift({
        msg,
        x: CONTAINER_X + BLOCK_INSET,
        y,
        w: INNER_WIDTH,
        h,
      });
      stackBottom = y - BLOCK_GAP;
    }

    return positions;
  })();

  // Fill percentage
  const fillPct = Math.min((totalTokens / MAX_TOKENS) * 100, 100);
  const fillColor = fillPct > 85 ? CORAL : fillPct > 60 ? '#F5A623' : PURPLE;

  // Bracket y positions
  const bracketVisible = showBracket && blockPositions.length > 0;
  const bracketTop = bracketVisible
    ? Math.max(blockPositions[0]?.y ?? CONTAINER_Y + SYSTEM_BLOCK_HEIGHT + 20, CONTAINER_Y + SYSTEM_BLOCK_HEIGHT + 12)
    : CONTAINER_Y + SYSTEM_BLOCK_HEIGHT + 20;
  const bracketBottom = CONTAINER_Y + CONTAINER_HEIGHT - BLOCK_INSET;

  const transition = reducedMotion ? 'none' : 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  const fadeTransition = reducedMotion ? 'none' : 'opacity 0.5s ease, transform 0.5s ease';

  const containerStyle: React.CSSProperties = {
    maxWidth: 520,
    margin: '0 auto',
    background: '#FFFFFF',
    borderRadius: 16,
    border: '1px solid rgba(26, 26, 46, 0.06)',
    boxShadow: '0 4px 32px rgba(26, 26, 46, 0.06), 0 1px 4px rgba(0,0,0,0.02)',
    padding: '24px 16px',
    overflow: 'hidden',
    position: 'relative',
  };

  return (
    <div style={containerStyle}>
      {/* Title */}
      <div style={{
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 16,
        fontWeight: 700,
        color: DEEP,
        letterSpacing: '-0.01em',
      }}>
        Context Window
      </div>

      <svg
        viewBox="0 0 440 460"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
        aria-label="Context window container filling with message blocks that overflow when capacity is reached"
      >
        {/* Fill bar (left side) */}
        <rect
          x={FILL_BAR_X}
          y={CONTAINER_Y}
          width={FILL_BAR_WIDTH}
          height={CONTAINER_HEIGHT}
          rx={3}
          fill="rgba(26, 26, 46, 0.04)"
        />
        <rect
          x={FILL_BAR_X}
          y={CONTAINER_Y + CONTAINER_HEIGHT * (1 - fillPct / 100)}
          width={FILL_BAR_WIDTH}
          height={CONTAINER_HEIGHT * (fillPct / 100)}
          rx={3}
          fill={fillColor}
          opacity={0.5}
          style={{ transition }}
        />
        {/* Fill percentage label */}
        <text
          x={FILL_BAR_X + FILL_BAR_WIDTH / 2}
          y={CONTAINER_Y + CONTAINER_HEIGHT + 18}
          textAnchor="middle"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            fontWeight: 600,
            fill: fillColor,
            transition: reducedMotion ? 'none' : 'fill 0.4s ease',
          }}
        >
          {Math.round(fillPct)}%
        </text>

        {/* Container outline */}
        <rect
          x={CONTAINER_X}
          y={CONTAINER_Y}
          width={CONTAINER_WIDTH}
          height={CONTAINER_HEIGHT}
          rx={14}
          fill="rgba(26, 26, 46, 0.015)"
          stroke="rgba(26, 26, 46, 0.1)"
          strokeWidth={1.5}
        />
        {/* Inner subtle border */}
        <rect
          x={CONTAINER_X + 3}
          y={CONTAINER_Y + 3}
          width={CONTAINER_WIDTH - 6}
          height={CONTAINER_HEIGHT - 6}
          rx={11}
          fill="none"
          stroke="rgba(26, 26, 46, 0.03)"
          strokeWidth={1}
        />

        {/* Capacity label at top */}
        <text
          x={CONTAINER_X + CONTAINER_WIDTH / 2}
          y={CONTAINER_Y - 10}
          textAnchor="middle"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            fill: SUBTLE,
            letterSpacing: '0.04em',
          }}
        >
          8,192 tokens
        </text>

        {/* System prompt block (pinned at top) */}
        <g>
          <rect
            x={CONTAINER_X + BLOCK_INSET}
            y={CONTAINER_Y + BLOCK_INSET}
            width={INNER_WIDTH}
            height={SYSTEM_BLOCK_HEIGHT}
            rx={8}
            fill={PURPLE}
            opacity={0.9}
          />
          {/* System prompt inner highlight */}
          <rect
            x={CONTAINER_X + BLOCK_INSET + 6}
            y={CONTAINER_Y + BLOCK_INSET + 3}
            width={INNER_WIDTH - 12}
            height={1.5}
            rx={0.75}
            fill="rgba(255,255,255,0.2)"
          />
          {/* Lock icon (small) */}
          <g transform={`translate(${CONTAINER_X + BLOCK_INSET + 12}, ${CONTAINER_Y + BLOCK_INSET + SYSTEM_BLOCK_HEIGHT / 2 - 5})`}>
            <rect x={2} y={4} width={6} height={6} rx={1} fill="rgba(255,255,255,0.8)" />
            <path
              d="M3 4 V2.5 A2.5 2.5 0 0 1 8 2.5 V4"
              fill="none"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth={1.2}
              strokeLinecap="round"
            />
          </g>
          <text
            x={CONTAINER_X + BLOCK_INSET + 28}
            y={CONTAINER_Y + BLOCK_INSET + SYSTEM_BLOCK_HEIGHT / 2 + 1}
            dominantBaseline="central"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9.5,
              fontWeight: 600,
              fill: 'rgba(255,255,255,0.9)',
              letterSpacing: '0.03em',
            }}
          >
            System Prompt
          </text>
          <text
            x={CONTAINER_X + INNER_WIDTH - 4}
            y={CONTAINER_Y + BLOCK_INSET + SYSTEM_BLOCK_HEIGHT / 2 + 1}
            textAnchor="end"
            dominantBaseline="central"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8,
              fontWeight: 500,
              fill: 'rgba(255,255,255,0.55)',
            }}
          >
            {SYSTEM_PROMPT_TOKENS} tk
          </text>
        </g>

        {/* Dashed separator below system prompt */}
        <line
          x1={CONTAINER_X + BLOCK_INSET + 8}
          y1={CONTAINER_Y + BLOCK_INSET + SYSTEM_BLOCK_HEIGHT + BLOCK_GAP + 2}
          x2={CONTAINER_X + BLOCK_INSET + INNER_WIDTH - 8}
          y2={CONTAINER_Y + BLOCK_INSET + SYSTEM_BLOCK_HEIGHT + BLOCK_GAP + 2}
          stroke="rgba(26, 26, 46, 0.08)"
          strokeWidth={1}
          strokeDasharray="4 3"
        />

        {/* Message blocks */}
        {blockPositions.map(({ msg, x, y, w, h }) => {
          const isUser = msg.role === 'user';
          const blockColor = isUser ? CORAL : SKY;
          const isForgotten = msg.forgotten;

          return (
            <g
              key={msg.id}
              style={{
                opacity: isForgotten ? 0 : msg.opacity,
                transform: isForgotten
                  ? `translateY(${h + 20}px)`
                  : `translateY(0px)`,
                transition: fadeTransition,
              }}
            >
              {/* Block shadow */}
              <rect
                x={x + 1}
                y={y + 2}
                width={w}
                height={h}
                rx={7}
                fill="rgba(0,0,0,0.03)"
              />
              {/* Block body */}
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={7}
                fill={blockColor}
                opacity={0.85}
              />
              {/* Top highlight */}
              <rect
                x={x + 6}
                y={y + 3}
                width={w - 12}
                height={1}
                rx={0.5}
                fill="rgba(255,255,255,0.18)"
              />
              {/* Role label */}
              <text
                x={x + 10}
                y={y + h / 2 + (h > 30 ? -4 : 1)}
                dominantBaseline="central"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  fontWeight: 700,
                  fill: 'rgba(255,255,255,0.9)',
                  letterSpacing: '0.04em',
                }}
              >
                {msg.label}
              </text>
              {/* Token count */}
              <text
                x={x + w - 10}
                y={y + h / 2 + (h > 30 ? -4 : 1)}
                textAnchor="end"
                dominantBaseline="central"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 7.5,
                  fontWeight: 500,
                  fill: 'rgba(255,255,255,0.55)',
                }}
              >
                {msg.tokens} tk
              </text>
              {/* Simulated text lines inside block (only if tall enough) */}
              {h > 34 && (
                <>
                  <rect
                    x={x + 10}
                    y={y + h / 2 + 4}
                    width={w * 0.55}
                    height={2.5}
                    rx={1.25}
                    fill="rgba(255,255,255,0.12)"
                  />
                  {h > 44 && (
                    <rect
                      x={x + 10}
                      y={y + h / 2 + 12}
                      width={w * 0.38}
                      height={2.5}
                      rx={1.25}
                      fill="rgba(255,255,255,0.08)"
                    />
                  )}
                </>
              )}

              {/* Strikethrough for forgotten messages */}
              {isForgotten && (
                <line
                  x1={x + 8}
                  y1={y + h / 2}
                  x2={x + w - 8}
                  y2={y + h / 2}
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              )}
            </g>
          );
        })}

        {/* Token counter (right side) */}
        <g>
          <text
            x={CONTAINER_X + CONTAINER_WIDTH + 28}
            y={CONTAINER_Y + 20}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fontWeight: 600,
              fill: SUBTLE,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Used
          </text>
          <text
            x={CONTAINER_X + CONTAINER_WIDTH + 28}
            y={CONTAINER_Y + 38}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 700,
              fill: fillPct > 85 ? CORAL : DEEP,
              transition: reducedMotion ? 'none' : 'fill 0.4s ease',
            }}
          >
            {totalTokens.toLocaleString()}
          </text>
          <text
            x={CONTAINER_X + CONTAINER_WIDTH + 28}
            y={CONTAINER_Y + 54}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fontWeight: 500,
              fill: SUBTLE,
              opacity: 0.7,
            }}
          >
            / 8,192
          </text>
        </g>

        {/* "What AI sees right now" bracket (right side, along the visible blocks) */}
        {bracketVisible && (() => {
          const bx = CONTAINER_X + CONTAINER_WIDTH + 20;
          const tipX = bx + 10;
          const bTop = bracketTop;
          const bBottom = bracketBottom;
          const bMid = (bTop + bBottom) / 2;

          return (
            <g style={{
              opacity: showBracket ? 1 : 0,
              transform: showBracket ? 'translateX(0)' : 'translateX(-6px)',
              transition: reducedMotion ? 'none' : 'opacity 0.6s ease, transform 0.6s ease',
            }}>
              <path
                d={`
                  M ${bx} ${bTop + 70}
                  L ${tipX} ${bTop + 70}
                  L ${tipX} ${bMid - 4}
                  L ${tipX + 4} ${bMid}
                  L ${tipX} ${bMid + 4}
                  L ${tipX} ${bBottom}
                  L ${bx} ${bBottom}
                `}
                fill="none"
                stroke={PURPLE}
                strokeWidth={1.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.35}
              />
              {/* Label text */}
              <text
                x={tipX + 14}
                y={bMid - 10}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 8,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fill: PURPLE,
                  opacity: 0.6,
                }}
              >
                What AI
              </text>
              <text
                x={tipX + 14}
                y={bMid + 2}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 8,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fill: PURPLE,
                  opacity: 0.6,
                }}
              >
                sees now
              </text>
            </g>
          );
        })()}

        {/* Legend at bottom */}
        <g>
          {/* System prompt legend */}
          <rect x={CONTAINER_X} y={CONTAINER_Y + CONTAINER_HEIGHT + 24} width={10} height={10} rx={3} fill={PURPLE} opacity={0.8} />
          <text
            x={CONTAINER_X + 16}
            y={CONTAINER_Y + CONTAINER_HEIGHT + 31}
            dominantBaseline="central"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fill: SUBTLE,
              letterSpacing: '0.03em',
            }}
          >
            System prompt (pinned)
          </text>

          {/* User legend */}
          <rect x={CONTAINER_X} y={CONTAINER_Y + CONTAINER_HEIGHT + 42} width={10} height={10} rx={3} fill={CORAL} opacity={0.8} />
          <text
            x={CONTAINER_X + 16}
            y={CONTAINER_Y + CONTAINER_HEIGHT + 49}
            dominantBaseline="central"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fill: SUBTLE,
              letterSpacing: '0.03em',
            }}
          >
            User message
          </text>

          {/* AI legend */}
          <rect x={CONTAINER_X + 130} y={CONTAINER_Y + CONTAINER_HEIGHT + 42} width={10} height={10} rx={3} fill={SKY} opacity={0.8} />
          <text
            x={CONTAINER_X + 146}
            y={CONTAINER_Y + CONTAINER_HEIGHT + 49}
            dominantBaseline="central"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fill: SUBTLE,
              letterSpacing: '0.03em',
            }}
          >
            AI response
          </text>
        </g>
      </svg>
    </div>
  );
}
