interface Props {
  beatNumber: number;
  totalBeats: number;
  title: string;
  estimatedMinutes: number;
  accentColor: string;
}

export default function BeatHeader({ beatNumber, totalBeats, title, estimatedMinutes, accentColor }: Props) {
  return (
    <div style={{
      maxWidth: 680,
      margin: '0 auto',
      padding: '0 1.5rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '1rem 0',
      }}>
        {/* Beat number ring */}
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: `2px solid ${accentColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-heading)',
          fontSize: '0.9rem',
          fontWeight: 800,
          color: accentColor,
          flexShrink: 0,
        }}>
          {beatNumber}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            color: '#6B7280',
            margin: '0 0 2px',
          }}>
            Part {beatNumber} of {totalBeats}
          </p>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#1A1A2E',
            margin: 0,
            lineHeight: 1.3,
          }}>
            {title}
          </p>
        </div>

        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          color: '#B0B0B0',
          flexShrink: 0,
        }}>
          ~{estimatedMinutes} min
        </span>
      </div>
    </div>
  );
}
