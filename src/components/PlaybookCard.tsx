import { useState } from 'react';

interface Props {
  number: number;
  title: string;
  subtitle: string;
  prompt: string;
  color: string;
  delay: number;
}

export default function PlaybookCard({ number, title, subtitle, prompt, color, delay }: Props) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      onClick={handleCopy}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        padding: '1.5rem 1.75rem',
        borderRadius: 14,
        border: `1px solid ${hovered ? color + '30' : 'rgba(26,26,46,0.07)'}`,
        background: hovered ? `${color}04` : 'white',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? `0 8px 30px ${color}12` : '0 1px 4px rgba(26,26,46,0.04)',
        opacity: 0,
        animation: `pb-card-in 0.5s ease ${delay}s forwards`,
        overflow: 'hidden',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCopy(); }}
      aria-label={`Copy: ${title}`}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: `linear-gradient(to bottom, ${color}, ${color}50)`,
        borderRadius: '3px 0 0 3px',
      }} />

      {/* Number + title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <span style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800,
          color: color, lineHeight: 1, flexShrink: 0, opacity: 0.3,
          minWidth: 24, textAlign: 'right' as const,
        }}>
          {number}
        </span>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700,
            color: '#1A1A2E', margin: '0 0 2px', lineHeight: 1.25,
          }}>
            {title}
          </h3>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.78rem',
            color: 'var(--color-subtle)', margin: 0, lineHeight: 1.4, fontStyle: 'italic',
          }}>
            {subtitle}
          </p>
        </div>
        {/* Copy indicator */}
        <div style={{
          flexShrink: 0, padding: '3px 10px', borderRadius: 100,
          background: copied ? `${color}12` : 'rgba(26,26,46,0.03)',
          border: `1px solid ${copied ? color + '30' : 'rgba(26,26,46,0.06)'}`,
          transition: 'all 0.3s',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {copied ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 600,
            color: copied ? color : 'var(--color-subtle)',
            letterSpacing: '0.05em', opacity: copied ? 1 : 0.5,
          }}>
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </div>
      </div>

      {/* The prompt */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.65,
        color: 'var(--color-deep)', padding: '12px 16px',
        background: 'var(--color-cream)', borderRadius: 8,
        border: '1px solid rgba(26,26,46,0.05)',
        whiteSpace: 'pre-wrap' as const,
        opacity: 0.8,
      }}>
        {prompt}
      </div>
    </div>
  );
}
