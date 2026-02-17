import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';

interface ExpandableProps {
  children: React.ReactNode;
  maxLines?: number;
  accentColor?: string;
  showMoreText?: string;
  showLessText?: string;
  forceExpanded?: boolean;
}

export default function Expandable({
  children,
  maxLines = 3,
  accentColor = 'var(--color-subtle)',
  showMoreText = 'Show more',
  showLessText = 'Show less',
  forceExpanded = false,
}: ExpandableProps) {
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const isOpen = expanded || forceExpanded;

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    // Compare scrollHeight (full content) vs clientHeight (clamped)
    setNeedsTruncation(el.scrollHeight > el.clientHeight + 1);
  }, [children, maxLines]);

  // Re-check when forceExpanded changes back to false
  useEffect(() => {
    if (!forceExpanded && !expanded) {
      const el = contentRef.current;
      if (!el) return;
      // Defer to let clamp re-apply
      requestAnimationFrame(() => {
        setNeedsTruncation(el.scrollHeight > el.clientHeight + 1);
      });
    }
  }, [forceExpanded, expanded]);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div>
      <div
        ref={contentRef}
        style={{
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical' as any,
          WebkitLineClamp: isOpen ? 'unset' : maxLines,
          overflow: isOpen ? 'visible' : 'hidden',
          transition: reducedMotion ? 'none' : 'max-height 0.2s ease',
        }}
      >
        {children}
      </div>
      {(needsTruncation || isOpen) && !forceExpanded && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              setExpanded((v) => !v);
            }
          }}
          style={{
            display: 'inline-block',
            marginTop: 4,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            color: accentColor,
            cursor: 'pointer',
            userSelect: 'none',
            letterSpacing: '0.02em',
          }}
        >
          {isOpen ? `▾ ${showLessText}` : `▸ ${showMoreText}`}
        </span>
      )}
    </div>
  );
}
