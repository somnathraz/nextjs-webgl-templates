'use client';
import { useEffect, useState } from 'react';

/** A brief cinematic intro curtain — counts up, then lifts to reveal the
 *  mercury. Auto-dismisses; becomes inert so it never blocks interaction. */
export function Intro() {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let raf = 0;
    let to: ReturnType<typeof setTimeout> | undefined;
    const start = performance.now();
    const dur = reduce ? 1 : 1500;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      setPct(Math.round((1 - Math.pow(1 - t, 3)) * 100)); // ease-out
      if (t < 1) raf = requestAnimationFrame(tick);
      else to = setTimeout(() => setDone(true), reduce ? 0 : 260);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (to) clearTimeout(to);
    };
  }, []);

  return (
    <div className={`mc-intro ${done ? 'is-done' : ''}`} aria-hidden="true">
      <div className="mc-intro-inner">
        <span className="mc-intro-mark">MERCURY</span>
        <span className="mc-intro-sub">LIQUID CHROME · REAL-TIME</span>
      </div>
      <div className="mc-intro-bar">
        <span style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
      <span className="mc-intro-pct">{pct.toString().padStart(3, '0')}</span>
    </div>
  );
}
