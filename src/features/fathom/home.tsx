'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Component, useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Cursor, Magnetic } from './components/cursor';
import {
  Chapter,
  FieldLog,
  Finale,
  Marquee,
  Pressure,
  Torch,
} from './components/moments';
import { useAmbience } from './hooks/use-ambience';
import { useDive, type HudRefs } from './hooks/use-dive';
import { ZONES } from './lib/zones';

const OceanScene = dynamic(() => import('./components/ocean-scene'), {
  ssr: false,
});

const EASE = [0.16, 1, 0.3, 1] as const;
const TITLE = 'FATHOM'.split('');

/** If WebGL fails the CSS gradient behind the canvas carries the page. */
class Boundary extends Component<
  { children: React.ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Preloader({
  visible,
  reduced,
  onFull,
}: {
  visible: boolean;
  reduced: boolean;
  onFull: () => void;
}) {
  const count = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = reduced ? 1 : Math.min(1, (now - start) / 1800);
      const eased = 1 - Math.pow(1 - p, 3);
      if (count.current)
        count.current.textContent = String(Math.round(eased * 100)).padStart(
          3,
          '0',
        );
      if (p < 1) frame = requestAnimationFrame(tick);
      else onFull();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, onFull]);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fathom-loader"
          role="status"
          aria-label="Preparing the dive"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: reduced ? 0 : 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="fathom-loader-row">
            <span>Fathom</span>
            <span>Dive 001</span>
          </div>
          <strong>
            <span ref={count}>000</span>
          </strong>
          <div className="fathom-loader-row">
            <span>Sealing hatch</span>
            <span>Flooding ballast</span>
            <span>Lights on</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HeroLetter({
  char,
  index,
  progress,
  entered,
  reduced,
}: {
  char: string;
  index: number;
  progress: MotionValue<number>;
  entered: boolean;
  reduced: boolean;
}) {
  // Each letter rises at its own speed, so the word breaks apart as you sink.
  const drift = -(70 + ((index * 3) % TITLE.length) * 62);
  const y = useTransform(progress, [0, 1], [0, drift]);
  const rotate = useTransform(progress, [0, 1], [0, (index % 2 ? 1 : -1) * 7]);
  const opacity = useTransform(progress, [0.15, 0.85], [1, 0]);
  return (
    <motion.span
      className="fathom-letter"
      style={reduced ? undefined : { y, rotate, opacity }}
    >
      <motion.span
        initial={{ y: reduced ? '0%' : '115%' }}
        animate={{ y: entered || reduced ? '0%' : '115%' }}
        transition={{ duration: 1.3, delay: 0.25 + index * 0.075, ease: EASE }}
      >
        {char}
      </motion.span>
    </motion.span>
  );
}

function Hud({
  bind,
  zone,
}: {
  bind: (key: keyof HudRefs) => (element: HTMLElement | null) => void;
  zone: number;
}) {
  return (
    <aside className="fathom-hud" aria-hidden="true">
      <div className="fathom-hud-depth">
        <span ref={bind('depth')}>00000</span>
        <small>m</small>
      </div>
      <div className="fathom-hud-zone">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={zone}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {ZONES[zone].name}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="fathom-hud-track">
        {['0', '200', '1k', '4k', '6k', '11k'].map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
        <div ref={bind('marker')} className="fathom-hud-marker">
          <i />
        </div>
      </div>
      <dl>
        <div>
          <dt>Pressure</dt>
          <dd>
            <span ref={bind('pressure')}>1</span> atm
          </dd>
        </div>
        <div>
          <dt>Water</dt>
          <dd>
            <span ref={bind('temperature')}>24.0</span> °C
          </dd>
        </div>
        <div>
          <dt>Sunlight</dt>
          <dd>
            <span ref={bind('light')}>100</span> %
          </dd>
        </div>
      </dl>
    </aside>
  );
}

export function FathomHome() {
  const reduced = !!useReducedMotion();
  const ambience = useAmbience();
  const { signal, bind, zone } = useDive(reduced, ambience.setDepth);
  const [ready, setReady] = useState(false);
  const [full, setFull] = useState(false);
  const entered = ready && full;
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ['start start', 'end start'],
  });
  const heroFade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const markReady = useCallback(() => setReady(true), []);
  const markFull = useCallback(() => setFull(true), []);

  // Never hold the page hostage to the GPU.
  useEffect(() => {
    const timer = window.setTimeout(markReady, 6000);
    return () => window.clearTimeout(timer);
  }, [markReady]);

  return (
    <div className="fathom-root" data-zone={zone}>
      <a className="fathom-skip" href="#fathom-main">
        Skip to content
      </a>
      <Preloader visible={!entered} reduced={reduced} onFull={markFull} />
      <Cursor />
      <div className="fathom-canvas" aria-hidden="true">
        <Boundary onFail={markReady}>
          <OceanScene signal={signal} onReady={markReady} />
        </Boundary>
      </div>

      <header className="fathom-nav">
        <Link href="/fathom" className="fathom-logo" aria-label="Fathom home">
          Fathom
        </Link>
        <nav aria-label="Ocean zones">
          {ZONES.map((item, index) => (
            <a
              key={item.id}
              href={`#fathom-${item.id}`}
              aria-current={index === zone ? 'true' : undefined}
              data-cursor={item.index}
            >
              <i />
              <span>{item.name}</span>
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="fathom-sound"
          aria-pressed={ambience.on}
          onClick={ambience.toggle}
        >
          {ambience.on ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span>Sound {ambience.on ? 'on' : 'off'}</span>
        </button>
      </header>

      <Hud bind={bind} zone={zone} />

      <main id="fathom-main" className="fathom-main">
        <section ref={hero} className="fathom-hero">
          <motion.p
            className="fathom-meta fathom-hero-eyebrow"
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: entered ? 1 : 0, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
          >
            <span>Mariana Trench</span>
            <span>11°22′N 142°35′E</span>
          </motion.p>
          <h1 aria-label="Fathom">
            {TITLE.map((char, index) => (
              <HeroLetter
                key={index}
                char={char}
                index={index}
                progress={scrollYProgress}
                entered={entered}
                reduced={reduced}
              />
            ))}
          </h1>
          <motion.div
            className="fathom-hero-foot"
            style={reduced ? undefined : { opacity: heroFade }}
          >
            <motion.p
              initial={{ opacity: 0, y: reduced ? 0 : 20 }}
              animate={{ opacity: entered ? 1 : 0, y: 0 }}
              transition={{ duration: 0.9, delay: 1.05, ease: EASE }}
            >
              Eleven kilometres of water, five zones, one scroll.{' '}
              <em>Hold your breath.</em>
            </motion.p>
            <motion.a
              href="#fathom-sunlight"
              className="fathom-cue"
              data-cursor="Dive"
              initial={{ opacity: 0 }}
              animate={{ opacity: entered ? 1 : 0 }}
              transition={{ duration: 0.9, delay: 1.25 }}
            >
              Begin descent
              <span>
                <ArrowDown size={16} />
              </span>
            </motion.a>
          </motion.div>
        </section>

        <section data-fathom-zone="0">
          <Chapter zone={ZONES[0]} reduced={reduced} />
          <Marquee text="Light falls — Pressure rises — " reduced={reduced} />
        </section>
        <section data-fathom-zone="1">
          <Chapter zone={ZONES[1]} reduced={reduced} />
          <FieldLog reduced={reduced} />
        </section>
        <section data-fathom-zone="2">
          <Chapter zone={ZONES[2]} reduced={reduced} />
          <Torch />
        </section>
        <section data-fathom-zone="3">
          <Marquee
            text="No sun — No seasons — No hurry — "
            reverse
            reduced={reduced}
          />
          <Chapter zone={ZONES[3]} reduced={reduced} />
          <Pressure reduced={reduced} />
        </section>
        <section data-fathom-zone="4">
          <Chapter zone={ZONES[4]} reduced={reduced} />
          <Finale reduced={reduced} bind={bind('finale')} />
        </section>
      </main>

      <footer className="fathom-footer">
        <div className="fathom-footer-top">
          <p>
            That was 10,935 metres.
            <br />
            <em>The way back is faster.</em>
          </p>
          <Magnetic
            className="fathom-surface"
            label="Up"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ArrowUp size={22} />
            <span>Surface</span>
          </Magnetic>
        </div>
        <motion.div
          className="fathom-wordmark"
          aria-hidden="true"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {TITLE.map((char, index) => (
            <span key={index}>
              <motion.span
                variants={{
                  hidden: { y: reduced ? 0 : '110%' },
                  visible: { y: 0 },
                }}
                transition={{
                  duration: reduced ? 0 : 1,
                  delay: reduced ? 0 : index * 0.07,
                  ease: EASE,
                }}
              >
                {char}
              </motion.span>
            </span>
          ))}
        </motion.div>
        <div className="fathom-footer-bottom">
          <span>
            © {new Date().getFullYear()} Fathom, an independent concept
          </span>
          <span>Figures are approximate. The dark is real.</span>
          <Link href="/">
            All showcases <ArrowUpRight size={13} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
