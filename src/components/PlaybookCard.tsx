import { useState, useRef } from 'react';

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
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
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
      ref={cardRef}
      onClick={handleCopy}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        padding: '1.75rem 2rem',
        borderRadius: 16,
        border: `1px solid ${hovered ? color + '40' : 'rgba(255,255,255,0.06)'}`,
        background: hovered
          ? `linear-gradient(135deg, ${color}08, ${color}04)`
          : 'rgba(255,255,255,0.02)',
        cursor: 'pointer',
        transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? `0 12px 40px ${color}15` : 'none',
        opacity: 0,
        animation: `pb-card-in 0.6s ease ${delay}s forwards`,
        overflow: 'hidden',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCopy(); }}
      aria-label={`Copy: ${title}`}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: '2rem', right: '2rem', height: 2,
        background: `linear-gradient(90deg, ${color}, ${color}40)`,
        borderRadius: '0 0 2px 2px',
        opacity: hovered ? 1 : 0.5,
        transition: 'opacity 0.3s',
      }} />

      {/* Number + title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
        <span style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800,
          color: color, lineHeight: 1, flexShrink: 0, opacity: 0.4,
          minWidth: 30, textAlign: 'right' as const,
        }}>
          {number}
        </span>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700,
            color: '#FFFFFFEE', margin: '0 0 3px', lineHeight: 1.25,
          }}>
            {title}
          </h3>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.4, fontStyle: 'italic',
          }}>
            {subtitle}
          </p>
        </div>
        {/* Copy indicator */}
        <div style={{
          flexShrink: 0, padding: '4px 10px', borderRadius: 100,
          background: copied ? `${color}25` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${copied ? color : 'rgba(255,255,255,0.06)'}`,
          transition: 'all 0.3s',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {copied ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600,
            color: copied ? color : 'rgba(255,255,255,0.3)',
            letterSpacing: '0.05em',
          }}>
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </div>
      </div>

      {/* The prompt itself */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.78rem', lineHeight: 1.65,
        color: 'rgba(255,255,255,0.75)', padding: '14px 18px',
        background: 'rgba(0,0,0,0.2)', borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.04)',
        whiteSpace: 'pre-wrap' as const,
      }}>
        {prompt}
      </div>
    </div>
  );
}
