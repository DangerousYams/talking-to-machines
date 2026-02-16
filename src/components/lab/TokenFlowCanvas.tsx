import { useRef, useEffect, useState, useCallback } from 'react';

/*
 * TokenFlowCanvas
 * ---------------
 * A Canvas2D particle system: tokens flow from prompt (left) into
 * an AI core (center) and responses flow back out (right).
 * Warm input tones, cool output tones, gentle curved paths.
 */

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  progress: number;
  speed: number;
  color: string;
  size: number;
  opacity: number;
  curveOffset: number;
  phase: 'input' | 'output';
  alive: boolean;
}

const INPUT_COLORS = ['#E94560', '#F5A623', '#E94560CC', '#F5A623CC', '#D63B56'];
const OUTPUT_COLORS = ['#7B61FF', '#0EA5E9', '#16C79A', '#7B61FFCC', '#0EA5E9CC'];

// Easing: ease-in-out cubic
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Helper for rounded rectangles (fallback for browsers without roundRect)
function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }
}

export default function TokenFlowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const tokensInRef = useRef(0);
  const tokensOutRef = useRef(0);
  const [tokensIn, setTokensIn] = useState(0);
  const [tokensOut, setTokensOut] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const lastSpawnRef = useRef(0);
  const pulseRef = useRef(0);
  const mountedRef = useRef(true);

  const getCanvasDimensions = useCallback(() => {
    const container = containerRef.current;
    if (!container) return { width: 900, height: 500 };
    const rect = container.getBoundingClientRect();
    return { width: rect.width, height: rect.width * (9 / 16) };
  }, []);

  const spawnParticle = useCallback((width: number, height: number) => {
    const isInput = Math.random() < 0.55;
    const centerX = width / 2;
    const centerY = height / 2;

    if (isInput) {
      const startX = 30 + Math.random() * (width * 0.15);
      const startY = centerY - 60 + Math.random() * 120;
      return {
        x: startX,
        y: startY,
        startX,
        startY,
        targetX: centerX,
        targetY: centerY + (Math.random() - 0.5) * 30,
        progress: 0,
        speed: 0.004 + Math.random() * 0.004,
        color: INPUT_COLORS[Math.floor(Math.random() * INPUT_COLORS.length)],
        size: 3 + Math.random() * 2.5,
        opacity: 0.6 + Math.random() * 0.4,
        curveOffset: (Math.random() - 0.5) * 80,
        phase: 'input' as const,
        alive: true,
      };
    } else {
      const endX = width - 30 - Math.random() * (width * 0.15);
      const endY = centerY - 60 + Math.random() * 120;
      return {
        x: centerX,
        y: centerY + (Math.random() - 0.5) * 30,
        startX: centerX,
        startY: centerY + (Math.random() - 0.5) * 30,
        targetX: endX,
        targetY: endY,
        progress: 0,
        speed: 0.003 + Math.random() * 0.004,
        color: OUTPUT_COLORS[Math.floor(Math.random() * OUTPUT_COLORS.length)],
        size: 3 + Math.random() * 2.5,
        opacity: 0.6 + Math.random() * 0.4,
        curveOffset: (Math.random() - 0.5) * 80,
        phase: 'output' as const,
        alive: true,
      };
    }
  }, []);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || reducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const { width, height } = getCanvasDimensions();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = (time: number) => {
      if (!mountedRef.current) return;
      const { width, height } = getCanvasDimensions();
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Spawn new particles
      if (time - lastSpawnRef.current > 120) {
        particlesRef.current.push(spawnParticle(width, height));
        lastSpawnRef.current = time;
      }

      // Keep particle count manageable
      if (particlesRef.current.length > 120) {
        particlesRef.current = particlesRef.current.filter(p => p.alive).slice(-100);
      }

      // Draw the "AI" core glow
      pulseRef.current += 0.02;
      const pulseScale = 1 + Math.sin(pulseRef.current) * 0.08;
      const coreRadius = 36 * pulseScale;

      // Outer glow
      const glowGrad = ctx.createRadialGradient(centerX, centerY, coreRadius * 0.5, centerX, centerY, coreRadius * 3);
      glowGrad.addColorStop(0, 'rgba(123, 97, 255, 0.12)');
      glowGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.04)');
      glowGrad.addColorStop(1, 'rgba(123, 97, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius * 3, 0, Math.PI * 2);
      ctx.fill();

      // Core
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
      coreGrad.addColorStop(0, 'rgba(123, 97, 255, 0.25)');
      coreGrad.addColorStop(0.6, 'rgba(14, 165, 233, 0.15)');
      coreGrad.addColorStop(1, 'rgba(123, 97, 255, 0.05)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // Core ring
      ctx.strokeStyle = 'rgba(123, 97, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner ring
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      // Update and draw particles
      for (const p of particlesRef.current) {
        if (!p.alive) continue;

        p.progress += p.speed;

        if (p.progress >= 1) {
          p.alive = false;
          if (p.phase === 'input') {
            tokensInRef.current++;
            setTokensIn(tokensInRef.current);
          } else {
            tokensOutRef.current++;
            setTokensOut(tokensOutRef.current);
          }
          continue;
        }

        const t = easeInOutCubic(p.progress);

        // Quadratic bezier curve
        const midX = (p.startX + p.targetX) / 2;
        const midY = (p.startY + p.targetY) / 2 + p.curveOffset;

        p.x = (1 - t) * (1 - t) * p.startX + 2 * (1 - t) * t * midX + t * t * p.targetX;
        p.y = (1 - t) * (1 - t) * p.startY + 2 * (1 - t) * t * midY + t * t * p.targetY;

        // Fade in and out at edges
        const fadeIn = Math.min(p.progress * 5, 1);
        const fadeOut = Math.min((1 - p.progress) * 5, 1);
        const alpha = p.opacity * fadeIn * fadeOut;

        // Particle glow
        const glowR = p.size * 3;
        const particleGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        particleGlow.addColorStop(0, p.color.replace(/CC$/, '') + Math.round(alpha * 40).toString(16).padStart(2, '0'));
        particleGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = particleGlow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Particle dot
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw labels
      ctx.font = "500 11px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';

      // "Your prompt" label (left)
      ctx.fillStyle = 'rgba(233, 69, 96, 0.5)';
      ctx.fillText('Your prompt', width * 0.13, centerY - 85);

      // Lines representing prompt text (left side)
      const lineColors = ['rgba(233, 69, 96, 0.12)', 'rgba(245, 166, 35, 0.12)', 'rgba(233, 69, 96, 0.08)'];
      for (let i = 0; i < 4; i++) {
        const ly = centerY - 50 + i * 22;
        const lw = 60 + Math.random() * 40;
        const lx = width * 0.13 - lw / 2;
        ctx.fillStyle = lineColors[i % lineColors.length];
        drawRoundedRect(ctx, lx, ly, lw, 6, 3);
      }

      // AI label
      ctx.fillStyle = 'rgba(123, 97, 255, 0.6)';
      ctx.font = "600 13px 'JetBrains Mono', monospace";
      ctx.fillText('AI', centerX, centerY + 5);

      // "Response" label (right)
      ctx.font = "500 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = 'rgba(14, 165, 233, 0.5)';
      ctx.fillText('Response', width * 0.87, centerY - 85);

      // Lines representing response text (right side)
      const outLineColors = ['rgba(123, 97, 255, 0.12)', 'rgba(14, 165, 233, 0.12)', 'rgba(22, 199, 154, 0.08)'];
      for (let i = 0; i < 5; i++) {
        const ly = centerY - 50 + i * 20;
        const lw = 50 + Math.random() * 50;
        const lx = width * 0.87 - lw / 2;
        ctx.fillStyle = outLineColors[i % outLineColors.length];
        drawRoundedRect(ctx, lx, ly, lw, 5, 2.5);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion, getCanvasDimensions, spawnParticle]);

  // Static fallback for reduced motion
  if (reducedMotion) {
    return (
      <div style={staticContainerStyle}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ fontFamily: "'Lora', serif", color: '#6B7280', fontSize: 15 }}>
            Token flow visualization (animation paused — reduced motion preference detected).
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 20 }}>
            <span style={counterStyle}>
              <span style={{ color: '#E94560' }}>tokens in:</span> 128
            </span>
            <span style={counterStyle}>
              <span style={{ color: '#7B61FF' }}>tokens out:</span> 256
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={outerContainerStyle}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />

      {/* Token counters overlay */}
      <div style={countersOverlayStyle}>
        <span style={counterStyle}>
          <span style={{ color: '#E94560' }}>tokens in:</span>{' '}
          <span style={{ color: '#1A1A2E', fontWeight: 600 }}>{tokensIn}</span>
        </span>
        <span style={counterStyle}>
          <span style={{ color: '#7B61FF' }}>tokens out:</span>{' '}
          <span style={{ color: '#1A1A2E', fontWeight: 600 }}>{tokensOut}</span>
        </span>
      </div>
    </div>
  );
}

// Styles
const outerContainerStyle: React.CSSProperties = {
  maxWidth: 900,
  margin: '0 auto',
  background: '#FFFFFF',
  borderRadius: 16,
  border: '1px solid rgba(26, 26, 46, 0.06)',
  boxShadow: '0 4px 32px rgba(26, 26, 46, 0.06), 0 1px 4px rgba(0,0,0,0.02)',
  position: 'relative',
  overflow: 'hidden',
};

const staticContainerStyle: React.CSSProperties = {
  ...outerContainerStyle,
};

const countersOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 16,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  gap: 32,
};

const counterStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: '0.04em',
  opacity: 0.7,
};
