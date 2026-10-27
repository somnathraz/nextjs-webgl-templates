'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowDown,
  ArrowUpRight,
  Eye,
  Maximize2,
  Plus,
  Scan,
  Sparkles,
} from 'lucide-react';
import { useExperience } from './hooks/use-experience';
import { ProductStudio } from './components/product-studio';
import { ExperienceNotes } from './components/experience-notes';
import type { VelaSettings } from './lib/experience';

const Headset = dynamic(() => import('./components/headset'), { ssr: false });
const chapters = [
  {
    number: '01',
    label: 'THE FEELING',
    title: ['Less between you', 'and your world.'],
    body: 'Soft where it touches. Precise where it matters. Every curve brings the experience a little closer.',
    detail: 'WOVEN COMFORT. SCULPTED ALUMINUM.',
  },
  {
    number: '02',
    label: 'THE PERSPECTIVE',
    title: ['A world of detail.', 'Inside every layer.'],
    body: 'An intricate assembly, designed to disappear. Glass, light, and optics working together in one seamless view.',
    detail: 'EXPLORE THE OPTICAL ASSEMBLY',
  },
  {
    number: '03',
    label: 'THE POSSIBILITY',
    title: ['This is where', 'the room ends.'],
    body: 'And your next experience begins. Keep scrolling. There’s a whole world on the other side.',
    detail: 'STEP THROUGH THE GLASS',
  },
];

export function VelaHome() {
  const { signal, surface, chapter, dark, inStudio } = useExperience();
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const [settings, setSettings] = useState<VelaSettings>({
    finish: 'cloud',
    view: 'front',
  });
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => {
    setReady(true);
    setFailed(true);
  }, []);
  useEffect(() => {
    if (ready) return;
    const timeout = window.setTimeout(onFailure, 18000);
    return () => window.clearTimeout(timeout);
  }, [ready, onFailure]);

  function jump(index: number) {
    const section = document.getElementById('vela-design');
    if (section)
      window.scrollTo({
        top:
          section.offsetTop +
          (section.offsetHeight - window.innerHeight) *
            [0.12, 0.46, 0.8][index],
        behavior: reduced ? 'instant' : 'smooth',
      });
  }

  return (
    <div
      ref={surface}
      className={`vela-experience ${ready ? 'is-ready' : ''} ${dark ? 'is-immersed' : ''} ${inStudio ? 'is-studio' : ''}`}
    >
      <a className="vela-skip" href="#vela-main">
        Skip to experience
      </a>
      <div className="vela-backdrop" aria-hidden="true">
        <div className="vela-world-image">
          <Image
            src="/vela/alpine-dawn.png"
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div />
        </div>
      </div>
      <div className="vela-stage" aria-hidden="true">
        {!failed ? (
          <Headset
            signal={signal}
            settings={settings}
            reduced={!!reduced}
            onReady={onReady}
            onFailure={onFailure}
          />
        ) : (
          <div className="vela-render-fallback">A new perspective awaits.</div>
        )}
      </div>
      <header className="vela-nav">
        <a
          href="#vela-main"
          className="vela-logo"
          aria-label="Vela, back to top"
        >
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M4 8l12 20L28 8M10 8l6 10 6-10" />
          </svg>
          vela<span>spatial</span>
        </a>
        <nav aria-label="Vela navigation">
          <a href="#vela-design">Design</a>
          <a href="#vela-world">Experience</a>
          <a href="#vela-studio" className="vela-nav-cta">
            Explore Vela <ArrowUpRight size={13} />
          </a>
        </nav>
      </header>

      <main id="vela-main">
        <section className="vela-hero">
          <motion.div
            className="vela-hero-title"
            initial={{ opacity: 0, y: reduced ? 0 : 20 }}
            animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 20 }}
            transition={{ duration: reduced ? 0 : 1, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <p className="vela-eyebrow">INTRODUCING VELA</p>
            <h1>
              A new sense
              <br />
              <span>of possibility.</span>
            </h1>
          </motion.div>
          <div className="vela-hero-side">
            <span>01 — VELA SPATIAL</span>
            <i />
            FORM MEETS FEELING
          </div>
          <div className="vela-hero-bottom">
            <p>
              A closer connection.
              <br />
              <span>A little more world.</span>
            </p>
            <a href="#vela-design" className="vela-scroll">
              <span>Take a closer look</span>
              <span>
                <ArrowDown size={18} />
              </span>
            </a>
            <p className="vela-hero-note">
              DESIGNED FOR THE WAY
              <br />
              YOU SEE WHAT’S NEXT.
            </p>
          </div>
          {!ready ? (
            <div className="vela-preparing" role="status">
              <span /> Bringing Vela into view
            </div>
          ) : null}
        </section>

        <section
          className="vela-design"
          id="vela-design"
          aria-label="Discover the design"
        >
          <div className="vela-design-stage">
            <div className="vela-design-heading">
              <span>A CLOSER LOOK</span>
              <span>{chapters[chapter].number} / 03</span>
            </div>
            <div className="vela-chapter-copy">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={chapter}
                  initial={{ opacity: 0, y: reduced ? 0 : 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduced ? 0 : -15 }}
                  transition={{ duration: reduced ? 0 : 0.35 }}
                >
                  <p className="vela-eyebrow">
                    {chapters[chapter].number} / {chapters[chapter].label}
                  </p>
                  <h2>
                    {chapters[chapter].title[0]}
                    <br />
                    <span>{chapters[chapter].title[1]}</span>
                  </h2>
                  <p className="vela-chapter-body">{chapters[chapter].body}</p>
                  <div className="vela-chapter-detail">
                    <Plus size={12} />
                    {chapters[chapter].detail}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <nav className="vela-chapter-nav" aria-label="Design chapters">
              {chapters.map((item, i) => (
                <button
                  type="button"
                  key={item.number}
                  aria-current={i === chapter ? 'step' : undefined}
                  onClick={() => jump(i)}
                >
                  <span>{item.number}</span>
                  {
                    ['Made to feel right', 'A deeper look', 'Beyond the glass'][
                      i
                    ]
                  }
                </button>
              ))}
            </nav>
          </div>
        </section>

        <section
          className={`vela-world ${quiet ? 'is-quiet' : ''}`}
          id="vela-world"
          aria-labelledby="vela-world-title"
        >
          <div className="vela-world-copy">
            <p className="vela-eyebrow">YOUR WORLD. EXPANDED.</p>
            <h2 id="vela-world-title">
              Be here.
              <br />
              <span>And anywhere.</span>
            </h2>
            <p>
              A change of scenery.
              <br />A completely different feeling.
            </p>
          </div>
          <div className="vela-world-marker">
            <span />
            <p>
              THE DOLOMITES
              <br />
              <small>AN IMMERSIVE ENVIRONMENT</small>
            </p>
          </div>
          <div className="vela-environment-controls">
            <span>
              <Scan size={16} /> Alpine dawn
            </span>
            <button
              type="button"
              aria-pressed={quiet}
              onClick={() => setQuiet(!quiet)}
            >
              {quiet ? <Eye size={15} /> : <Maximize2 size={15} />}
              {quiet ? 'Show interface' : 'Just the view'}
            </button>
          </div>
          <a className="vela-world-next" href="#vela-studio">
            Make it yours <ArrowDown size={16} />
          </a>
        </section>

        <ProductStudio settings={settings} onChange={setSettings} />
        <section className="vela-final">
          <p className="vela-eyebrow">
            <Sparkles size={13} /> ONE SMALL SHIFT. A WHOLE NEW WORLD.
          </p>
          <h2>
            The best view
            <br />
            <span>is the one ahead.</span>
          </h2>
          <a href="#vela-main" className="vela-button vela-button-dark">
            Experience it again <ArrowUpRight size={16} />
          </a>
        </section>
        <footer className="vela-footer">
          <Link href="/" className="vela-footer-logo">
            vela.
          </Link>
          <ExperienceNotes />
          <Link href="/">
            All showcases <ArrowUpRight size={13} />
          </Link>
          <span>ORIGINAL SPATIAL CONCEPT © 2026</span>
        </footer>
      </main>
      <div className="vela-progress" aria-hidden="true">
        <div />
      </div>
    </div>
  );
}
