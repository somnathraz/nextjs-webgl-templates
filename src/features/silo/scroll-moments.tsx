'use client';

import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { ArrowDownRight, Asterisk } from 'lucide-react';

function Word({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(() => {
    const amount = Math.max(0, Math.min(1, progress.get() * total - index));
    return 0.14 + amount * 0.86;
  });
  return <motion.span style={{ opacity }}>{word} </motion.span>;
}

export function BalanceStory() {
  const section = useRef<HTMLElement>(null);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ['start start', 'end end'],
  });
  const rotation = useTransform(scrollYProgress, [0, 1], [-35, 145]);
  const ringScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.8, 1.15, 0.9],
  );
  const words =
    'Two rings. One quiet point of balance. A familiar room, seen in a completely different light.'.split(
      ' ',
    );
  return (
    <section ref={section} className="silo-balance">
      <div className="silo-balance-sticky">
        <div className="silo-balance-meta">
          <span className="silo-index">02 / A DIFFERENT PERSPECTIVE</span>
          <ArrowDownRight size={28} />
        </div>
        <div className="silo-balance-composition">
          <motion.div
            className="silo-orbit-drawing"
            style={reduced ? undefined : { rotate: rotation, scale: ringScale }}
            aria-hidden="true"
          >
            <div />
            <div />
            <span>01</span>
          </motion.div>
          <h2>
            {reduced
              ? words.join(' ')
              : words.map((word, index) => (
                  <Word
                    key={`${word}-${index}`}
                    word={word}
                    index={index}
                    total={words.length}
                    progress={scrollYProgress}
                  />
                ))}
          </h2>
        </div>
        <div className="silo-balance-caption">
          <span>FORM FOLLOWS FEELING.</span>
          <span>ALUMINUM / LIGHT / BALANCE</span>
        </div>
        <motion.div
          className="silo-story-progress"
          style={{ scaleX: reduced ? 1 : scrollYProgress }}
        />
      </div>
    </section>
  );
}

export function MovingType() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const x = useTransform(scrollYProgress, [0, 1], ['4%', '-24%']);
  return (
    <div ref={ref} className="silo-moving-type" aria-hidden="true">
      <motion.div style={reduced ? undefined : { x }}>
        <span>A DIFFERENT KIND OF LIGHT</span>
        <Asterisk />
        <span>A DIFFERENT KIND OF LIGHT</span>
        <Asterisk />
      </motion.div>
    </div>
  );
}

export function InteriorImage() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1.03]);
  return (
    <div
      ref={ref}
      className="silo-detail-photo"
      role="img"
      aria-label="Sculptural modern interior with natural light"
    >
      <motion.div
        className="silo-photo-image"
        style={reduced ? undefined : { y, scale }}
      />
      <span>AT HOME, IN GOOD COMPANY.</span>
    </div>
  );
}

export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  return (
    <motion.div
      ref={ref}
      className="silo-footer-wordmark"
      aria-hidden="true"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <motion.div style={reduced ? undefined : { y }}>
        {'silo'.split('').map((letter, i) => (
          <motion.span
            className="silo-footer-letter"
            key={i}
            variants={{
              hidden: { y: reduced ? 0 : '110%', rotate: reduced ? 0 : 8 },
              visible: { y: 0, rotate: 0 },
            }}
            transition={{
              duration: reduced ? 0 : 0.9,
              delay: reduced ? 0 : i * 0.09,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {letter}
          </motion.span>
        ))}
        <sup>®</sup>
      </motion.div>
    </motion.div>
  );
}
