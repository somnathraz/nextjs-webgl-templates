'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import { stagger } from './motion';
import type { SceneTarget } from '../engine/scene-kit';
import type { SlideTheme } from '../engine/themes';

const YearScene = dynamic(() => import('./year-scene'), { ssr: false });

const SLIDE_MS = 6500;
const HOLD_MS = 220;

type Props<K extends string> = {
  slides: K[];
  themes: Record<K, SlideTheme>;
  /** Must be stable (useCallback) — the scene re-targets whenever it changes. */
  buildTarget: (key: K) => SceneTarget;
  render: (key: K, index: number, replay: () => void) => React.ReactNode;
  year: number;
  who: string;
};

/**
 * The story player: progress bars, tap / hold / keyboard navigation,
 * auto-advance, per-slide color, and one 3D scene behind it all. The last
 * slide never auto-advances — that's where the share actions live.
 */
export function StoryShell<K extends string>({
  slides,
  themes,
  buildTarget,
  render,
  year,
  who,
}: Props<K>) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const at = Math.min(index, slides.length - 1);
  const key = slides[at];
  const last = at === slides.length - 1;
  const theme = themes[key];
  const target = useMemo(() => buildTarget(key), [buildTarget, key]);

  const elapsed = useRef(0);
  const held = useRef(false);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  const go = useCallback(
    (to: number) => setIndex(Math.max(0, Math.min(slides.length - 1, to))),
    [slides.length],
  );

  // auto-advance; the active bar is driven straight from the rAF loop
  const autoplay = !paused && !reduced && !last;
  // a new slide restarts its clock; pausing must not
  useEffect(() => {
    elapsed.current = 0;
  }, [at]);

  useEffect(() => {
    const bar = bars.current[at];
    if (last) {
      if (bar) bar.style.transform = 'scaleX(1)';
      return;
    }
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = now - prev;
      prev = now;
      if (autoplay && !held.current && !document.hidden) elapsed.current += dt;
      if (bar)
        bar.style.transform = `scaleX(${Math.min(1, elapsed.current / SLIDE_MS)})`;
      if (elapsed.current >= SLIDE_MS) {
        go(at + 1);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [at, last, autoplay, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        e.target.closest('input, textarea, button, a')
      )
        return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        go(at + 1);
      } else if (e.key === 'ArrowLeft') {
        go(at - 1);
      } else if (e.key.toLowerCase() === 'p') {
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [at, go]);

  // tap left third = back, elsewhere = forward; press and hold = pause
  const pressedAt = useRef(0);
  const onPointerDown = (e: React.PointerEvent) => {
    if (
      (e.target as HTMLElement).closest('[data-nav-ignore], a, button, input')
    )
      return;
    pressedAt.current = performance.now();
    held.current = true;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!held.current) return;
    held.current = false;
    if (performance.now() - pressedAt.current > HOLD_MS) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    go(e.clientX - rect.left < rect.width * 0.3 ? at - 1 : at + 1);
  };

  const vars = {
    '--gw-a': theme.a,
    '--gw-b': theme.b,
    '--gw-ink': theme.ink,
    '--gw-accent': theme.accent,
  } as React.CSSProperties;

  return (
    <div className={`gw-story gw-story--${key}`} style={vars}>
      <div className="gw-bg" aria-hidden="true" />
      <div className="gw-canvas" aria-hidden="true">
        <YearScene target={target} />
      </div>
      <div className="gw-shade" aria-hidden="true" />

      <header className="gw-top">
        <div className="gw-bars" aria-hidden="true">
          {slides.map((s, i) => (
            <span className="gw-bar" key={s}>
              <span
                className="gw-bar-fill"
                ref={(el) => {
                  bars.current[i] = el;
                }}
                style={
                  i < at
                    ? { transform: 'scaleX(1)' }
                    : i > at
                      ? { transform: 'scaleX(0)' }
                      : undefined
                }
              />
            </span>
          ))}
        </div>
        <div className="gw-top-row">
          <Link className="gw-brand" href="/wrapped">
            Wrapped<sup>&rsquo;{String(year).slice(2)}</sup>
          </Link>
          <span className="gw-who">{who}</span>
          <button
            className="gw-icon"
            onClick={() => setPaused((p) => !p)}
            aria-label={autoplay ? 'Pause' : 'Play'}
            aria-pressed={!autoplay}
          >
            {autoplay ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <Link className="gw-icon" href="/wrapped" aria-label="Close">
            <X size={18} />
          </Link>
        </div>
      </header>

      <main
        className="gw-stage"
        id="gw-main"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (held.current = false)}
      >
        <AnimatePresence mode="wait">
          <motion.section
            key={key}
            className={`gw-slide gw-slide--${key}`}
            variants={stagger}
            initial="hidden"
            animate="show"
            exit="exit"
            aria-live="polite"
          >
            {render(key, at, () => go(0))}
          </motion.section>
        </AnimatePresence>
      </main>

      <button
        className="gw-step gw-step--prev"
        onClick={() => go(at - 1)}
        disabled={at === 0}
        aria-label="Previous"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        className="gw-step gw-step--next"
        onClick={() => go(at + 1)}
        disabled={last}
        aria-label="Next"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
}
