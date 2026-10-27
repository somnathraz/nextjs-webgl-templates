'use client';
import { useEffect, useRef } from 'react';

export type NovaSignal = { progress: number; px: number; py: number };

/**
 * Tracks whole-document scroll progress (0..1) and normalized pointer
 * (-1..1) in a ref so the WebGL frame loop can read it without re-rendering
 * React. The canvas sits behind pointer-events:none content, so we listen on
 * the window rather than relying on R3F's in-canvas pointer.
 */
export function useNovaSignal() {
  const signal = useRef<NovaSignal>({ progress: 0, px: 0, py: 0 });
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
