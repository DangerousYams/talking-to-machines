import React, { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';

interface FeedCardDeckProps {
  children: ReactNode[];
  onActiveChange?: (index: number) => void;
  activeIndex: number;
}

/**
 * Mobile layout: Full-viewport card deck with scroll-snap.
 * Adapts the CardDeck pattern (100dvh snap scroll, IntersectionObserver) for infinite feed.
 */
export default function FeedCardDeck({ children, onActiveChange, activeIndex }: FeedCardDeckProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const total = children.length;

  // IntersectionObserver to detect active card
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.cardIndex);
            if (!isNaN(index)) {
              onActiveChange?.(index);
            }
          }
        }
      },
      { root: container, threshold: 0.5 },
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [total, onActiveChange]);

  return (
    <div
      ref={containerRef}
      className="card-deck-container"
      style={{ background: 'var(--color-cream)' }}
    >
      {children.map((child, i) => (
        <div
          key={i}
          ref={(el) => { cardRefs.current[i] = el; }}
          data-card-index={i}
          className="card-deck-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
