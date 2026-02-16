import { useState, useRef, useEffect, useCallback } from 'react';

interface CardListenButtonProps {
  chapterSlug: string;
  audioIndices: number[];
  accentColor: string;
  isActive?: boolean;
}

/**
 * Inline callout-style listen button for per-card audio playback.
 * Styled to match the Key Insight callout visual language.
 */
export default function CardListenButton({ chapterSlug, audioIndices, accentColor, isActive = false }: CardListenButtonProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentIndexRef = useRef(0);
  const animFrameRef = useRef<number>(0);

  const audioUrl = useCallback(
    (index: number) => `/audio/cards/${chapterSlug}/${String(index).padStart(3, '0')}.mp3`,
    [chapterSlug],
  );

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    cancelAnimationFrame(animFrameRef.current);
    setPlaying(false);
    setProgress(0);
    currentIndexRef.current = 0;
  }, []);

  useEffect(() => {
    if (!isActive && playing) stopPlayback();
  }, [isActive, playing, stopPlayback]);

  useEffect(() => {
    return () => stopPlayback();
  }, [stopPlayback]);

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const totalFiles = audioIndices.length;
    const fileProgress = audio.currentTime / audio.duration;
    setProgress((currentIndexRef.current + fileProgress) / totalFiles);
    animFrameRef.current = requestAnimationFrame(updateProgress);
  }, [audioIndices.length]);

  const playFile = useCallback((fileIndex: number) => {
    if (fileIndex >= audioIndices.length) {
      stopPlayback();
      return;
    }
    currentIndexRef.current = fileIndex;
    const audio = new Audio(audioUrl(audioIndices[fileIndex]));
    audioRef.current = audio;
    audio.onended = () => playFile(fileIndex + 1);
    audio.onerror = () => playFile(fileIndex + 1);
    audio.play().catch(() => stopPlayback());
    animFrameRef.current = requestAnimationFrame(updateProgress);
  }, [audioIndices, audioUrl, stopPlayback, updateProgress]);

  const toggle = useCallback(() => {
    if (playing) {
      stopPlayback();
    } else {
      setPlaying(true);
      playFile(0);
    }
  }, [playing, stopPlayback, playFile]);

  const iconSize = 16;

  return (
    <button
      onClick={toggle}
      aria-label={playing ? 'Stop audio' : 'Listen to this section'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '12px 16px',
        borderRadius: 8,
        border: `1px solid ${playing ? accentColor + '30' : 'rgba(107,114,128,0.12)'}`,
        background: playing ? `${accentColor}08` : 'rgba(107,114,128,0.05)',
        cursor: 'pointer',
        textAlign: 'left' as const,
        position: 'relative' as const,
        overflow: 'hidden' as const,
        transition: 'border-color 0.25s ease, background 0.25s ease',
      }}
      onMouseEnter={(e) => {
        if (!playing) {
          e.currentTarget.style.background = 'rgba(107,114,128,0.08)';
          e.currentTarget.style.borderColor = 'rgba(107,114,128,0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (!playing) {
          e.currentTarget.style.background = 'rgba(107,114,128,0.05)';
          e.currentTarget.style.borderColor = 'rgba(107,114,128,0.12)';
        }
      }}
    >
      {/* Progress bar at bottom */}
      {playing && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 2,
          width: `${progress * 100}%`,
          background: accentColor,
          borderRadius: '0 1px 0 0',
          transition: 'width 0.15s linear',
        }} />
      )}

      {playing ? (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill={accentColor}>
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="var(--color-subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}

      <span style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: playing ? accentColor : 'var(--color-subtle)',
        transition: 'color 0.25s ease',
      }}>
        {playing ? 'Playing...' : 'Listen'}
      </span>
    </button>
  );
}
