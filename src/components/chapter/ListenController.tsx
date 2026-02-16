import { useState, useEffect, useRef, useCallback } from 'react';
import { useChapterMode } from './ChapterModeContext';

interface Props {
  accentColor: string;
  chapterSlug: string;
}

/**
 * ListenController
 * ----------------
 * When chapter mode is 'listen', this component:
 * 1. Collects all readable paragraphs from narrative sections
 * 2. Plays pre-generated MP3 audio files via HTML5 Audio
 * 3. Auto-scrolls to follow along
 * 4. Highlights the current paragraph
 * 5. Shows a floating player bar with play/pause + speed controls
 */
export default function ListenController({ accentColor, chapterSlug }: Props) {
  const { mode, setMode } = useChapterMode();
  const isListening = mode === 'listen';

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalParagraphs, setTotalParagraphs] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [audioAvailable, setAudioAvailable] = useState<boolean | null>(null);

  const paragraphsRef = useRef<HTMLElement[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const highlightRef = useRef<HTMLElement | null>(null);
  const mountedRef = useRef(true);
  const manifestRef = useRef<Record<string, number>>({});

  // Fetch manifest on mount to check audio availability
  useEffect(() => {
    fetch('/audio/manifest.json')
      .then((r) => r.json())
      .then((data: Record<string, number>) => {
        manifestRef.current = data;
        if (data[chapterSlug] && data[chapterSlug] > 0) {
          setAudioAvailable(true);
        } else {
          setAudioAvailable(false);
        }
      })
      .catch(() => setAudioAvailable(false));
  }, [chapterSlug]);

  // Collect readable paragraphs when entering listen mode
  const collectParagraphs = useCallback(() => {
    const selectors = [
      'section.max-w-\\[680px\\] p',
      'section.max-w-\\[680px\\] h2',
      'section.max-w-\\[680px\\] h3',
      'section.min-h-\\[80vh\\] h1',
      'section.min-h-\\[80vh\\] p',
      '.pull-quote',
    ];
    const elements = document.querySelectorAll<HTMLElement>(selectors.join(', '));
    const readable = Array.from(elements).filter((el) => {
      const text = el.textContent?.trim() || '';
      return text.length > 5;
    });
    readable.sort((a, b) => {
      const pos = a.compareDocumentPosition(b);
      return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    paragraphsRef.current = readable;
    setTotalParagraphs(readable.length);
    return readable;
  }, []);

  // Clear highlight from previous paragraph
  const clearHighlight = useCallback(() => {
    if (highlightRef.current) {
      highlightRef.current.style.removeProperty('background-color');
      highlightRef.current.style.removeProperty('border-radius');
      highlightRef.current.style.removeProperty('box-shadow');
      highlightRef.current.style.removeProperty('transition');
      highlightRef.current = null;
    }
  }, []);

  // Highlight and scroll to a paragraph
  const highlightParagraph = useCallback((el: HTMLElement) => {
    clearHighlight();
    el.style.backgroundColor = `${accentColor}12`;
    el.style.borderRadius = '8px';
    el.style.boxShadow = `inset 3px 0 0 ${accentColor}`;
    el.style.transition = 'background-color 0.3s ease, box-shadow 0.3s ease';
    highlightRef.current = el;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [accentColor, clearHighlight]);

  // Build audio URL for a given paragraph index
  const audioUrl = useCallback(
    (index: number) => `/audio/${chapterSlug}/${String(index).padStart(3, '0')}.mp3`,
    [chapterSlug]
  );

  // Play a specific paragraph's audio
  const playParagraph = useCallback((index: number) => {
    if (!mountedRef.current) return;
    const paragraphs = paragraphsRef.current;
    if (index >= paragraphs.length) {
      // Finished all paragraphs
      setIsPlaying(false);
      setCurrentIndex(0);
      clearHighlight();
      return;
    }

    setCurrentIndex(index);
    highlightParagraph(paragraphs[index]);

    // Stop any current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }

    const audio = new Audio(audioUrl(index));
    audio.playbackRate = speed;
    audioRef.current = audio;

    audio.onended = () => {
      if (!mountedRef.current) return;
      playParagraph(index + 1);
    };

    audio.onerror = () => {
      if (!mountedRef.current) return;
      // Skip on error, try next
      playParagraph(index + 1);
    };

    audio.play().catch(() => {
      // Autoplay blocked or other error — skip to next
      if (mountedRef.current) playParagraph(index + 1);
    });
  }, [speed, highlightParagraph, clearHighlight, audioUrl]);

  // Start playback
  const play = useCallback(() => {
    if (audioAvailable === false) return;
    const paragraphs = collectParagraphs();
    if (paragraphs.length === 0) return;

    setIsPlaying(true);
    playParagraph(currentIndex);
  }, [audioAvailable, collectParagraphs, playParagraph, currentIndex]);

  // Pause
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  // Resume
  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(true);
  }, []);

  // Stop completely
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    clearHighlight();
    setIsPlaying(false);
    setCurrentIndex(0);
  }, [clearHighlight]);

  // Skip forward/back
  const skip = useCallback((direction: 1 | -1) => {
    const next = Math.max(0, Math.min(currentIndex + direction, paragraphsRef.current.length - 1));
    setIsPlaying(true);
    playParagraph(next);
  }, [currentIndex, playParagraph]);

  // When entering listen mode, auto-play
  useEffect(() => {
    if (isListening) {
      const t = setTimeout(() => play(), 300);
      return () => clearTimeout(t);
    } else {
      stop();
    }
  }, [isListening]); // eslint-disable-line react-hooks/exhaustive-deps

  // When speed changes, apply to current audio without restarting
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
        audioRef.current = null;
      }
      clearHighlight();
    };
  }, [clearHighlight]);

  // Don't render anything if not in listen mode
  if (!isListening) return null;

  if (audioAvailable === false) {
    return (
      <div style={playerBarStyle}>
        <div style={{ ...playerInnerStyle, justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280' }}>
            Audio not available for this chapter.
          </span>
          <button onClick={() => setMode('read')} style={closeButtonStyle}>
            &times;
          </button>
        </div>
      </div>
    );
  }

  const progress = totalParagraphs > 0 ? ((currentIndex + 1) / totalParagraphs) * 100 : 0;

  return (
    <div style={playerBarStyle}>
      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: 'rgba(26, 26, 46, 0.06)',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: accentColor,
          transition: 'width 0.3s ease',
          borderRadius: '0 2px 2px 0',
        }} />
      </div>

      <div style={playerInnerStyle}>
        {/* Skip back */}
        <button
          onClick={() => skip(-1)}
          disabled={currentIndex === 0}
          style={{
            ...controlButtonStyle,
            opacity: currentIndex === 0 ? 0.3 : 1,
          }}
          aria-label="Previous paragraph"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="19,20 9,12 19,4" />
            <line x1="5" y1="19" x2="5" y2="5" />
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => isPlaying ? pause() : resume()}
          style={{
            ...controlButtonStyle,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: accentColor,
            color: '#FFFFFF',
          }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6,4 20,12 6,20" />
            </svg>
          )}
        </button>

        {/* Skip forward */}
        <button
          onClick={() => skip(1)}
          disabled={currentIndex >= totalParagraphs - 1}
          style={{
            ...controlButtonStyle,
            opacity: currentIndex >= totalParagraphs - 1 ? 0.3 : 1,
          }}
          aria-label="Next paragraph"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5,4 15,12 5,20" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>

        {/* Progress counter */}
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: '#6B7280',
          marginLeft: 8,
          minWidth: 48,
        }}>
          {currentIndex + 1} / {totalParagraphs}
        </span>

        {/* Speed control */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          {[0.75, 1, 1.25, 1.5].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              style={{
                ...controlButtonStyle,
                padding: '3px 8px',
                borderRadius: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                fontWeight: speed === s ? 700 : 400,
                background: speed === s ? `${accentColor}18` : 'transparent',
                color: speed === s ? accentColor : '#6B7280',
                border: speed === s ? `1px solid ${accentColor}30` : '1px solid transparent',
              }}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Close */}
        <button
          onClick={() => setMode('read')}
          style={closeButtonStyle}
          aria-label="Exit listen mode"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Styles ───

const playerBarStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 50,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderTop: '1px solid rgba(26, 26, 46, 0.08)',
  boxShadow: '0 -4px 24px rgba(26, 26, 46, 0.06)',
};

const playerInnerStyle: React.CSSProperties = {
  maxWidth: 680,
  margin: '0 auto',
  padding: '10px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const controlButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: '#1A1A2E',
  padding: 4,
  borderRadius: 4,
  transition: 'opacity 0.2s ease',
};

const closeButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: '#6B7280',
  padding: 6,
  marginLeft: 8,
  borderRadius: 6,
};
