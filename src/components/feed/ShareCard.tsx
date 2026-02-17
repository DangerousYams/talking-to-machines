import React, { useRef, useCallback } from 'react';
import type { Challenge } from '../../data/challenges';
import { CHALLENGE_TYPE_META, CONCEPT_AREA_LABELS } from '../../data/challenges';

interface ShareCardProps {
  challenge: Challenge;
  percentile: number;
  onClose: () => void;
}

export default function ShareCard({ challenge, percentile, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meta = CHALLENGE_TYPE_META[challenge.type];

  const generateImage = useCallback((): HTMLCanvasElement | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const w = 600;
    const h = 400;
    canvas.width = w * 2; // 2x for retina
    canvas.height = h * 2;
    ctx.scale(2, 2);

    // Background
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#1A1A2E');
    bg.addColorStop(1, '#0F3460');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Accent glow
    const glow = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, 200);
    glow.addColorStop(0, meta.color + '30');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Type badge
    ctx.fillStyle = meta.color + '25';
    ctx.beginPath();
    ctx.roundRect(32, 32, meta.label.length * 9 + 48, 32, 16);
    ctx.fill();
    ctx.font = '13px monospace';
    ctx.fillStyle = meta.color;
    ctx.fillText(`${meta.icon}  ${meta.label}`, 48, 53);

    // Challenge title
    ctx.font = 'bold 28px serif';
    ctx.fillStyle = '#FFFFFF';
    const titleLines = wrapText(ctx, challenge.title, w - 64, 28);
    titleLines.forEach((line, i) => {
      ctx.fillText(line, 32, 105 + i * 36);
    });

    // Percentile
    const pY = 105 + titleLines.length * 36 + 40;
    ctx.font = 'bold 72px serif';
    const pColor = percentile >= 70 ? '#16C79A' : percentile >= 40 ? '#F5A623' : '#E94560';
    ctx.fillStyle = pColor;
    ctx.fillText(`${percentile}`, 32, pY + 60);

    // Percentile label
    ctx.font = '16px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    const pWidth = ctx.measureText(String(percentile)).width;
    ctx.font = 'bold 72px serif';
    const numWidth = ctx.measureText(String(percentile)).width;
    ctx.font = '14px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('th percentile', 32 + numWidth + 8, pY + 52);

    // Concept area
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillText(CONCEPT_AREA_LABELS[challenge.conceptArea].toUpperCase(), 32, pY + 90);

    // Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(32, h - 52, w - 64, 1);
    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillText('TALKING TO MACHINES  ·  THE ARENA', 32, h - 24);

    return canvas;
  }, [challenge, percentile, meta]);

  const handleShare = useCallback(async () => {
    const canvas = generateImage();
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (!blob) return;

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'practice-result.png', { type: 'image/png' });
        const shareData = {
          title: `${challenge.title} — ${percentile}th percentile`,
          text: `I scored in the ${percentile}th percentile on "${challenge.title}" in The Arena — Talking to Machines!`,
          files: [file],
        };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }

      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'practice-result.png';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // User cancelled share
    }
  }, [generateImage, challenge, percentile]);

  const handleCopy = useCallback(async () => {
    const canvas = generateImage();
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
      }
    } catch {
      // Clipboard not available
    }
  }, [generateImage]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '16px 0',
    }}>
      {/* Preview */}
      <div style={{
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(26, 26, 46, 0.08)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          width={1200}
          height={800}
        />
        {/* Render on mount */}
        <RenderOnMount onRender={generateImage} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleShare}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: meta.color,
            color: '#FFFFFF',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Share
        </button>
        <button
          onClick={handleCopy}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid rgba(26, 26, 46, 0.1)',
            background: 'transparent',
            color: 'var(--color-deep)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(26, 26, 46, 0.03)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          Copy
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid rgba(26, 26, 46, 0.1)',
            background: 'transparent',
            color: 'var(--color-subtle)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(26, 26, 46, 0.03)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Helper: wrap text for canvas
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Trigger canvas render after mount
function RenderOnMount({ onRender }: { onRender: () => void }) {
  const hasRendered = useRef(false);
  if (!hasRendered.current) {
    hasRendered.current = true;
    setTimeout(onRender, 50);
  }
  return null;
}
