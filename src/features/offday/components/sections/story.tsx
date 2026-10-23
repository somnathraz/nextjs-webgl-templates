'use client';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FLAVORS } from '@/features/offday/lib/products';
import { useStoryScroll } from '@/features/offday/hooks/use-story-scroll';
const IngredientScene = dynamic(
  () => import('@/features/offday/components/three/ingredient-scene'),
  { ssr: false },
);
const CHAPTERS = [
  {
    title: 'REFRESH.\nYOUR WAY.',
    body: 'Crisp citrus notes. A bright little fizz. A cold can made for the first sip of a fresh afternoon.',
    tag: '01 / THE FRESH START',
    detail: 'Citrus-inspired flavor',
    flavor: 2,
    color: '#e4e9ce',
    label: 'BRIGHT / CRISP / CITRUS',
  },
  {
    title: 'RESET.\nYOUR PACE.',
    body: 'Step out of the scroll. Take the scenic route. Make room for a slower sip and a little time that’s just yours.',
    tag: '02 / THE LITTLE RESET',
    detail: 'A moment to yourself',
    flavor: 1,
    color: '#eddde0',
    label: 'PAUSE / SIP / REPEAT',
  },
  {
    title: 'RECHARGE.\nYOUR DAY.',
    body: 'A green-tea-inspired energy concept, built around bright flavor and a big appetite for whatever comes next.',
    tag: '03 / THE NEXT CHAPTER',
    detail: 'Green-tea energy concept',
    flavor: 0,
    color: '#f2e4c8',
    label: 'FRESH IDEAS / GOOD ENERGY',
  },
];
export function Story() {
  const { section, chapter } = useStoryScroll();
  const reduced = useReducedMotion();
  const current = CHAPTERS[chapter];
  return (
    <section
      id="flavors"
      className="story benefits-story"
      ref={section}
      style={{ background: current.color }}
    >
      <div className="story-sticky">
        <div className="story-copy">
          <p className="eyebrow">GOOD INSIDE. GOOD OUT THERE.</p>
          <div className="story-text" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={chapter}
                initial={{ opacity: 0, y: reduced ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -15 }}
                transition={{ duration: 0.25 }}
              >
                <h2>{current.title}</h2>
                <p>{current.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="story-progress">
            {CHAPTERS.map((_, i) => (
              <span key={i} className={i === chapter ? 'active' : ''} />
            ))}
            <small>{current.tag}</small>
          </div>
        </div>
        <div
          className="benefits-scene"
          data-can-stage="benefits"
          data-can-flavor={FLAVORS[current.flavor].id}
        >
          <IngredientScene flavor={FLAVORS[current.flavor]} />
          <div className="ingredient-label">
            <i />
            <strong>{current.detail}</strong>
            <small>{current.label}</small>
          </div>
        </div>
        <span className="story-footnote">
          ILLUSTRATIVE INGREDIENTS AND BENEFITS FOR THIS BRAND CONCEPT.
        </span>
      </div>
    </section>
  );
}
