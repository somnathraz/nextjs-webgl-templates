'use client';
import dynamic from 'next/dynamic';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useScroll,
  useTransform,
} from 'motion/react';
import { useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
const SignalCore = dynamic(() => import('./signal-core'), {
  ssr: false,
  loading: () => <div className="relay-core-fallback" />,
});
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 180]);
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.2]);
  const xMouse = useMotionValue(0),
    yMouse = useMotionValue(0);
  const x = useSpring(xMouse, { stiffness: 120, damping: 18 }),
    cy = useSpring(yMouse, { stiffness: 120, damping: 18 });
  const [hover, setHover] = useState(false);
  return (
    <section
      ref={ref}
      className="relay-hero"
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        xMouse.set(e.clientX - r.left);
        yMouse.set(e.clientY - r.top);
        setHover(true);
      }}
      onPointerLeave={() => setHover(false)}
    >
      <div className="relay-hero-grid" />
      <div className="relay-hero-core">
        <SignalCore />
      </div>
      <div className="relay-core-label">
        <span className="relay-live-dot" /> CORE ONLINE <span>↗</span>
      </div>
      <motion.div className="relay-hero-copy" style={{ y, opacity }}>
        <div className="relay-announcement">
          <span className="relay-live-dot" /> A NEW WAY TO MOVE WORK FORWARD{' '}
          <ArrowUpRight size={12} />
        </div>
        <h1>
          Intelligence,
          <br />
          <span>in motion.</span>
        </h1>
        <p>
          A shared goal. A team of agents.
          <br />
          One continuous flow from intent to outcome.
        </p>
        <div className="relay-hero-actions">
          <a href="#relay-playground" className="relay-button">
            Run a workflow <ArrowUpRight size={16} />
          </a>
          <a className="relay-quiet-link" href="#relay-system">
            Explore the system <span>↘</span>
          </a>
        </div>
      </motion.div>
      <div className="relay-orbit-caption">
        <span>
          ONE SIGNAL.
          <br />
          ENDLESS POSSIBILITIES.
        </span>
        <span>
          RLY—001
          <br />
          ORCHESTRATION CORE
        </span>
      </div>
      <div className="relay-hero-bottom">
        <a href="#relay-system">
          <ArrowDown size={14} /> FOLLOW THE SIGNAL
        </a>
        <span>CONTEXT → REASONING → ACTION</span>
        <span>BUILT TO WORK TOGETHER.</span>
      </div>
      {!reduced && (
        <motion.div
          className="relay-cursor"
          style={{ x, y: cy, opacity: hover ? 1 : 0 }}
        >
          <span />
        </motion.div>
      )}
    </section>
  );
}
