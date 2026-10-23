'use client';
import dynamic from 'next/dynamic';
import { ArrowDown, ArrowUpRight, Plus } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEntranceReady } from '@/features/aura/components/experience/entrance';
import { FINISHES } from '@/features/aura/lib/product';
const ProductScene = dynamic(
  () => import('@/features/aura/components/product/product-scene'),
  { ssr: false },
);
export function Hero() {
  const reduced = useReducedMotion();
  const ready = useEntranceReady();
  return (
    <section className="hero" aria-labelledby="hero-title">
      <motion.div
        className="hero-heading"
        initial={{ opacity: 0, y: reduced ? 0 : 25 }}
        animate={{ opacity: ready ? 1 : 0, y: ready || reduced ? 0 : 25 }}
        transition={{ duration: 1 }}
      >
        <p className="eyebrow">LESS NOISE. MORE FEELING.</p>
        <h1 id="hero-title">AURA ONE</h1>
      </motion.div>
      <motion.div
        className="hero-product"
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.15 }}
      >
        {ready && <ProductScene finish={FINISHES[0]} intro />}
      </motion.div>
      <div className="hero-caption">
        <span className="small-cross">+</span>
        <span>
          Precision in every detail.
          <br />
          Presence in every note.
        </span>
      </div>
      <div className="hero-index">
        <span>01 / 03</span>
        <div />
        <span>DESIGNED TO DISAPPEAR.</span>
      </div>
      <div className="hero-bottom">
        <div>
          <p className="hero-promise">The world can wait.</p>
          <p>Meet your own little world of sound.</p>
        </div>
        <a className="button button-dark" href="#configure">
          Discover Aura One <ArrowUpRight size={16} />
        </a>
        <a href="#design" className="scroll-cue">
          <span>SCROLL TO EXPLORE</span>
          <ArrowDown size={17} />
        </a>
      </div>
      <span className="hero-coordinate">
        <Plus size={13} /> FORM. FEELING. FREQUENCY.
      </span>
    </section>
  );
}
