'use client';

import { useEffect, useRef, useState } from 'react';
import { clamp, type HeliosSignal } from '../lib/choreography';

export function useChoreography() {
  const signal = useRef<HeliosSignal>({
    scroll: 0,
    story: 0,
    instrument: 0,
    pointerX: 0,
    pointerY: 0,
    velocity: 0,
    burst: -10000,
    burstStrength: 0.5,
    chargeStart: 0,
    rotationX: 0,
    rotationY: 0,
  });
  const [chapter, setChapter] = useState(0);
  const [inInstrument, setInInstrument] = useState(false);
  const progress = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const story = document.getElementById('helios-journey');
    const instrument = document.getElementById('helios-instrument');
    let frame = 0;
    let lastY = window.scrollY;
    let lastTime = performance.now();
    const update = () => {
      frame = 0;
      const now = performance.now();
      const y = window.scrollY;
      const h = window.innerHeight;
      const start = story?.offsetTop ?? h;
      const length = (story?.offsetHeight ?? h * 4) - h;
      const p = clamp((y - start) / Math.max(1, length));
      signal.current.scroll = clamp(y / h);
      signal.current.story = p;
      signal.current.instrument = clamp(
        (y - (instrument?.offsetTop ?? 0) + h) / (h * 0.9),
      );
      signal.current.velocity = clamp(
        (y - lastY) / Math.max(16, now - lastTime),
        -5,
        5,
      );
      lastY = y;
      lastTime = now;
      setChapter(Math.min(2, Math.floor(p * 3)));
      setInInstrument(signal.current.instrument > 0.65);
      if (progress.current)
        progress.current.style.transform = `scaleX(${clamp(y / (document.documentElement.scrollHeight - h))})`;
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      signal.current.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      signal.current.pointerY = 1 - (event.clientY / window.innerHeight) * 2;
    };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    window.addEventListener('pointermove', pointer, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      window.removeEventListener('pointermove', pointer);
    };
  }, []);

  const pulse = (strength = 0.5) => {
    signal.current.chargeStart = 0;
    signal.current.burst = performance.now();
    signal.current.burstStrength = strength;
    window.dispatchEvent(new Event('helios:input'));
  };
  const charge = (active: boolean) => {
    signal.current.chargeStart = active ? performance.now() : 0;
  };
  const rotate = (dx: number, dy: number) => {
    signal.current.rotationY += dx;
    signal.current.rotationX = clamp(signal.current.rotationX + dy, -0.9, 0.9);
    window.dispatchEvent(new Event('helios:input'));
  };
  const resetRotation = () => {
    signal.current.rotationX = 0;
    signal.current.rotationY = 0;
    window.dispatchEvent(new Event('helios:input'));
  };
  return { signal, chapter, inInstrument, progress, pulse, charge, rotate, resetRotation };
}
