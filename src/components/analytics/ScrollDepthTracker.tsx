import { useEffect, useRef, useCallback } from 'react';
import { upsertScrollDepth } from '../../lib/analytics';

interface Props {
  chapterSlug: string;
  variant: 'scroll' | 'cards';
  /** Total sections. For cards, pass the card count. For scroll, auto-detected from DOM or uses 10 buckets. */
  totalSections?: number;
}

const FLUSH_INTERVAL_MS = 5000;
const SCROLL_BUCKETS = 10; // 0%, 10%, 20%, ... 100%

/**
 * Tracks how far a user gets through a chapter.
 *
 * Scroll pages: observes [data-beat-id] elements if present,
 *   otherwise tracks scroll percentage in 10% buckets.
 * Cards pages: listens for 'card-progress' CustomEvents from CardDeck.
 */
export default function ScrollDepthTracker({ chapterSlug, variant, totalSections }: Props) {
  const maxIndexRef = useRef(0);
  const maxSectionIdRef = useRef<string | null>(null);
  const totalRef = useRef(totalSections ?? 1);
  const startTimeRef = useRef(Date.now());
  const flushTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastFlushedRef = useRef(0);

  const flush = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const total = totalRef.current;
    const pct = total > 0
      ? Math.round(((maxIndexRef.current + 1) / total) * 100)
      : 0;

    upsertScrollDepth({
      chapterSlug,
      variant,
      maxSectionIndex: maxIndexRef.current,
      maxSectionId: maxSectionIdRef.current,
      totalSections: total,
      percentComplete: Math.min(100, pct),
      timeOnPageMs: elapsed,
      reachedEnd: maxIndexRef.current >= total - 1,
    });
    lastFlushedRef.current = Date.now();
  }, [chapterSlug, variant]);

  const scheduleFlush = useCallback(() => {
    const sinceLastFlush = Date.now() - lastFlushedRef.current;
    if (sinceLastFlush >= FLUSH_INTERVAL_MS) {
      flush();
    } else {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = setTimeout(flush, FLUSH_INTERVAL_MS - sinceLastFlush);
    }
  }, [flush]);

  const recordProgress = useCallback((index: number, sectionId: string | null) => {
    if (index > maxIndexRef.current) {
      maxIndexRef.current = index;
      maxSectionIdRef.current = sectionId;
      scheduleFlush();
    }
  }, [scheduleFlush]);

  // Main tracking effect
  useEffect(() => {
    startTimeRef.current = Date.now();
    maxIndexRef.current = 0;
    maxSectionIdRef.current = null;

    if (variant === 'cards') {
      const handler = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail && typeof detail.index === 'number') {
          recordProgress(detail.index, detail.cardId || null);
        }
      };
      window.addEventListener('card-progress', handler);
      return () => {
        window.removeEventListener('card-progress', handler);
        flush();
        clearTimeout(flushTimerRef.current);
      };
    }

    // variant === 'scroll'
    const beats = document.querySelectorAll('[data-beat-id]');

    if (beats.length > 0) {
      // Structured beats — observe each one
      totalRef.current = totalSections ?? beats.length;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              const beatId = el.dataset.beatId || null;
              const idx = Array.from(beats).indexOf(el);
              if (idx >= 0) recordProgress(idx, beatId);
            }
          }
        },
        { threshold: 0.3 },
      );

      beats.forEach((b) => observer.observe(b));
      return () => {
        observer.disconnect();
        flush();
        clearTimeout(flushTimerRef.current);
      };
    }

    // No structured beats — track scroll percentage in buckets
    totalRef.current = SCROLL_BUCKETS;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = scrollTop / docHeight; // 0-1
      const bucketIndex = Math.min(SCROLL_BUCKETS - 1, Math.floor(pct * SCROLL_BUCKETS));
      const label = `${Math.round(pct * 100)}%`;
      recordProgress(bucketIndex, label);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      flush();
      clearTimeout(flushTimerRef.current);
    };
  }, [chapterSlug, variant, totalSections, recordProgress, flush]);

  // Flush on page hide (tab switch / navigate away)
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [flush]);

  return null;
}
