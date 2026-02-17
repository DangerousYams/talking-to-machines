import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';

/*
 * BuildingBlocksAssembly
 * ----------------------
 * Interactive: each tap/click adds the next building block to the stack.
 * After all 5 are placed, connection dots + bracket appear.
 * Tap again to reset and rebuild.
 */

interface Block {
  letter: string;
  name: string;
  color: string;
  scatterX: number;
  scatterY: number;
  scatterRotate: number;
}

const BLOCKS: Block[] = [
  { letter: 'R', name: 'Role',        color: '#E94560', scatterX: -130, scatterY: -90,  scatterRotate: -15 },
  { letter: 'T', name: 'Task',        color: '#0F3460', scatterX: 140,  scatterY: -50,  scatterRotate: 12  },
  { letter: 'F', name: 'Format',      color: '#7B61FF', scatterX: -110, scatterY: 30,   scatterRotate: -10 },
  { letter: 'C', name: 'Constraints', color: '#16C79A', scatterX: 120,  scatterY: 80,   scatterRotate: 18  },
  { letter: 'E', name: 'Examples',    color: '#F5A623', scatterX: -90,  scatterY: 130,  scatterRotate: -12 },
];

const BLOCK_WIDTH = 260;
const BLOCK_GAP = 12;
const SETTLE_MS = 500;

// Desktop constants
const BLOCK_HEIGHT_DESKTOP = 58;
const STACK_X_DESKTOP = 110; // (480 - 260) / 2 = centered in viewBox
const STACK_TOP_DESKTOP = 40;
const VIEWBOX_DESKTOP = '0 0 480 420';

// Mobile constants — taller viewBox, bigger blocks, recentered
const BLOCK_WIDTH_MOBILE = 280;
const BLOCK_HEIGHT_MOBILE = 76;
const STACK_X_MOBILE = 50; // center better in the new viewBox
const STACK_TOP_MOBILE = 40;
const VIEWBOX_MOBILE = '0 0 380 700';

export default function BuildingBlocksAssembly() {
  const [landedCount, setLandedCount] = useState(0);
  const [showLines, setShowLines] = useState(false);
  const [showBracket, setShowBracket] = useState(false);
  const isMobile = useIsMobile();

  const BLOCK_W = isMobile ? BLOCK_WIDTH_MOBILE : BLOCK_WIDTH;
  const BLOCK_HEIGHT = isMobile ? BLOCK_HEIGHT_MOBILE : BLOCK_HEIGHT_DESKTOP;
  const STACK_X = isMobile ? STACK_X_MOBILE : STACK_X_DESKTOP;
  const STACK_TOP = isMobile ? STACK_TOP_MOBILE : STACK_TOP_DESKTOP;
  const viewBox = isMobile ? VIEWBOX_MOBILE : VIEWBOX_DESKTOP;

  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const allLanded = landedCount === BLOCKS.length;
  const nextBlock = !allLanded ? BLOCKS[landedCount] : null;

  const handleTap = useCallback(() => {
    if (allLanded) {
      setLandedCount(0);
      setShowLines(false);
      setShowBracket(false);
      return;
    }
    setLandedCount((prev) => prev + 1);
  }, [allLanded]);

  useEffect(() => {
    if (!allLanded) return;
    const t1 = setTimeout(() => setShowLines(true), 300);
    const t2 = setTimeout(() => setShowBracket(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [allLanded]);

  const getBlockTransform = (block: Block, index: number): string => {
    const finalX = STACK_X;
    const finalY = STACK_TOP + index * (BLOCK_HEIGHT + BLOCK_GAP);

    if (index >= landedCount) {
      const sx = finalX + block.scatterX;
      const sy = finalY + block.scatterY;
      return `translate(${sx}, ${sy}) rotate(${block.scatterRotate}, ${BLOCK_W / 2}, ${BLOCK_HEIGHT / 2})`;
    }

    return `translate(${finalX}, ${finalY}) rotate(0, ${BLOCK_W / 2}, ${BLOCK_HEIGHT / 2})`;
  };

  const getBlockOpacity = (index: number): number => {
    if (index >= landedCount) return 0.25;
    return 1;
  };

  const getTextOpacity = (index: number): number => {
    if (index >= landedCount) return 0;
    return 1;
  };

  const bracketX = STACK_X + BLOCK_W + 20;
  const bracketTop = STACK_TOP + 4;
  const bracketBottom = STACK_TOP + (BLOCKS.length - 1) * (BLOCK_HEIGHT + BLOCK_GAP) + BLOCK_HEIGHT - 4;
  const bracketMid = (bracketTop + bracketBottom) / 2;
  const tipX = bracketX + 12;

  return (
    <div
      onClick={handleTap}
      role="button"
      tabIndex={0}
      aria-label={allLanded ? 'All blocks placed. Tap to reset.' : `Tap to add ${nextBlock?.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(); }
      }}
      style={{
        cursor: 'pointer',
        width: '100%',
        flex: isMobile ? 1 : undefined,
        maxWidth: isMobile ? undefined : 600,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <svg
        viewBox={viewBox}
        style={{ width: '100%', height: isMobile ? '100%' : 'auto', display: 'block' }}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-hidden="true"
      >
        {/* Blocks */}
        {BLOCKS.map((block, i) => (
          <g
            key={block.letter}
            transform={getBlockTransform(block, i)}
            style={{
              transition: reducedMotion
                ? 'none'
                : `transform ${SETTLE_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity ${SETTLE_MS}ms ease`,
            }}
          >
            {/* Shadow */}
            <rect
              x={2} y={3}
              width={BLOCK_W} height={BLOCK_HEIGHT}
              rx={14}
              fill="rgba(0,0,0,0.04)"
              style={{
                opacity: getBlockOpacity(i),
                transition: reducedMotion ? 'none' : `opacity ${SETTLE_MS}ms ease`,
              }}
            />

            {/* Body */}
            <rect
              x={0} y={0}
              width={BLOCK_W} height={BLOCK_HEIGHT}
              rx={14}
              fill={block.color}
              style={{
                opacity: getBlockOpacity(i),
                transition: reducedMotion ? 'none' : `opacity ${SETTLE_MS}ms ease`,
              }}
            />

            {/* Top highlight */}
            <rect
              x={10} y={5}
              width={BLOCK_W - 20} height={1.5}
              rx={0.75}
              fill="rgba(255,255,255,0.2)"
              style={{
                opacity: getBlockOpacity(i),
                transition: reducedMotion ? 'none' : `opacity ${SETTLE_MS}ms ease`,
              }}
            />

            {/* Letter */}
            <text
              x={30}
              y={BLOCK_HEIGHT / 2 + 1}
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 24,
                fontWeight: 800,
                fill: 'rgba(255,255,255,0.95)',
                opacity: getTextOpacity(i),
                transition: reducedMotion ? 'none' : `opacity ${SETTLE_MS}ms ease 80ms`,
              }}
            >
              {block.letter}
            </text>

            {/* Name */}
            <text
              x={56}
              y={BLOCK_HEIGHT / 2 + 1}
              dominantBaseline="central"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '0.04em',
                fill: 'rgba(255,255,255,0.85)',
                opacity: getTextOpacity(i),
                transition: reducedMotion ? 'none' : `opacity ${SETTLE_MS}ms ease 120ms`,
              }}
            >
              {block.name}
            </text>
          </g>
        ))}

        {/* Connection dots between landed blocks */}
        {BLOCKS.slice(0, -1).map((_, i) => {
          const cx = STACK_X + BLOCK_W / 2;
          const cy = STACK_TOP + i * (BLOCK_HEIGHT + BLOCK_GAP) + BLOCK_HEIGHT + BLOCK_GAP / 2;

          return (
            <g key={`dot-${i}`}>
              <circle
                cx={cx} cy={cy} r={2.5}
                fill="#1A1A2E"
                style={{
                  opacity: showLines ? 0.2 : 0,
                  transition: reducedMotion ? 'none' : `opacity 400ms ease ${i * 80}ms`,
                }}
              />
              <line
                x1={cx} y1={cy - 3}
                x2={cx} y2={STACK_TOP + i * (BLOCK_HEIGHT + BLOCK_GAP) + BLOCK_HEIGHT + 1}
                stroke="#1A1A2E" strokeWidth={1} strokeDasharray="2 2"
                style={{
                  opacity: showLines ? 0.12 : 0,
                  transition: reducedMotion ? 'none' : `opacity 400ms ease ${i * 80}ms`,
                }}
              />
              <line
                x1={cx} y1={cy + 3}
                x2={cx} y2={STACK_TOP + (i + 1) * (BLOCK_HEIGHT + BLOCK_GAP) + 1}
                stroke="#1A1A2E" strokeWidth={1} strokeDasharray="2 2"
                style={{
                  opacity: showLines ? 0.12 : 0,
                  transition: reducedMotion ? 'none' : `opacity 400ms ease ${i * 80}ms`,
                }}
              />
            </g>
          );
        })}

        {/* Right bracket + label */}
        <g style={{
          opacity: showBracket ? 1 : 0,
          transform: showBracket ? 'translateX(0)' : 'translateX(-8px)',
          transition: reducedMotion ? 'none' : 'opacity 500ms ease, transform 500ms ease',
        }}>
          <path
            d={`
              M ${bracketX} ${bracketTop}
              L ${tipX} ${bracketTop}
              L ${tipX} ${bracketMid - 6}
              L ${tipX + 6} ${bracketMid}
              L ${tipX} ${bracketMid + 6}
              L ${tipX} ${bracketBottom}
              L ${bracketX} ${bracketBottom}
            `}
            fill="none"
            stroke="#1A1A2E"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.2}
          />
          <text
            x={tipX + 16} y={bracketMid - 6}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fill: '#6B7280',
            }}
          >
            Complete
          </text>
          <text
            x={tipX + 16} y={bracketMid + 8}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fill: '#6B7280',
            }}
          >
            Prompt
          </text>
        </g>
      </svg>

      {/* Instruction text */}
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: isMobile ? '0.8rem' : '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: allLanded ? 'var(--color-subtle)' : (nextBlock?.color || 'var(--color-subtle)'),
          textAlign: 'center',
          margin: '8px 0 0',
          transition: reducedMotion ? 'none' : 'color 0.3s ease',
        }}
      >
        {allLanded ? 'Tap to reset' : (
          <>
            Tap to add{' '}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 6,
              background: `${nextBlock!.color}12`,
              border: `1px solid ${nextBlock!.color}25`,
              color: nextBlock!.color,
            }}>
              {nextBlock!.letter} {nextBlock!.name}
            </span>
          </>
        )}
      </p>

      {/* Progress dots */}
      <div style={{
        display: 'flex',
        gap: 6,
        marginTop: 12,
      }}>
        {BLOCKS.map((block, i) => (
          <div
            key={block.letter}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: i < landedCount ? block.color : 'rgba(107,114,128,0.15)',
              transition: reducedMotion ? 'none' : 'background 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
