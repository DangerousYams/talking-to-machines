import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { useFTUE } from '../../hooks/useFTUE';

interface CardActionBarProps {
  cardIndex: number;
  totalCards: number;
  accentColor: string;
  /* Menu */
  onMenuOpen?: () => void;
  /* Audio */
  chapterSlug?: string;
  audioIndices?: number[];
  isActive?: boolean;
  /* Flip */
  hasFlip?: boolean;
  flipSide?: 'widget' | 'text';
  onFlipToggle?: () => void;
  /* Facts */
  keyFact?: ReactNode;
  /* FTUE */
  isFirstFlippable?: boolean;
}

export default function CardActionBar({
  cardIndex,
  totalCards,
  accentColor,
  onMenuOpen,
  chapterSlug,
  audioIndices,
  isActive = false,
  hasFlip = false,
  flipSide = 'widget',
  onFlipToggle,
  keyFact,
  isFirstFlippable = false,
}: CardActionBarProps) {
  const hasAudio = !!(chapterSlug && audioIndices?.length);
  const [factsOpen, setFactsOpen] = useState(false);

  /* ── Audio state ── */
  const [playing, setPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentFileRef = useRef(0);
  const rafRef = useRef<number>(0);

  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── FTUE coach marks ── */
  const { seen: ftueSeen, markSeen: ftueMarkSeen } = useFTUE('cards_action_bar');
  const showFTUE = isFirstFlippable && !ftueSeen;
  const toggleRef = useRef<HTMLDivElement>(null);
  const factsRef = useRef<HTMLButtonElement>(null);
  const listenRef = useRef<HTMLButtonElement>(null);

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
    cancelAnimationFrame(rafRef.current);
    setPlaying(false);
    setAudioProgress(0);
    currentFileRef.current = 0;
  }, []);

  useEffect(() => {
    if (!isActive && playing) stopPlayback();
  }, [isActive, playing, stopPlayback]);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  const updateProgress = useCallback(() => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const total = audioIndices!.length;
    const fileProg = a.currentTime / a.duration;
    setAudioProgress((currentFileRef.current + fileProg) / total);
    rafRef.current = requestAnimationFrame(updateProgress);
  }, [audioIndices]);

  const playFile = useCallback((fileIndex: number) => {
    if (!audioIndices || fileIndex >= audioIndices.length) { stopPlayback(); return; }
    currentFileRef.current = fileIndex;
    const a = new Audio(audioUrl(audioIndices[fileIndex]));
    audioRef.current = a;
    a.onended = () => playFile(fileIndex + 1);
    a.onerror = () => playFile(fileIndex + 1);
    a.play().catch(() => stopPlayback());
    rafRef.current = requestAnimationFrame(updateProgress);
  }, [audioIndices, audioUrl, stopPlayback, updateProgress]);

  const toggleAudio = useCallback(() => {
    if (playing) stopPlayback();
    else { setPlaying(true); playFile(0); }
  }, [playing, stopPlayback, playFile]);

  /* ── Progress ring for audio ── */
  const ringRadius = 13;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - audioProgress);

  const progress = totalCards > 1 ? (cardIndex / totalCards) : 0;

  const showingText = flipSide === 'text';

  /* ── FTUE inline tooltip ── */
  const FTUETooltip = ({ label, delay }: { label: string; delay: number }) => (
    <div
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: 6,
        pointerEvents: 'none',
        animation: reducedMotion
          ? 'none'
          : `ftue-tooltip-in 0.3s ease ${delay}ms both`,
        opacity: reducedMotion ? 1 : 0,
        zIndex: 20,
      }}
    >
      <div
        style={{
          background: 'rgba(26,26,46,0.95)',
          color: '#fff',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          padding: '4px 10px',
          borderRadius: 8,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
      {/* Caret */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '5px solid rgba(26,26,46,0.95)',
          margin: '0 auto',
        }}
      />
    </div>
  );

  const pulseKeyframes = `
    @keyframes ftue-pulse {
      0%   { box-shadow: 0 0 0 0 ${accentColor}66; }
      70%  { box-shadow: 0 0 0 8px ${accentColor}00; }
      100% { box-shadow: 0 0 0 0 ${accentColor}00; }
    }
    @keyframes ftue-tooltip-in {
      from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;

  return (
    <div style={{ flexShrink: 0, position: 'relative', zIndex: 5 }}>
      {showFTUE && <style>{pulseKeyframes}</style>}
      {/* ── Main bar ── */}
      <div
        onClick={showFTUE ? ftueMarkSeen : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 48,
          padding: '0 16px',
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        {/* Left: hamburger + progress counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={onMenuOpen}
            aria-label="Open navigation menu"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              color: 'var(--color-subtle)',
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              color: 'var(--color-subtle)',
            }}
          >
            <span style={{ color: accentColor, fontWeight: 700 }}>{cardIndex}</span>
            <span style={{ opacity: 0.4 }}> / {totalCards}</span>
          </span>
        </div>

        {/* Right: action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Read ↔ Try segmented control */}
          {hasFlip && (
            <div ref={toggleRef} style={{ position: 'relative' }}>
              {/* FTUE pulse ring */}
              {showFTUE && !reducedMotion && (
                <div
                  style={{
                    position: 'absolute',
                    inset: -3,
                    borderRadius: 11,
                    animation: 'ftue-pulse 1.2s ease-out 3',
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}
                />
              )}
              {/* FTUE tooltip */}
              {showFTUE && <FTUETooltip label="Tap to switch views" delay={0} />}
            <div
              role="tablist"
              aria-label="View mode"
              style={{
                position: 'relative',
                display: 'flex',
                borderRadius: 8,
                background: 'rgba(0,0,0,0.05)',
                padding: 2,
                height: 32,
              }}
            >
              {/* Sliding pill — highlights the ACTIVE tab */}
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  left: showingText ? 2 : '50%',
                  width: 'calc(50% - 2px)',
                  height: 28,
                  borderRadius: 6,
                  background: accentColor,
                  transition: reducedMotion ? 'none' : 'left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  zIndex: 0,
                }}
              />
              <button
                role="tab"
                aria-selected={showingText}
                onClick={() => { if (!showingText && onFlipToggle) onFlipToggle(); }}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  border: 'none',
                  background: 'none',
                  padding: '0 14px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: showingText ? '#fff' : 'var(--color-subtle)',
                  cursor: 'pointer',
                  transition: reducedMotion ? 'none' : 'color 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                Read
              </button>
              <button
                role="tab"
                aria-selected={!showingText}
                onClick={() => { if (showingText && onFlipToggle) onFlipToggle(); }}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  border: 'none',
                  background: 'none',
                  padding: '0 14px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: !showingText ? '#fff' : 'var(--color-subtle)',
                  cursor: 'pointer',
                  transition: reducedMotion ? 'none' : 'color 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                Try it
              </button>
            </div>
            </div>
          )}

          {/* Facts button */}
          {keyFact && (
            <div style={{ position: 'relative' }}>
              {showFTUE && <FTUETooltip label="Key facts" delay={200} />}
            <button
              ref={factsRef}
              onClick={() => setFactsOpen((o) => !o)}
              aria-label={factsOpen ? 'Hide key insight' : 'Show key insight'}
              aria-expanded={factsOpen}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: 'none',
                background: factsOpen ? `${accentColor}12` : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease',
                padding: 0,
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={factsOpen ? accentColor : 'var(--color-subtle)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.2s ease' }}>
                <path d="M9 18h6" />
                <path d="M10 22h4" />
                <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
              </svg>
            </button>
            </div>
          )}

          {/* Listen button (always rightmost) */}
          {hasAudio && (
            <div style={{ position: 'relative' }}>
              {showFTUE && <FTUETooltip label="Listen to this card" delay={400} />}
            <button
              ref={listenRef}
              onClick={toggleAudio}
              aria-label={playing ? 'Stop audio' : 'Listen'}
              style={{
                position: 'relative',
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: 'none',
                background: playing ? `${accentColor}12` : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease',
                padding: 0,
              }}
            >
              {/* Progress ring */}
              {playing && (
                <svg
                  width={36}
                  height={36}
                  style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
                >
                  <circle
                    cx={18}
                    cy={18}
                    r={ringRadius}
                    fill="none"
                    stroke={`${accentColor}20`}
                    strokeWidth={2}
                  />
                  <circle
                    cx={18}
                    cy={18}
                    r={ringRadius}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    style={{ transition: 'stroke-dashoffset 0.15s linear' }}
                  />
                </svg>
              )}
              {playing ? (
                <svg width={14} height={14} viewBox="0 0 24 24" fill={accentColor}>
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--color-subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Progress line ── */}
      <div
        style={{
          height: 2,
          background: 'rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: accentColor,
            borderRadius: '0 1px 1px 0',
            transition: reducedMotion ? 'none' : 'width 0.4s ease',
          }}
        />
      </div>

      {/* ── Facts panel ── */}
      {keyFact && (
        <div
          style={{
            maxHeight: factsOpen ? 200 : 0,
            overflow: 'hidden',
            transition: reducedMotion ? 'none' : 'max-height 0.35s ease',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              background: `${accentColor}08`,
              borderBottom: `1px solid ${accentColor}15`,
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              lineHeight: 1.6,
              color: 'var(--color-deep)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '0.7rem',
                color: accentColor,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 4,
              }}
            >
              Key insight
            </span>
            {keyFact}
          </div>
        </div>
      )}
    </div>
  );
}
