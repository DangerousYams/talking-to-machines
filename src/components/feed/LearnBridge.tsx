import React from 'react';
import { chapters } from '../../data/chapters';

interface LearnBridgeProps {
  chapterNumber?: number;
}

export default function LearnBridge({ chapterNumber }: LearnBridgeProps) {
  if (!chapterNumber) return null;

  const chapter = chapters.find((c) => c.number === chapterNumber);
  if (!chapter) return null;

  return (
    <a
      href={`/${chapter.slug}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 10,
        border: `1px solid ${chapter.accent}25`,
        background: `${chapter.accent}08`,
        textDecoration: 'none',
        transition: 'all 0.2s',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        color: chapter.accent,
        textTransform: 'uppercase',
      }}>
        Go deeper
      </span>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.8rem',
        color: 'var(--color-deep)',
        fontWeight: 500,
      }}>
        Ch {chapter.number}: {chapter.title}
      </span>
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke={chapter.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 7h10M8 3l4 4-4 4" />
      </svg>
    </a>
  );
}
