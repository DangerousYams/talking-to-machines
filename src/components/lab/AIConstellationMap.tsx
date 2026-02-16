import { useState, useEffect, useRef, useCallback } from 'react';

/*
 * AIConstellationMap
 * ------------------
 * A Canvas2D "star map" of AI tools arranged as constellations by category.
 * Dark background (#1A1A2E) intentionally breaks the white-card pattern
 * to achieve a night-sky effect. Stars twinkle, constellation lines connect
 * tools within categories, and clusters cycle through an "active" highlight.
 * Nebula gradients provide ambient depth behind each cluster.
 */

// ---------- Data ----------

interface Tool {
  name: string;
  // Position offsets within cluster (0-1 range, mapped to cluster zone)
  ox: number;
  oy: number;
  // Per-star twinkle phase offset
  twinkleOffset: number;
  // Per-star twinkle speed multiplier
  twinkleSpeed: number;
}

interface Cluster {
  label: string;
  color: string;
  // Cluster center as fraction of canvas (0-1)
  cx: number;
  cy: number;
  // Spread radius as fraction of canvas width
  spread: number;
  tools: Tool[];
}

const CLUSTERS: Cluster[] = [
  {
    label: 'IMAGE GEN',
    color: '#E94560',
    cx: 0.2,
    cy: 0.22,
    spread: 0.12,
    tools: [
      { name: 'Midjourney',        ox: 0.0,   oy: -0.3,  twinkleOffset: 0.0,  twinkleSpeed: 1.0  },
      { name: 'DALL\u00B7E',       ox: -0.35, oy: 0.15,  twinkleOffset: 1.2,  twinkleSpeed: 0.8  },
      { name: 'Stable Diffusion',  ox: 0.4,   oy: 0.1,   twinkleOffset: 2.5,  twinkleSpeed: 1.1  },
      { name: 'Flux',              ox: -0.1,  oy: 0.45,  twinkleOffset: 3.8,  twinkleSpeed: 0.9  },
      { name: 'Ideogram',          ox: 0.3,   oy: -0.35, twinkleOffset: 5.0,  twinkleSpeed: 1.2  },
    ],
  },
  {
    label: 'VIDEO',
    color: '#F5A623',
    cx: 0.78,
    cy: 0.2,
    spread: 0.1,
    tools: [
      { name: 'Sora',    ox: 0.0,   oy: -0.35, twinkleOffset: 0.7,  twinkleSpeed: 0.9  },
      { name: 'Runway',  ox: -0.4,  oy: 0.1,   twinkleOffset: 2.1,  twinkleSpeed: 1.1  },
      { name: 'Kling',   ox: 0.35,  oy: 0.15,  twinkleOffset: 3.3,  twinkleSpeed: 0.7  },
      { name: 'Pika',    ox: 0.0,   oy: 0.4,   twinkleOffset: 4.6,  twinkleSpeed: 1.3  },
    ],
  },
  {
    label: 'MUSIC & AUDIO',
    color: '#16C79A',
    cx: 0.82,
    cy: 0.55,
    spread: 0.09,
    tools: [
      { name: 'Suno',       ox: -0.3,  oy: -0.25, twinkleOffset: 1.1,  twinkleSpeed: 1.0  },
      { name: 'Udio',       ox: 0.35,  oy: -0.15, twinkleOffset: 2.4,  twinkleSpeed: 0.85 },
      { name: 'ElevenLabs', ox: 0.0,   oy: 0.35,  twinkleOffset: 4.0,  twinkleSpeed: 1.15 },
    ],
  },
  {
    label: 'RESEARCH',
    color: '#0EA5E9',
    cx: 0.2,
    cy: 0.72,
    spread: 0.11,
    tools: [
      { name: 'Perplexity',      ox: 0.0,   oy: -0.35, twinkleOffset: 0.3,  twinkleSpeed: 1.05 },
      { name: 'Elicit',           ox: -0.4,  oy: 0.1,   twinkleOffset: 1.8,  twinkleSpeed: 0.75 },
      { name: 'NotebookLM',      ox: 0.35,  oy: 0.05,  twinkleOffset: 3.1,  twinkleSpeed: 1.2  },
      { name: 'Claude Research',  ox: 0.0,   oy: 0.4,   twinkleOffset: 4.5,  twinkleSpeed: 0.95 },
    ],
  },
  {
    label: 'CODING',
    color: '#7B61FF',
    cx: 0.72,
    cy: 0.78,
    spread: 0.12,
    tools: [
      { name: 'Claude Code', ox: 0.0,   oy: -0.3,  twinkleOffset: 0.5,  twinkleSpeed: 1.1  },
      { name: 'Cursor',      ox: -0.4,  oy: 0.05,  twinkleOffset: 1.9,  twinkleSpeed: 0.8  },
      { name: 'Copilot',     ox: 0.38,  oy: 0.0,   twinkleOffset: 3.2,  twinkleSpeed: 1.0  },
      { name: 'Windsurf',    ox: -0.15, oy: 0.4,   twinkleOffset: 4.4,  twinkleSpeed: 1.25 },
      { name: 'Replit',      ox: 0.25,  oy: 0.38,  twinkleOffset: 5.7,  twinkleSpeed: 0.9  },
    ],
  },
];

// How long each cluster stays "active"
const CLUSTER_CYCLE_MS = 4000;

// Slow orbital drift radius (in CSS px)
const ORBIT_RADIUS = 0.4;
const ORBIT_SPEED = 0.0003;

// Star visual constants
const STAR_RADIUS = 3.5;
const GLOW_RADIUS = 18;
const LABEL_FONT_SIZE = 9;
const CATEGORY_LABEL_FONT_SIZE = 10;

// ---------- Helpers ----------

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Background star type
interface BgStar {
  x: number;
  y: number;
  r: number;
  a: number;
  speed: number;
  offset: number;
}

// ---------- Component ----------

export default function AIConstellationMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const getCanvasDimensions = useCallback(() => {
    const container = containerRef.current;
    if (!container) return { width: 900, height: 506 };
    const rect = container.getBoundingClientRect();
    return { width: rect.width, height: rect.width * (9 / 16) };
  }, []);

  // Compute absolute star positions given canvas size and time for orbit
  const getStarPos = useCallback(
    (
      cluster: Cluster,
      tool: Tool,
      width: number,
      height: number,
      time: number
    ): { x: number; y: number } => {
      const baseX = cluster.cx * width + tool.ox * cluster.spread * width;
      const baseY = cluster.cy * height + tool.oy * cluster.spread * height;

      // Unique orbit phase per star
      const orbitPhase = tool.twinkleOffset * 1.7;
      const dx =
        Math.cos(time * ORBIT_SPEED + orbitPhase) * ORBIT_RADIUS * width * 0.003;
      const dy =
        Math.sin(time * ORBIT_SPEED * 0.7 + orbitPhase + 1.0) *
        ORBIT_RADIUS *
        height *
        0.003;

      return { x: baseX + dx, y: baseY + dy };
    },
    []
  );

  // Main draw function — defined before the effect that uses it
  const drawFrame = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      time: number,
      activeClusterIndex: number,
      bgStars: BgStar[],
      isStatic: boolean
    ) => {
      // --- Background ---
      ctx.fillStyle = '#1A1A2E';
      ctx.fillRect(0, 0, width, height);

      // Subtle vignette
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.15,
        width / 2,
        height / 2,
        width * 0.75
      );
      vignette.addColorStop(0, 'rgba(26, 26, 46, 0)');
      vignette.addColorStop(1, 'rgba(8, 8, 18, 0.5)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // --- Background stars ---
      for (const s of bgStars) {
        const twinkle = isStatic
          ? s.a
          : s.a * (0.5 + 0.5 * Math.sin(time * 0.001 * s.speed + s.offset));
        ctx.fillStyle = `rgba(200, 210, 230, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Nebula effects (large faint radial gradients behind each cluster) ---
      for (let ci = 0; ci < CLUSTERS.length; ci++) {
        const cluster = CLUSTERS[ci];
        const nCx = cluster.cx * width;
        const nCy = cluster.cy * height;
        const nebulaR = cluster.spread * width * 1.8;
        const isActive = ci === activeClusterIndex;

        // Base nebula (always visible)
        const baseAlpha = isActive && !isStatic ? 0.06 : 0.03;
        const nebula = ctx.createRadialGradient(nCx, nCy, 0, nCx, nCy, nebulaR);
        nebula.addColorStop(0, rgba(cluster.color, baseAlpha));
        nebula.addColorStop(0.6, rgba(cluster.color, baseAlpha * 0.3));
        nebula.addColorStop(1, rgba(cluster.color, 0));
        ctx.fillStyle = nebula;
        ctx.beginPath();
        ctx.arc(nCx, nCy, nebulaR, 0, Math.PI * 2);
        ctx.fill();

        // Active pulse nebula
        if (isActive && !isStatic) {
          const cycleT = (time % CLUSTER_CYCLE_MS) / CLUSTER_CYCLE_MS;
          // Smooth ease-in-out pulse
          const pulse = Math.sin(cycleT * Math.PI) * 0.5;
          const pulseNebula = ctx.createRadialGradient(
            nCx,
            nCy,
            0,
            nCx,
            nCy,
            nebulaR * (1 + pulse * 0.15)
          );
          pulseNebula.addColorStop(0, rgba(cluster.color, 0.04 * pulse));
          pulseNebula.addColorStop(0.5, rgba(cluster.color, 0.02 * pulse));
          pulseNebula.addColorStop(1, rgba(cluster.color, 0));
          ctx.fillStyle = pulseNebula;
          ctx.beginPath();
          ctx.arc(nCx, nCy, nebulaR * (1 + pulse * 0.15), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- Constellation lines (within each cluster) ---
      for (let ci = 0; ci < CLUSTERS.length; ci++) {
        const cluster = CLUSTERS[ci];
        const isActive = ci === activeClusterIndex;
        const tools = cluster.tools;

        // Connect stars in a chain (0-1, 1-2, 2-3...)
        const lineAlphaBase = isActive && !isStatic ? 0.35 : 0.1;

        ctx.strokeStyle = rgba(cluster.color, lineAlphaBase);
        ctx.lineWidth = isActive && !isStatic ? 0.8 : 0.5;

        // Build constellation lines: connect sequentially
        for (let i = 0; i < tools.length - 1; i++) {
          const posA = getStarPos(cluster, tools[i], width, height, time);
          const posB = getStarPos(cluster, tools[i + 1], width, height, time);
          ctx.beginPath();
          ctx.moveTo(posA.x, posA.y);
          ctx.lineTo(posB.x, posB.y);
          ctx.stroke();
        }

        // Close the loop for clusters with 4+ tools
        if (tools.length >= 4) {
          const posFirst = getStarPos(cluster, tools[0], width, height, time);
          const posLast = getStarPos(
            cluster,
            tools[tools.length - 1],
            width,
            height,
            time
          );
          ctx.beginPath();
          ctx.moveTo(posFirst.x, posFirst.y);
          ctx.lineTo(posLast.x, posLast.y);
          ctx.stroke();
        }

        // One cross-strut for visual interest (connect first to middle)
        if (tools.length >= 4) {
          const mid = Math.floor(tools.length / 2);
          const posA = getStarPos(cluster, tools[0], width, height, time);
          const posB = getStarPos(cluster, tools[mid], width, height, time);
          ctx.globalAlpha = isActive && !isStatic ? 0.2 : 0.06;
          ctx.beginPath();
          ctx.moveTo(posA.x, posA.y);
          ctx.lineTo(posB.x, posB.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // --- Stars + labels ---
      for (let ci = 0; ci < CLUSTERS.length; ci++) {
        const cluster = CLUSTERS[ci];
        const isActive = ci === activeClusterIndex;

        for (const tool of cluster.tools) {
          const pos = getStarPos(cluster, tool, width, height, time);

          // Twinkle: opacity oscillation
          const twinkleBase = isStatic
            ? 0.85
            : 0.55 +
              0.45 *
                Math.sin(
                  time * 0.0015 * tool.twinkleSpeed + tool.twinkleOffset
                );
          const activeMul = isActive && !isStatic ? 1.0 : 0.65;
          const starAlpha = twinkleBase * activeMul;

          // Active stars pulse slightly larger
          const activeScale = isActive && !isStatic
            ? 1.0 + 0.25 * Math.sin(time * 0.002 + tool.twinkleOffset * 2)
            : 1.0;

          // Glow halo
          const glowR = GLOW_RADIUS * activeScale;
          const glow = ctx.createRadialGradient(
            pos.x,
            pos.y,
            0,
            pos.x,
            pos.y,
            glowR
          );
          glow.addColorStop(0, rgba(cluster.color, 0.25 * starAlpha));
          glow.addColorStop(0.4, rgba(cluster.color, 0.08 * starAlpha));
          glow.addColorStop(1, rgba(cluster.color, 0));
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, glowR, 0, Math.PI * 2);
          ctx.fill();

          // Core star dot
          const coreR = STAR_RADIUS * activeScale;
          ctx.fillStyle = rgba(cluster.color, starAlpha);
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, coreR, 0, Math.PI * 2);
          ctx.fill();

          // Bright white center pinpoint
          ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * starAlpha})`;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, coreR * 0.35, 0, Math.PI * 2);
          ctx.fill();

          // Tool name label
          const labelAlpha = isActive && !isStatic ? 0.8 : 0.35;
          ctx.font = `${LABEL_FONT_SIZE}px 'JetBrains Mono', monospace`;
          ctx.fillStyle = rgba(cluster.color, labelAlpha);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(tool.name, pos.x + coreR + 6, pos.y + 1);
        }

        // Category label (near cluster center, slightly above)
        const labelX = cluster.cx * width;
        const labelY = cluster.cy * height - cluster.spread * height * 0.65;
        const catAlpha = isActive && !isStatic ? 0.9 : 0.3;

        ctx.font = `600 ${CATEGORY_LABEL_FONT_SIZE}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = rgba(cluster.color, catAlpha);
        ctx.textBaseline = 'middle';

        // Draw label with manual letter spacing for cross-browser support
        const labelText = cluster.label;
        const charSpacing = 1.8;
        const totalLabelW =
          ctx.measureText(labelText).width + (labelText.length - 1) * charSpacing;
        let charX = labelX - totalLabelW / 2;
        ctx.textAlign = 'left';
        for (let ch = 0; ch < labelText.length; ch++) {
          const c = labelText[ch];
          ctx.fillText(c, charX, labelY);
          charX += ctx.measureText(c).width + charSpacing;
        }

        // Small underline accent below category label
        ctx.strokeStyle = rgba(cluster.color, catAlpha * 0.4);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(labelX - totalLabelW * 0.3, labelY + 8);
        ctx.lineTo(labelX + totalLabelW * 0.3, labelY + 8);
        ctx.stroke();
      }

      // --- Active cluster indicator dots at bottom ---
      if (!isStatic && activeClusterIndex >= 0) {
        const indicatorY = height - 20;
        const dotSpacing = 14;
        const totalW = (CLUSTERS.length - 1) * dotSpacing;
        const startX = width / 2 - totalW / 2;

        for (let i = 0; i < CLUSTERS.length; i++) {
          const dotX = startX + i * dotSpacing;
          const isCurrentDot = i === activeClusterIndex;
          ctx.fillStyle = isCurrentDot
            ? rgba(CLUSTERS[i].color, 0.8)
            : 'rgba(255, 255, 255, 0.15)';
          ctx.beginPath();
          ctx.arc(dotX, indicatorY, isCurrentDot ? 3 : 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    [getStarPos]
  );

  useEffect(() => {
    setReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const { width, height } = getCanvasDimensions();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // Pre-generate background stars (tiny white dots for depth)
    const bgStars: BgStar[] = [];
    for (let i = 0; i < 120; i++) {
      bgStars.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.4 + Math.random() * 1.0,
        a: 0.1 + Math.random() * 0.25,
        speed: 0.3 + Math.random() * 0.8,
        offset: Math.random() * Math.PI * 2,
      });
    }

    if (reducedMotion) {
      // Draw a single static frame
      const { width, height } = getCanvasDimensions();
      drawFrame(ctx, width, height, 0, -1, bgStars, true);

      return () => {
        mountedRef.current = false;
        window.removeEventListener('resize', resize);
      };
    }

    const startTime = performance.now();

    const animate = (time: number) => {
      if (!mountedRef.current) return;
      const { width, height } = getCanvasDimensions();
      const elapsed = time - startTime;
      const activeClusterIndex =
        Math.floor(elapsed / CLUSTER_CYCLE_MS) % CLUSTERS.length;

      drawFrame(ctx, width, height, elapsed, activeClusterIndex, bgStars, false);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion, getCanvasDimensions, drawFrame]);

  // --- Reduced-motion static fallback ---
  if (reducedMotion) {
    return (
      <div ref={containerRef} style={outerContainerStyle}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />
        <div style={staticOverlayStyle}>
          <p
            style={{
              fontFamily: "'Lora', Georgia, serif",
              color: '#6B7280',
              fontSize: 13,
              margin: 0,
            }}
          >
            AI tools constellation map (animation paused).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={outerContainerStyle}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />
    </div>
  );
}

// ---------- Styles ----------

const outerContainerStyle: React.CSSProperties = {
  maxWidth: 900,
  margin: '0 auto',
  background: '#1A1A2E',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.06)',
  boxShadow:
    '0 4px 32px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.15)',
  position: 'relative',
  overflow: 'hidden',
};

const staticOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 16,
  left: 0,
  right: 0,
  textAlign: 'center',
};
