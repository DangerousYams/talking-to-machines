import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';

/*
 * TokenRain
 * ---------
 * A Canvas2D "digital rain" effect where sentences break apart into
 * individual tokens (subword tokenization) and fall like rain into
 * a token buffer at the bottom. Each token is rendered as a rounded
 * pill with text, colored by type. DPR-aware.
 */

interface TokenParticle {
  text: string;
  type: 'common' | 'content' | 'space' | 'punctuation';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  vx: number;
  vy: number;
  speed: number;
  sineOffset: number;
  sineFreq: number;
  sineAmp: number;
  width: number;
  height: number;
  phase: 'source' | 'falling' | 'landing' | 'landed';
  progress: number;
  opacity: number;
  delay: number;
  index: number;
}

interface SentenceData {
  text: string;
  tokens: Array<{ text: string; type: 'common' | 'content' | 'space' | 'punctuation' }>;
}

const SENTENCES: SentenceData[] = [
  {
    text: 'The quick brown fox jumps over the lazy dog',
    tokens: [
      { text: 'The', type: 'common' },
      { text: ' quick', type: 'content' },
      { text: ' brown', type: 'content' },
      { text: ' fox', type: 'content' },
      { text: ' jumps', type: 'content' },
      { text: ' over', type: 'common' },
      { text: ' the', type: 'common' },
      { text: ' lazy', type: 'content' },
      { text: ' dog', type: 'content' },
    ],
  },
  {
    text: 'Write me a poem about the ocean at midnight',
    tokens: [
      { text: 'Write', type: 'content' },
      { text: ' me', type: 'common' },
      { text: ' a', type: 'common' },
      { text: ' poem', type: 'content' },
      { text: ' about', type: 'common' },
      { text: ' the', type: 'common' },
      { text: ' ocean', type: 'content' },
      { text: ' at', type: 'common' },
      { text: ' mid', type: 'content' },
      { text: 'night', type: 'content' },
    ],
  },
  {
    text: 'You are a helpful coding assistant',
    tokens: [
      { text: 'You', type: 'common' },
      { text: ' are', type: 'common' },
      { text: ' a', type: 'common' },
      { text: ' helpful', type: 'content' },
      { text: ' coding', type: 'content' },
      { text: ' assist', type: 'content' },
      { text: 'ant', type: 'content' },
    ],
  },
];

const PURPLE = '#7B61FF';
const NAVY = '#0F3460';
const SUBTLE = '#6B7280';
const DEEP = '#1A1A2E';
const LIGHT_BG = '#F3F0FF';

// Color for each token type
function tokenColor(type: string): string {
  switch (type) {
    case 'content': return NAVY;
    case 'common': return SUBTLE;
    case 'space': return '#9CA3AF';
    case 'punctuation': return '#9CA3AF';
    default: return SUBTLE;
  }
}

function tokenBg(type: string): string {
  switch (type) {
    case 'content': return 'rgba(15, 52, 96, 0.08)';
    case 'common': return 'rgba(107, 114, 128, 0.07)';
    case 'space': return 'rgba(156, 163, 175, 0.06)';
    case 'punctuation': return 'rgba(156, 163, 175, 0.06)';
    default: return 'rgba(107, 114, 128, 0.06)';
  }
}

function tokenBorder(type: string): string {
  switch (type) {
    case 'content': return 'rgba(15, 52, 96, 0.18)';
    case 'common': return 'rgba(107, 114, 128, 0.14)';
    default: return 'rgba(156, 163, 175, 0.12)';
  }
}

// Ease out cubic
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Ease in quad
function easeInQuad(t: number): number {
  return t * t;
}

// Draw a rounded rectangle path
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
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
}

export default function TokenRain() {
  const isMobile = useIsMobile();
  const isMobileRef = useRef(isMobile);
  isMobileRef.current = isMobile;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [landedCount, setLandedCount] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const stateRef = useRef<{
    particles: TokenParticle[];
    sentenceIndex: number;
    phase: 'showing' | 'splitting' | 'falling' | 'complete' | 'pause';
    phaseTimer: number;
    sentenceOpacity: number;
    bufferGlow: number;
    landedCount: number;
    totalTokens: number;
  }>({
    particles: [],
    sentenceIndex: 0,
    phase: 'showing',
    phaseTimer: 0,
    sentenceOpacity: 1,
    bufferGlow: 0,
    landedCount: 0,
    totalTokens: 0,
  });

  const getCanvasDimensions = useCallback(() => {
    const mobile = isMobileRef.current;
    const container = containerRef.current;
    if (!container) return { width: 500, height: mobile ? 700 : 480 };
    const rect = container.getBoundingClientRect();
    if (mobile) {
      return { width: rect.width, height: rect.height || rect.width * 1.6 };
    }
    const w = Math.min(rect.width, 560);
    return { width: w, height: w * 0.9 };
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

    let dpr = 1;

    const resize = () => {
      const { width, height } = getCanvasDimensions();
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const state = stateRef.current;

    // Measure text widths for tokens
    const measureToken = (text: string): number => {
      ctx.font = "600 11px 'JetBrains Mono', monospace";
      return ctx.measureText(text).width + 16;
    };

    const initSentence = () => {
      const { width, height } = getCanvasDimensions();
      const sentence = SENTENCES[state.sentenceIndex];
      state.particles = [];
      state.phase = 'showing';
      state.phaseTimer = 0;
      state.sentenceOpacity = 1;
      state.bufferGlow = 0;
      state.landedCount = 0;

      // Create particles for each token
      const pillH = 26;
      const tokenWidths = sentence.tokens.map(t => measureToken(t.text));
      const totalWidth = tokenWidths.reduce((a, b) => a + b + 6, -6);
      let startX = (width - totalWidth) / 2;
      const sourceY = 60;

      // Buffer area
      const bufferY = height - 60;
      const bufferTotalWidth = tokenWidths.reduce((a, b) => a + b + 4, -4);
      let bufferStartX = (width - bufferTotalWidth) / 2;

      sentence.tokens.forEach((token, i) => {
        const tw = tokenWidths[i];
        const bx = bufferStartX;
        bufferStartX += tw + 4;

        const particle: TokenParticle = {
          text: token.text,
          type: token.type,
          x: startX,
          y: sourceY,
          targetX: bx,
          targetY: bufferY,
          startX: startX,
          startY: sourceY,
          vx: 0,
          vy: 0,
          speed: 0.6 + Math.random() * 0.4,
          sineOffset: Math.random() * Math.PI * 2,
          sineFreq: 0.02 + Math.random() * 0.015,
          sineAmp: 12 + Math.random() * 16,
          width: tw,
          height: pillH,
          phase: 'source',
          progress: 0,
          opacity: 1,
          delay: i * 180,
          index: i,
        };

        startX += tw + 6;
        state.particles.push(particle);
      });

      state.totalTokens = sentence.tokens.length;
    };

    initSentence();

    let lastTime = 0;

    const animate = (time: number) => {
      if (!mountedRef.current) return;
      const { width, height } = getCanvasDimensions();
      const dt = lastTime ? Math.min(time - lastTime, 32) : 16;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const sentence = SENTENCES[state.sentenceIndex];

      // === Draw sentence text at the top ===
      if (state.phase === 'showing' || state.phase === 'splitting') {
        ctx.save();
        ctx.globalAlpha = state.sentenceOpacity;
        ctx.font = "500 15px 'Lora', Georgia, serif";
        ctx.fillStyle = DEEP;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Draw the sentence centered
        const sentenceY = 22;
        ctx.fillText(sentence.text, width / 2, sentenceY);

        // Label above sentence
        ctx.font = "600 9px 'JetBrains Mono', monospace";
        ctx.fillStyle = PURPLE;
        ctx.globalAlpha = state.sentenceOpacity * 0.6;
        ctx.fillText('ORIGINAL TEXT', width / 2, 6);

        ctx.restore();
      }

      // === Phase management ===
      state.phaseTimer += dt;

      if (state.phase === 'showing' && state.phaseTimer > 1400) {
        state.phase = 'splitting';
        state.phaseTimer = 0;
      }

      if (state.phase === 'splitting') {
        state.sentenceOpacity = Math.max(0, 1 - state.phaseTimer / 600);
        if (state.phaseTimer > 700) {
          state.phase = 'falling';
          state.phaseTimer = 0;
          // Start particles falling
          state.particles.forEach(p => {
            p.phase = 'falling';
            p.progress = 0;
          });
        }
      }

      // === Draw "buffer" area at bottom ===
      const bufferY = height - 60;
      const bufferAreaY = bufferY - 6;
      const bufferAreaH = 38;

      // Buffer background
      ctx.save();
      ctx.fillStyle = 'rgba(123, 97, 255, 0.03)';
      roundRect(ctx, 20, bufferAreaY, width - 40, bufferAreaH, 10);
      ctx.fill();

      // Buffer border
      ctx.strokeStyle = 'rgba(123, 97, 255, 0.1)';
      ctx.lineWidth = 1;
      roundRect(ctx, 20, bufferAreaY, width - 40, bufferAreaH, 10);
      ctx.stroke();

      // Buffer glow
      if (state.bufferGlow > 0) {
        ctx.fillStyle = `rgba(123, 97, 255, ${state.bufferGlow * 0.08})`;
        roundRect(ctx, 16, bufferAreaY - 4, width - 32, bufferAreaH + 8, 14);
        ctx.fill();
        state.bufferGlow = Math.max(0, state.bufferGlow - dt * 0.002);
      }
      ctx.restore();

      // Buffer label
      ctx.save();
      ctx.font = "600 8px 'JetBrains Mono', monospace";
      ctx.fillStyle = PURPLE;
      ctx.globalAlpha = 0.45;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('TOKEN BUFFER', 28, bufferAreaY + bufferAreaH + 6);
      ctx.restore();

      // === Update and draw particles ===
      let newLanded = 0;

      for (const p of state.particles) {
        if (p.phase === 'source') {
          // Draw in source position (part of the sentence)
          drawPill(ctx, p, p.startX, p.startY, state.sentenceOpacity);
          continue;
        }

        if (p.phase === 'falling') {
          const elapsed = state.phaseTimer - p.delay;
          if (elapsed < 0) {
            // Still waiting to start falling — draw at source with fade
            drawPill(ctx, p, p.startX, p.startY, Math.max(0, 1 - state.phaseTimer / 400));
            continue;
          }

          // Fall duration is proportional to distance
          const fallDuration = 1800 + p.index * 80;
          p.progress = Math.min(elapsed / fallDuration, 1);

          const t = easeInQuad(Math.min(p.progress * 0.7, 1)); // Accelerate
          const tEnd = easeOutCubic(p.progress); // Smooth landing

          // Use tEnd for position (smooth decel at end)
          const baseY = p.startY + (p.targetY - p.startY) * tEnd;
          const baseX = p.startX + (p.targetX - p.startX) * tEnd;

          // Sine wave drift
          const drift = Math.sin(elapsed * p.sineFreq + p.sineOffset) * p.sineAmp * (1 - tEnd);

          p.x = baseX + drift;
          p.y = baseY;
          p.opacity = Math.min(elapsed / 200, 1);

          if (p.progress >= 1) {
            p.phase = 'landed';
            p.x = p.targetX;
            p.y = p.targetY;
            p.opacity = 1;
            state.bufferGlow = 1;
          }

          drawPill(ctx, p, p.x, p.y, p.opacity);
        }

        if (p.phase === 'landing') {
          p.phase = 'landed';
        }

        if (p.phase === 'landed') {
          newLanded++;
          drawPill(ctx, p, p.targetX, p.targetY, 1);
        }
      }

      // Update landed count for display
      if (newLanded !== state.landedCount) {
        state.landedCount = newLanded;
        setLandedCount(newLanded);
      }

      // === Draw token counter ===
      ctx.save();
      ctx.font = "700 13px 'JetBrains Mono', monospace";
      ctx.fillStyle = PURPLE;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.globalAlpha = 0.7;
      ctx.fillText(`${state.landedCount} token${state.landedCount !== 1 ? 's' : ''}`, width - 28, bufferAreaY + bufferAreaH + 4);
      ctx.restore();

      // === Check if complete ===
      if (state.phase === 'falling' && state.landedCount >= state.totalTokens) {
        state.phase = 'complete';
        state.phaseTimer = 0;
      }

      if (state.phase === 'complete') {
        if (state.phaseTimer > 2200) {
          // Move to next sentence
          state.sentenceIndex = (state.sentenceIndex + 1) % SENTENCES.length;
          setCurrentSentenceIndex(state.sentenceIndex);
          initSentence();
        }
      }

      if (state.phase === 'pause') {
        // Just a brief hold before restarting
        if (state.phaseTimer > 600) {
          initSentence();
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    // Draw a single token pill
    function drawPill(
      ctx: CanvasRenderingContext2D,
      p: TokenParticle,
      x: number,
      y: number,
      alpha: number
    ) {
      if (alpha <= 0) return;

      ctx.save();
      ctx.globalAlpha = alpha;

      const bg = tokenBg(p.type);
      const border = tokenBorder(p.type);
      const color = tokenColor(p.type);
      const r = p.height / 2;

      // Shadow
      ctx.fillStyle = 'rgba(26, 26, 46, 0.04)';
      roundRect(ctx, x + 1, y + 2, p.width, p.height, r);
      ctx.fill();

      // Background
      ctx.fillStyle = bg;
      roundRect(ctx, x, y, p.width, p.height, r);
      ctx.fill();

      // Border
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, p.width, p.height, r);
      ctx.stroke();

      // Text
      ctx.font = "600 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.text, x + p.width / 2, y + p.height / 2 + 0.5);

      ctx.restore();
    }

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion, getCanvasDimensions]);

  const dynamicContainerStyle: React.CSSProperties = isMobile
    ? {
        width: '100%',
        margin: '0 auto',
        background: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
      }
    : {
        maxWidth: 560,
        margin: '0 auto',
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid rgba(26, 26, 46, 0.06)',
        boxShadow: '0 4px 32px rgba(26, 26, 46, 0.06), 0 1px 4px rgba(0,0,0,0.02)',
        position: 'relative',
        overflow: 'hidden',
      };

  // Static fallback for reduced motion
  if (reducedMotion) {
    const sentence = SENTENCES[0];
    return (
      <div style={dynamicContainerStyle}>
        <div style={{ textAlign: 'center', padding: '32px 20px' }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            fontWeight: 600,
            color: PURPLE,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 8,
            opacity: 0.6,
          }}>
            Tokenization
          </div>
          <p style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 15,
            color: DEEP,
            marginBottom: 20,
          }}>
            {sentence.text}
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 6,
            marginBottom: 16,
          }}>
            {sentence.tokens.map((t, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  color: tokenColor(t.type),
                  background: tokenBg(t.type),
                  border: `1px solid ${tokenBorder(t.type)}`,
                  borderRadius: 13,
                  padding: '4px 8px',
                }}
              >
                {t.text}
              </span>
            ))}
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            color: PURPLE,
            opacity: 0.6,
          }}>
            {sentence.tokens.length} tokens
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={dynamicContainerStyle}>
      {/* Sentence indicator dots */}
      <div style={{
        position: 'absolute',
        top: 14,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 6,
        zIndex: 1,
      }}>
        {SENTENCES.map((_, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: i === currentSentenceIndex ? PURPLE : 'rgba(26, 26, 46, 0.1)',
              transition: 'background 0.4s ease',
            }}
          />
        ))}
      </div>

      <div ref={containerRef} style={{ width: '100%', position: 'relative', ...(isMobile ? { flex: 1 } : {}) }}>
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%' }}
        />
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 20,
        padding: '6px 16px 16px',
        ...(isMobile ? { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, padding: '8px 16px 12px' } : {}),
      }}>
        <div style={legendItemStyle}>
          <div style={{ ...legendDotStyle, background: NAVY, opacity: 0.6 }} />
          <span>content words</span>
        </div>
        <div style={legendItemStyle}>
          <div style={{ ...legendDotStyle, background: SUBTLE, opacity: 0.5 }} />
          <span>common words</span>
        </div>
        <div style={legendItemStyle}>
          <div style={{ ...legendDotStyle, background: PURPLE, opacity: 0.5 }} />
          <span>subword split</span>
        </div>
      </div>
    </div>
  );
}

// containerStyle is now dynamic — see dynamicContainerStyle inside the component

const legendItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9,
  color: '#6B7280',
  letterSpacing: '0.03em',
};

const legendDotStyle: React.CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: 2,
};
