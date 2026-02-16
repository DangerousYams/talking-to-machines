interface Props {
  beatId: string;
  beatTitle: string;
  nextBeatTitle?: string;
  accentColor: string;
}

export default function BeatCompletionCard({ beatId, beatTitle, nextBeatTitle, accentColor }: Props) {
  return (
    <div
      data-beat-end={beatId}
      style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '2rem 1.5rem',
      }}
    >
      <div style={{
        background: `linear-gradient(135deg, ${accentColor}06, ${accentColor}03)`,
        border: `1px solid ${accentColor}18`,
        borderRadius: 14,
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        {/* Checkmark */}
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: `${accentColor}15`,
          border: `1.5px solid ${accentColor}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: accentColor,
          fontSize: '0.7rem',
          fontWeight: 700,
        }}>
          &#10003;
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            color: accentColor,
            margin: '0 0 2px',
            opacity: 0.8,
          }}>
            You just learned
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: '#1A1A2E',
            margin: 0,
            lineHeight: 1.5,
          }}>
            {beatTitle}
          </p>
        </div>

        {nextBeatTitle && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: '#B0B0B0',
            margin: 0,
            flexShrink: 0,
            textAlign: 'right' as const,
          }}>
            Next: {nextBeatTitle}
          </p>
        )}
      </div>
    </div>
  );
}
