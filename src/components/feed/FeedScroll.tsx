import React, { useRef, useEffect, useCallback, type ReactNode } from 'react';

interface FeedScrollProps {
  children: ReactNode[];
  onActiveChange?: (index: number) => void;
  activeIndex: number;
}

/**
 * Desktop layout: Centered scrollable column with card styling.
 * No snap scroll — standard scroll with 24px card gap.
 */
export default function FeedScroll({ children, onActiveChange, activeIndex }: FeedScrollProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const total = children.length;

  // IntersectionObserver to detect which card is most visible
  useEffect(() => {
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
      { threshold: 0.3 },
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [total, onActiveChange]);

  return (
    <div style={{
      maxWidth: 640,
      margin: '0 auto',
      padding: '24px 16px 120px',
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
    }}>
      {children.map((child, i) => (
        <div
          key={i}
          ref={(el) => { cardRefs.current[i] = el; }}
          data-card-index={i}
          style={{
            borderRadius: 16,
            border: '1px solid rgba(26, 26, 46, 0.06)',
            background: '#FFFFFF',
            boxShadow: '0 2px 12px rgba(26, 26, 46, 0.04)',
            overflow: 'hidden',
            minHeight: 400,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
