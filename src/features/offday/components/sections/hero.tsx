'use client';
import { JourneyAnchor } from '@/features/offday/components/experience/product-journey';
import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowUpRight, MoveHorizontal } from 'lucide-react';
import { FLAVORS } from '@/features/offday/lib/products';
import { Sun } from '@/features/offday/components/ui/sun';
export function Hero() {
  const [flavor, setFlavor] = useState(FLAVORS[0]);
  const reduced = useReducedMotion();
  return (
    <section
      className="hero"
      style={{ backgroundColor: flavor.background }}
      aria-labelledby="hero-title"
    >
      <div className="hero-topline">
        <span>FOR THE DAYS THAT BECOME STORIES.</span>
        <span>SPARKLING ENERGY · 250 mL</span>
      </div>
      <motion.h1
        id="hero-title"
        initial={{ opacity: 0, y: reduced ? 0 : 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
      >
        <span>GOOD</span>
        <span>ENERGY.</span>
      </motion.h1>
      <JourneyAnchor className="hero-can" stage="hero" flavor={flavor} />
      <div className="hero-side">
        <span className="tiny-plus">+</span>
        <p>
          A little spark.
          <br />A lot of possibility.
        </p>
      </div>
      <div className="hero-stamp">
        <Sun />
        <span>
          BIG
          <br />
          DAY
          <br />
          ENERGY
        </span>
      </div>
      <div className="hero-flavor">
        <span className="eyebrow">CURRENT OBSESSION</span>
        <strong aria-live="polite">{flavor.name}</strong>
        <div className="flavor-dots" role="group" aria-label="Preview a flavor">
          {FLAVORS.map((item) => (
            <button
              key={item.id}
              title={item.name}
              aria-label={`Preview ${item.name}`}
              aria-pressed={flavor.id === item.id}
              onClick={() => setFlavor(item)}
              style={{ background: item.label }}
            />
          ))}
        </div>
      </div>
      <div className="hero-cta">
        <p>
          Good energy. Great detours.
          <br />
          Take the long way home.
        </p>
        <a href="#shop" className="button button-cream">
          Meet your new plus-one <ArrowUpRight size={18} />
        </a>
      </div>
      <div className="hero-bottom">
        <a href="#flavor-flight">
          TAKE A SIP. SCROLL A LITTLE. <ArrowDown size={13} />
        </a>
        <span>
          <MoveHorizontal size={14} /> GO ON, GIVE IT A SPIN.
        </span>
        <span>01 — 03 / THE DAILY DETOUR</span>
      </div>
    </section>
  );
}
