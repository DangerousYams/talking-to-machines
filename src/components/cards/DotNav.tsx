import { useCallback } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface DotNavProps {
  total: number;
  activeIndex: number;
  accentColor: string;
  onDotClick: (index: number) => void;
}

export default function DotNav({ total, activeIndex, accentColor, onDotClick }: DotNavProps) {
  const isMobile = useIsMobile();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onDotClick(index);
      } else if (e.key === 'ArrowUp' && index > 0) {
        e.preventDefault();
        onDotClick(index - 1);
      } else if (e.key === 'ArrowDown' && index < total - 1) {
        e.preventDefault();
        onDotClick(index + 1);
      }
    },
    [onDotClick, total],
  );

  return (
    <nav
      role="navigation"
      aria-label="Card navigation"
      style={{
        position: 'fixed',
        ...(isMobile
          ? {
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              flexDirection: 'row' as const,
            }
          : {
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              flexDirection: 'column' as const,
            }),
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 8 : 10,
      }}
    >
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={i}
            tabIndex={0}
            aria-label={`Go to card ${i + 1}`}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => onDotClick(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            style={{
              width: isActive ? 8 : 6,
              height: isActive ? 8 : 6,
              borderRadius: '50%',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              background: isActive ? accentColor : 'rgba(107, 114, 128, 0.35)',
              boxShadow: isActive ? `0 0 0 3px ${accentColor}30` : 'none',
              transition: 'all 0.3s ease',
              outline: 'none',
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 44,
                height: 44,
                borderRadius: '50%',
              }}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </nav>
  );
}
