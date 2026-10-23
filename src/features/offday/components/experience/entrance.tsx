'use client';
import dynamic from 'next/dynamic';
import { SceneBoundary } from '@/features/offday/components/three/scene-boundary';
import { FLAVORS } from '@/features/offday/lib/products';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
const EntranceScene = dynamic(
  () => import('@/features/offday/components/three/entrance-scene'),
  { ssr: false },
);
const ReadyContext = createContext(true);
export const useExperienceReady = () => useContext(ReadyContext);
export function Entrance({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<'loading' | 'can' | 'done'>('loading');
  const [percent, setPercent] = useState(0);
  const target = useRef(0);
  const rendererMarked = useRef(false);
  const reduced = useReducedMotion();
  const done = useCallback(() => setPhase('done'), []);
  const rendererReady = useCallback(() => {
    if (rendererMarked.current) return;
    rendererMarked.current = true;
    target.current = Math.min(100, target.current + 40);
  }, []);
  useEffect(() => {
    let cancelled = false;
    const mark = (value: number) => {
      if (!cancelled) target.current = Math.min(100, target.current + value);
    };
    const picture = new Image();
    picture.src = '/offday/images/offday-court.png';
    void picture.decode().then(
      () => mark(30),
      () => mark(30),
    );
    void document.fonts.ready.then(() => mark(30));
    const interval = window.setInterval(
      () => setPercent((previous) => Math.min(target.current, previous + 2)),
      35,
    );
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);
  useEffect(() => {
    if (percent < 100 || phase !== 'loading') return;
    const timer = setTimeout(() => setPhase('can'), 450);
    return () => clearTimeout(timer);
  }, [percent, phase]);
  useEffect(() => {
    if (phase === 'done') return;
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timeout = setTimeout(done, reduced ? 0 : 15000);
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') done();
    };
    window.addEventListener('keydown', key);
    return () => {
      clearTimeout(timeout);
      document.body.style.overflow = before;
      window.removeEventListener('keydown', key);
    };
  }, [phase, reduced, done]);
  return (
    <ReadyContext.Provider value={phase === 'done'}>
      <AnimatePresence>
        {phase !== 'done' && (
          <motion.div
            className={`loading-screen phase-${phase}`}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 1.2 }}
          >
            <a href="#" className="wordmark">
              offday<span>®</span>
            </a>
            <button className="loader-skip" onClick={done}>
              Skip intro ↗
            </button>
            <div className="loader-scene">
              <SceneBoundary flavor={FLAVORS[0]}>
                <EntranceScene
                  running={phase === 'can'}
                  onReady={rendererReady}
                  onComplete={done}
                />
              </SceneBoundary>
            </div>
            <div className="loader-readout" aria-live="polite">
              <span className="eyebrow">A GOOD DAY IS LOADING.</span>
              <div className="loader-number">
                {percent}
                <span>%</span>
              </div>
              <div
                className="loader-progress"
                role="progressbar"
                aria-label="Preparing the experience"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <i style={{ transform: `scaleX(${percent / 100})` }} />
              </div>
              <small>LOADING THE LIGHT. THE FLAVOR. THE GOOD STUFF.</small>
            </div>
            <span className="loader-bottom">GOOD ENERGY. GREAT DETOURS.</span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        inert={phase !== 'done'}
        aria-hidden={phase !== 'done'}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'done' ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 1.8 }}
      >
        {children}
      </motion.div>
    </ReadyContext.Provider>
  );
}
