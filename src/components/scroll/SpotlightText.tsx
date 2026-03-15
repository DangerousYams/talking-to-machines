import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  text: string;
  className?: string;
  /** Whether to render as a drop-cap paragraph */
  dropCap?: boolean;
}

/**
 * SpotlightText — scroll-linked reading spotlight.
 * Highlights the current sentence at full opacity, dims the rest to 20%.
 * Uses GSAP ScrollTrigger with scrub for smooth scroll-linked animation.
 */
export default function SpotlightText({ text, className = '', dropCap = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      // Show all sentences at full opacity
      el.querySelectorAll<HTMLSpanElement>('[data-sentence-index]').forEach((span) => {
        span.style.opacity = '1';
      });
      return;
    }

    const sentences = el.querySelectorAll<HTMLSpanElement>('[data-sentence-index]');
    if (sentences.length === 0) return;

    // Start all sentences dimmed
    gsap.set(sentences, { opacity: 0.2 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 60%',
        end: 'bottom 40%',
        scrub: true,
      },
    });

    const step = 1 / sentences.length;

    sentences.forEach((sentence, i) => {
      const pos = i * step;
      // Fade in
      tl.to(sentence, { opacity: 1, duration: step * 0.3, ease: 'none' }, pos);
      // Keep bright for the middle portion
      // Fade out (except last sentence — stays bright)
      if (i < sentences.length - 1) {
        tl.to(sentence, { opacity: 0.2, duration: step * 0.3, ease: 'none' }, pos + step * 0.7);
      }
    });

    timelineRef.current = tl;

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [text]);

  // Split text into sentences, handling abbreviations
  const sentences = splitSentences(text);

  return (
    <div ref={containerRef} className={className}>
      <p className={`text-lg leading-[1.85]${dropCap ? ' drop-cap' : ''}`} style={{ margin: 0 }}>
        {sentences.map((sentence, i) => (
          <span key={i} data-sentence-index={i} style={{ transition: 'opacity 0.1s ease' }}>
            {sentence}
          </span>
        ))}
      </p>
    </div>
  );
}

/**
 * Split text into sentences. Handles common abbreviations (Mr., Dr., U.S., etc.)
 * and avoids splitting on them.
 */
function splitSentences(text: string): string[] {
  // Common abbreviations that shouldn't trigger a split
  const abbrevs = /(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|i\.e|e\.g|U\.S|U\.K|Inc|Ltd|Co|St|Ave|Blvd|Fig|Vol|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\./gi;

  // Temporarily replace abbreviation periods
  let temp = text;
  const replacements: string[] = [];
  temp = temp.replace(abbrevs, (match) => {
    replacements.push(match);
    return `__ABBREV${replacements.length - 1}__`;
  });

  // Split on sentence boundaries: period, question mark, exclamation mark followed by space or end
  const parts = temp.split(/(?<=[.!?])\s+/);

  // Restore abbreviations and trim
  return parts
    .map((part) =>
      part.replace(/__ABBREV(\d+)__/g, (_, idx) => replacements[parseInt(idx)])
    )
    .filter((s) => s.trim().length > 0)
    .map((s, i, arr) => (i < arr.length - 1 ? s + ' ' : s));
}
