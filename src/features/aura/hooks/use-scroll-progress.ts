'use client';
import { useEffect, useRef, useState } from 'react';
import { storyStep } from '@/features/aura/lib/story';
/** A mutable progress value keeps scroll updates outside React's render loop. */
export function useScrollProgress() {
  const element = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [step, setStep] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!element.current) return;
        const rect = element.current.getBoundingClientRect();
        progress.current = Math.max(
          0,
          Math.min(
            1,
            -rect.top / Math.max(1, rect.height - window.innerHeight),
          ),
        );
        setStep(storyStep(progress.current));
      });
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
  return { element, progress, step };
}
