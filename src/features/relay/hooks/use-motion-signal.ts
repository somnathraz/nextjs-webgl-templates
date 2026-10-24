'use client';
import { useEffect, useRef } from 'react';
export function useMotionSignal() {
  const signal = useRef({ scroll: 0, velocity: 0 });
  useEffect(() => {
    let frame = 0;
    let last = scrollY;
    let time = performance.now();
    const update = () => {
      frame = 0;
      const now = performance.now();
      signal.current = {
        scroll: scrollY / Math.max(1, innerHeight),
        velocity: Math.max(
          -3,
          Math.min(3, (scrollY - last) / Math.max(16, now - time)),
        ),
      };
      last = scrollY;
      time = now;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
    };
  }, []);
  return signal;
}
