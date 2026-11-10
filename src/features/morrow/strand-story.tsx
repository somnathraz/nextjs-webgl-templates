'use client';
import dynamic from 'next/dynamic';
import { Component, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from 'motion/react';
import { Pause, Play, ArrowDown } from 'lucide-react';

const Scene = dynamic(() => import('./sculpted-avatar'), { ssr: false });
class SceneBoundary extends Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="mw-strand-fallback">
        Every strand.
        <br />A little possibility.
      </div>
    ) : (
      this.props.children
    );
  }
}
export function StrandStory() {
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [gender, setGender] = useState<'men' | 'women'>('men');
  const [look, setLook] = useState(0);
  const visible = useInView(stage, { margin: '100px' });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = value < 0.33 ? 0 : value < 0.7 ? 1 : 2;
    setLook((current) => (current === next ? current : next));
  });
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const firstOpacity = useTransform(
    () => 1 - clamp((scrollYProgress.get() - 0.25) / 0.08),
  );
  const secondOpacity = useTransform(() =>
    Math.min(
      clamp((scrollYProgress.get() - 0.33) / 0.08),
      1 - clamp((scrollYProgress.get() - 0.62) / 0.08),
    ),
  );
  const thirdOpacity = useTransform(() =>
    clamp((scrollYProgress.get() - 0.7) / 0.08),
  );
  const x = useTransform(scrollYProgress, [0, 1], ['12%', '-30%']);
  return (
    <section
      ref={ref}
      className={`mw-strand-story ${reduced ? 'is-still' : ''}`}
    >
      <div className="mw-strand-pin">
        <div className="mw-strand-top">
          <span className="mw-eyebrow">THE ART IS IN THE DETAILS.</span>
          <div className="mw-avatar-styles" role="group" aria-label="Avatar">
            <button
              aria-pressed={gender === 'men'}
              onClick={() => setGender('men')}
            >
              Men
            </button>
            <button
              aria-pressed={gender === 'women'}
              onClick={() => setGender('women')}
            >
              Women
            </button>
          </div>
          <button
            className="mw-icon"
            disabled={reduced}
            aria-label={paused ? 'Resume sculpture' : 'Pause sculpture'}
            title={paused ? 'Resume sculpture' : 'Pause sculpture'}
            onClick={() => setPaused(!paused)}
          >
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
        <motion.div
          className="mw-strand-type"
          style={reduced ? undefined : { x }}
          aria-hidden="true"
        >
          natural movement
        </motion.div>
        <div
          ref={stage}
          className="mw-strand-canvas"
          role="img"
          aria-label={`${gender === 'men' ? 'Male' : 'Female-styled'} sculpted avatar with a hairstyle that changes as you scroll`}
        >
          <SceneBoundary>
            <Scene
              gender={gender}
              progress={scrollYProgress}
              reduced={reduced}
              paused={paused}
              visible={visible}
            />
          </SceneBoundary>
        </div>
        <div className="mw-strand-copy">
          <motion.div style={{ opacity: reduced ? 1 : firstOpacity }}>
            <span>01 / LISTEN</span>
            <h2>
              Every strand.
              <br />
              <em>Every bit of you.</em>
            </h2>
            <p>
              We start with your texture.
              <br />
              Not somebody else&apos;s rules.
            </p>
          </motion.div>
          {!reduced && (
            <>
              <motion.div style={{ opacity: secondOpacity }}>
                <span>02 / SHAPE</span>
                <h2>
                  A little craft.
                  <br />
                  <em>A lot of character.</em>
                </h2>
                <p>
                  A shape that moves with you.
                  <br />
                  And grows out beautifully.
                </p>
              </motion.div>
              <motion.div style={{ opacity: thirdOpacity }}>
                <span>03 / FEEL</span>
                <h2>
                  Let it move.
                  <br />
                  <em>Let it be yours.</em>
                </h2>
                <p>
                  Good hair isn&apos;t one look.
                  <br />
                  It&apos;s how you feel wearing it.
                </p>
              </motion.div>
            </>
          )}
        </div>
        <div className="mw-strand-bottom">
          <span aria-live="polite">
            0{(reduced ? 0 : look) + 1} /{' '}
            {
              (gender === 'men'
                ? ['TEXTURED CROP', 'LIFTED QUIFF', 'SWEPT BACK']
                : ['SOFT BOB', 'SHOULDER LAYERS', 'LONG LAYERS'])[
                reduced ? 0 : look
              ]
            }
          </span>
          <a
            href="/models/morrow/ATTRIBUTION.md"
            title="3D model attribution"
            aria-label="3D model credits"
          >
            MODEL CREDITS
          </a>
          <ArrowDown size={18} />
        </div>
        <motion.div
          className="mw-strand-progress"
          style={{ scaleX: reduced ? 1 : scrollYProgress }}
        />
      </div>
    </section>
  );
}
