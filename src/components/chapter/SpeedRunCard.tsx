interface Props {
  beatNumber: number;
  title: string;
  tldr: string;
  accentColor: string;
}

export default function SpeedRunCard({ beatNumber, title, tldr, accentColor }: Props) {
  return (
    <div style={{
      maxWidth: 680,
      margin: '0 auto',
      padding: '1rem 1.5rem',
    }}>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid rgba(26, 26, 46, 0.08)',
        borderRadius: 14,
        padding: '1.25rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Left accent bar */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: accentColor,
          borderRadius: '3px 0 0 3px',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            fontWeight: 800,
            color: accentColor,
            flexShrink: 0,
            marginTop: 1,
          }}>
            {beatNumber}.
          </span>
          <div>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#1A1A2E',
              margin: '0 0 4px',
              lineHeight: 1.3,
            }}>
              {title}
            </p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              color: '#6B7280',
              margin: 0,
              lineHeight: 1.6,
            }}>
              {tldr}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
