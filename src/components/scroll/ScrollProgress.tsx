import { useEffect, useState } from 'react';

export default function ScrollProgress({ color = '#E94560' }: { color?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-50 bg-transparent">
      <div
        className="h-full transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%`, backgroundColor: color }}
      />
    </div>
  );
}
