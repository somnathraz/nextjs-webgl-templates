'use client';
import { useEffect, useRef, useState } from 'react';
export function useArchitectureScroll() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [chapter, setChapter] = useState(0);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (!section.current) return;
      const r = section.current.getBoundingClientRect();
      progress.current = Math.max(
        0,
        Math.min(1, -r.top / Math.max(1, r.height - innerHeight)),
      );
      setChapter(Math.min(2, Math.floor(progress.current * 3)));
    };
    const update = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return { section, progress, chapter };
}
