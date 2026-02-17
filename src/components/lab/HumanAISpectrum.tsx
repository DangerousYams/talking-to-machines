import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';

/*
 * HumanAISpectrum
 * ---------------
 * Ch10 — "The Human Edge"
 * An animated spectrum showing skills sliding from center
 * to their position between "AI excels" and "Uniquely human".
 * Desktop: horizontal layout (600x340). Cards alternate above/below the bar.
 * Mobile: vertical layout (340x600). Cards alternate left/right of the bar.
 * After all placed, a bracket highlights the interesting middle zone.
 */

interface SkillCard {
  name: string;
  aiPercent: number; // 0 = fully human, 100 = fully AI
}

const SKILLS: SkillCard[] = [
  { name: 'Data entry', aiPercent: 90 },
  { name: 'Writing first drafts', aiPercent: 70 },
  { name: 'Code scaffolding', aiPercent: 65 },
  { name: 'Research synthesis', aiPercent: 50 },
  { name: 'Strategic planning', aiPercent: 35 },
  { name: 'Empathy in a crisis', aiPercent: 10 },
  { name: 'Original questions', aiPercent: 5 },
  { name: 'Creative vision', aiPercent: 15 },
];

const COLORS = {
  deep: '#1A1A2E',
  sky: '#0EA5E9',
  teal: '#16C79A',
  subtle: '#6B7280',
  cream: '#FAF8F5',
};

// Interpolate between sky blue and teal based on AI percent
function interpolateColor(aiPercent: number): string {
  const t = 1 - aiPercent / 100; // 0 = sky, 1 = teal
  const r = Math.round(14 + t * (22 - 14));
  const g = Math.round(165 + t * (199 - 165));
  const b = Math.round(233 + t * (154 - 233));
  return `rgb(${r}, ${g}, ${b})`;
}

function interpolateColorAlpha(aiPercent: number, alpha: number): string {
  const t = 1 - aiPercent / 100;
  const r = Math.round(14 + t * (22 - 14));
  const g = Math.round(165 + t * (199 - 165));
  const b = Math.round(233 + t * (154 - 233));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const CARD_APPEAR_INTERVAL = 700;
const CARD_SLIDE_DURATION = 650;
const BRACKET_DELAY = 600;
const HOLD_DURATION = 4000;

// --- DESKTOP (horizontal) SVG layout constants ---
const SVG_WIDTH = 600;
const SVG_HEIGHT = 340;
const BAR_Y = 155;
const BAR_X_START = 50;
const BAR_X_END = SVG_WIDTH - 50;
const BAR_WIDTH = BAR_X_END - BAR_X_START;
const BAR_HEIGHT = 8;
const CARD_WIDTH = 106;
const CARD_HEIGHT = 26;
const LINE_GAP = 3;

// Pre-compute card Y positions to avoid overlaps (desktop)
const ABOVE_OFFSETS = [38, 70, 38, 70];
const BELOW_OFFSETS = [38, 70, 38, 70];

function getDesktopCardY(index: number): number {
  const isAbove = index % 2 === 0;
  const slotIndex = Math.floor(index / 2);
  if (isAbove) {
    return BAR_Y - ABOVE_OFFSETS[slotIndex];
  } else {
    return BAR_Y + BELOW_OFFSETS[slotIndex];
  }
}

// --- MOBILE (vertical) SVG layout constants ---
const M_SVG_WIDTH = 340;
const M_SVG_HEIGHT = 780;
const M_BAR_X = 170; // centered horizontal position of vertical bar
const M_BAR_Y_START = 70;
const M_BAR_Y_END = 700;
const M_BAR_LENGTH = M_BAR_Y_END - M_BAR_Y_START;
const M_BAR_WIDTH = 8; // thickness of the bar
const M_CARD_WIDTH = 116;
const M_CARD_HEIGHT = 30;
const M_LINE_GAP = 3;

// Cards alternate left/right of the vertical bar
// Even indices: left, odd indices: right
const M_LEFT_OFFSETS = [76, 76, 76, 76]; // distance from bar center for left cards
const M_RIGHT_OFFSETS = [76, 76, 76, 76]; // distance from bar center for right cards

function getMobileCardX(index: number): number {
  const isLeft = index % 2 === 0;
  const slotIndex = Math.floor(index / 2);
  if (isLeft) {
    return M_BAR_X - M_LEFT_OFFSETS[slotIndex];
  } else {
    return M_BAR_X + M_RIGHT_OFFSETS[slotIndex];
  }
}

function getMobileCardTargetY(aiPercent: number): number {
  // aiPercent=100 (AI excels) maps to top, aiPercent=0 (human) maps to bottom
  return M_BAR_Y_START + ((100 - aiPercent) / 100) * M_BAR_LENGTH;
}

export default function HumanAISpectrum() {
  const isMobile = useIsMobile();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [settledCount, setSettledCount] = useState(0);
  const [showBracket, setShowBracket] = useState(false);
  const [phase, setPhase] = useState<'placing' | 'showing' | 'fading'>('placing');
  const mountedRef = useRef(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Main animation cycle
  useEffect(() => {
    mountedRef.current = true;

    if (reducedMotion) {
      setVisibleCount(SKILLS.length);
      setSettledCount(SKILLS.length);
      setShowBracket(true);
      setPhase('showing');
      return;
    }

    const runCycle = () => {
      if (!mountedRef.current) return;
      clearTimers();

      setVisibleCount(0);
      setSettledCount(0);
      setShowBracket(false);
      setPhase('placing');

      for (let i = 0; i < SKILLS.length; i++) {
        const appearDelay = 500 + i * CARD_APPEAR_INTERVAL;
        const settleDelay = appearDelay + CARD_SLIDE_DURATION;

        const t1 = setTimeout(() => {
          if (!mountedRef.current) return;
          setVisibleCount(i + 1);
        }, appearDelay);
        timersRef.current.push(t1);

        const t2 = setTimeout(() => {
          if (!mountedRef.current) return;
          setSettledCount(i + 1);
        }, settleDelay);
        timersRef.current.push(t2);
      }

      const bracketTime = 500 + SKILLS.length * CARD_APPEAR_INTERVAL + CARD_SLIDE_DURATION + BRACKET_DELAY;
      const t3 = setTimeout(() => {
        if (!mountedRef.current) return;
        setShowBracket(true);
        setPhase('showing');
      }, bracketTime);
      timersRef.current.push(t3);

      const fadeTime = bracketTime + HOLD_DURATION;
      const t4 = setTimeout(() => {
        if (!mountedRef.current) return;
        setPhase('fading');
      }, fadeTime);
      timersRef.current.push(t4);

      const restartTime = fadeTime + 1000;
      const t5 = setTimeout(() => {
        if (!mountedRef.current) return;
        runCycle();
      }, restartTime);
      timersRef.current.push(t5);
    };

    runCycle();

    return () => {
      mountedRef.current = false;
      clearTimers();
    };
  }, [reducedMotion]);

  const transition = reducedMotion
    ? 'none'
    : `transform ${CARD_SLIDE_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${CARD_SLIDE_DURATION}ms ease`;
  const fadeTransition = reducedMotion ? 'none' : 'opacity 0.8s ease';

  // Dynamic container style
  const dynContainerStyle: React.CSSProperties = isMobile
    ? {
        margin: '0 auto',
        background: '#FFFFFF',
        overflow: 'hidden',
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
      }
    : {
        maxWidth: 650,
        margin: '0 auto',
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid rgba(26, 26, 46, 0.06)',
        boxShadow: '0 4px 32px rgba(26, 26, 46, 0.06)',
        padding: '24px 20px',
        overflow: 'hidden',
      };

  // ========== MOBILE (Vertical) Layout ==========
  if (isMobile) {
    const centerY = M_BAR_Y_START + M_BAR_LENGTH / 2;

    // Bracket zone: 25% to 75% AI (mapped vertically, inverted)
    const bracketTop = getMobileCardTargetY(75); // 75% AI = closer to top
    const bracketBottom = getMobileCardTargetY(25); // 25% AI = closer to bottom
    const bracketMidY = (bracketTop + bracketBottom) / 2;

    return (
      <div style={dynContainerStyle}>
        <svg
          viewBox={`0 0 ${M_SVG_WIDTH} ${M_SVG_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            flex: 1,
            opacity: phase === 'fading' ? 0 : 1,
            transition: fadeTransition,
          }}
          role="img"
          aria-label="Vertical spectrum showing skills positioned between AI excels and uniquely human"
        >
          <defs>
            <linearGradient id="spectrumGradV" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={COLORS.sky} stopOpacity={0.55} />
              <stop offset="50%" stopColor="rgba(26, 26, 46, 0.05)" />
              <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0.55} />
            </linearGradient>
            <linearGradient id="spectrumTrackV" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={COLORS.sky} stopOpacity={0.06} />
              <stop offset="50%" stopColor="rgba(26, 26, 46, 0.02)" />
              <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0.06} />
            </linearGradient>
          </defs>

          {/* Wide track background (vertical) */}
          <rect
            x={M_BAR_X - 14}
            y={M_BAR_Y_START - 4}
            width={28}
            height={M_BAR_LENGTH + 8}
            rx={14}
            fill="url(#spectrumTrackV)"
          />

          {/* Main spectrum bar (vertical) */}
          <rect
            x={M_BAR_X - M_BAR_WIDTH / 2}
            y={M_BAR_Y_START}
            width={M_BAR_WIDTH}
            height={M_BAR_LENGTH}
            rx={M_BAR_WIDTH / 2}
            fill="url(#spectrumGradV)"
          />

          {/* Subtle tick marks (horizontal, across the vertical bar) */}
          {[0, 25, 50, 75, 100].map(pct => {
            const ty = M_BAR_Y_START + ((100 - pct) / 100) * M_BAR_LENGTH;
            return (
              <line
                key={pct}
                x1={M_BAR_X - M_BAR_WIDTH / 2 - 2}
                y1={ty}
                x2={M_BAR_X + M_BAR_WIDTH / 2 + 2}
                y2={ty}
                stroke="rgba(26, 26, 46, 0.08)"
                strokeWidth={1}
              />
            );
          })}

          {/* Top label: AI excels */}
          <g>
            <rect
              x={M_BAR_X - 6}
              y={24}
              width={12}
              height={12}
              rx={3}
              fill={COLORS.sky}
              opacity={0.12}
            />
            <rect
              x={M_BAR_X - 3}
              y={27}
              width={6}
              height={6}
              rx={1.5}
              fill={COLORS.sky}
              opacity={0.35}
            />
            <text
              x={M_BAR_X}
              y={16}
              textAnchor="middle"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                fill: COLORS.sky,
                letterSpacing: '0.04em',
              }}
            >
              AI excels
            </text>
          </g>

          {/* Bottom label: Uniquely human */}
          <g>
            <circle
              cx={M_BAR_X}
              cy={M_BAR_Y_END + 30}
              r={6}
              fill={COLORS.teal}
              opacity={0.12}
            />
            <circle
              cx={M_BAR_X}
              cy={M_BAR_Y_END + 30}
              r={2.5}
              fill={COLORS.teal}
              opacity={0.35}
            />
            <text
              x={M_BAR_X}
              y={M_SVG_HEIGHT - 16}
              textAnchor="middle"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                fill: COLORS.teal,
                letterSpacing: '0.04em',
              }}
            >
              Uniquely human
            </text>
          </g>

          {/* Skill cards — vertical layout, alternating left/right */}
          {SKILLS.map((skill, i) => {
            const isVisible = i < visibleCount;
            const isSettled = i < settledCount;
            const isLeft = i % 2 === 0;

            const targetY = getMobileCardTargetY(skill.aiPercent);
            const cardY = isSettled ? targetY : centerY;
            const cardX = getMobileCardX(i);

            const color = interpolateColor(skill.aiPercent);
            const bgColor = interpolateColorAlpha(skill.aiPercent, 0.07);
            const borderColor = interpolateColorAlpha(skill.aiPercent, 0.22);

            // Connector line endpoints (horizontal, from card to bar)
            const lineFromX = isLeft
              ? cardX + M_CARD_WIDTH / 2 + M_LINE_GAP
              : cardX - M_CARD_WIDTH / 2 - M_LINE_GAP;
            const lineToX = isLeft
              ? M_BAR_X - M_BAR_WIDTH / 2 - M_LINE_GAP
              : M_BAR_X + M_BAR_WIDTH / 2 + M_LINE_GAP;

            return (
              <g
                key={skill.name}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transition,
                }}
              >
                {/* Connector line (horizontal) */}
                {isSettled && (
                  <line
                    x1={lineFromX}
                    y1={cardY}
                    x2={lineToX}
                    y2={cardY}
                    stroke={color}
                    strokeWidth={1}
                    opacity={0.25}
                    strokeDasharray="3 2"
                  />
                )}

                {/* Dot on bar */}
                {isSettled && (
                  <circle
                    cx={M_BAR_X}
                    cy={cardY}
                    r={3.5}
                    fill={color}
                    opacity={0.6}
                  />
                )}

                {/* Card pill — positioned via transform for smooth animation */}
                <g
                  style={{
                    transform: `translate(${cardX - M_CARD_WIDTH / 2}px, ${cardY - M_CARD_HEIGHT / 2}px)`,
                    transition,
                  }}
                >
                  {/* Shadow */}
                  <rect
                    x={1}
                    y={1.5}
                    width={M_CARD_WIDTH}
                    height={M_CARD_HEIGHT}
                    rx={M_CARD_HEIGHT / 2}
                    fill="rgba(0,0,0,0.03)"
                  />
                  {/* White background */}
                  <rect
                    x={0}
                    y={0}
                    width={M_CARD_WIDTH}
                    height={M_CARD_HEIGHT}
                    rx={M_CARD_HEIGHT / 2}
                    fill="#FFFFFF"
                    stroke={borderColor}
                    strokeWidth={1.2}
                  />
                  {/* Color wash */}
                  <rect
                    x={0}
                    y={0}
                    width={M_CARD_WIDTH}
                    height={M_CARD_HEIGHT}
                    rx={M_CARD_HEIGHT / 2}
                    fill={bgColor}
                  />
                  {/* Color dot indicator */}
                  <circle
                    cx={14}
                    cy={M_CARD_HEIGHT / 2}
                    r={3.5}
                    fill={color}
                    opacity={0.55}
                  />
                  {/* Skill name */}
                  <text
                    x={23}
                    y={M_CARD_HEIGHT / 2 + 0.5}
                    dominantBaseline="central"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9.5,
                      fontWeight: 600,
                      fill: COLORS.deep,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {skill.name}
                  </text>
                </g>
              </g>
            );
          })}

          {/* "Interesting zone" bracket (vertical) */}
          {showBracket && (
            <g style={{
              opacity: 1,
              transition: reducedMotion ? 'none' : 'opacity 0.8s ease',
            }}>
              {/* Dashed highlight around middle zone of bar */}
              <rect
                x={M_BAR_X - M_BAR_WIDTH / 2 - 3}
                y={bracketTop}
                width={M_BAR_WIDTH + 6}
                height={bracketBottom - bracketTop}
                rx={M_BAR_WIDTH / 2 + 2}
                fill="none"
                stroke={COLORS.teal}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.3}
              />

              {/* Right bracket arms (pointing right from the bar to the label) */}
              <path
                d={`
                  M ${M_BAR_X + M_BAR_WIDTH / 2 + 50} ${bracketTop}
                  L ${M_BAR_X + M_BAR_WIDTH / 2 + 58} ${bracketTop}
                  L ${M_BAR_X + M_BAR_WIDTH / 2 + 58} ${bracketMidY - 3}
                `}
                fill="none"
                stroke={COLORS.teal}
                strokeWidth={1}
                opacity={0.35}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={`
                  M ${M_BAR_X + M_BAR_WIDTH / 2 + 50} ${bracketBottom}
                  L ${M_BAR_X + M_BAR_WIDTH / 2 + 58} ${bracketBottom}
                  L ${M_BAR_X + M_BAR_WIDTH / 2 + 58} ${bracketMidY + 3}
                `}
                fill="none"
                stroke={COLORS.teal}
                strokeWidth={1}
                opacity={0.35}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Center diamond */}
              <polygon
                points={`${M_BAR_X + M_BAR_WIDTH / 2 + 55},${bracketMidY} ${M_BAR_X + M_BAR_WIDTH / 2 + 58},${bracketMidY + 3} ${M_BAR_X + M_BAR_WIDTH / 2 + 61},${bracketMidY} ${M_BAR_X + M_BAR_WIDTH / 2 + 58},${bracketMidY - 3}`}
                fill={COLORS.teal}
                opacity={0.3}
              />

              {/* Label line 1 — rotated 90deg for vertical reading alongside bracket */}
              <text
                x={M_BAR_X + M_BAR_WIDTH / 2 + 72}
                y={bracketMidY - 8}
                textAnchor="middle"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  fontWeight: 600,
                  fill: COLORS.teal,
                  letterSpacing: '0.03em',
                  opacity: 0.65,
                }}
                transform={`rotate(90, ${M_BAR_X + M_BAR_WIDTH / 2 + 72}, ${bracketMidY - 8})`}
              >
                The interesting zone
              </text>
              {/* Label line 2 */}
              <text
                x={M_BAR_X + M_BAR_WIDTH / 2 + 84}
                y={bracketMidY - 8}
                textAnchor="middle"
                style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: 10,
                  fill: COLORS.subtle,
                  fontStyle: 'italic',
                  opacity: 0.8,
                }}
                transform={`rotate(90, ${M_BAR_X + M_BAR_WIDTH / 2 + 84}, ${bracketMidY - 8})`}
              >
                AI-assisted, human-directed
              </text>
            </g>
          )}
        </svg>
      </div>
    );
  }

  // ========== DESKTOP (Horizontal) Layout ==========
  const getCardX = (aiPercent: number) => {
    return BAR_X_START + (aiPercent / 100) * BAR_WIDTH;
  };

  const centerX = BAR_X_START + BAR_WIDTH / 2;

  // Bracket zone: 25% to 75% AI
  const bracketLeft = getCardX(25);
  const bracketRight = getCardX(75);
  const bracketMidX = (bracketLeft + bracketRight) / 2;

  return (
    <div style={dynContainerStyle}>
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          opacity: phase === 'fading' ? 0 : 1,
          transition: fadeTransition,
        }}
        role="img"
        aria-label="Horizontal spectrum showing skills positioned between AI excels and uniquely human"
      >
        <defs>
          <linearGradient id="spectrumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.sky} stopOpacity={0.55} />
            <stop offset="50%" stopColor="rgba(26, 26, 46, 0.05)" />
            <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0.55} />
          </linearGradient>
          <linearGradient id="spectrumTrack" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.sky} stopOpacity={0.06} />
            <stop offset="50%" stopColor="rgba(26, 26, 46, 0.02)" />
            <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0.06} />
          </linearGradient>
        </defs>

        {/* Wide track background */}
        <rect
          x={BAR_X_START - 4}
          y={BAR_Y - 14}
          width={BAR_WIDTH + 8}
          height={28}
          rx={14}
          fill="url(#spectrumTrack)"
        />

        {/* Main spectrum bar */}
        <rect
          x={BAR_X_START}
          y={BAR_Y - BAR_HEIGHT / 2}
          width={BAR_WIDTH}
          height={BAR_HEIGHT}
          rx={BAR_HEIGHT / 2}
          fill="url(#spectrumGrad)"
        />

        {/* Subtle tick marks */}
        {[0, 25, 50, 75, 100].map(pct => {
          const tx = BAR_X_START + (pct / 100) * BAR_WIDTH;
          return (
            <line
              key={pct}
              x1={tx}
              y1={BAR_Y - BAR_HEIGHT / 2 - 2}
              x2={tx}
              y2={BAR_Y + BAR_HEIGHT / 2 + 2}
              stroke="rgba(26, 26, 46, 0.08)"
              strokeWidth={1}
            />
          );
        })}

        {/* Left label: AI excels */}
        <g>
          <rect
            x={BAR_X_START - 2}
            y={BAR_Y + 20}
            width={12}
            height={12}
            rx={3}
            fill={COLORS.sky}
            opacity={0.12}
          />
          <rect
            x={BAR_X_START + 1}
            y={BAR_Y + 23}
            width={6}
            height={6}
            rx={1.5}
            fill={COLORS.sky}
            opacity={0.35}
          />
          <text
            x={BAR_X_START + 16}
            y={BAR_Y + 29}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              fill: COLORS.sky,
              letterSpacing: '0.04em',
            }}
          >
            AI excels
          </text>
        </g>

        {/* Right label: Uniquely human */}
        <g>
          <circle
            cx={BAR_X_END + 2}
            cy={BAR_Y + 26}
            r={6}
            fill={COLORS.teal}
            opacity={0.12}
          />
          <circle
            cx={BAR_X_END + 2}
            cy={BAR_Y + 26}
            r={2.5}
            fill={COLORS.teal}
            opacity={0.35}
          />
          <text
            x={BAR_X_END - 14}
            y={BAR_Y + 29}
            textAnchor="end"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              fill: COLORS.teal,
              letterSpacing: '0.04em',
            }}
          >
            Uniquely human
          </text>
        </g>

        {/* Skill cards — each wrapped in a <g> with animated transform */}
        {SKILLS.map((skill, i) => {
          const isVisible = i < visibleCount;
          const isSettled = i < settledCount;
          const isAbove = i % 2 === 0;

          const targetX = getCardX(skill.aiPercent);
          const cardX = isSettled ? targetX : centerX;
          const cardY = getDesktopCardY(i);

          const color = interpolateColor(skill.aiPercent);
          const bgColor = interpolateColorAlpha(skill.aiPercent, 0.07);
          const borderColor = interpolateColorAlpha(skill.aiPercent, 0.22);

          // Connector line endpoints (in local card group coords)
          const lineFromY = isAbove
            ? cardY + CARD_HEIGHT / 2 + LINE_GAP
            : cardY - CARD_HEIGHT / 2 - LINE_GAP;
          const lineToY = isAbove
            ? BAR_Y - BAR_HEIGHT / 2 - LINE_GAP
            : BAR_Y + BAR_HEIGHT / 2 + LINE_GAP;

          return (
            <g
              key={skill.name}
              style={{
                opacity: isVisible ? 1 : 0,
                transition,
              }}
            >
              {/* Connector line */}
              {isSettled && (
                <line
                  x1={cardX}
                  y1={lineFromY}
                  x2={cardX}
                  y2={lineToY}
                  stroke={color}
                  strokeWidth={1}
                  opacity={0.25}
                  strokeDasharray="3 2"
                />
              )}

              {/* Dot on bar */}
              {isSettled && (
                <circle
                  cx={cardX}
                  cy={BAR_Y}
                  r={3.5}
                  fill={color}
                  opacity={0.6}
                />
              )}

              {/* Card pill — positioned via transform for smooth animation */}
              <g
                style={{
                  transform: `translate(${cardX - CARD_WIDTH / 2}px, ${cardY - CARD_HEIGHT / 2}px)`,
                  transition,
                }}
              >
                {/* Shadow */}
                <rect
                  x={1}
                  y={1.5}
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT}
                  rx={CARD_HEIGHT / 2}
                  fill="rgba(0,0,0,0.03)"
                />
                {/* White background */}
                <rect
                  x={0}
                  y={0}
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT}
                  rx={CARD_HEIGHT / 2}
                  fill="#FFFFFF"
                  stroke={borderColor}
                  strokeWidth={1.2}
                />
                {/* Color wash */}
                <rect
                  x={0}
                  y={0}
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT}
                  rx={CARD_HEIGHT / 2}
                  fill={bgColor}
                />
                {/* Color dot indicator */}
                <circle
                  cx={13}
                  cy={CARD_HEIGHT / 2}
                  r={3}
                  fill={color}
                  opacity={0.55}
                />
                {/* Skill name */}
                <text
                  x={21}
                  y={CARD_HEIGHT / 2 + 0.5}
                  dominantBaseline="central"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 8.2,
                    fontWeight: 600,
                    fill: COLORS.deep,
                    letterSpacing: '0.01em',
                  }}
                >
                  {skill.name}
                </text>
              </g>
            </g>
          );
        })}

        {/* "Interesting zone" bracket */}
        {showBracket && (
          <g style={{
            opacity: 1,
            transition: reducedMotion ? 'none' : 'opacity 0.8s ease',
          }}>
            {/* Dashed highlight around middle zone of bar */}
            <rect
              x={bracketLeft}
              y={BAR_Y - BAR_HEIGHT / 2 - 3}
              width={bracketRight - bracketLeft}
              height={BAR_HEIGHT + 6}
              rx={BAR_HEIGHT / 2 + 2}
              fill="none"
              stroke={COLORS.teal}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              opacity={0.3}
            />

            {/* Bottom bracket arms */}
            <path
              d={`
                M ${bracketLeft} ${BAR_Y + BAR_HEIGHT / 2 + 50}
                L ${bracketLeft} ${BAR_Y + BAR_HEIGHT / 2 + 58}
                L ${bracketMidX - 3} ${BAR_Y + BAR_HEIGHT / 2 + 58}
              `}
              fill="none"
              stroke={COLORS.teal}
              strokeWidth={1}
              opacity={0.35}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={`
                M ${bracketRight} ${BAR_Y + BAR_HEIGHT / 2 + 50}
                L ${bracketRight} ${BAR_Y + BAR_HEIGHT / 2 + 58}
                L ${bracketMidX + 3} ${BAR_Y + BAR_HEIGHT / 2 + 58}
              `}
              fill="none"
              stroke={COLORS.teal}
              strokeWidth={1}
              opacity={0.35}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Center diamond */}
            <polygon
              points={`${bracketMidX},${BAR_Y + BAR_HEIGHT / 2 + 55} ${bracketMidX + 3},${BAR_Y + BAR_HEIGHT / 2 + 58} ${bracketMidX},${BAR_Y + BAR_HEIGHT / 2 + 61} ${bracketMidX - 3},${BAR_Y + BAR_HEIGHT / 2 + 58}`}
              fill={COLORS.teal}
              opacity={0.3}
            />

            {/* Label line 1 */}
            <text
              x={bracketMidX}
              y={BAR_Y + BAR_HEIGHT / 2 + 76}
              textAnchor="middle"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                fontWeight: 600,
                fill: COLORS.teal,
                letterSpacing: '0.03em',
                opacity: 0.65,
              }}
            >
              The interesting zone
            </text>
            {/* Label line 2 */}
            <text
              x={bracketMidX}
              y={BAR_Y + BAR_HEIGHT / 2 + 90}
              textAnchor="middle"
              style={{
                fontFamily: "'Lora', Georgia, serif",
                fontSize: 10,
                fill: COLORS.subtle,
                fontStyle: 'italic',
                opacity: 0.8,
              }}
            >
              AI-assisted, human-directed
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
