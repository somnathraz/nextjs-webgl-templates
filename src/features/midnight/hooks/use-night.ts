'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { chapterAt, clamp, clockAt } from '../lib/time';

export type NightSignal = {
  /** Scroll coordinate: 0 street level, 2 countdown starts, 3 midnight, 4 end. */
  t: number;
  pointerX: number;
  pointerY: number;
  reduced: boolean;
  /** Fireworks the visitor asked for, as NDC points. The scene drains this. */
  launches: [number, number][];
};

type Readouts = {
  clock: HTMLElement | null;
  progress: HTMLElement | null;
};

/**
 * One scroll listener for the page. Section offsets become a scroll
 * coordinate, the clock is written straight to the DOM, and the WebGL scene
 * reads the same ref every frame.
 */
export function useNight(reduced: boolean) {
  const signal = useRef<NightSignal>({
    t: 0,
    pointerX: 0,
    pointerY: 0,
    reduced,
    launches: [],
  });
  const readouts = useRef<Readouts>({ clock: null, progress: null });
  const [chapter, setChapter] = useState(0);

  useEffect(() => {
    signal.current.reduced = reduced;
  }, [reduced]);

  useEffect(() => {
    const find = (name: string) =>
      document.querySelector<HTMLElement>(`[data-night="${name}"]`);
    let anchors: [number, number][] = [];
    let frame = 0;

    const measure = () => {
      const h = window.innerHeight;
      const edge = (name: string, bottom = false) => {
        const rect = find(name)?.getBoundingClientRect();
        if (!rect) return 0;
        return (bottom ? rect.bottom - h : rect.top) + window.scrollY;
      };
      anchors = [
        [0, 0],
        [edge('lookback'), 0.1],
        [edge('letgo'), 1.1],
        [edge('countdown'), 2],
        [edge('countdown', true), 3],
        [edge('midnight', true), 4],
      ];
    };

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      let t = 4;
      for (let i = 1; i < anchors.length; i++) {
        if (y <= anchors[i][0]) {
          const [y0, t0] = anchors[i - 1];
          const [y1, t1] = anchors[i];
          t = t0 + (t1 - t0) * clamp((y - y0) / Math.max(1, y1 - y0));
          break;
        }
      }
      signal.current.t = t;
      const refs = readouts.current;
      if (refs.clock) refs.clock.textContent = clockAt(t);
      if (refs.progress)
        refs.progress.style.transform = `scaleX(${clamp(t / 3)})`;
      setChapter(chapterAt(t));
    };

    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = () => {
      measure();
      queue();
    };
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      signal.current.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      signal.current.pointerY = 1 - (event.clientY / window.innerHeight) * 2;
    };
    // Click empty sky to send a firework up at that point.
    const click = (event: MouseEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest('a, button, input, [data-no-launch]')
      )
        return;
      signal.current.launches.push([
        (event.clientX / window.innerWidth) * 2 - 1,
        1 - (event.clientY / window.innerHeight) * 2,
      ]);
    };

    measure();
    update();
    const observer = new ResizeObserver(resize);
    observer.observe(document.body);
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', pointer, { passive: true });
    window.addEventListener('click', click);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', pointer);
      window.removeEventListener('click', click);
    };
  }, []);

  /** Ref callback factory: hands a readout element to the scroll loop. */
  const bind = useCallback(
    (key: keyof Readouts) => (element: HTMLElement | null) => {
      readouts.current[key] = element;
    },
    [],
  );

  /** Ask the scene for a firework at a screen position (pixels). */
  const launch = useCallback((clientX: number, clientY: number) => {
    signal.current.launches.push([
      (clientX / window.innerWidth) * 2 - 1,
      1 - (clientY / window.innerHeight) * 2,
    ]);
  }, []);

  return { signal, bind, chapter, launch };
}
