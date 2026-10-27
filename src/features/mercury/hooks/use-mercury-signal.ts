'use client';
import { useEffect, useRef } from 'react';

export type MercurySignal = {
  progress: number; // whole-page scroll 0..1
  px: number; // pointer x -1..1
  py: number; // pointer y -1..1
  active: number; // pointer presence 0..1 (eased in the frame loop)
};

/**
 * Scroll progress + normalized pointer + pointer speed, written to a ref so
 * the WebGL loop can read it every frame without re-rendering React.
 */
export function useMercurySignal() {
  const signal = useRef<MercurySignal>({
    progress: 0,
    px: 0,
    py: 0,
    active: 0,
  });

  useEffect(() => {
    let frame = 0;

    const readScroll = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      signal.current.progress =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(readScroll);
    };
    const onMove = (e: PointerEvent) => {
      signal.current.px = (e.clientX / window.innerWidth) * 2 - 1;
      signal.current.py = -((e.clientY / window.innerHeight) * 2 - 1);
      signal.current.active = 1;
    };
    const onLeave = () => {
      signal.current.active = 0;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerout', onLeave);
    readScroll();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerout', onLeave);
    };
  }, []);

  return signal;
}
