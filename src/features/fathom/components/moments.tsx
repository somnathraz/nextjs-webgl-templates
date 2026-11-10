'use client';

import { useEffect, useRef } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'motion/react';
import { SPECIMENS, clamp, type Specimen, type Zone } from '../lib/zones';

const number = new Intl.NumberFormat('en-US');

/* ——— Chapter: a pinned stage whose type is scrubbed by scroll ——— */

function Word({
  word,
  index,
  last,
  progress,
  reduced,
}: {
  word: string;
  index: number;
  last: boolean;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const start = 0.04 + index * 0.04;
  const y = useTransform(progress, [start, start + 0.14], ['112%', '0%']);
  const rotate = useTransform(progress, [start, start + 0.14], [6, 0]);
  return (
    <span className="fathom-word" aria-hidden="true">
      <motion.span
        className={last ? 'fathom-word-accent' : undefined}
        style={reduced ? undefined : { y, rotate }}
      >
        {word}
      </motion.span>
    </span>
  );
}

function Fact({
  label,
  value,
  index,
  progress,
  reduced,
}: {
  label: string;
  value: string;
  index: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const start = 0.34 + index * 0.05;
  const opacity = useTransform(progress, [start, start + 0.14], [0, 1]);
  const y = useTransform(progress, [start, start + 0.14], [26, 0]);
  return (
    <motion.div style={reduced ? undefined : { opacity, y }}>
      <dd>{value}</dd>
      <dt>{label}</dt>
    </motion.div>
  );
}

export function Chapter({ zone, reduced }: { zone: Zone; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.75', 'end end'],
  });
  const opacity = useTransform(scrollYProgress, [0.84, 1], [1, 0]);
  const lift = useTransform(scrollYProgress, [0.84, 1], [0, -80]);
  const rule = useTransform(scrollYProgress, [0.02, 0.4], [0, 1]);
  const bodyOpacity = useTransform(scrollYProgress, [0.24, 0.42], [0, 1]);
  const bodyY = useTransform(scrollYProgress, [0.24, 0.42], [30, 0]);
  return (
    <div
      ref={ref}
      className={`fathom-chapter fathom-chapter-${zone.side}`}
      id={`fathom-${zone.id}`}
    >
      <div className="fathom-chapter-stage">
        <motion.div
          className="fathom-chapter-copy"
          style={reduced ? undefined : { opacity, y: lift }}
        >
          <div className="fathom-meta">
            <span>{zone.index}</span>
            <span>{zone.science}</span>
            <span>
              {number.format(zone.from)}–{number.format(zone.to)} m
            </span>
          </div>
          <motion.i
            className="fathom-rule"
            style={reduced ? undefined : { scaleX: rule }}
          />
          <h2 aria-label={zone.title.join(' ')}>
            {zone.title.map((word, index) => (
              <Word
                key={index}
                word={word}
                index={index}
                last={index === zone.title.length - 1}
                progress={scrollYProgress}
                reduced={reduced}
              />
            ))}
          </h2>
          <motion.p
            style={reduced ? undefined : { opacity: bodyOpacity, y: bodyY }}
          >
            {zone.body}
          </motion.p>
          <dl>
            {zone.facts.map((fact, index) => (
              <Fact
                key={fact.label}
                {...fact}
                index={index}
                progress={scrollYProgress}
                reduced={reduced}
              />
            ))}
          </dl>
        </motion.div>
      </div>
    </div>
  );
}

/* ——— Marquee: drifts with scroll, leans with scroll speed ——— */

export function Marquee({
  text,
  reverse = false,
  reduced,
}: {
  text: string;
  reverse?: boolean;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const { scrollY } = useScroll();
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    reverse ? ['-34%', '-4%'] : ['-4%', '-34%'],
  );
  const skewX = useSpring(
    useTransform(useVelocity(scrollY), [-2600, 2600], [14, -14]),
    { stiffness: 220, damping: 32 },
  );
  return (
    <div ref={ref} className="fathom-marquee" aria-hidden="true">
      <motion.div style={reduced ? undefined : { x, skewX }}>
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i}>{text}</span>
        ))}
      </motion.div>
    </div>
  );
}

/* ——— Field log: vertical scroll becomes a horizontal pass of tilt cards ——— */

function Glyph({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 200 200" className="fathom-glyph" aria-hidden="true">
      {[0, 1, 2, 3].map((ring) => (
        <circle
          key={ring}
          cx="100"
          cy="100"
          r={26 + ring * 20}
          strokeDasharray={`${3 + ((index * 7 + ring * 13) % 22)} ${
            5 + ((index * 5 + ring * 11) % 16)
          }`}
          style={{ animationDuration: `${18 + ring * 9 + index * 3}s` }}
        />
      ))}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const inner = 94;
        const outer = 94 + 2 + ((i * (index + 3)) % 5);
        return (
          <line
            key={i}
            x1={(100 + Math.cos(angle) * inner).toFixed(2)}
            y1={(100 + Math.sin(angle) * inner).toFixed(2)}
            x2={(100 + Math.cos(angle) * outer).toFixed(2)}
            y2={(100 + Math.sin(angle) * outer).toFixed(2)}
          />
        );
      })}
      <circle className="fathom-glyph-core" cx="100" cy="100" r="7" />
    </svg>
  );
}

function SpecimenCard({
  specimen,
  index,
}: {
  specimen: Specimen;
  index: number;
}) {
  const rotateX = useSpring(0, { stiffness: 160, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 160, damping: 18 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(0);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, hsl(${specimen.hue} 100% 80% / 0.22), transparent 58%)`;
  return (
    <motion.article
      className="fathom-card"
      data-cursor="Inspect"
      style={{
        rotateX,
        rotateY,
        ['--hue' as string]: specimen.hue,
      }}
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse') return;
        const rect = event.currentTarget.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        rotateY.set((px - 0.5) * 18);
        rotateX.set((0.5 - py) * 18);
        glareX.set(px * 100);
        glareY.set(py * 100);
      }}
      onPointerLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
    >
      <motion.div className="fathom-card-glare" style={{ background: glare }} />
      <header>
        <span>No. {String(index + 1).padStart(2, '0')}</span>
        <span>{specimen.depth}</span>
      </header>
      <Glyph index={index} />
      <h3>{specimen.name}</h3>
      <em>{specimen.latin}</em>
      <p>{specimen.note}</p>
    </motion.article>
  );
}

export function FieldLog({ reduced }: { reduced: boolean }) {
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
      className={`fathom-log${reduced ? ' fathom-log-static' : ''}`}
    >
      <div className="fathom-log-stage">
        <motion.div
          ref={track}
          className="fathom-log-track"
          style={reduced ? undefined : { x }}
        >
          <div className="fathom-log-intro">
            <span className="fathom-meta">
              <span>Field log</span>
              <span>06 entries</span>
            </span>
            <h2>
              Six lives between here and <em>the floor.</em>
            </h2>
            <p>Keep scrolling. The log runs sideways.</p>
          </div>
          {SPECIMENS.map((specimen, index) => (
            <SpecimenCard
              key={specimen.name}
              specimen={specimen}
              index={index}
            />
          ))}
        </motion.div>
        <div className="fathom-log-progress">
          <motion.i style={{ scaleX: scrollYProgress }} />
        </div>
      </div>
    </div>
  );
}

/* ——— Torch: a sentence in the dark that only your cursor can read ——— */

const TORCH_TEXT =
  'Three in four animals down here make their own light. Everything else is waiting to be found by it.';

export function Torch() {
  const stage = useRef<HTMLDivElement>(null);
  return (
    <div className="fathom-torch">
      <div
        ref={stage}
        className="fathom-torch-stage"
        data-cursor="Light"
        onPointerMove={(event) => {
          const element = stage.current;
          if (!element || event.pointerType !== 'mouse') return;
          const rect = element.getBoundingClientRect();
          element.style.setProperty('--mx', `${event.clientX - rect.left}px`);
          element.style.setProperty('--my', `${event.clientY - rect.top}px`);
        }}
      >
        <p className="fathom-torch-dim" aria-hidden="true">
          {TORCH_TEXT}
        </p>
        <p className="fathom-torch-lit">{TORCH_TEXT}</p>
        <span className="fathom-torch-hint">
          Move your cursor. You are the only light.
        </span>
      </div>
    </div>
  );
}

/* ——— Pressure: a word crushed by the water above it ——— */

export function Pressure({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const atm = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  });
  const scaleY = useTransform(scrollYProgress, [0.3, 0.95], [1, 0.24]);
  const scaleX = useTransform(scrollYProgress, [0.3, 0.95], [1, 1.08]);
  const press = useTransform(scrollYProgress, [0.3, 0.95], ['0vw', '5.2vw']);
  const lift = useTransform(press, (value) => `-${value}`);
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    if (atm.current)
      atm.current.textContent = String(
        Math.round(398 + clamp((value - 0.3) / 0.65) * 199),
      );
  });
  return (
    <div ref={ref} className="fathom-pressure">
      <div className="fathom-pressure-stage">
        <motion.i
          className="fathom-press-bar"
          style={reduced ? undefined : { y: press }}
        />
        <motion.strong style={reduced ? undefined : { scaleY, scaleX }}>
          PRESSURE
        </motion.strong>
        <motion.i
          className="fathom-press-bar"
          style={reduced ? undefined : { y: lift }}
        />
        <p>
          <span ref={atm}>398</span> atmospheres. A foam cup sent down on the
          outside of a submersible comes back the size of a thimble.
        </p>
      </div>
    </div>
  );
}

/* ——— Finale: the counter lands on the floor ——— */

export function Finale({
  reduced,
  bind,
}: {
  reduced: boolean;
  /** The scroll loop writes the live depth into this element. */
  bind: (element: HTMLElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  });
  const scale = useTransform(scrollYProgress, [0.2, 1], [0.72, 1]);
  const spacing = useTransform(
    scrollYProgress,
    [0.2, 1],
    ['0.18em', '-0.03em'],
  );
  const caption = useTransform(scrollYProgress, [0.9, 1], [0, 1]);
  return (
    <div ref={ref} className="fathom-finale">
      <div className="fathom-finale-stage">
        <span className="fathom-meta">
          <span>11°22′N 142°35′E</span>
          <span>Challenger Deep</span>
        </span>
        <motion.strong
          style={reduced ? undefined : { scale, letterSpacing: spacing }}
        >
          <span ref={bind}>10,935</span>
          <small>m</small>
        </motion.strong>
        <motion.p style={reduced ? undefined : { opacity: caption }}>
          The bottom of the world. Nothing below you but the planet.
        </motion.p>
      </div>
    </div>
  );
}
