import { useState, useEffect, useCallback, useRef } from 'react';
import type { Beat } from '../../data/chapters';

interface Props {
  beats: Beat[];
  accentColor: string;
  chapterSlug: string;
}

const STORAGE_PREFIX = 'ttm_beat_';

function getCompletedBeats(chapterSlug: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${chapterSlug}`);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveCompletedBeats(chapterSlug: string, completed: Set<string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_PREFIX}${chapterSlug}`, JSON.stringify([...completed]));
}

export default function BeatProgress({ beats, accentColor, chapterSlug }: Props) {
  // Start with empty set to match SSR, then hydrate from localStorage in useEffect
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [currentBeat, setCurrentBeat] = useState(0);
  const [showToast, setShowToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Hydrate completed beats from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const saved = getCompletedBeats(chapterSlug);
    if (saved.size > 0) setCompleted(saved);
  }, [chapterSlug]);

  // Track which beat the user is currently in via scroll position
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const beatId = entry.target.getAttribute('data-beat-id');
            const idx = beats.findIndex((b) => b.id === beatId);
            if (idx >= 0) setCurrentBeat(idx);
          }
        }
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );

    // Observe all beat sections
    beats.forEach((beat) => {
      const el = document.getElementById(`beat-${beat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [beats]);

  // Mark beat complete when user scrolls past it
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Trigger when the END marker enters the viewport
          if (entry.isIntersecting) {
            const beatId = entry.target.getAttribute('data-beat-end');
            if (beatId && !completed.has(beatId)) {
              setCompleted((prev) => {
                const next = new Set(prev);
                next.add(beatId);
                saveCompletedBeats(chapterSlug, next);
                return next;
              });
              // Show toast
              const beat = beats.find((b) => b.id === beatId);
              if (beat) {
                setShowToast(beat.title);
                if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                toastTimerRef.current = window.setTimeout(() => setShowToast(null), 2500);
              }
            }
          }
        }
      },
      { threshold: 0.5 }
    );

    beats.forEach((beat) => {
      const el = document.querySelector(`[data-beat-end="${beat.id}"]`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [beats, chapterSlug, completed]);

  const completedCount = completed.size;
  const totalBeats = beats.length;
  const progress = totalBeats > 0 ? completedCount / totalBeats : 0;

  // SVG ring dimensions
  const size = 36;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <>
      {/* Progress ring */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(26, 26, 46, 0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <span style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.55rem',
          fontWeight: 700,
          color: completedCount === totalBeats ? accentColor : '#6B7280',
          width: size,
        }}>
          {completedCount}/{totalBeats}
        </span>
      </div>

      {/* Completion toast */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 60,
          background: '#FFFFFF',
          border: `1px solid ${accentColor}30`,
          borderRadius: 12,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 8px 32px rgba(26, 26, 46, 0.12)',
          animation: 'beatToastIn 0.4s ease',
        }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}>
            &#10003;
          </div>
          <div>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: accentColor,
              margin: 0,
            }}>
              Checkpoint reached
            </p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              color: '#1A1A2E',
              margin: 0,
            }}>
              {showToast}
            </p>
          </div>
        </div>
      )}

      {/* Toast animation keyframes */}
      <style>{`
        @keyframes beatToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}
