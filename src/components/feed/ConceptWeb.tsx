import React, { useMemo, useId } from 'react';
import { scaleLinear } from 'd3-scale';
import { CONCEPT_AREA_LABELS, type ConceptArea } from '../../data/challenges';

interface ConceptWebProps {
  data: Record<ConceptArea, number>; // 0-1 scale per area
  size?: number; // SVG size in px (default 300)
  animated?: boolean; // Animate on mount (default true)
}

const AREAS = Object.keys(CONCEPT_AREA_LABELS) as ConceptArea[];
const RING_LEVELS = [0.25, 0.5, 0.75, 1.0];

// Per-axis accent colors for dot highlights
const AXIS_COLORS: Record<ConceptArea, string> = {
  'prompt-craft': '#E94560',
  'context-engineering': '#7B61FF',
  'tool-landscape': '#0EA5E9',
  'tool-use': '#F5A623',
  'agent-design': '#16C79A',
  'coding-with-ai': '#0F3460',
  'critical-thinking': '#E94560',
  'human-judgment': '#F5A623',
};

export default function ConceptWeb({
  data,
  size = 300,
  animated = true,
}: ConceptWebProps) {
  const uid = useId();
  const gradientId = `concept-web-gradient-${uid.replace(/:/g, '')}`;
  const glowId = `concept-web-glow-${uid.replace(/:/g, '')}`;

  // Layout math
  const padding = size * 0.22; // space for labels
  const maxRadius = (size - padding * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // D3 scales: map data values (0-1) to pixel radius, and axis index to angle
  const radiusScale = useMemo(
    () => scaleLinear().domain([0, 1]).range([0, maxRadius]),
    [maxRadius],
  );

  const angleScale = useMemo(
    () => scaleLinear().domain([0, AREAS.length]).range([0, 2 * Math.PI]),
    [],
  );

  // Compute (x, y) for a given axis index at a given normalized value (0-1)
  const pointAt = (axisIndex: number, normalizedValue: number) => {
    const angle = angleScale(axisIndex) - Math.PI / 2;
    const r = radiusScale(normalizedValue);
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Data polygon — values per axis, clamped with a small minimum for visual presence
  const dataValues = useMemo(
    () => AREAS.map((area) => Math.max(data[area] ?? 0, 0.03)),
    [data],
  );

  // Cartesian data points (for placing dots)
  const dataPoints = useMemo(
    () => AREAS.map((_, i) => pointAt(i, dataValues[i])),
    [dataValues, maxRadius, cx, cy],
  );

  // Build polygon path from Cartesian points (D3 scales handle value-to-pixel mapping)
  const polygonPath = useMemo(() => {
    if (dataPoints.length === 0) return '';
    return (
      dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'
    );
  }, [dataPoints]);

  // Ring paths (concentric octagons) — built from Cartesian points
  const ringPaths = useMemo(
    () =>
      RING_LEVELS.map((level) => {
        const pts = AREAS.map((_, i) => pointAt(i, level));
        return (
          pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'
        );
      }),
    [maxRadius, cx, cy],
  );

  // Label positioning — push labels further out and adjust alignment
  const labelPositions = useMemo(
    () =>
      AREAS.map((area, i) => {
        const labelRadius = maxRadius + (size < 250 ? 24 : 32);
        const angle = angleScale(i) - Math.PI / 2;
        const x = cx + labelRadius * Math.cos(angle);
        const y = cy + labelRadius * Math.sin(angle);

        // Determine text-anchor based on position around the circle
        const angleDeg = ((angle * 180) / Math.PI + 360) % 360;
        let textAnchor: 'start' | 'middle' | 'end' = 'middle';
        if (angleDeg > 20 && angleDeg < 160) textAnchor = 'start';
        else if (angleDeg > 200 && angleDeg < 340) textAnchor = 'end';

        // Vertical nudge
        let dy = 0;
        if (angleDeg > 60 && angleDeg < 120) dy = 4; // bottom half
        if (angleDeg > 240 && angleDeg < 300) dy = -2; // top half

        return {
          area,
          label: CONCEPT_AREA_LABELS[area],
          x,
          y: y + dy,
          textAnchor,
        };
      }),
    [maxRadius, cx, cy, size, angleScale],
  );

  // CSS keyframes for mount animation
  const animationStyles = animated
    ? `
    @keyframes concept-web-expand {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      60% {
        transform: scale(1.04);
        opacity: 0.8;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    @keyframes concept-web-dot-pop {
      0% {
        r: 0;
        opacity: 0;
      }
      70% {
        r: 4.5;
        opacity: 1;
      }
      100% {
        r: 3.5;
        opacity: 1;
      }
    }
    @keyframes concept-web-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `
    : '';

  // Check if all values are zero or near-zero
  const hasData = AREAS.some((area) => (data[area] ?? 0) > 0.01);

  return (
    <div
      style={{
        width: size,
        maxWidth: '100%',
        aspectRatio: '1 / 1',
        position: 'relative',
      }}
    >
      {animated && <style>{animationStyles}</style>}

      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        style={{ maxWidth: '100%', height: 'auto', overflow: 'visible' }}
        role="img"
        aria-label="Concept coverage radar chart showing progress across 8 skill areas"
      >
        <defs>
          {/* Gradient fill for the data polygon */}
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#7B61FF" stopOpacity={0.35} />
            <stop offset="50%" stopColor="#16C79A" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.3} />
          </linearGradient>

          {/* Soft glow filter for the polygon */}
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Concentric ring outlines */}
        {ringPaths.map((d, i) => (
          <path
            key={`ring-${i}`}
            d={d}
            fill="none"
            stroke="rgba(26, 26, 46, 0.08)"
            strokeWidth={i === ringPaths.length - 1 ? 1.2 : 0.7}
            style={
              animated
                ? {
                    opacity: 0,
                    animation: `concept-web-fade-in 0.4s ease-out ${0.1 + i * 0.06}s forwards`,
                  }
                : undefined
            }
          />
        ))}

        {/* Axis lines from center to outer ring */}
        {AREAS.map((_, i) => {
          const outer = pointAt(i, 1);
          return (
            <line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(26, 26, 46, 0.08)"
              strokeWidth={0.7}
              style={
                animated
                  ? {
                      opacity: 0,
                      animation: `concept-web-fade-in 0.3s ease-out ${0.15 + i * 0.04}s forwards`,
                    }
                  : undefined
              }
            />
          );
        })}

        {/* Data polygon (filled area) */}
        {hasData && (
          <path
            d={polygonPath}
            fill={`url(#${gradientId})`}
            stroke="rgba(123, 97, 255, 0.6)"
            strokeWidth={1.5}
            strokeLinejoin="round"
            filter={`url(#${glowId})`}
            style={
              animated
                ? {
                    transformOrigin: `${cx}px ${cy}px`,
                    transform: 'scale(0)',
                    opacity: 0,
                    animation:
                      'concept-web-expand 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s forwards',
                  }
                : undefined
            }
          />
        )}

        {/* Data points (dots on each axis) */}
        {hasData &&
          dataPoints.map((p, i) => {
            const area = AREAS[i];
            const value = data[area] ?? 0;
            if (value < 0.01) return null;

            return (
              <circle
                key={`dot-${i}`}
                cx={p.x}
                cy={p.y}
                r={animated ? 0 : 3.5}
                fill={AXIS_COLORS[area]}
                stroke="#FAF8F5"
                strokeWidth={1.5}
                style={
                  animated
                    ? {
                        animation: `concept-web-dot-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.7 + i * 0.06}s forwards`,
                      }
                    : undefined
                }
              />
            );
          })}

        {/* Zero state: subtle center dot */}
        {!hasData && (
          <circle
            cx={cx}
            cy={cy}
            r={3}
            fill="rgba(26, 26, 46, 0.12)"
          />
        )}

        {/* Axis labels */}
        {labelPositions.map((lp, i) => {
          // Split long labels across two lines
          const words = lp.label.split(' ');
          const needsWrap = words.length > 1 && lp.label.length > 10;
          const line1 = needsWrap ? words.slice(0, Math.ceil(words.length / 2)).join(' ') : lp.label;
          const line2 = needsWrap ? words.slice(Math.ceil(words.length / 2)).join(' ') : '';

          const value = data[AREAS[i]] ?? 0;
          const hasValue = value > 0.01;

          return (
            <text
              key={`label-${i}`}
              x={lp.x}
              y={lp.y}
              textAnchor={lp.textAnchor}
              dominantBaseline="central"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: size < 250 ? '8px' : '10px',
                fontWeight: hasValue ? 500 : 400,
                fill: hasValue ? '#1A1A2E' : '#6B7280',
                letterSpacing: '0.02em',
                ...(animated
                  ? {
                      opacity: 0,
                      animation: `concept-web-fade-in 0.4s ease-out ${0.9 + i * 0.05}s forwards`,
                    }
                  : {}),
              }}
            >
              <tspan x={lp.x} dy={needsWrap ? '-0.45em' : '0'}>
                {line1}
              </tspan>
              {line2 && (
                <tspan x={lp.x} dy="1.15em">
                  {line2}
                </tspan>
              )}
            </text>
          );
        })}
      </svg>

      {/* Empty state message */}
      {!hasData && (
        <div
          style={{
            position: 'absolute',
            bottom: size < 250 ? '18%' : '22%',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem',
              color: '#6B7280',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              margin: 0,
              whiteSpace: 'nowrap',
            }}
          >
            Complete challenges to fill your web
          </p>
        </div>
      )}
    </div>
  );
}
