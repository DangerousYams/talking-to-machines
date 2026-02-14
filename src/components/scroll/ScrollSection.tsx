import { useRef, useEffect, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  children: ReactNode;
  className?: string;
  onEnter?: () => void;
  onLeave?: () => void;
}

export default function ScrollSection({ children, className = '', onEnter, onLeave }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter,
      onLeave,
      onEnterBack: onEnter,
      onLeaveBack: onLeave,
    });

    return () => trigger.kill();
  }, [onEnter, onLeave]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
