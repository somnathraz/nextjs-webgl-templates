'use client';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useScrollProgress } from '@/features/aura/hooks/use-scroll-progress';
import { FINISHES } from '@/features/aura/lib/product';
import { STORY_STEPS } from '@/features/aura/lib/story';
const ProductScene = dynamic(
  () => import('@/features/aura/components/product/product-scene'),
  { ssr: false },
);
export function DesignStory() {
  const { element, progress, step } = useScrollProgress();
  const annotation = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const chapter = STORY_STEPS[step];
  return (
    <section
      id="design"
      className="design-story"
      ref={element}
      aria-label="Explore the form, sound, and fit"
    >
      <div className="story-sticky">
        <div className="story-copy">
          <p className="eyebrow">
            0{step + 1} / 03 — {chapter.label}
          </p>
          <div
            className="story-text-stage"
            aria-live="polite"
            aria-atomic="true"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: reduced ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -14 }}
                transition={{ duration: reduced ? 0 : 0.3 }}
              >
                <h2>
                  {chapter.title}
                  <br />
                  <span>{chapter.emphasis}</span>
                </h2>
                <p>{chapter.description}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="story-chapters" aria-label="Story progress">
            {STORY_STEPS.map((item, index) => (
              <span
                key={item.label}
                className={index === step ? 'active' : ''}
                aria-current={index === step ? 'step' : undefined}
              >
                <i />
                {item.label.replace('THE ', '')}
              </span>
            ))}
          </div>
        </div>
        <div className="story-product">
          <ProductScene
            finish={FINISHES[1]}
            progress={progress}
            annotation={annotation}
          />
          <div
            className="product-annotation"
            ref={annotation}
            aria-hidden="true"
          >
            <i />
            <span>
              <strong>{chapter.detail}</strong>
              <small>{chapter.note}</small>
            </span>
          </div>
        </div>
        <span className="story-bottom">
          SCROLL TO DISCOVER &nbsp; — &nbsp; FORM / SOUND / FIT
        </span>
      </div>
    </section>
  );
}
