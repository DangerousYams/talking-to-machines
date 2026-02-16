import { useChapterMode } from './ChapterModeContext';

interface Props {
  accentColor: string;
}

export default function ListenButton({ accentColor }: Props) {
  const { mode, setMode } = useChapterMode();
  const isListening = mode === 'listen';

  return (
    <button
      onClick={() => setMode(isListening ? 'read' : 'listen')}
      aria-label={isListening ? 'Stop listening' : 'Listen to chapter'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        background: isListening ? `${accentColor}18` : 'transparent',
        color: isListening ? accentColor : '#6B7280',
        transition: 'all 0.25s ease',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    </button>
  );
}
