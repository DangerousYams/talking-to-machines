import type { ReactNode } from 'react';

interface ChallengeData {
  type: string;
  score: number;
  total: number;
}

interface ShareCardProps {
  title: string;
  metric: string;
  metricColor?: string;
  subtitle: string;
  tweetText: string;
  shareUrl?: string;
  accentColor?: string;
  challengeData?: ChallengeData;
  children?: ReactNode;
}

/**
 * Renders the share card as a 1080x1920 canvas image and triggers a PNG download.
 */
function renderCardToCanvas(
  title: string,
  metric: string,
  metricColor: string,
  subtitle: string,
  accentColor: string,
): void {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // --- Background ---
  ctx.fillStyle = '#FAF8F5';
  ctx.fillRect(0, 0, W, H);

  // --- Accent stripe at top ---
  const stripeHeight = 12;
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, accentColor);
  grad.addColorStop(1, accentColor + '80');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, stripeHeight);

  // --- Content area (centered vertically) ---
  const contentX = 100;
  const contentW = W - 200;
  let y = H * 0.35; // Start roughly in the upper third

  // --- Title (small, mono, uppercase) ---
  ctx.fillStyle = accentColor;
  ctx.font = '700 28px "JetBrains Mono", monospace';
  ctx.letterSpacing = '4px';
  ctx.textBaseline = 'top';
  ctx.fillText(title.toUpperCase(), contentX, y);
  y += 60;

  // --- Big metric ---
  ctx.fillStyle = metricColor;
  ctx.font = '800 160px "Playfair Display", Georgia, serif';
  ctx.letterSpacing = '0px';

  // Word-wrap the metric if needed
  const metricLines = wrapText(ctx, metric, contentW);
  for (const line of metricLines) {
    ctx.fillText(line, contentX, y);
    y += 170;
  }
  y += 20;

  // --- Subtitle ---
  ctx.fillStyle = '#6B7280';
  ctx.font = '400 38px "Source Serif 4", "Lora", Georgia, serif';
  ctx.letterSpacing = '0px';
  const subtitleLines = wrapText(ctx, subtitle, contentW);
  for (const line of subtitleLines) {
    ctx.fillText(line, contentX, y);
    y += 52;
  }

  // --- Branding at bottom ---
  ctx.fillStyle = '#B0B0B0';
  ctx.font = '600 24px "JetBrains Mono", monospace';
  ctx.letterSpacing = '2px';
  ctx.textBaseline = 'bottom';
  ctx.fillText('talkingtomachines.vercel.app', contentX, H - 80);

  // --- Small decorative accent line above branding ---
  ctx.fillStyle = accentColor + '40';
  ctx.fillRect(contentX, H - 110, 120, 3);

  // --- Download ---
  const link = document.createElement('a');
  link.download = `talking-to-machines-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/** Simple word-wrap helper for canvas text. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export default function ShareCard({
  title,
  metric,
  metricColor = '#E94560',
  subtitle,
  tweetText,
  shareUrl,
  accentColor = '#E94560',
  challengeData,
  children,
}: ShareCardProps) {
  const url = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');

  const handleShare = () => {
    const encodedText = encodeURIComponent(tweetText);
    const encodedUrl = encodeURIComponent(url);
    window.open(
      `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      '_blank',
      'width=550,height=420,noopener,noreferrer'
    );
  };

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText(url);
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy Link'; }, 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy Link'; }, 2000);
    }
  };

  const handleDownloadImage = () => {
    renderCardToCanvas(title, metric, metricColor, subtitle, accentColor);
  };

  const handleChallenge = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!challengeData) return;
    const btn = e.currentTarget;
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const challengeUrl = `${base}/ch1?challenge=${encodeURIComponent(challengeData.type)}&target=${challengeData.score}&total=${challengeData.total}`;
    try {
      await navigator.clipboard.writeText(challengeUrl);
      btn.textContent = 'Challenge link copied!';
      setTimeout(() => { btn.textContent = 'Challenge a Friend'; }, 2500);
    } catch {
      const input = document.createElement('input');
      input.value = challengeUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      btn.textContent = 'Challenge link copied!';
      setTimeout(() => { btn.textContent = 'Challenge a Friend'; }, 2500);
    }
  };

  // Shared styles for outline buttons
  const outlineButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 100,
    border: '1px solid rgba(26,26,46,0.15)',
    background: 'transparent',
    color: '#6B7280',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.03em',
    transition: 'all 0.25s',
    minHeight: 38,
  };

  const handleOutlineEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'rgba(26,26,46,0.3)';
    e.currentTarget.style.color = '#1A1A2E';
  };

  const handleOutlineLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'rgba(26,26,46,0.15)';
    e.currentTarget.style.color = '#6B7280';
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAFE 100%)',
      border: '1px solid rgba(26,26,46,0.08)',
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* Accent stripe */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`,
      }} />

      <div style={{ padding: '1.5rem 1.75rem' }}>
        {/* Title */}
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          color: accentColor,
          margin: '0 0 0.25rem',
        }}>
          {title}
        </p>

        {/* Big metric */}
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2.75rem',
          fontWeight: 800,
          color: metricColor,
          margin: '0 0 0.25rem',
          lineHeight: 1.1,
        }}>
          {metric}
        </p>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.88rem',
          color: '#6B7280',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {subtitle}
        </p>

        {/* Children slot */}
        {children && <div style={{ marginTop: '0.75rem' }}>{children}</div>}

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'rgba(26,26,46,0.06)',
          margin: '1.25rem 0',
        }} />

        {/* Button row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
          {/* Share on X */}
          <button
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 18px',
              borderRadius: 100,
              border: 'none',
              background: '#1A1A2E',
              color: '#FAF8F5',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.03em',
              transition: 'all 0.25s',
              minHeight: 38,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {/* X / Twitter icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopy}
            style={outlineButtonStyle}
            onMouseEnter={handleOutlineEnter}
            onMouseLeave={handleOutlineLeave}
          >
            Copy Link
          </button>

          {/* Download Image */}
          <button
            onClick={handleDownloadImage}
            style={outlineButtonStyle}
            onMouseEnter={handleOutlineEnter}
            onMouseLeave={handleOutlineLeave}
          >
            {/* Download icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Image
          </button>

          {/* Challenge a Friend */}
          {challengeData && (
            <button
              onClick={handleChallenge}
              style={{
                ...outlineButtonStyle,
                borderColor: accentColor + '40',
                color: accentColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.background = accentColor + '0A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = accentColor + '40';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Trophy / challenge icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
              Challenge a Friend
            </button>
          )}
        </div>

        {/* Branding */}
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.58rem',
          color: '#B0B0B0',
          margin: '1rem 0 0',
          letterSpacing: '0.04em',
        }}>
          talkingtomachines.vercel.app
        </p>
      </div>
    </div>
  );
}
