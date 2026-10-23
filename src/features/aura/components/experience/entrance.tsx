'use client';
import dynamic from 'next/dynamic';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FINISHES } from '@/features/aura/lib/product';
const ProductScene = dynamic(
  () => import('@/features/aura/components/product/product-scene'),
  { ssr: false },
);
const EntranceContext = createContext(true);
export const useEntranceReady = () => useContext(EntranceContext);

/** The intro never gates access indefinitely: skip, reduced motion, and a timeout all release it. */
export function Entrance({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<'loading' | 'arrive' | 'zoom'>('loading');
  const reduced = useReducedMotion();
  const finish = useCallback(() => setReady(true), []);
  useEffect(() => {
    if (ready) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timeout = window.setTimeout(finish, reduced ? 0 : 8000);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [ready, reduced, finish]);
  return (
    <EntranceContext.Provider value={ready}>
      <AnimatePresence>
        {!ready && (
          <motion.div
            className="entrance"
            data-phase={phase}
            key="entrance"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.85 }}
            aria-label="Aura opening animation"
          >
            <div className="entrance-brand">
              aura<span>®</span>
            </div>
            <div className="entrance-scene">
              <ProductScene
                finish={FINISHES[0]}
                portal
                onEntranceComplete={finish}
                onEntrancePhase={setPhase}
              />
            </div>
            <div className="entrance-copy">
              <p className="eyebrow">LEAVE THE WORLD OUTSIDE.</p>
              <p>A little closer.</p>
              <span className="entrance-track">
                <i />
              </span>
              <small role="status">
                {phase === 'loading'
                  ? 'PREPARING YOUR EXPERIENCE'
                  : phase === 'arrive'
                    ? 'MEET AURA ONE'
                    : 'STEP INSIDE THE SOUND'}
              </small>
            </div>
            <button className="entrance-skip" onClick={finish}>
              Skip intro ↗
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="page-reveal"
        inert={!ready}
        aria-hidden={!ready}
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 1.6, delay: reduced ? 0 : 0.15 }}
      >
        {children}
      </motion.div>
      <noscript>
        <style>{`.entrance{display:none!important}.page-reveal{opacity:1!important}`}</style>
        <p className="noscript-note">
          Enable JavaScript for the interactive 3D experience.
        </p>
      </noscript>
    </EntranceContext.Provider>
  );
}
