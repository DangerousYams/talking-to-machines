import { useChapterMode, type ChapterMode } from './ChapterModeContext';

const modes: { id: ChapterMode; label: string; icon: string }[] = [
  { id: 'read', label: 'Read', icon: '\u{1F4D6}' },
  { id: 'speed-run', label: 'Speed Run', icon: '\u26A1' },
  { id: 'listen', label: 'Listen', icon: '\u{1F3A7}' },
];

interface Props {
  accentColor: string;
}

export default function ChapterModeBar({ accentColor }: Props) {
  const { mode, setMode } = useChapterMode();

  return (
    <div style={{
      position: 'sticky',
      top: 48, // below the header (h-12 = 48px)
      zIndex: 35,
      background: 'rgba(250, 248, 245, 0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(26, 26, 46, 0.06)',
    }}>
      <div style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        height: 44,
      }}>
        {modes.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 16px',
                borderRadius: 100,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: active ? 700 : 500,
                letterSpacing: '0.03em',
                background: active ? accentColor : 'transparent',
                color: active ? '#FFFFFF' : '#6B7280',
                transition: 'all 0.25s ease',
                minHeight: 32,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(26, 26, 46, 0.05)';
                  e.currentTarget.style.color = '#1A1A2E';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6B7280';
                }
              }}
            >
              <span style={{ fontSize: '0.85rem', lineHeight: 1 }}>{m.icon}</span>
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
