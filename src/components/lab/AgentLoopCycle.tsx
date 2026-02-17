import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';

/*
 * AgentLoopCycle
 * ---------------
 * An animated SVG circular diagram showing the Agent Loop:
 * Observe -> Think -> Act -> Evaluate, cycling continuously.
 * A pulse dot travels the path, highlighting each node in turn.
 * After 3 loops a "Done" state appears, then the cycle resets.
 */

interface LoopNode {
  label: string;
  action: string;
  color: string;
  icon: string; // SVG path data for the icon
  angle: number; // degrees, 0 = top (12 o'clock)
}

const NODES: LoopNode[] = [
  {
    label: 'Observe',
    action: 'Reading search results...',
    color: '#0EA5E9',
    icon: 'eye',
    angle: 0,
  },
  {
    label: 'Think',
    action: 'Analyzing information...',
    color: '#7B61FF',
    icon: 'brain',
    angle: 90,
  },
  {
    label: 'Act',
    action: 'Writing draft...',
    color: '#F5A623',
    icon: 'zap',
    angle: 180,
  },
  {
    label: 'Evaluate',
    action: 'Checking quality...',
    color: '#16C79A',
    icon: 'check',
    angle: 270,
  },
];

const ORBIT_RADIUS = 130;
const ORBIT_RADIUS_MOBILE = 150;
const CENTER_X_DESKTOP = 220;
const CENTER_Y_DESKTOP = 210;
const CENTER_X_MOBILE = 190;
const CENTER_Y_MOBILE = 320;
const NODE_RADIUS = 32;
const STEP_DURATION = 1400; // ms per node
const PAUSE_AT_NODE = 600; // ms to hold at each node
const DONE_HOLD = 2200; // ms to show "Done" state
const TOTAL_LOOPS = 3;

function degToRad(deg: number): number {
  return ((deg - 90) * Math.PI) / 180; // -90 so 0deg = top
}

function getNodePos(angle: number, centerX: number, centerY: number, orbitRadius: number = ORBIT_RADIUS): { x: number; y: number } {
  const rad = degToRad(angle);
  return {
    x: centerX + orbitRadius * Math.cos(rad),
    y: centerY + orbitRadius * Math.sin(rad),
  };
}

// Simple SVG icons drawn as paths
function NodeIcon({ type, x, y, color, scale = 1 }: { type: string; x: number; y: number; color: string; scale?: number }) {
  const s = scale;
  if (type === 'eye') {
    return (
      <g transform={`translate(${x}, ${y}) scale(${s})`}>
        <ellipse cx={0} cy={0} rx={11} ry={7} fill="none" stroke={color} strokeWidth={1.8} />
        <circle cx={0} cy={0} r={3.5} fill={color} />
        <circle cx={1} cy={-1} r={1.2} fill="white" opacity={0.7} />
      </g>
    );
  }
  if (type === 'brain') {
    return (
      <g transform={`translate(${x}, ${y}) scale(${s})`}>
        <path
          d="M-2 8 C-2 8 -8 6 -9 1 C-10 -4 -6 -7 -3 -8 C0 -9 3 -9 5 -7 C7 -5 9 -3 9 0 C9 3 8 6 4 7 C2 8 0 8 -2 8 Z"
          fill="none"
          stroke={color}
          strokeWidth={1.8}
        />
        <path
          d="M-2 8 C-2 2 -2 -4 -2 -8"
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          opacity={0.6}
        />
        <path
          d="M-2 -2 C1 -3 4 -2 5 0"
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          opacity={0.6}
        />
        <path
          d="M-2 3 C-5 2 -7 1 -8 -1"
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          opacity={0.6}
        />
      </g>
    );
  }
  if (type === 'zap') {
    return (
      <g transform={`translate(${x}, ${y}) scale(${s})`}>
        <polygon
          points="1,-10 -5,1 0,1 -1,10 5,-1 0,-1"
          fill={color}
          opacity={0.9}
        />
      </g>
    );
  }
  if (type === 'check') {
    return (
      <g transform={`translate(${x}, ${y}) scale(${s})`}>
        <circle cx={0} cy={0} r={9} fill="none" stroke={color} strokeWidth={1.8} />
        <polyline
          points="-5,0 -1,4 6,-4"
          fill="none"
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    );
  }
  return null;
}

export default function AgentLoopCycle() {
  const [activeNode, setActiveNode] = useState(-1); // -1 = none, 0-3 = node index
  const [loopCount, setLoopCount] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [pulseProgress, setPulseProgress] = useState(0); // 0-1 progress around current arc
  const [pulseFromNode, setPulseFromNode] = useState(3); // which node the pulse is traveling from
  const [reducedMotion, setReducedMotion] = useState(false);
  const mountedRef = useRef(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const animFrameRef = useRef<number>(0);
  const pulseStartTimeRef = useRef(0);
  const pulseDurationRef = useRef(STEP_DURATION);
  const isPulseMovingRef = useRef(false);
  const isMobile = useIsMobile();

  const CENTER_X = isMobile ? CENTER_X_MOBILE : CENTER_X_DESKTOP;
  const CENTER_Y = isMobile ? CENTER_Y_MOBILE : CENTER_Y_DESKTOP;
  const currentOrbitRadius = isMobile ? ORBIT_RADIUS_MOBILE : ORBIT_RADIUS;

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    cancelAnimationFrame(animFrameRef.current);
  };

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Pulse animation via requestAnimationFrame
  useEffect(() => {
    if (reducedMotion || !isPulseMovingRef.current) return;

    const animate = () => {
      if (!mountedRef.current) return;
      const elapsed = Date.now() - pulseStartTimeRef.current;
      const progress = Math.min(elapsed / pulseDurationRef.current, 1);
      // Ease in-out
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      setPulseProgress(eased);
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [pulseFromNode, reducedMotion]);

  useEffect(() => {
    mountedRef.current = true;

    if (reducedMotion) {
      setActiveNode(0);
      setLoopCount(1);
      setIsDone(false);
      return;
    }

    const runCycle = () => {
      if (!mountedRef.current) return;
      clearTimers();
      setActiveNode(-1);
      setLoopCount(0);
      setIsDone(false);
      setPulseProgress(0);

      let totalDelay = 600; // initial pause
      let currentLoop = 0;

      for (let loop = 0; loop < TOTAL_LOOPS; loop++) {
        for (let step = 0; step < NODES.length; step++) {
          const fromNode = step === 0 ? NODES.length - 1 : step - 1;

          // Start pulse traveling from previous node to this node
          const travelStart = totalDelay;
          const t1 = setTimeout(() => {
            if (!mountedRef.current) return;
            setPulseFromNode(fromNode);
            setPulseProgress(0);
            pulseStartTimeRef.current = Date.now();
            pulseDurationRef.current = STEP_DURATION - PAUSE_AT_NODE;
            isPulseMovingRef.current = true;
            // Force re-render to start animation
            setPulseProgress(0.001);
          }, travelStart);
          timersRef.current.push(t1);

          // Arrive at node
          const arriveTime = travelStart + STEP_DURATION - PAUSE_AT_NODE;
          const t2 = setTimeout(() => {
            if (!mountedRef.current) return;
            isPulseMovingRef.current = false;
            setActiveNode(step);
            setPulseProgress(1);
            if (step === 0) {
              currentLoop++;
              setLoopCount(currentLoop);
            }
          }, arriveTime);
          timersRef.current.push(t2);

          totalDelay += STEP_DURATION;
        }
      }

      // Done state
      const t3 = setTimeout(() => {
        if (!mountedRef.current) return;
        setActiveNode(-1);
        setIsDone(true);
        isPulseMovingRef.current = false;
      }, totalDelay);
      timersRef.current.push(t3);

      // Reset and loop
      const t4 = setTimeout(() => {
        if (!mountedRef.current) return;
        setIsDone(false);
        runCycle();
      }, totalDelay + DONE_HOLD);
      timersRef.current.push(t4);
    };

    runCycle();

    return () => {
      mountedRef.current = false;
      clearTimers();
    };
  }, [reducedMotion]);

  // Calculate pulse dot position
  const getPulsePos = (): { x: number; y: number } | null => {
    if (isDone || reducedMotion) return null;
    const fromAngle = NODES[pulseFromNode].angle;
    let toAngle = NODES[(pulseFromNode + 1) % NODES.length].angle;
    if (toAngle <= fromAngle) toAngle += 360;
    const currentAngle = fromAngle + (toAngle - fromAngle) * pulseProgress;
    const pos = getNodePos(currentAngle, CENTER_X, CENTER_Y, currentOrbitRadius);
    return pos;
  };

  // Curved arrow path between two nodes (SVG arc)
  const getArrowArc = (fromIdx: number, toIdx: number): { path: string; tipAngle: number; tipX: number; tipY: number } => {
    const from = NODES[fromIdx];
    const to = NODES[toIdx];
    // Offset start/end to not overlap nodes
    const offsetDeg = 16;
    let startAngle = from.angle + offsetDeg;
    let endAngle = to.angle - offsetDeg;
    if (endAngle <= startAngle) endAngle += 360;

    const startRad = degToRad(startAngle);
    const endRad = degToRad(endAngle);
    const x1 = CENTER_X + currentOrbitRadius * Math.cos(startRad);
    const y1 = CENTER_Y + currentOrbitRadius * Math.sin(startRad);
    const x2 = CENTER_X + currentOrbitRadius * Math.cos(endRad);
    const y2 = CENTER_Y + currentOrbitRadius * Math.sin(endRad);
    const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
    const path = `M ${x1} ${y1} A ${currentOrbitRadius} ${currentOrbitRadius} 0 ${largeArc} 1 ${x2} ${y2}`;

    // Arrow tip direction: tangent at endpoint (perpendicular to radius)
    const tipAngle = endAngle; // in degrees
    return { path, tipAngle, tipX: x2, tipY: y2 };
  };

  const pulsePos = getPulsePos();

  const containerStyle: React.CSSProperties = {
    maxWidth: isMobile ? 'none' : 560,
    margin: '0 auto',
    background: '#FFFFFF',
    borderRadius: isMobile ? 0 : 16,
    border: isMobile ? 'none' : '1px solid rgba(26, 26, 46, 0.06)',
    boxShadow: isMobile ? 'none' : '0 4px 32px rgba(26, 26, 46, 0.06), 0 1px 4px rgba(0,0,0,0.02)',
    padding: isMobile ? 0 : '24px 16px',
    overflow: 'hidden',
    ...(isMobile ? { flex: 1, display: 'flex', flexDirection: 'column' as const } : {}),
  };

  const transitionDuration = reducedMotion ? '0ms' : '400ms';

  return (
    <div style={containerStyle}>
      <svg
        viewBox={isMobile ? '0 0 380 680' : '0 0 440 420'}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: isMobile ? '100%' : 'auto', display: 'block', ...(isMobile ? { flex: 1 } : {}) }}
        role="img"
        aria-label="Agent loop cycle: Observe, Think, Act, Evaluate repeating in a circle"
      >
        <defs>
          {/* Glow filters for each node color */}
          {NODES.map((node, i) => (
            <filter key={`glow-${i}`} id={`node-glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feFlood floodColor={node.color} floodOpacity="0.35" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          {/* Pulse dot glow */}
          <filter id="pulse-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#F5A623" floodOpacity="0.5" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Done glow */}
          <filter id="done-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feFlood floodColor="#16C79A" floodOpacity="0.3" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Orbit circle (dashed, subtle) */}
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={currentOrbitRadius}
          fill="none"
          stroke="rgba(26, 26, 46, 0.06)"
          strokeWidth={1.5}
          strokeDasharray="4 6"
        />

        {/* Curved arrows between nodes */}
        {NODES.map((_, i) => {
          const nextIdx = (i + 1) % NODES.length;
          const { path, tipAngle, tipX, tipY } = getArrowArc(i, nextIdx);
          // Arrow tip tangent: perpendicular to radius at that point
          const tangentRad = degToRad(tipAngle) + Math.PI / 2;
          // Tiny arrowhead
          const arrowSize = 6;
          const ax1 = tipX - arrowSize * Math.cos(tangentRad - 0.5);
          const ay1 = tipY - arrowSize * Math.sin(tangentRad - 0.5);
          const ax2 = tipX - arrowSize * Math.cos(tangentRad + 0.5);
          const ay2 = tipY - arrowSize * Math.sin(tangentRad + 0.5);

          return (
            <g key={`arrow-${i}`}>
              <path
                d={path}
                fill="none"
                stroke="rgba(26, 26, 46, 0.1)"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <polygon
                points={`${tipX},${tipY} ${ax1},${ay1} ${ax2},${ay2}`}
                fill="rgba(26, 26, 46, 0.15)"
              />
            </g>
          );
        })}

        {/* Nodes */}
        {NODES.map((node, i) => {
          const pos = getNodePos(node.angle, CENTER_X, CENTER_Y, currentOrbitRadius);
          const isActive = activeNode === i;
          const nodeScale = isActive ? 1.15 : 1;
          const bgOpacity = isActive ? 0.15 : 0.06;

          return (
            <g key={node.label}>
              {/* Background glow when active */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_RADIUS + 8}
                fill={node.color}
                style={{
                  opacity: isActive ? 0.12 : 0,
                  transition: `opacity ${transitionDuration} ease`,
                }}
              />

              {/* Node circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_RADIUS}
                fill="white"
                stroke={node.color}
                strokeWidth={isActive ? 2.5 : 1.5}
                style={{
                  filter: isActive ? `url(#node-glow-${i})` : 'none',
                  transform: `scale(${nodeScale})`,
                  transformOrigin: `${pos.x}px ${pos.y}px`,
                  transition: `transform ${transitionDuration} cubic-bezier(0.34, 1.56, 0.64, 1), stroke-width ${transitionDuration} ease`,
                }}
              />

              {/* Inner colored ring */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_RADIUS - 4}
                fill={node.color}
                style={{
                  opacity: bgOpacity,
                  transition: `opacity ${transitionDuration} ease`,
                }}
              />

              {/* Icon */}
              <NodeIcon
                type={node.icon}
                x={pos.x}
                y={pos.y - 2}
                color={node.color}
                scale={isActive ? 1.05 : 0.95}
              />

              {/* Label below node */}
              <text
                x={pos.x}
                y={pos.y + NODE_RADIUS + 18}
                textAnchor="middle"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  fill: isActive ? node.color : '#6B7280',
                  transition: `fill ${transitionDuration} ease`,
                }}
              >
                {node.label}
              </text>

              {/* Action text when active */}
              <text
                x={pos.x}
                y={pos.y + NODE_RADIUS + 32}
                textAnchor="middle"
                style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: 10,
                  fontStyle: 'italic',
                  fill: node.color,
                  opacity: isActive ? 0.7 : 0,
                  transition: `opacity ${transitionDuration} ease`,
                }}
              >
                {node.action}
              </text>
            </g>
          );
        })}

        {/* Traveling pulse dot */}
        {pulsePos && !isDone && (
          <g>
            {/* Trail glow */}
            <circle
              cx={pulsePos.x}
              cy={pulsePos.y}
              r={10}
              fill="#F5A623"
              opacity={0.15}
            />
            {/* Dot */}
            <circle
              cx={pulsePos.x}
              cy={pulsePos.y}
              r={5}
              fill="#F5A623"
              filter="url(#pulse-glow)"
            />
            {/* Inner bright spot */}
            <circle
              cx={pulsePos.x}
              cy={pulsePos.y}
              r={2.5}
              fill="white"
              opacity={0.9}
            />
          </g>
        )}

        {/* Center content */}
        <g>
          {/* Subtle center circle */}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={40}
            fill="rgba(26, 26, 46, 0.015)"
            stroke="rgba(26, 26, 46, 0.04)"
            strokeWidth={1}
          />

          {/* Loop counter or Done state */}
          {isDone ? (
            <g style={{ opacity: 1 }}>
              <circle
                cx={CENTER_X}
                cy={CENTER_Y}
                r={36}
                fill="#16C79A"
                opacity={0.08}
                filter="url(#done-glow)"
              />
              <text
                x={CENTER_X}
                y={CENTER_Y - 4}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                  fontWeight: 700,
                  fill: '#16C79A',
                }}
              >
                Done
              </text>
              {/* Checkmark */}
              <polyline
                points={`${CENTER_X - 7},${CENTER_Y + 14} ${CENTER_X - 1},${CENTER_Y + 20} ${CENTER_X + 8},${CENTER_Y + 10}`}
                fill="none"
                stroke="#16C79A"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.7}
              />
            </g>
          ) : (
            <g>
              <text
                x={CENTER_X}
                y={CENTER_Y - 6}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  fill: '#6B7280',
                  opacity: 0.7,
                }}
              >
                Loop
              </text>
              <text
                x={CENTER_X}
                y={CENTER_Y + 12}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 22,
                  fontWeight: 700,
                  fill: '#1A1A2E',
                }}
              >
                {loopCount || '\u2014'}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
