'use client';
import { useEffect, useRef } from 'react';

export type SceneSignal = { progress: number; px: number; py: number };

/**
 * Whole-document scroll progress (0..1) plus normalized pointer (-1..1),
 * written to a ref so the WebGL frame loop reads it without re-rendering React.
 */
export function useSceneSignal() {
  const signal = useRef<SceneSignal>({ progress: 0, px: 0, py: 0 });
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
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    readScroll();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);
  return signal;
}
