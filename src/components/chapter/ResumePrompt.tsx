import { useState, useEffect } from 'react';
import type { Beat } from '../../data/chapters';

interface Props {
  beats: Beat[];
  chapterSlug: string;
  accentColor: string;
}

const STORAGE_PREFIX = 'ttm_beat_';

export default function ResumePrompt({ beats, chapterSlug, accentColor }: Props) {
  const [resumeBeat, setResumeBeat] = useState<Beat | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${chapterSlug}`);
      if (!raw) return;
      const completedIds: string[] = JSON.parse(raw);
      if (completedIds.length === 0 || completedIds.length >= beats.length) return;

      // Find first uncompleted beat
      const completedSet = new Set(completedIds);
      const nextBeat = beats.find((b) => !completedSet.has(b.id));
      if (nextBeat) setResumeBeat(nextBeat);
    } catch { /* ignore */ }
  }, [beats, chapterSlug]);

  if (!resumeBeat || dismissed) return null;

  const handleResume = () => {
    const el = document.getElementById(`beat-${resumeBeat.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setDismissed(true);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 55,
      background: '#FFFFFF',
      border: `1px solid ${accentColor}25`,
      borderRadius: 14,
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      boxShadow: '0 8px 40px rgba(26, 26, 46, 0.15)',
      maxWidth: '90vw',
      animation: 'resumeSlideUp 0.5s ease',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          color: '#6B7280',
          margin: '0 0 2px',
        }}>
          Pick up where you left off
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: '#1A1A2E',
          margin: 0,
        }}>
          {resumeBeat.title}
        </p>
      </div>

      <button
        onClick={handleResume}
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          border: 'none',
          background: accentColor,
          color: '#FFFFFF',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          fontWeight: 700,
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        Resume
      </button>

      <button
        onClick={() => setDismissed(true)}
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(26, 26, 46, 0.06)',
          color: '#6B7280',
          fontSize: '0.7rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        &#10005;
      </button>

      <style>{`
        @keyframes resumeSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
