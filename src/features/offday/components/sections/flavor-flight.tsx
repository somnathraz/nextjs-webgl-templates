'use client';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { FLAVORS } from '@/features/offday/lib/products';
import { useStoryScroll } from '@/features/offday/hooks/use-story-scroll';
const FruitScene = dynamic(
  () => import('@/features/offday/components/three/fruit-scene'),
  { ssr: false },
);
export function FlavorFlight() {
  const { section, chapter } = useStoryScroll();
  const flavor = FLAVORS[chapter];
  const reduced = useReducedMotion();
  function go(index: number) {
    if (!section.current) return;
    const top =
      section.current.offsetTop +
      (section.current.offsetHeight - window.innerHeight) * ((index + 0.5) / 3);
    window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' });
  }
  return (
    <section
      id="flavor-flight"
      ref={section}
      className="flavor-flight"
      style={{ background: flavor.background }}
    >
      <div className="flight-sticky">
        <p className="eyebrow flight-kicker">FROM FIRST SIP TO FULL SEND.</p>
        <h2 className="flight-title">
          FLAVOR
          <br />
          TAKES
          <br />
          <span>FLIGHT.</span>
        </h2>
        <div
          className="flight-scene"
          data-can-stage="flight"
          data-can-flavor={flavor.id}
        >
          <FruitScene flavor={flavor} />
        </div>
        <div className="flight-copy">
          <span className="eyebrow">THE FLAVOR FILES / N° {flavor.number}</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={flavor.id}
              initial={{ opacity: 0, y: reduced ? 0 : 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h3>{flavor.name}</h3>
              <p>
                {flavor.note}
                <br />A full-on flavor. An off-script kind of day.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flight-picker" aria-label="Flavor chapters">
          {FLAVORS.map((f, i) => (
            <button
              key={f.id}
              onClick={() => go(i)}
              aria-pressed={i === chapter}
            >
              <span>{f.number}</span>
              {f.name}
            </button>
          ))}
        </div>
        <span className="flight-scroll">
          KEEP GOING. THERE’S MORE GOOD INSIDE. <ArrowDown size={14} />
        </span>
      </div>
    </section>
  );
}
