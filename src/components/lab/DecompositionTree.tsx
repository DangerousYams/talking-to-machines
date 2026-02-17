import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';

/*
 * DecompositionTree
 * -----------------
 * An animated tree diagram that breaks a big task into smaller subtasks,
 * showing decomposition and handoff patterns.
 *
 * Chapter 8: Orchestrating Complexity
 * Accent: #0F3460 (navy)
 */

// Colors
const NAVY = '#0F3460';
const PURPLE = '#7B61FF';
const SKY = '#0EA5E9';
const TEAL = '#16C79A';
const AMBER = '#F5A623';
const RED = '#E94560';
const DEEP = '#1A1A2E';
const SUBTLE = '#6B7280';

// Tree data
interface TreeNodeData {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  parentId?: string;
  width: number;
}

// Layout constants — desktop defaults
const SVG_WIDTH_DESKTOP = 600;
const SVG_HEIGHT_DESKTOP = 440;
const SVG_WIDTH_MOBILE = 380;
const SVG_HEIGHT_MOBILE = 700;
const NODE_HEIGHT = 32;
const NODE_RX = 8;
const BORDER_LEFT = 4;

// Desktop node positions
const ROOT_DESKTOP: TreeNodeData = {
  id: 'root',
  label: 'Build a Weather App',
  color: NAVY,
  x: SVG_WIDTH_DESKTOP / 2,
  y: 42,
  width: 180,
};

const L1_NODES_DESKTOP: TreeNodeData[] = [
  { id: 'frontend', label: 'Frontend UI', color: PURPLE, x: 175, y: 130, parentId: 'root', width: 120 },
  { id: 'backend', label: 'Backend API', color: SKY, x: 425, y: 130, parentId: 'root', width: 120 },
];

const L2_NODES_DESKTOP: TreeNodeData[] = [
  { id: 'layout', label: 'Layout Components', color: PURPLE, x: 85, y: 230, parentId: 'frontend', width: 145 },
  { id: 'styling', label: 'Styling', color: PURPLE, x: 215, y: 230, parentId: 'frontend', width: 80 },
  { id: 'state', label: 'State Management', color: PURPLE, x: 330, y: 230, parentId: 'frontend', width: 140 },
  { id: 'weather-api', label: 'Weather API Integration', color: SKY, x: 440, y: 230, parentId: 'backend', width: 175 },
  { id: 'caching', label: 'Caching Layer', color: SKY, x: 555, y: 230, parentId: 'backend', width: 120 },
];

// Mobile node positions — narrower, more vertical spread
const ROOT_MOBILE: TreeNodeData = {
  id: 'root',
  label: 'Build a Weather App',
  color: NAVY,
  x: SVG_WIDTH_MOBILE / 2,
  y: 42,
  width: 170,
};

const L1_NODES_MOBILE: TreeNodeData[] = [
  { id: 'frontend', label: 'Frontend UI', color: PURPLE, x: 120, y: 200, parentId: 'root', width: 110 },
  { id: 'backend', label: 'Backend API', color: SKY, x: 260, y: 200, parentId: 'root', width: 110 },
];

const L2_NODES_MOBILE: TreeNodeData[] = [
  { id: 'layout', label: 'Layout', color: PURPLE, x: 70, y: 380, parentId: 'frontend', width: 80 },
  { id: 'styling', label: 'Styling', color: PURPLE, x: 170, y: 380, parentId: 'frontend', width: 75 },
  { id: 'state', label: 'State Mgmt', color: PURPLE, x: 120, y: 460, parentId: 'frontend', width: 100 },
  { id: 'weather-api', label: 'Weather API', color: SKY, x: 280, y: 380, parentId: 'backend', width: 110 },
  { id: 'caching', label: 'Caching', color: SKY, x: 280, y: 460, parentId: 'backend', width: 90 },
];

// Timing
const INITIAL_DELAY = 800;
const L1_STAGGER = 700;
const L1_TO_L2_DELAY = 900;
const L2_STAGGER = 450;
const CHECKMARK_DELAY = 800;
const HANDOFF_DELAY = 1000;
const LABEL_DELAY = 800;
const HOLD_DURATION = 3000;
const FADE_DURATION = 800;

// Build a curved path from parent bottom to child top
function makeCurvedPath(parentX: number, parentY: number, childX: number, childY: number): string {
  const startY = parentY + NODE_HEIGHT / 2 + 2;
  const endY = childY - NODE_HEIGHT / 2 - 2;
  const midY = (startY + endY) / 2;
  return `M ${parentX} ${startY} C ${parentX} ${midY}, ${childX} ${midY}, ${childX} ${endY}`;
}

export default function DecompositionTree() {
  const [visibleL1, setVisibleL1] = useState(0);
  const [visibleL2, setVisibleL2] = useState(0);
  const [showChecks, setShowChecks] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [masterOpacity, setMasterOpacity] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const mountedRef = useRef(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isMobile = useIsMobile();

  // Select layout based on screen size
  const SVG_WIDTH = isMobile ? SVG_WIDTH_MOBILE : SVG_WIDTH_DESKTOP;
  const SVG_HEIGHT = isMobile ? SVG_HEIGHT_MOBILE : SVG_HEIGHT_DESKTOP;
  const ROOT = isMobile ? ROOT_MOBILE : ROOT_DESKTOP;
  const L1_NODES = isMobile ? L1_NODES_MOBILE : L1_NODES_DESKTOP;
  const L2_NODES = isMobile ? L2_NODES_MOBILE : L2_NODES_DESKTOP;
  const ALL_NODES = [ROOT, ...L1_NODES, ...L2_NODES];

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

  useEffect(() => {
    mountedRef.current = true;

    if (reducedMotion) {
      setVisibleL1(L1_NODES.length);
      setVisibleL2(L2_NODES.length);
      setShowChecks(true);
      setShowHandoff(true);
      setShowLabel(true);
      setMasterOpacity(1);
      return;
    }

    const runCycle = () => {
      if (!mountedRef.current) return;
      clearTimers();

      setVisibleL1(0);
      setVisibleL2(0);
      setShowChecks(false);
      setShowHandoff(false);
      setShowLabel(false);
      setMasterOpacity(1);

      let elapsed = INITIAL_DELAY;

      // Reveal L1 nodes
      L1_NODES.forEach((_, i) => {
        addTimer(() => setVisibleL1(i + 1), elapsed + i * L1_STAGGER);
      });
      elapsed += L1_NODES.length * L1_STAGGER;

      // Reveal L2 nodes
      elapsed += L1_TO_L2_DELAY;
      L2_NODES.forEach((_, i) => {
        addTimer(() => setVisibleL2(i + 1), elapsed + i * L2_STAGGER);
      });
      elapsed += L2_NODES.length * L2_STAGGER;

      // Show checkmarks
      elapsed += CHECKMARK_DELAY;
      addTimer(() => setShowChecks(true), elapsed);

      // Show handoff arrow
      elapsed += HANDOFF_DELAY;
      addTimer(() => setShowHandoff(true), elapsed);

      // Show summary label
      elapsed += LABEL_DELAY;
      addTimer(() => setShowLabel(true), elapsed);

      // Hold, then fade and restart
      elapsed += HOLD_DURATION;
      addTimer(() => {
        setMasterOpacity(0);
        addTimer(() => runCycle(), FADE_DURATION + 400);
      }, elapsed);
    };

    runCycle();

    return () => {
      mountedRef.current = false;
      clearTimers();
    };
  }, [reducedMotion, clearTimers, addTimer]);

  const getNodeVisible = (node: TreeNodeData): boolean => {
    if (node.id === 'root') return true;
    if (L1_NODES.some(n => n.id === node.id)) {
      const idx = L1_NODES.findIndex(n => n.id === node.id);
      return idx < visibleL1;
    }
    if (L2_NODES.some(n => n.id === node.id)) {
      const idx = L2_NODES.findIndex(n => n.id === node.id);
      return idx < visibleL2;
    }
    return false;
  };

  const getEdgeVisible = (childNode: TreeNodeData): boolean => {
    return getNodeVisible(childNode);
  };

  const transition = reducedMotion ? 'none' : 'opacity 0.5s ease, transform 0.5s ease';
  const masterTransition = reducedMotion ? 'none' : `opacity ${FADE_DURATION}ms ease`;

  const containerStyle: React.CSSProperties = {
    maxWidth: isMobile ? 'none' : 650,
    margin: '0 auto',
    background: '#FFFFFF',
    borderRadius: isMobile ? 0 : 16,
    border: isMobile ? 'none' : '1px solid rgba(26, 26, 46, 0.06)',
    boxShadow: isMobile ? 'none' : '0 4px 32px rgba(26, 26, 46, 0.06)',
    padding: isMobile ? 0 : '24px 16px',
    overflow: 'hidden',
    ...(isMobile ? { flex: 1, display: 'flex', flexDirection: 'column' as const } : {}),
  };

  // Render a tree node
  const renderNode = (node: TreeNodeData, isRoot: boolean = false) => {
    const visible = getNodeVisible(node);
    const w = node.width;
    const h = NODE_HEIGHT;
    const rx = node.x - w / 2;
    const ry = node.y - h / 2;
    const isLeaf = !ALL_NODES.some(n => n.parentId === node.id);

    return (
      <g
        key={node.id}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-10px)',
          transition: reducedMotion ? 'none' : 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        {/* Shadow */}
        <rect
          x={rx + 1}
          y={ry + 2}
          width={w}
          height={h}
          rx={NODE_RX}
          fill={`rgba(0,0,0,0.04)`}
        />
        {/* Node body */}
        <rect
          x={rx}
          y={ry}
          width={w}
          height={h}
          rx={NODE_RX}
          fill="#FFFFFF"
          stroke={isRoot ? node.color : 'rgba(26, 26, 46, 0.08)'}
          strokeWidth={isRoot ? 2 : 1}
        />
        {/* Colored left border */}
        <rect
          x={rx}
          y={ry + 4}
          width={BORDER_LEFT}
          height={h - 8}
          rx={2}
          fill={node.color}
          opacity={0.9}
        />
        {/* Text */}
        <text
          x={node.x + 2}
          y={node.y + 1}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontFamily: isRoot ? "'Playfair Display', Georgia, serif" : "'JetBrains Mono', monospace",
            fontSize: isRoot ? 14 : 11,
            fontWeight: isRoot ? 700 : 500,
            fill: isRoot ? NAVY : DEEP,
            letterSpacing: isRoot ? '0' : '0.01em',
          }}
        >
          {node.label}
        </text>
        {/* Checkmark for leaf nodes */}
        {isLeaf && showChecks && (
          <g
            style={{
              opacity: showChecks ? 1 : 0,
              transition: reducedMotion ? 'none' : 'opacity 0.4s ease',
            }}
          >
            <circle
              cx={rx + w - 2}
              cy={ry - 2}
              r={8}
              fill={TEAL}
            />
            <text
              x={rx + w - 2}
              y={ry - 1}
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontSize: 10,
                fontWeight: 700,
                fill: '#FFFFFF',
              }}
            >
              {'\u2713'}
            </text>
          </g>
        )}
      </g>
    );
  };

  // Render edge
  const renderEdge = (child: TreeNodeData) => {
    const parent = ALL_NODES.find(n => n.id === child.parentId);
    if (!parent) return null;
    const visible = getEdgeVisible(child);

    return (
      <path
        key={`edge-${child.id}`}
        d={makeCurvedPath(parent.x, parent.y, child.x, child.y)}
        fill="none"
        stroke={child.color}
        strokeWidth={1.5}
        strokeDasharray="none"
        style={{
          opacity: visible ? 0.25 : 0,
          transition: reducedMotion ? 'none' : 'opacity 0.5s ease',
        }}
      />
    );
  };

  // Handoff arrow: horizontal dashed line from backend leaf area to frontend leaf area
  // Shows output of Backend connecting to input of Frontend
  const maxL2Y = Math.max(...L2_NODES.map(n => n.y));
  const handoffY = maxL2Y + 80;
  const backendCenterX = (L2_NODES.find(n => n.id === 'weather-api')!.x + L2_NODES.find(n => n.id === 'caching')!.x) / 2;
  const frontendCenterX = (L2_NODES.find(n => n.id === 'layout')!.x + L2_NODES.find(n => n.id === 'state')!.x) / 2;

  // We draw the handoff going from backend side to frontend side
  const handoffStartX = backendCenterX - 30;
  const handoffEndX = frontendCenterX + 30;
  // Since backend is to the right, we draw right-to-left
  const handoffLeftX = Math.min(handoffStartX, handoffEndX);
  const handoffRightX = Math.max(handoffStartX, handoffEndX);

  return (
    <div style={containerStyle}>
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: isMobile ? '100%' : 'auto',
          display: 'block',
          opacity: masterOpacity,
          transition: masterTransition,
          ...(isMobile ? { flex: 1 } : {}),
        }}
        role="img"
        aria-label="Task decomposition tree: Build a Weather App breaks into Frontend UI and Backend API subtasks, with handoff connections"
      >
        <defs>
          {/* Arrowhead marker */}
          <marker
            id="handoff-arrow-left"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth={6}
            markerHeight={6}
            orient="auto-start-reverse"
          >
            <path d="M 10 0 L 0 5 L 10 10 Z" fill={AMBER} opacity={0.6} />
          </marker>
          <marker
            id="handoff-arrow-right"
            viewBox="0 0 10 10"
            refX="0"
            refY="5"
            markerWidth={6}
            markerHeight={6}
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 Z" fill={AMBER} opacity={0.6} />
          </marker>
        </defs>

        {/* Top-right decorative label */}
        <text
          x={SVG_WIDTH - 12}
          y={14}
          textAnchor="end"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: '0.1em',
            fill: NAVY,
            opacity: 0.2,
            textTransform: 'uppercase' as never,
          }}
        >
          DECOMPOSITION
        </text>

        {/* Edges - render before nodes so they're behind */}
        {[...L1_NODES, ...L2_NODES].map(child => renderEdge(child))}

        {/* Nodes */}
        {renderNode(ROOT, true)}
        {L1_NODES.map(n => renderNode(n))}
        {L2_NODES.map(n => renderNode(n))}

        {/* Handoff arrow: bidirectional dotted arc between frontend and backend leaf areas */}
        {showHandoff && (
          <g
            style={{
              opacity: showHandoff ? 1 : 0,
              transition: reducedMotion ? 'none' : 'opacity 0.6s ease',
            }}
          >
            {/* Handoff path: curved dashed line from backend area to frontend area */}
            <path
              d={`M ${handoffRightX} ${handoffY - 18} C ${handoffRightX - 20} ${handoffY + 20}, ${handoffLeftX + 20} ${handoffY + 20}, ${handoffLeftX} ${handoffY - 18}`}
              fill="none"
              stroke={AMBER}
              strokeWidth={1.5}
              strokeDasharray="6 4"
              opacity={0.5}
              markerEnd="url(#handoff-arrow-left)"
            />
            {/* Second arrow going the other way, slightly offset */}
            <path
              d={`M ${handoffLeftX + 10} ${handoffY - 24} C ${handoffLeftX + 30} ${handoffY + 10}, ${handoffRightX - 30} ${handoffY + 10}, ${handoffRightX - 10} ${handoffY - 24}`}
              fill="none"
              stroke={AMBER}
              strokeWidth={1.5}
              strokeDasharray="6 4"
              opacity={0.3}
              markerEnd="url(#handoff-arrow-right)"
            />
            {/* "handoff" label */}
            <text
              x={SVG_WIDTH / 2}
              y={handoffY + 28}
              textAnchor="middle"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: '0.06em',
                fill: AMBER,
                opacity: 0.7,
                textTransform: 'uppercase' as never,
              }}
            >
              HANDOFFS
            </text>
          </g>
        )}

        {/* Summary label at bottom */}
        {showLabel && (
          <g
            style={{
              opacity: showLabel ? 1 : 0,
              transition: reducedMotion ? 'none' : 'opacity 0.6s ease',
            }}
          >
            {/* Background pill */}
            <rect
              x={SVG_WIDTH / 2 - 120}
              y={SVG_HEIGHT - 52}
              width={240}
              height={30}
              rx={15}
              fill={NAVY}
              opacity={0.06}
            />
            <text
              x={SVG_WIDTH / 2}
              y={SVG_HEIGHT - 35}
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.04em',
                fill: NAVY,
                opacity: 0.7,
              }}
            >
              5 parallel tasks, 2 handoffs
            </text>
          </g>
        )}

        {/* Phase labels on L1 nodes */}
        {L1_NODES.map((node, i) => {
          const visible = i < visibleL1;
          return (
            <text
              key={`label-${node.id}`}
              x={node.x}
              y={node.y - NODE_HEIGHT / 2 - 10}
              textAnchor="middle"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 8,
                fontWeight: 600,
                letterSpacing: '0.08em',
                fill: node.color,
                opacity: visible ? 0.5 : 0,
                transition: reducedMotion ? 'none' : 'opacity 0.5s ease',
                textTransform: 'uppercase' as never,
              }}
            >
              {node.id === 'frontend' ? 'CLIENT' : 'SERVER'}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
