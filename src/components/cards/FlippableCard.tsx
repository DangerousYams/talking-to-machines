import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';
import CardActionBar from './CardActionBar';

interface FlippableCardProps {
  widgetContent: ReactNode;
  textContent: ReactNode;
  defaultSide?: 'widget' | 'text';
  accentColor?: string;
  isActive?: boolean;
  cardIndex?: number;
  totalCards?: number;
  onMenuOpen?: () => void;
  chapterSlug?: string;
  audioIndices?: number[];
  keyFact?: ReactNode;
  isFirstFlippable?: boolean;
}

function FlippableCard({
  widgetContent,
  textContent,
  defaultSide = 'widget',
  accentColor = '#E94560',
  isActive = false,
  cardIndex = 1,
  totalCards = 1,
  onMenuOpen,
  chapterSlug,
  audioIndices,
  keyFact,
  isFirstFlippable,
}: FlippableCardProps) {
  const [side, setSide] = useState<'widget' | 'text'>(defaultSide);
  const [barHeight, setBarHeight] = useState(50);
  const barRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const showingWidget = side === 'widget';

  const flip = useCallback(() => {
    setSide((s) => (s === 'widget' ? 'text' : 'widget'));
  }, []);

  // Track action bar height (changes when facts panel opens/closes)
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setBarHeight(entry.contentRect.height);
      }
    });
    ro.observe(el);
    setBarHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      role="region"
      aria-label={showingWidget ? 'Interactive widget' : 'Explanation'}
      style={{ position: 'absolute', inset: 0, background: 'var(--color-cream)' }}
    >
      {/* ── Action bar — pinned at top ── */}
      <div ref={barRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5 }}>
        <CardActionBar
          cardIndex={cardIndex}
          totalCards={totalCards}
          accentColor={accentColor}
          onMenuOpen={onMenuOpen}
          chapterSlug={chapterSlug}
          audioIndices={audioIndices}
          isActive={isActive}
          hasFlip
          flipSide={side}
          onFlipToggle={flip}
          keyFact={keyFact}
          isFirstFlippable={isFirstFlippable}
        />
      </div>

      {/* Widget face */}
      <div
        style={{
          position: 'absolute',
          top: barHeight,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: showingWidget ? 1 : 0,
          transform: showingWidget ? 'scale(1)' : 'scale(0.98)',
          transition: reducedMotion
            ? 'none'
            : 'opacity 0.4s ease, transform 0.4s ease, top 0.35s ease',
          pointerEvents: showingWidget ? 'auto' : 'none',
          overflowY: 'auto',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: isMobile ? '12px 12px 24px' : '24px 24px 32px',
        }}
        aria-hidden={!showingWidget}
      >
        <div style={{ maxWidth: 900, width: '100%' }}>
          {widgetContent}
        </div>
      </div>

      {/* Text face */}
      <div
        style={{
          position: 'absolute',
          top: barHeight,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: showingWidget ? 0 : 1,
          transform: showingWidget ? 'scale(0.98)' : 'scale(1)',
          transition: reducedMotion
            ? 'none'
            : 'opacity 0.4s ease, transform 0.4s ease, top 0.35s ease',
          pointerEvents: showingWidget ? 'none' : 'auto',
          overflowY: 'auto',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: isMobile ? '20px 20px 24px' : '32px 32px 32px',
        }}
        aria-hidden={showingWidget}
      >
        <div
          style={{
            maxWidth: 560,
            width: '100%',
            fontFamily: 'var(--font-body)',
            fontSize: isMobile ? '0.85rem' : '1.05rem',
            lineHeight: isMobile ? 1.6 : 1.75,
            color: 'var(--color-deep)',
          }}
        >
          {textContent}
        </div>
      </div>

      {/* SR-only live region */}
      <div aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
        {showingWidget ? 'Showing interactive widget' : 'Showing explanation text'}
      </div>
    </div>
  );
}

FlippableCard.displayName = 'FlippableCard';
export default FlippableCard;
