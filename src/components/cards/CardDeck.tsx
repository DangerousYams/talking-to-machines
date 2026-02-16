import { useRef, useState, useEffect, useCallback, Children, cloneElement, isValidElement, type ReactNode, type ReactElement } from 'react';
import DotNav from './DotNav';
import NavDrawer from './NavDrawer';
import { trackPageView } from '../../lib/analytics';

interface CardDeckProps {
  children: ReactNode;
  accentColor: string;
  chapterSlug?: string;
}

interface CardChildProps {
  isActive?: boolean;
  cardIndex?: number;
  totalCards?: number;
  onMenuOpen?: () => void;
  'data-card-index'?: number;
}

export default function CardDeck({ children, accentColor, chapterSlug }: CardDeckProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const childArray = Children.toArray(children).filter(isValidElement);
  const total = childArray.length;

  // Track page view on mount
  useEffect(() => {
    if (chapterSlug) {
      trackPageView(window.location.pathname, 'cards', chapterSlug);
    }
  }, [chapterSlug]);

  // Set up IntersectionObserver to detect active card
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.cardIndex);
            if (!isNaN(index)) setActiveIndex(index);
          }
        }
      },
      {
        root: container,
        threshold: 0.5,
      },
    );

    // Observe all card wrappers
    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [total]);

  const scrollToCard = useCallback((index: number) => {
    const el = cardRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          height: '100dvh',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
        }}
      >
        {childArray.map((child, i) => (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            data-card-index={i}
            style={{
              height: '100dvh',
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
              position: 'relative',
              overflow: 'clip',
            }}
          >
            {cloneElement(child as ReactElement<CardChildProps>, {
              isActive: i === activeIndex,
              cardIndex: i + 1,
              totalCards: total,
              onMenuOpen: () => setMenuOpen(true),
              'data-card-index': i,
            })}
          </div>
        ))}
      </div>

      <DotNav
        total={total}
        activeIndex={activeIndex}
        accentColor={accentColor}
        onDotClick={scrollToCard}
      />

      <NavDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        accentColor={accentColor}
        currentChapterSlug={chapterSlug}
      />
    </>
  );
}
