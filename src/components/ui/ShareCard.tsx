import type { ReactNode } from 'react';

interface ShareCardProps {
  title: string;
  metric: string;
  metricColor?: string;
  subtitle: string;
  tweetText: string;
  shareUrl?: string;
  accentColor?: string;
  children?: ReactNode;
}

export default function ShareCard({
  title,
  metric,
  metricColor = '#E94560',
  subtitle,
  tweetText,
  shareUrl,
  accentColor = '#E94560',
  children,
}: ShareCardProps) {
  const url = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const copied = false;

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

          <button
            onClick={handleCopy}
            style={{
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
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.3)'; e.currentTarget.style.color = '#1A1A2E'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.15)'; e.currentTarget.style.color = '#6B7280'; }}
          >
            Copy Link
          </button>
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
