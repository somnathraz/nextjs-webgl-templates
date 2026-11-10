'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Component, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import {
  BalanceStory,
  MovingType,
  InteriorImage,
  FooterWordmark,
} from './scroll-moments';
import {
  ArrowDown,
  ArrowUpRight,
  ArrowUp,
  Minus,
  Plus,
  Pause,
  Play,
  RotateCcw,
  Sun,
} from 'lucide-react';

const Scene = dynamic(() => import('./scene'), {
  ssr: false,
  loading: () => (
    <div className="silo-loading" role="status">
      Assembling Orbit 01...
    </div>
  ),
});
const finishes = [
  { name: 'Brushed aluminum', color: '#c5c8c9' },
  { name: 'Signal red', color: '#b92d23' },
  { name: 'Carbon', color: '#333735' },
];
class Boundary extends Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="silo-loading">
        Orbit 01 / Aluminum, light, and balance.
        <a href="#silo-details">
          Explore the object <ArrowDown size={16} />
        </a>
      </div>
    ) : (
      this.props.children
    );
  }
}

export function SiloHome() {
  const [finish, setFinish] = useState(0);
  const [lit, setLit] = useState(true);
  const [moving, setMoving] = useState(true);
  const [angle, setAngle] = useState(-0.35);
  const [open, setOpen] = useState<number | null>(0);
  const reduced = !!useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const visible = useInView(stage, { margin: '80px' });
  const reveal = {
    initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: reduced ? 0 : 0.7 },
  };
  return (
    <>
      <a className="silo-skip" href="#silo-main">
        Skip to content
      </a>
      <header className="silo-nav" id="silo-top">
        <Link href="/silo" className="silo-logo" aria-label="Silo home">
          silo<span>®</span>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#silo-object">The object</a>
          <a href="#silo-details">In detail</a>
        </nav>
        <a href="#silo-footer" className="silo-nav-link">
          Get in touch <ArrowUpRight size={16} />
        </a>
      </header>
      <main id="silo-main">
        <section className="silo-hero" id="silo-object">
          <div className="silo-hero-heading">
            <motion.p {...reveal}>INDEPENDENT OBJECTS / EDITION 001</motion.p>
            <motion.h1 {...reveal}>SILO</motion.h1>
          </div>
          <div
            ref={stage}
            className="silo-stage"
            role="img"
            aria-label={`Orbit 01 orbital lamp in ${finishes[finish].name}, light ${lit ? 'on' : 'off'}`}
          >
            <Boundary>
              <Scene
                color={finishes[finish].color}
                lit={lit}
                moving={moving}
                reduced={reduced}
                visible={visible}
                angle={angle}
              />
            </Boundary>
          </div>
          <motion.div className="silo-hero-copy" {...reveal}>
            <span className="silo-index">01 / ORBIT</span>
            <h2>
              A little less ordinary.
              <br />A different kind of light.
            </h2>
            <a href="#silo-details">
              Meet Orbit 01 <ArrowDown size={18} />
            </a>
          </motion.div>
          <div className="silo-controls">
            <div className="silo-finish-label">
              <span>FINISH</span>
              <span aria-live="polite">{finishes[finish].name}</span>
            </div>
            <div className="silo-control-row">
              <div
                className="silo-swatches"
                role="group"
                aria-label="Lamp finish"
              >
                {finishes.map((f, i) => (
                  <button
                    key={f.name}
                    title={f.name}
                    aria-label={f.name}
                    aria-pressed={i === finish}
                    onClick={() => setFinish(i)}
                    style={{ background: f.color }}
                  />
                ))}
              </div>
              <span className="silo-control-divider" />
              <button
                className="silo-icon"
                title={lit ? 'Turn light off' : 'Turn light on'}
                aria-label="Light"
                aria-pressed={lit}
                onClick={() => setLit(!lit)}
              >
                <Sun size={18} />
              </button>
              <button
                className="silo-icon"
                title={moving ? 'Pause movement' : 'Resume movement'}
                aria-label={moving ? 'Pause movement' : 'Resume movement'}
                aria-pressed={!moving}
                disabled={reduced}
                onClick={() => setMoving(!moving)}
              >
                {moving ? <Pause size={17} /> : <Play size={17} />}
              </button>
              <button
                className="silo-icon"
                title="Rotate lamp"
                aria-label="Rotate lamp"
                onClick={() => setAngle(angle + Math.PI / 4)}
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
          <span className="silo-hero-note">
            DESIGNED TO FIND ITS OWN BALANCE.
          </span>
        </section>
        <section className="silo-intro" id="silo-details">
          <span className="silo-index">A STUDY IN BALANCE</span>
          <motion.h2 {...reveal}>
            Light takes shape.
            <br />
            <span>Space feels different.</span>
          </motion.h2>
          <motion.p {...reveal}>
            Two rings. One quiet point of balance. Orbit pairs a sculptural
            aluminum frame with a warm, continuous line of light. An object that
            belongs in a room, even when the lights are off.
          </motion.p>
        </section>
        <BalanceStory />
        <MovingType />
        <section className="silo-detail-band">
          <InteriorImage />
          <motion.div className="silo-specs" {...reveal}>
            <span className="silo-index">ORBIT 01 / THE PARTICULARS</span>
            <h2>
              Considered.
              <br />
              From every angle.
            </h2>
            {[
              {
                title: 'Form & material',
                body: 'Anodized aluminum rings. A weighted, machined base. Three finishes, each with its own character.',
              },
              {
                title: 'Light & atmosphere',
                body: 'A warm 2700 K light source, diffused around the inner ring. Designed for a softer end to the day.',
              },
              {
                title: 'Dimensions',
                body: 'Height 480 mm. Ring diameter 360 mm. Base diameter 200 mm. A compact presence for a desk or side table.',
              },
            ].map((item, i) => (
              <motion.div
                className="silo-accordion"
                key={item.title}
                initial={{ opacity: reduced ? 1 : 0, x: reduced ? 0 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: reduced ? 0 : 0.6,
                  delay: reduced ? 0 : i * 0.12,
                }}
              >
                <button
                  aria-expanded={open === i}
                  aria-controls={`silo-spec-${i}`}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  {item.title}
                  {open === i ? <Minus size={18} /> : <Plus size={18} />}
                </button>
                <motion.div
                  id={`silo-spec-${i}`}
                  inert={open !== i}
                  aria-hidden={open !== i}
                  initial={false}
                  animate={{
                    height: open === i ? 'auto' : 0,
                    opacity: open === i ? 1 : 0,
                  }}
                  transition={{ duration: reduced ? 0 : 0.35 }}
                  style={{ overflow: 'hidden' }}
                >
                  <p>{item.body}</p>
                </motion.div>
              </motion.div>
            ))}
            <small>
              Independent design concept. Specifications are illustrative.
            </small>
          </motion.div>
        </section>
        <section className="silo-closing">
          <span className="silo-index">OBJECTS WITH A POINT OF VIEW</span>
          <motion.p {...reveal}>
            Less, but with
            <br />
            <em>a little more feeling.</em>
          </motion.p>
          <a href="#silo-object">
            Take another look <ArrowUpRight size={20} />
          </a>
        </section>
      </main>
      <footer className="silo-footer" id="silo-footer">
        <motion.div className="silo-footer-top" {...reveal}>
          <div>
            <span>HAVE SOMETHING IN MIND?</span>
            <a href="mailto:studio@example.com?subject=SILO%20studio%20inquiry">
              Let&apos;s make space.
              <ArrowUpRight />
            </a>
            <small>Concept studio / demo contact address</small>
          </div>
          <a
            href="#silo-top"
            className="silo-back"
            aria-label="Back to top"
            title="Back to top"
          >
            <ArrowUp size={24} />
          </a>
        </motion.div>
        <FooterWordmark />
        <div className="silo-footer-bottom">
          <span>© {new Date().getFullYear()} SILO STUDIO</span>
          <span>INDEPENDENT BY DESIGN.</span>
          <Link href="/">
            All showcases <ArrowUpRight size={14} />
          </Link>
        </div>
      </footer>
    </>
  );
}
