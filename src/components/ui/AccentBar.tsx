import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  color: string;
  className?: string;
}

export default function AccentBar({ color, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.style.width = '100%';
      return;
    }

    gsap.fromTo(
      el,
      { width: '0%' },
      {
        width: '100%',
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, []);

  return (
    <div className={`h-1 rounded-full overflow-hidden ${className}`}>
      <div
        ref={ref}
        className="h-full rounded-full"
        style={{ backgroundColor: color, width: '0%' }}
      />
    </div>
  );
}
