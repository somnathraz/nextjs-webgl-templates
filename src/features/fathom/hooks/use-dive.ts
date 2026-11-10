'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ZONES,
  clamp,
  depthAt,
  lightAt,
  pressureAt,
  temperatureAt,
} from '../lib/zones';

export type DiveSignal = {
  /** Zone coordinate: 0 at the surface, 5 on the trench floor. */
  t: number;
  depth: number;
  /** Scroll speed in px/ms, signed. */
  velocity: number;
  pointerX: number;
  pointerY: number;
  reduced: boolean;
};

export type HudRefs = {
  depth: HTMLElement | null;
  pressure: HTMLElement | null;
  temperature: HTMLElement | null;
  light: HTMLElement | null;
  marker: HTMLElement | null;
  finale: HTMLElement | null;
};

const number = new Intl.NumberFormat('en-US');

/**
 * One scroll listener for the whole page. Maps scroll position to a zone
 * coordinate using the real section offsets, writes the HUD straight to the
 * DOM, and exposes a ref the WebGL scene reads every frame.
 */
export function useDive(reduced: boolean, onDepth?: (t: number) => void) {
  const signal = useRef<DiveSignal>({
    t: 0,
    depth: 0,
    velocity: 0,
    pointerX: 0,
    pointerY: 0,
    reduced,
  });
  const hud = useRef<HudRefs>({
    depth: null,
    pressure: null,
    temperature: null,
    light: null,
    marker: null,
    finale: null,
  });
  const listener = useRef(onDepth);
  const [zone, setZone] = useState(0);

  useEffect(() => {
    listener.current = onDepth;
  }, [onDepth]);

  useEffect(() => {
    signal.current.reduced = reduced;
  }, [reduced]);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-fathom-zone]'),
    );
    let anchors: [number, number][] = [];
    let frame = 0;
    let lastY = window.scrollY;
    let lastTime = performance.now();

    const measure = () => {
      // The dive ends when the last zone ends, not when the footer does.
      const last = sections[sections.length - 1];
      const max = last
        ? last.getBoundingClientRect().bottom +
          window.scrollY -
          window.innerHeight
        : document.documentElement.scrollHeight - window.innerHeight;
      anchors = [[0, 0]];
      sections.forEach((section, i) => {
        const top = section.getBoundingClientRect().top + window.scrollY;
        anchors.push([top, i + 0.1]);
      });
      anchors.push([Math.max(max, 1), ZONES.length]);
    };

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const now = performance.now();
      let t = ZONES.length;
      for (let i = 1; i < anchors.length; i++) {
        if (y <= anchors[i][0]) {
          const [y0, t0] = anchors[i - 1];
          const [y1, t1] = anchors[i];
          t = t0 + (t1 - t0) * clamp((y - y0) / Math.max(1, y1 - y0));
          break;
        }
      }
      const depth = depthAt(t);
      const state = signal.current;
      state.t = t;
      state.depth = depth;
      state.velocity = clamp((y - lastY) / Math.max(16, now - lastTime), -4, 4);
      lastY = y;
      lastTime = now;

      const refs = hud.current;
      if (refs.depth)
        refs.depth.textContent = String(Math.round(depth)).padStart(5, '0');
      if (refs.finale)
        refs.finale.textContent = number.format(Math.round(depth));
      if (refs.pressure)
        refs.pressure.textContent = number.format(
          Math.round(pressureAt(depth)),
        );
      if (refs.temperature)
        refs.temperature.textContent = temperatureAt(depth).toFixed(1);
      if (refs.light) {
        const light = lightAt(depth);
        refs.light.textContent =
          light >= 1 ? light.toFixed(0) : light > 0.01 ? light.toFixed(2) : '0';
      }
      if (refs.marker)
        refs.marker.style.transform = `translateY(${(t / ZONES.length) * 100}%)`;
      setZone(Math.min(ZONES.length - 1, Math.floor(t)));
      listener.current?.(t);
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

    measure();
    update();
    const observer = new ResizeObserver(resize);
    observer.observe(document.body);
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', pointer, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', pointer);
    };
  }, []);

  /** Ref callback factory: hands a readout element to the scroll loop. */
  const bind = useCallback(
    (key: keyof HudRefs) => (element: HTMLElement | null) => {
      hud.current[key] = element;
    },
    [],
  );

  return { signal, bind, zone };
}
