import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';

/*
 * MultiAgentHandoff
 * -----------------
 * A three-lane pipeline visualization showing agents passing work
 * to each other: Researcher -> Writer -> Editor. Each lane activates
 * in sequence, with animated document handoffs between lanes.
 * Pure SVG + CSS transitions, no external dependencies.
 */

interface Agent {
  name: string;
  color: string;
  icon: string;
  lines: string[];
}

const AGENTS: Agent[] = [
  {
    name: 'Researcher',
    color: '#0EA5E9',
    icon: 'search',
    lines: [
      'NASA Mars mission data...',
      'SpaceX Starship specs...',
      'Radiation shielding research...',
      'Water extraction methods...',
    ],
  },
  {
    name: 'Writer',
    color: '#7B61FF',
    icon: 'pen',
    lines: [
      'Introduction: The case for Mars',
      'Key challenges: radiation, food',
      'Current technology readiness',
      'Timeline & cost estimates',
      'Conclusion: feasibility outlook',
    ],
  },
  {
    name: 'Editor',
    color: '#16C79A',
    icon: 'edit',
    lines: [
      'Strengthen thesis statement',
      'Add source citations [3]',
      'Clarify technical terms',
      'Improve transitions',
    ],
  },
];

const TOPIC = 'Mars Colonization Report';

// Timing constants (ms)
const TOPIC_APPEAR = 800;
const LANE_ACTIVATE_DELAY = 600;
const LINE_STAGGER = 500;
const LINE_PAUSE_AFTER = 400;
const HANDOFF_DURATION = 900;
const EDITOR_MARK_STAGGER = 450;
const EDITOR_FIX_DELAY = 350;
const FINAL_BADGE_DELAY = 600;
const HOLD_DURATION = 2400;
const FADE_DURATION = 800;

type Phase =
  | 'idle'
  | 'topic'
  | 'researcher-active'
  | 'handoff-1'
  | 'writer-active'
  | 'handoff-2'
  | 'editor-active'
  | 'final'
  | 'fading';

function AgentIcon({ type, x, y, color, size = 16 }: { type: string; x: number; y: number; color: string; size?: number }) {
  const s = size / 16;
  if (type === 'search') {
    return (
      <g transform={`translate(${x}, ${y}) scale(${s})`}>
        <circle cx={-2} cy={-2} r={6} fill="none" stroke={color} strokeWidth={2} />
        <line x1={2.5} y1={2.5} x2={7} y2={7} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      </g>
    );
  }
  if (type === 'pen') {
    return (
      <g transform={`translate(${x}, ${y}) scale(${s})`}>
        <path
          d="M-6 7 L-2 -7 L2 -7 L6 7 Z"
          fill="none"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <line x1={-3.5} y1={3} x2={3.5} y2={3} stroke={color} strokeWidth={1.5} />
        <line x1={0} y1={3} x2={0} y2={7} stroke={color} strokeWidth={1.5} />
      </g>
    );
  }
  if (type === 'edit') {
    return (
      <g transform={`translate(${x}, ${y}) scale(${s})`}>
        <path
          d="M-7 6 L5 -6 L8 -3 L-4 9 L-8 9 Z"
          fill="none"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <line x1={3} y1={-4} x2={6} y2={-1} stroke={color} strokeWidth={1.5} />
      </g>
    );
  }
  return null;
}

export default function MultiAgentHandoff() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [researcherLines, setResearcherLines] = useState(0);
  const [writerLines, setWriterLines] = useState(0);
  const [editorMarked, setEditorMarked] = useState(0);
  const [editorFixed, setEditorFixed] = useState(0);
  const [showFinalBadge, setShowFinalBadge] = useState(false);
  const [handoff1Progress, setHandoff1Progress] = useState(0);
  const [handoff2Progress, setHandoff2Progress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const mountedRef = useRef(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const animFrameRef = useRef<number>(0);
  const handoffStartRef = useRef(0);
  const isMobile = useIsMobile();

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    cancelAnimationFrame(animFrameRef.current);
  };

  const addTimer = (fn: () => void, delay: number) => {
    const t = setTimeout(() => {
      if (mountedRef.current) fn();
    }, delay);
    timersRef.current.push(t);
  };

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Handoff 1 animation (researcher -> writer)
  useEffect(() => {
    if (phase !== 'handoff-1' || reducedMotion) return;
    handoffStartRef.current = Date.now();
    const animate = () => {
      if (!mountedRef.current) return;
      const elapsed = Date.now() - handoffStartRef.current;
      const t = Math.min(elapsed / HANDOFF_DURATION, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setHandoff1Progress(eased);
      if (t < 1) animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase, reducedMotion]);

  // Handoff 2 animation (writer -> editor)
  useEffect(() => {
    if (phase !== 'handoff-2' || reducedMotion) return;
    handoffStartRef.current = Date.now();
    const animate = () => {
      if (!mountedRef.current) return;
      const elapsed = Date.now() - handoffStartRef.current;
      const t = Math.min(elapsed / HANDOFF_DURATION, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setHandoff2Progress(eased);
      if (t < 1) animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase, reducedMotion]);

  useEffect(() => {
    mountedRef.current = true;

    if (reducedMotion) {
      setPhase('final');
      setResearcherLines(AGENTS[0].lines.length);
      setWriterLines(AGENTS[1].lines.length);
      setEditorMarked(AGENTS[2].lines.length);
      setEditorFixed(AGENTS[2].lines.length);
      setShowFinalBadge(true);
      setHandoff1Progress(1);
      setHandoff2Progress(1);
      return;
    }

    const runCycle = () => {
      if (!mountedRef.current) return;
      clearTimers();

      // Reset all state
      setPhase('idle');
      setResearcherLines(0);
      setWriterLines(0);
      setEditorMarked(0);
      setEditorFixed(0);
      setShowFinalBadge(false);
      setHandoff1Progress(0);
      setHandoff2Progress(0);

      let delay = 0;

      // Show topic
      delay += TOPIC_APPEAR;
      addTimer(() => setPhase('topic'), delay);

      // Activate researcher
      delay += LANE_ACTIVATE_DELAY;
      addTimer(() => setPhase('researcher-active'), delay);

      // Researcher lines appear one by one
      for (let i = 0; i < AGENTS[0].lines.length; i++) {
        delay += LINE_STAGGER;
        const lineNum = i + 1;
        addTimer(() => setResearcherLines(lineNum), delay);
      }

      // Handoff 1: researcher -> writer
      delay += LINE_PAUSE_AFTER;
      addTimer(() => setPhase('handoff-1'), delay);

      // Writer activates after handoff
      delay += HANDOFF_DURATION;
      addTimer(() => setPhase('writer-active'), delay);

      // Writer lines
      for (let i = 0; i < AGENTS[1].lines.length; i++) {
        delay += LINE_STAGGER;
        const lineNum = i + 1;
        addTimer(() => setWriterLines(lineNum), delay);
      }

      // Handoff 2: writer -> editor
      delay += LINE_PAUSE_AFTER;
      addTimer(() => setPhase('handoff-2'), delay);

      // Editor activates
      delay += HANDOFF_DURATION;
      addTimer(() => setPhase('editor-active'), delay);

      // Editor marks issues (red underlines)
      for (let i = 0; i < AGENTS[2].lines.length; i++) {
        delay += EDITOR_MARK_STAGGER;
        const markNum = i + 1;
        addTimer(() => setEditorMarked(markNum), delay);
      }

      // Editor fixes (turn green)
      delay += EDITOR_FIX_DELAY;
      for (let i = 0; i < AGENTS[2].lines.length; i++) {
        delay += EDITOR_FIX_DELAY;
        const fixNum = i + 1;
        addTimer(() => setEditorFixed(fixNum), delay);
      }

      // Final badge
      delay += FINAL_BADGE_DELAY;
      addTimer(() => {
        setShowFinalBadge(true);
        setPhase('final');
      }, delay);

      // Hold, then fade and reset
      delay += HOLD_DURATION;
      addTimer(() => setPhase('fading'), delay);

      delay += FADE_DURATION + 400;
      addTimer(() => runCycle(), delay);
    };

    runCycle();

    return () => {
      mountedRef.current = false;
      clearTimers();
    };
  }, [reducedMotion]);

  // Layout constants for SVG — responsive
  const SVG_W = isMobile ? 380 : 520;
  const SVG_H = isMobile ? 700 : 440;
  const LANE_W = isMobile ? 100 : 140;
  const LANE_GAP = isMobile ? 14 : 30;
  const LANES_LEFT = (SVG_W - 3 * LANE_W - 2 * LANE_GAP) / 2;
  const HEADER_H = 60;
  const WORKSPACE_TOP = isMobile ? 130 : 110;
  const WORKSPACE_H = isMobile ? 460 : 230;
  const LINE_H = 18;
  const LINE_GAP = isMobile ? 16 : 10;

  const getLaneX = (i: number) => LANES_LEFT + i * (LANE_W + LANE_GAP);

  const isLaneActive = (i: number): boolean => {
    if (i === 0) return phase === 'researcher-active' || phase === 'handoff-1';
    if (i === 1) return phase === 'writer-active' || phase === 'handoff-2';
    if (i === 2) return phase === 'editor-active' || phase === 'final';
    return false;
  };

  const isLaneDone = (i: number): boolean => {
    if (i === 0) return ['handoff-1', 'writer-active', 'handoff-2', 'editor-active', 'final', 'fading'].includes(phase);
    if (i === 1) return ['handoff-2', 'editor-active', 'final', 'fading'].includes(phase);
    if (i === 2) return phase === 'final' || phase === 'fading';
    return false;
  };

  // Handoff document position (bezier curve between lanes)
  const getHandoff1Pos = () => {
    const startX = getLaneX(0) + LANE_W;
    const endX = getLaneX(1);
    const midY = WORKSPACE_TOP + WORKSPACE_H / 2;
    const startY = midY + 10;
    const endY = midY - 10;
    const ctrlY = midY - 50;
    const t = handoff1Progress;
    const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ((startX + endX) / 2) + t * t * endX;
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * ctrlY + t * t * endY;
    return { x, y };
  };

  const getHandoff2Pos = () => {
    const startX = getLaneX(1) + LANE_W;
    const endX = getLaneX(2);
    const midY = WORKSPACE_TOP + WORKSPACE_H / 2;
    const startY = midY + 10;
    const endY = midY - 10;
    const ctrlY = midY - 50;
    const t = handoff2Progress;
    const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ((startX + endX) / 2) + t * t * endX;
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * ctrlY + t * t * endY;
    return { x, y };
  };

  const isFading = phase === 'fading';
  const td = reducedMotion ? '0ms' : '400ms';

  const containerStyle: React.CSSProperties = {
    maxWidth: isMobile ? 'none' : 620,
    margin: '0 auto',
    background: '#FFFFFF',
    borderRadius: isMobile ? 0 : 16,
    border: isMobile ? 'none' : '1px solid rgba(26, 26, 46, 0.06)',
    boxShadow: isMobile ? 'none' : '0 4px 32px rgba(26, 26, 46, 0.06), 0 1px 4px rgba(0,0,0,0.02)',
    padding: isMobile ? 0 : '24px 16px',
    overflow: 'hidden',
    ...(isMobile ? { flex: 1, display: 'flex', flexDirection: 'column' as const } : {}),
  };

  return (
    <div style={containerStyle}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: isMobile ? '100%' : 'auto',
          display: 'block',
          opacity: isFading ? 0 : 1,
          transition: isFading ? `opacity ${FADE_DURATION}ms ease` : 'opacity 300ms ease',
          ...(isMobile ? { flex: 1 } : {}),
        }}
        role="img"
        aria-label="Multi-agent handoff: Researcher passes notes to Writer, Writer passes draft to Editor, Editor produces final report"
      >
        <defs>
          {AGENTS.map((agent, i) => (
            <filter key={`lane-glow-${i}`} id={`lane-glow-${i}`} x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor={agent.color} floodOpacity="0.2" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Topic banner at top */}
        <g
          style={{
            opacity: phase === 'idle' ? 0 : 1,
            transform: phase === 'idle' ? 'translateY(-8px)' : 'translateY(0)',
            transition: `opacity 500ms ease, transform 500ms ease`,
          }}
        >
          <rect
            x={SVG_W / 2 - 130}
            y={14}
            width={260}
            height={34}
            rx={17}
            fill="#1A1A2E"
            opacity={0.04}
          />
          <text
            x={SVG_W / 2}
            y={35}
            textAnchor="middle"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 13,
              fontWeight: 700,
              fill: '#1A1A2E',
              letterSpacing: '0.02em',
            }}
          >
            {TOPIC}
          </text>
        </g>

        {/* Lanes */}
        {AGENTS.map((agent, laneIdx) => {
          const lx = getLaneX(laneIdx);
          const active = isLaneActive(laneIdx);
          const done = isLaneDone(laneIdx);
          const borderColor = active ? agent.color : done ? agent.color : 'rgba(26, 26, 46, 0.08)';
          const borderOpacity = active ? 0.6 : done ? 0.25 : 1;
          const bgOpacity = active ? 0.04 : 0;

          // Calculate visible lines for this lane
          let visibleLines = 0;
          let lineData: string[] = agent.lines;
          if (laneIdx === 0) visibleLines = researcherLines;
          if (laneIdx === 1) visibleLines = writerLines;
          if (laneIdx === 2) visibleLines = editorMarked;

          return (
            <g key={agent.name}>
              {/* Lane background */}
              <rect
                x={lx}
                y={HEADER_H + 10}
                width={LANE_W}
                height={WORKSPACE_H + HEADER_H - 10}
                rx={12}
                fill={agent.color}
                style={{
                  opacity: bgOpacity,
                  transition: `opacity ${td} ease`,
                }}
              />

              {/* Lane border */}
              <rect
                x={lx}
                y={HEADER_H + 10}
                width={LANE_W}
                height={WORKSPACE_H + HEADER_H - 10}
                rx={12}
                fill="none"
                stroke={borderColor}
                strokeWidth={active ? 2 : 1}
                style={{
                  opacity: borderOpacity,
                  transition: `stroke ${td} ease, stroke-width ${td} ease, opacity ${td} ease`,
                  filter: active ? `url(#lane-glow-${laneIdx})` : 'none',
                }}
              />

              {/* Header: icon + name */}
              <g>
                {/* Icon circle */}
                <circle
                  cx={lx + LANE_W / 2}
                  cy={HEADER_H + 30}
                  r={18}
                  fill={agent.color}
                  style={{
                    opacity: active ? 0.15 : done ? 0.08 : 0.05,
                    transition: `opacity ${td} ease`,
                  }}
                />
                <AgentIcon
                  type={agent.icon}
                  x={lx + LANE_W / 2}
                  y={HEADER_H + 30}
                  color={agent.color}
                  size={14}
                />

                {/* Name */}
                <text
                  x={lx + LANE_W / 2}
                  y={HEADER_H + 58}
                  textAnchor="middle"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    fill: active ? agent.color : done ? agent.color : '#6B7280',
                    opacity: active || done ? 1 : 0.6,
                    transition: `fill ${td} ease, opacity ${td} ease`,
                  }}
                >
                  {agent.name}
                </text>
              </g>

              {/* Workspace lines */}
              <g>
                {lineData.map((line, lineIdx) => {
                  const ly = WORKSPACE_TOP + 68 + lineIdx * (LINE_H + LINE_GAP);
                  const isVisible = lineIdx < visibleLines;
                  const lineWidth = Math.min(line.length * 2.8, LANE_W - 24);

                  // Editor special states
                  let lineColor = agent.color;
                  let lineOpacityValue = 0.2;
                  let decorationType: 'none' | 'marked' | 'fixed' = 'none';

                  if (laneIdx === 2) {
                    if (lineIdx < editorFixed) {
                      decorationType = 'fixed';
                      lineColor = '#16C79A';
                      lineOpacityValue = 0.35;
                    } else if (lineIdx < editorMarked) {
                      decorationType = 'marked';
                      lineColor = '#E94560';
                      lineOpacityValue = 0.25;
                    }
                  }

                  return (
                    <g key={lineIdx}>
                      {/* Line background bar */}
                      <rect
                        x={lx + 12}
                        y={ly}
                        width={lineWidth}
                        height={LINE_H - 4}
                        rx={4}
                        fill={lineColor}
                        style={{
                          opacity: isVisible ? lineOpacityValue : 0,
                          transition: `opacity 350ms ease, fill 300ms ease`,
                        }}
                      />

                      {/* Text label */}
                      <text
                        x={lx + 16}
                        y={ly + 10}
                        style={{
                          fontFamily: "'Lora', Georgia, serif",
                          fontSize: 7.5,
                          fill: '#1A1A2E',
                          opacity: isVisible ? 0.6 : 0,
                          transition: `opacity 350ms ease`,
                        }}
                      >
                        {isMobile ? (line.length > 12 ? line.slice(0, 12) + '...' : line) : (line.length > 22 ? line.slice(0, 22) + '...' : line)}
                      </text>

                      {/* Editor mark: red underline or green checkmark */}
                      {laneIdx === 2 && decorationType === 'marked' && (
                        <line
                          x1={lx + 12}
                          y1={ly + LINE_H - 3}
                          x2={lx + 12 + lineWidth * 0.7}
                          y2={ly + LINE_H - 3}
                          stroke="#E94560"
                          strokeWidth={1.5}
                          strokeDasharray="3 2"
                          style={{
                            opacity: 0.5,
                            transition: `opacity 300ms ease`,
                          }}
                        />
                      )}
                      {laneIdx === 2 && decorationType === 'fixed' && (
                        <g>
                          <circle
                            cx={lx + 12 + lineWidth + 8}
                            cy={ly + 7}
                            r={5}
                            fill="#16C79A"
                            opacity={0.15}
                          />
                          <polyline
                            points={`${lx + 12 + lineWidth + 5},${ly + 7} ${lx + 12 + lineWidth + 7.5},${ly + 9.5} ${lx + 12 + lineWidth + 11},${ly + 5}`}
                            fill="none"
                            stroke="#16C79A"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity={0.7}
                          />
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* "Active" indicator dot */}
              {active && (
                <circle
                  cx={lx + LANE_W - 12}
                  cy={HEADER_H + 20}
                  r={4}
                  fill={agent.color}
                  style={{
                    opacity: 0.8,
                  }}
                >
                  {/* Pulsing animation via CSS */}
                </circle>
              )}
            </g>
          );
        })}

        {/* Handoff document 1: Researcher -> Writer */}
        {phase === 'handoff-1' && (() => {
          const pos = getHandoff1Pos();
          return (
            <g>
              {/* Shadow */}
              <rect
                x={pos.x - 16}
                y={pos.y - 11}
                width={32}
                height={24}
                rx={4}
                fill="rgba(0,0,0,0.06)"
                transform={`translate(1, 2)`}
              />
              {/* Document card */}
              <rect
                x={pos.x - 16}
                y={pos.y - 11}
                width={32}
                height={24}
                rx={4}
                fill="white"
                stroke="#0EA5E9"
                strokeWidth={1.5}
              />
              {/* Mini text lines inside doc */}
              <rect x={pos.x - 10} y={pos.y - 5} width={16} height={2} rx={1} fill="#0EA5E9" opacity={0.3} />
              <rect x={pos.x - 10} y={pos.y + 1} width={12} height={2} rx={1} fill="#0EA5E9" opacity={0.2} />
              <rect x={pos.x - 10} y={pos.y + 7} width={18} height={2} rx={1} fill="#0EA5E9" opacity={0.25} />
              {/* Label */}
              <text
                x={pos.x}
                y={pos.y - 18}
                textAnchor="middle"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 7,
                  fontWeight: 600,
                  fill: '#0EA5E9',
                  opacity: 0.7,
                }}
              >
                Notes
              </text>
            </g>
          );
        })()}

        {/* Handoff document 2: Writer -> Editor */}
        {phase === 'handoff-2' && (() => {
          const pos = getHandoff2Pos();
          return (
            <g>
              <rect
                x={pos.x - 16}
                y={pos.y - 11}
                width={32}
                height={24}
                rx={4}
                fill="rgba(0,0,0,0.06)"
                transform={`translate(1, 2)`}
              />
              <rect
                x={pos.x - 16}
                y={pos.y - 11}
                width={32}
                height={24}
                rx={4}
                fill="white"
                stroke="#7B61FF"
                strokeWidth={1.5}
              />
              <rect x={pos.x - 10} y={pos.y - 5} width={18} height={2} rx={1} fill="#7B61FF" opacity={0.3} />
              <rect x={pos.x - 10} y={pos.y + 1} width={14} height={2} rx={1} fill="#7B61FF" opacity={0.2} />
              <rect x={pos.x - 10} y={pos.y + 7} width={16} height={2} rx={1} fill="#7B61FF" opacity={0.25} />
              <text
                x={pos.x}
                y={pos.y - 18}
                textAnchor="middle"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 7,
                  fontWeight: 600,
                  fill: '#7B61FF',
                  opacity: 0.7,
                }}
              >
                Draft
              </text>
            </g>
          );
        })()}

        {/* Connection arrows between lanes (always visible, subtle) */}
        {[0, 1].map((i) => {
          const fromX = getLaneX(i) + LANE_W;
          const toX = getLaneX(i + 1);
          const arrowY = WORKSPACE_TOP + WORKSPACE_H / 2 + 30;
          const arrowColor = AGENTS[i].color;
          const isActiveArrow = (i === 0 && ['handoff-1', 'writer-active', 'handoff-2', 'editor-active', 'final'].includes(phase))
            || (i === 1 && ['handoff-2', 'editor-active', 'final'].includes(phase));

          return (
            <g key={`conn-${i}`}>
              <line
                x1={fromX + 4}
                y1={arrowY}
                x2={toX - 4}
                y2={arrowY}
                stroke={arrowColor}
                strokeWidth={1.2}
                strokeDasharray="4 3"
                style={{
                  opacity: isActiveArrow ? 0.3 : 0.08,
                  transition: `opacity ${td} ease`,
                }}
              />
              {/* Arrowhead */}
              <polygon
                points={`${toX - 4},${arrowY} ${toX - 10},${arrowY - 3.5} ${toX - 10},${arrowY + 3.5}`}
                fill={arrowColor}
                style={{
                  opacity: isActiveArrow ? 0.3 : 0.08,
                  transition: `opacity ${td} ease`,
                }}
              />
            </g>
          );
        })}

        {/* Final badge */}
        {showFinalBadge && (
          <g
            style={{
              opacity: showFinalBadge ? 1 : 0,
              transition: `opacity 500ms ease`,
            }}
          >
            <rect
              x={SVG_W / 2 - 50}
              y={SVG_H - 46}
              width={100}
              height={30}
              rx={15}
              fill="#16C79A"
              opacity={0.1}
            />
            <rect
              x={SVG_W / 2 - 50}
              y={SVG_H - 46}
              width={100}
              height={30}
              rx={15}
              fill="none"
              stroke="#16C79A"
              strokeWidth={1.5}
              opacity={0.35}
            />
            <text
              x={SVG_W / 2}
              y={SVG_H - 27}
              textAnchor="middle"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                fill: '#16C79A',
              }}
            >
              FINAL REPORT
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
