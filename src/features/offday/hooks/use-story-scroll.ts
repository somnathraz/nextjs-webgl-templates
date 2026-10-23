'use client';
import { useEffect, useRef, useState } from 'react';
export function useStoryScroll() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [chapter, setChapter] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!section.current) return;
        const { top, height } = section.current.getBoundingClientRect();
        progress.current = Math.max(
          0,
          Math.min(1, -top / Math.max(1, height - window.innerHeight)),
        );
        setChapter(Math.min(2, Math.floor(progress.current * 3)));
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return { section, progress, chapter };
}
