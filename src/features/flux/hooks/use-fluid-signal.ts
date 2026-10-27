'use client';
import { useEffect, useRef } from 'react';

export type FluidSignal = {
  progress: number;
  /** pointer position in screen uv (0..1, y up) */
  px: number;
  py: number;
  /** timestamp of the last pointer move */
  moved: number;
};

/**
 * Pointer position in uv space (y up) plus scroll progress, written to a ref
 * for the fluid solver to read each frame. The solver derives movement deltas
 * itself, so this hook never has to be mutated from the render loop.
 */
export function useFluidSignal() {
  const signal = useRef<FluidSignal>({
    progress: 0,
    px: 0.5,
    py: 0.5,
    moved: -1e9,
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
      signal.current.px = e.clientX / window.innerWidth;
      signal.current.py = 1 - e.clientY / window.innerHeight;
      signal.current.moved = performance.now();
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
