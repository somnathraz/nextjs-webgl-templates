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
  ArrowUpRight,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Cursor, Magnetic } from './components/cursor';
import {
  Arrival,
  Chapter,
  Countdown,
  LetGo,
  LiveCountdown,
  Months,
} from './components/moments';
import { useNight } from './hooks/use-night';
import { useSound } from './hooks/use-sound';
import { CHAPTER_LABELS, getYears } from './lib/time';

const NightScene = dynamic(() => import('./components/night-scene'), {
  ssr: false,
});

const EASE = [0.16, 1, 0.3, 1] as const;

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
  year,
  reduced,
  onFull,
}: {
  visible: boolean;
  year: number;
  reduced: boolean;
  onFull: () => void;
}) {
  const fill = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = reduced ? 1 : Math.min(1, (now - start) / 1800);
      const eased = 1 - Math.pow(1 - p, 3);
      if (fill.current)
        fill.current.style.clipPath = `inset(${(1 - eased) * 100}% 0 0 0)`;
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
          className="midnight-loader"
          role="status"
          aria-label="Setting the scene"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: reduced ? 0 : 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="midnight-loader-row">
            <span>Midnight</span>
            <span>31 December</span>
          </div>
          <strong suppressHydrationWarning>
            {year}
            <span ref={fill} aria-hidden="true" suppressHydrationWarning>
              {year}
            </span>
          </strong>
          <div className="midnight-loader-row">
            <span>Lighting windows</span>
            <span>Chilling the air</span>
            <span>Loading shells</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HeroDigit({
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
  // Digits sink at different speeds as the camera starts to rise.
  const y = useTransform(progress, [0, 1], [0, 90 + ((index * 3) % 4) * 70]);
  const opacity = useTransform(progress, [0.1, 0.8], [1, 0]);
  return (
    <motion.span
      className="midnight-digit"
      style={reduced ? undefined : { y, opacity }}
    >
      <motion.span
        initial={{ y: reduced ? '0%' : '-115%' }}
        animate={{ y: entered || reduced ? '0%' : '-115%' }}
        transition={{ duration: 1.3, delay: 0.25 + index * 0.09, ease: EASE }}
        suppressHydrationWarning
      >
        {char}
      </motion.span>
    </motion.span>
  );
}

export function MidnightHome() {
  const reduced = !!useReducedMotion();
  const [{ previous, next, arrived }] = useState(() => getYears());
  const sound = useSound();
  const { signal, bind, chapter, launch } = useNight(reduced);
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
    <div className="midnight-root">
      <a className="midnight-skip" href="#midnight-main">
        Skip to content
      </a>
      <Preloader
        visible={!entered}
        year={previous}
        reduced={reduced}
        onFull={markFull}
      />
      <Cursor />
      <div className="midnight-canvas" aria-hidden="true">
        <Boundary onFail={markReady}>
          <NightScene
            signal={signal}
            onReady={markReady}
            onBurst={sound.boom}
          />
        </Boundary>
      </div>

      <header className="midnight-nav">
        <Link
          href="/midnight"
          className="midnight-logo"
          aria-label="Midnight home"
        >
          Midnight
        </Link>
        <LiveCountdown next={next} arrived={arrived} />
        <button
          type="button"
          className="midnight-sound"
          aria-pressed={sound.on}
          onClick={sound.toggle}
        >
          {sound.on ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span>Sound {sound.on ? 'on' : 'off'}</span>
        </button>
      </header>

      <aside className="midnight-hud" aria-hidden="true">
        <span ref={bind('clock')} className="midnight-hud-clock">
          23:50:00
        </span>
        <span className="midnight-hud-label">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={chapter}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {CHAPTER_LABELS[chapter]}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="midnight-hud-bar">
          <i ref={bind('progress')} />
        </span>
      </aside>

      <main id="midnight-main" className="midnight-main">
        <section ref={hero} className="midnight-hero">
          <motion.p
            className="midnight-meta midnight-hero-eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: entered ? 1 : 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
          >
            <span>31 December</span>
            <span>Ten minutes to go</span>
          </motion.p>
          <h1 aria-label={`The last night of ${previous}`}>
            {String(previous)
              .split('')
              .map((char, index) => (
                <HeroDigit
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
            className="midnight-hero-foot"
            style={reduced ? undefined : { opacity: heroFade }}
          >
            <motion.p
              initial={{ opacity: 0, y: reduced ? 0 : 20 }}
              animate={{ opacity: entered ? 1 : 0, y: 0 }}
              transition={{ duration: 0.9, delay: 1.05, ease: EASE }}
            >
              The year is almost out. Scroll up through the city and{' '}
              <em>meet the next one at the top.</em>
            </motion.p>
            <motion.a
              href="#midnight-lookback"
              className="midnight-cue"
              data-cursor="Rise"
              initial={{ opacity: 0 }}
              animate={{ opacity: entered ? 1 : 0 }}
              transition={{ duration: 0.9, delay: 1.25 }}
            >
              Start the clock
              <span>
                <ArrowDown size={16} />
              </span>
            </motion.a>
          </motion.div>
        </section>

        <section data-night="lookback" id="midnight-lookback">
          <Chapter
            index="23:50"
            kicker="Look back"
            title={['Every', 'window', 'is', 'somebody’s', 'year.']}
            body="Ten thousand lit rooms, each one finishing its own twelve months. Yours is in there too. Before the count starts, take one slow look at what it held."
            side="left"
            reduced={reduced}
          />
          <Months year={previous} reduced={reduced} />
        </section>

        <section data-night="letgo">
          <Chapter
            index="23:56"
            kicker="Let go"
            title={['Not', 'everything', 'needs', 'to', 'come', 'with', 'you.']}
            body="Above the rooftops the lanterns are already going up. Each one carries something its owner decided to stop carrying. Send a few of your own."
            side="right"
            reduced={reduced}
          />
          <LetGo reduced={reduced} onRelease={launch} />
        </section>

        <section data-night="countdown">
          <Countdown
            reduced={reduced}
            onTick={sound.tick}
            onMidnight={sound.chime}
          />
        </section>

        <section data-night="midnight">
          <Arrival previous={previous} next={next} reduced={reduced} />
        </section>
      </main>

      <footer className="midnight-footer" data-no-launch>
        <div className="midnight-footer-top">
          <div>
            <div className="midnight-meta">
              <span>Meanwhile, in real time</span>
              <span suppressHydrationWarning>Until {next}</span>
            </div>
            <LiveCountdown next={next} arrived={arrived} large />
          </div>
          <Magnetic
            className="midnight-replay"
            label="Again"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <RotateCcw size={20} />
            <span>Replay the night</span>
          </Magnetic>
        </div>
        <motion.div
          className="midnight-wordmark"
          aria-hidden="true"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {'Midnight'.split('').map((char, index) => (
            <span key={index}>
              <motion.span
                variants={{
                  hidden: { y: reduced ? 0 : '110%' },
                  visible: { y: 0 },
                }}
                transition={{
                  duration: reduced ? 0 : 1,
                  delay: reduced ? 0 : index * 0.06,
                  ease: EASE,
                }}
              >
                {char}
              </motion.span>
            </span>
          ))}
        </motion.div>
        <div className="midnight-footer-bottom">
          <span suppressHydrationWarning>
            © {next} Midnight, an independent concept
          </span>
          <span>Every light on this page is drawn in a shader.</span>
          <Link href="/">
            All showcases <ArrowUpRight size={13} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
