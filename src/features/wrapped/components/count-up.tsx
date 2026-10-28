'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/** Ticks a number up with an ease-out-expo, writing straight to the DOM. */
export function CountUp({
  value,
  duration = 1.7,
  delay = 0.25,
}: {
  value: number;
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const format = (n: number) => Math.round(n).toLocaleString('en-US');
    if (reduced) {
      el.textContent = format(value);
      return;
    }
    let raf = 0;
    const start = performance.now() + delay * 1000;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / (duration * 1000)));
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = format(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay, reduced]);

  return (
    <span ref={ref} aria-label={value.toLocaleString('en-US')}>
      0
    </span>
  );
}
