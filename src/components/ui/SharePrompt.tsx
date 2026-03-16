import { useState, useCallback } from 'react';

interface Props {
  text: string;
  url?: string;
}

export default function SharePrompt({ text, url }: Props) {
  const [hovered, setHovered] = useState(false);

  const defaultUrl = url || 'https://www.talkingtomachines.xyz';
  const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(defaultUrl)}`;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.origin : defaultUrl);
    const liveUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(liveUrl, '_blank', 'noopener,noreferrer');
  }, [text, url, defaultUrl]);

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      padding: '20px 0',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(26,26,46,0.06)' }} />
      <a
        href={tweetUrl}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '8px 16px',
          borderRadius: 100,
          border: '1px solid rgba(26,26,46,0.08)',
          background: hovered ? 'rgba(26,26,46,0.03)' : 'transparent',
          textDecoration: 'none',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem',
          fontWeight: 500,
          letterSpacing: '0.03em',
          color: 'var(--color-subtle)',
          opacity: hovered ? 0.9 : 0.55,
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        Share this course
      </a>
      <div style={{ flex: 1, height: 1, background: 'rgba(26,26,46,0.06)' }} />
    </div>
  );
}
