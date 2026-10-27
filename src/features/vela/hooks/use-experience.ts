'use client';

import { useEffect, useRef, useState } from 'react';
import { clamp, smooth, type VelaSignal } from '../lib/experience';

export function useExperience() {
  const signal = useRef<VelaSignal>({
    hero: 0,
    story: 0,
    world: 0,
    studio: 0,
    pointerX: 0,
    pointerY: 0,
  });
  const surface = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const [dark, setDark] = useState(false);
  const [inStudio, setInStudio] = useState(false);

  useEffect(() => {
    const journey = document.getElementById('vela-design');
    const world = document.getElementById('vela-world');
    const studio = document.getElementById('vela-studio');
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const h = window.innerHeight;
      const story = clamp(
        (y - (journey?.offsetTop ?? h)) /
          Math.max(1, (journey?.offsetHeight ?? h * 4) - h),
      );
      const space = clamp((y - (world?.offsetTop ?? h * 5) + h) / h);
      const lab = clamp(
        (y - (studio?.offsetTop ?? h * 6) + h * 0.8) / (h * 0.8),
      );
      signal.current.hero = clamp(y / h);
      signal.current.story = story;
      signal.current.world = space;
      signal.current.studio = lab;
      setChapter(story < 0.36 ? 0 : story < 0.69 ? 1 : 2);
      const immersion = smooth(0.72, 0.96, story) * (1 - lab);
      setDark(immersion > 0.7);
      setInStudio(lab > 0.65);
      if (surface.current) {
        surface.current.style.setProperty('--immersion', String(immersion));
        surface.current.style.setProperty(
          '--world-scale',
          String(1.16 - space * 0.16),
        );
        surface.current.style.setProperty(
          '--scene-opacity',
          String(1 - smooth(0.91, 0.99, story) * (1 - lab)),
        );
        surface.current.style.setProperty(
          '--page-progress',
          String(clamp(y / (document.documentElement.scrollHeight - h))),
        );
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      signal.current.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      signal.current.pointerY = 1 - (event.clientY / window.innerHeight) * 2;
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('pointermove', pointer, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pointermove', pointer);
    };
  }, []);
  return { signal, surface, chapter, dark, inStudio };
}
