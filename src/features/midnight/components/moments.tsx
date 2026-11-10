'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { LET_GO, MONTHS, timeLeft } from '../lib/time';

const EASE = [0.16, 1, 0.3, 1] as const;

/* ——— Chapter: pinned copy, words scrubbed in by scroll ——— */

function Word({
  word,
  index,
  accent,
  progress,
  reduced,
}: {
  word: string;
  index: number;
  accent: boolean;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const start = 0.04 + index * 0.04;
  const y = useTransform(progress, [start, start + 0.14], ['115%', '0%']);
  return (
    <span className="midnight-word" aria-hidden="true">
      <motion.span
        className={accent ? 'midnight-accent' : undefined}
        style={reduced ? undefined : { y }}
      >
        {word}
      </motion.span>
    </span>
  );
}

export function Chapter({
  index,
  kicker,
  title,
  body,
  side,
  reduced,
}: {
  index: string;
  kicker: string;
  title: string[];
  body: string;
  side: 'left' | 'right';
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.75', 'end end'],
  });
  const opacity = useTransform(scrollYProgress, [0.84, 1], [1, 0]);
  const lift = useTransform(scrollYProgress, [0.84, 1], [0, -80]);
  const rule = useTransform(scrollYProgress, [0.02, 0.4], [0, 1]);
  const bodyOpacity = useTransform(scrollYProgress, [0.26, 0.44], [0, 1]);
  const bodyY = useTransform(scrollYProgress, [0.26, 0.44], [30, 0]);
  return (
    <div ref={ref} className={`midnight-chapter midnight-chapter-${side}`}>
      <div className="midnight-chapter-stage">
        <motion.div
          className="midnight-chapter-copy"
          style={reduced ? undefined : { opacity, y: lift }}
        >
          <div className="midnight-meta">
            <span>{index}</span>
            <span>{kicker}</span>
          </div>
          <motion.i
            className="midnight-rule"
            style={reduced ? undefined : { scaleX: rule }}
          />
          <h2 aria-label={title.join(' ')}>
            {title.map((word, i) => (
              <Word
                key={i}
                word={word}
                index={i}
                accent={i === title.length - 1}
                progress={scrollYProgress}
                reduced={reduced}
              />
            ))}
          </h2>
          <motion.p
            style={reduced ? undefined : { opacity: bodyOpacity, y: bodyY }}
          >
            {body}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

/* ——— Months: the year as twelve calendar pages, passing sideways ——— */

function MonthCard({ index }: { index: number }) {
  const [name, line] = MONTHS[index];
  const rotateX = useSpring(0, { stiffness: 160, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 160, damping: 18 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(0);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(242, 197, 114, 0.28), transparent 60%)`;
  return (
    <motion.article
      className="midnight-month"
      data-cursor={name.slice(0, 3)}
      data-no-launch
      style={{ rotateX, rotateY }}
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse') return;
        const rect = event.currentTarget.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        rotateY.set((px - 0.5) * 20);
        rotateX.set((0.5 - py) * 20);
        glareX.set(px * 100);
        glareY.set(py * 100);
      }}
      onPointerLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
    >
      <motion.div
        className="midnight-month-glare"
        style={{ background: glare }}
      />
      <header>
        <span>{name}</span>
        <span>{String(index + 1).padStart(2, '0')} / 12</span>
      </header>
      <strong>{String(index + 1).padStart(2, '0')}</strong>
      <p>{line}</p>
    </motion.article>
  );
}

export function Months({ year, reduced }: { year: number; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const travel = useMotionValue(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(() => -scrollYProgress.get() * travel.get());

  useEffect(() => {
    const measure = () => {
      if (track.current)
        travel.set(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [travel]);

  return (
    <div
      ref={ref}
      className={`midnight-months${reduced ? ' midnight-months-static' : ''}`}
    >
      <div className="midnight-months-stage">
        <motion.div
          ref={track}
          className="midnight-months-track"
          style={reduced ? undefined : { x }}
        >
          <div className="midnight-months-intro">
            <div className="midnight-meta">
              <span>{year}</span>
              <span>Twelve pages</span>
            </div>
            <h2>
              One last look, <em>then turn the page.</em>
            </h2>
          </div>
          {MONTHS.map((_, index) => (
            <MonthCard key={index} index={index} />
          ))}
        </motion.div>
        <div className="midnight-months-progress">
          <motion.i style={{ scaleX: scrollYProgress }} />
        </div>
      </div>
    </div>
  );
}

/* ——— Let go: tap a word and it leaves with a firework ——— */

export function LetGo({
  reduced,
  onRelease,
}: {
  reduced: boolean;
  onRelease: (clientX: number, clientY: number) => void;
}) {
  const [gone, setGone] = useState<string[]>([]);
  const left = LET_GO.filter((word) => !gone.includes(word));
  return (
    <div className="midnight-letgo">
      <div className="midnight-letgo-stage">
        <div className="midnight-meta">
          <span>Tap to release</span>
          <span aria-live="polite">
            {gone.length} of {LET_GO.length} gone
          </span>
        </div>
        <ul>
          <AnimatePresence>
            {left.map((word, index) => (
              <motion.li
                key={word}
                layout={!reduced}
                exit={
                  reduced
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        y: -220,
                        rotate: index % 2 ? 14 : -14,
                        filter: 'blur(10px)',
                      }
                }
                transition={{ duration: reduced ? 0.2 : 1.1, ease: EASE }}
              >
                <button
                  type="button"
                  data-cursor="Release"
                  onClick={(event) => {
                    setGone((list) => [...list, word]);
                    onRelease(event.clientX, event.clientY);
                  }}
                >
                  {word}
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <AnimatePresence>
          {left.length === 0 && (
            <motion.div
              className="midnight-letgo-done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <p>
                Lighter already. <em>Keep climbing.</em>
              </p>
              <button type="button" onClick={() => setGone([])}>
                <RotateCcw size={14} /> Bring them back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ——— Countdown: ten numbers, one per tenth of the scroll ——— */

function Count({
  value,
  index,
  progress,
}: {
  value: number;
  index: number;
  progress: MotionValue<number>;
}) {
  const local = useTransform(progress, (v) => v * 10 - index);
  const opacity = useTransform(local, [0, 0.12, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(local, [0, 0.15, 0.8, 1], [1.4, 1, 1, 0.7]);
  const blur = useTransform(local, [0, 0.15, 0.8, 1], [16, 0, 0, 12]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  return (
    <motion.span style={{ opacity, scale, filter }} aria-hidden="true">
      {value}
    </motion.span>
  );
}

export function Countdown({
  reduced,
  onTick,
  onMidnight,
}: {
  reduced: boolean;
  onTick: () => void;
  onMidnight: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const second = useTransform(scrollYProgress, (v) =>
    v >= 1 ? 1 : (v * 10) % 1,
  );
  const fade = useTransform(scrollYProgress, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const step = Math.min(10, Math.floor(value * 10));
    if (step === last.current) return;
    if (step > last.current) {
      if (step === 10) onMidnight();
      else onTick();
    }
    last.current = step;
  });
  return (
    <div ref={ref} className="midnight-countdown">
      <div className="midnight-countdown-stage">
        <p className="midnight-sr">The last ten seconds of the year.</p>
        {reduced ? (
          <strong className="midnight-countdown-static">10 … 1</strong>
        ) : (
          <>
            <motion.svg
              viewBox="0 0 100 100"
              className="midnight-countdown-ring"
              style={{ opacity: fade }}
              aria-hidden="true"
            >
              <circle cx="50" cy="50" r="48" />
              <motion.circle
                cx="50"
                cy="50"
                r="48"
                style={{ pathLength: second }}
              />
            </motion.svg>
            <strong>
              {Array.from({ length: 10 }, (_, index) => (
                <Count
                  key={index}
                  value={10 - index}
                  index={index}
                  progress={scrollYProgress}
                />
              ))}
            </strong>
            <motion.span className="midnight-meta" style={{ opacity: fade }}>
              <span>Seconds</span>
              <span>Keep scrolling</span>
            </motion.span>
          </>
        )}
      </div>
    </div>
  );
}

/* ——— Midnight: the year rolls over ——— */

function RollDigit({
  from,
  to,
  index,
  progress,
  reduced,
}: {
  from: string;
  to: string;
  index: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const y = useTransform(
    progress,
    [0.14 + index * 0.02, 0.4 + index * 0.02],
    ['0%', '-50%'],
  );
  if (from === to) return <span>{to}</span>;
  return (
    <span className="midnight-roll">
      <motion.span style={{ y: reduced ? '-50%' : y }}>
        <span>{from}</span>
        <span>{to}</span>
      </motion.span>
    </span>
  );
}

export function Arrival({
  previous,
  next,
  reduced,
}: {
  previous: number;
  next: number;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  });
  const from = String(previous).split('');
  const to = String(next).split('');
  const greeting = ['Happy', 'New', 'Year.'];
  const scale = useTransform(scrollYProgress, [0.1, 0.5], [0.8, 1]);
  const note = useTransform(scrollYProgress, [0.66, 0.8], [0, 1]);
  return (
    <div ref={ref} className="midnight-arrival">
      <div className="midnight-arrival-stage">
        <div className="midnight-meta">
          <span>00:00:00</span>
          <span>1 January</span>
        </div>
        <motion.strong
          aria-label={String(next)}
          style={reduced ? undefined : { scale }}
        >
          {to.map((digit, index) => (
            <RollDigit
              key={index}
              from={from[index] ?? digit}
              to={digit}
              index={index}
              progress={scrollYProgress}
              reduced={reduced}
            />
          ))}
        </motion.strong>
        <h2 aria-label={greeting.join(' ')}>
          {greeting.map((word, index) => (
            <ArrivalWord
              key={word}
              word={word}
              index={index}
              progress={scrollYProgress}
              reduced={reduced}
            />
          ))}
        </h2>
        <motion.p style={reduced ? undefined : { opacity: note }}>
          The sky is yours. Click anywhere to send one up.
        </motion.p>
      </div>
    </div>
  );
}

function ArrivalWord({
  word,
  index,
  progress,
  reduced,
}: {
  word: string;
  index: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const start = 0.42 + index * 0.06;
  const y = useTransform(progress, [start, start + 0.14], ['115%', '0%']);
  return (
    <span className="midnight-word" aria-hidden="true">
      <motion.span style={reduced ? undefined : { y }}>{word}</motion.span>
    </span>
  );
}

/* ——— Live countdown: real time to the real New Year ——— */

export function LiveCountdown({
  next,
  arrived,
  large = false,
}: {
  next: number;
  arrived: boolean;
  large?: boolean;
}) {
  const [left, setLeft] = useState<ReturnType<typeof timeLeft> | null>(null);
  useEffect(() => {
    const update = () => setLeft(timeLeft(next));
    const first = window.setTimeout(update, 0);
    const timer = window.setInterval(update, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [next]);
  const pad = (value: number | undefined) =>
    value === undefined ? '--' : String(value).padStart(2, '0');
  const units: [string, string][] = [
    [pad(left?.days), 'days'],
    [pad(left?.hours), 'hours'],
    [pad(left?.minutes), 'min'],
    [pad(left?.seconds), 'sec'],
  ];
  if (arrived)
    return (
      <span className={large ? 'midnight-live-large' : 'midnight-live'}>
        It is {next}.
      </span>
    );
  if (!large)
    return (
      <span className="midnight-live" suppressHydrationWarning>
        {next} in {units[0][0]}d {units[1][0]}:{units[2][0]}:{units[3][0]}
      </span>
    );
  return (
    <div
      className="midnight-live-large"
      role="timer"
      aria-label={`Time until ${next}`}
    >
      {units.map(([value, label]) => (
        <div key={label}>
          <span className="midnight-live-slot">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={value}
                initial={{ y: '70%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '-70%', opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                {value}
              </motion.span>
            </AnimatePresence>
          </span>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}
