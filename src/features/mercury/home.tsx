'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Move3d, Droplet } from 'lucide-react';
import { TemplateDownloadLink } from '@/components/template-download-link';
import { useMercurySignal } from './hooks/use-mercury-signal';
import { Reveal } from './components/reveal';
import { Intro } from './components/intro';

const MercuryScene = dynamic(() => import('./components/mercury-scene'), {
  ssr: false,
  loading: () => <div className="mc-canvas-fallback" />,
});

const CHAPTERS = [
  {
    index: '01',
    kicker: 'SURFACE',
    title: 'A mirror with no edges.',
    body: 'There is no texture and no environment map file. Every reflection you see is a procedural studio — key light, cool fill, and two sharp softboxes — sampled live along each reflected ray. Move the light of your attention and the metal answers.',
  },
  {
    index: '02',
    kicker: 'FORM',
    title: 'Many drops, one body.',
    body: 'The blob is five orbiting spheres fused by a smooth-minimum field. They pull apart and flow back together every second, so the silhouette is never the same frame twice — liquid, not geometry.',
  },
  {
    index: '03',
    kicker: 'TOUCH',
    title: 'It reaches for the cursor.',
    body: 'A droplet tracks your pointer and melts into the mass where you hover; quick movement sends a ripple across the skin. Drag anywhere to orbit the whole form and watch the reflections slide.',
  },
  {
    index: '04',
    kicker: 'FLOW',
    title: 'Scroll, and it melts.',
    body: 'As the page descends, the satellites spread, the body elongates, and the camera eases inward. The motion of the page is the motion of the material — one continuous, scroll-bound choreography.',
  },
];

const MATERIALS = [
  'MERCURY',
  'CHROME',
  'QUICKSILVER',
  'LIQUID METAL',
  'MIRROR',
  'MOLTEN STEEL',
];

export function MercuryHome() {
  const signal = useMercurySignal();
  return (
    <>
      <Intro />

      <div className="mc-canvas" aria-hidden="true">
        <MercuryScene signal={signal} />
      </div>
      <div className="mc-grain" aria-hidden="true" />

      <header className="mc-nav">
        <Link className="mc-logo" href="/mercury">
          <span className="mc-logo-mark" />
          MERCURY
        </Link>
        <nav aria-label="Mercury navigation">
          <a href="#mc-story">The material</a>
          <a href="#mc-specs">How it works</a>
          <Link href="/">
            All showcases <ArrowUpRight size={11} />
          </Link>
          <TemplateDownloadLink>
            Download ZIP <ArrowUpRight size={11} />
          </TemplateDownloadLink>
        </nav>
      </header>

      <main id="mc-main" className="mc-shell">
        <section className="mc-hero">
          <span className="mc-eyebrow">
            <span className="mc-dot" /> REAL-TIME · RAYMARCHED · ONE FRAGMENT
            SHADER
          </span>
          <h1>
            Liquid chrome,
            <br />
            <span>poured in real time.</span>
          </h1>
          <p>
            No video, no 3D model, no texture. Every pixel traces a ray into a
            field of molten metal and reflects a studio that only exists in the
            shader. It flows, it ripples, and it reaches for your cursor.
          </p>
          <div className="mc-hero-actions">
            <a className="mc-button" href="#mc-story">
              Follow it down <ArrowDown size={16} />
            </a>
            <span className="mc-hint">
              <Move3d size={14} /> Drag to orbit · move to disturb
            </span>
          </div>
          <dl className="mc-readout">
            <div>
              <dt>Surface</dt>
              <dd>
                SDF<span>metaballs</span>
              </dd>
            </div>
            <div>
              <dt>Lighting</dt>
              <dd>
                env<span>procedural</span>
              </dd>
            </div>
            <div>
              <dt>Reflection</dt>
              <dd>
                RGB<span>chromatic</span>
              </dd>
            </div>
            <div>
              <dt>Draw calls</dt>
              <dd>
                1<span>fullscreen</span>
              </dd>
            </div>
          </dl>
        </section>

        <div className="mc-marquee" aria-hidden="true">
          <div className="mc-marquee-row">
            {[...MATERIALS, ...MATERIALS].map((m, i) => (
              <span key={i}>
                <Droplet size={12} /> {m}
              </span>
            ))}
          </div>
        </div>

        <section className="mc-story" id="mc-story">
          {CHAPTERS.map((c, i) => (
            <Reveal
              as="article"
              key={c.index}
              className={`mc-chapter mc-chapter--${i % 2 ? 'right' : 'left'}`}
            >
              <div className="mc-chapter-card">
                <span className="mc-chapter-kicker">
                  {c.index} / {c.kicker}
                </span>
                <h2>{c.title}</h2>
                <p>{c.body}</p>
              </div>
            </Reveal>
          ))}
        </section>

        <section className="mc-specs" id="mc-specs">
          <Reveal>
            <span className="mc-eyebrow">HOW IT WORKS</span>
            <h2>Metal, by distance.</h2>
          </Reveal>
          <div className="mc-spec-grid">
            {[
              [
                'Signed-distance field',
                'Five spheres plus a cursor droplet, fused with a polynomial smooth-minimum into one breathing body.',
              ],
              [
                'Sphere tracing',
                'Each fragment marches its ray to the surface in under 96 steps, under-relaxed so the ripple field stays stable.',
              ],
              [
                'Procedural studio',
                'The environment is pure math — a skylight gradient, a warm key, a cool fill, and two sharp softbox streaks.',
              ],
              [
                'Chromatic reflection',
                'The reflected ray is split per colour channel, so the grazing edge breaks into that oily, jewel-like rainbow.',
              ],
              [
                'Fresnel + march AO',
                'A Fresnel term lifts the rim toward white; the ray-march cost doubles as cheap ambient occlusion in the creases.',
              ],
              [
                'Raw Three.js + R3F',
                'One fullscreen plane, a single ShaderMaterial, no post-processing dependency. Honours reduced motion.',
              ],
            ].map(([t, b], i) => (
              <Reveal key={t} delay={(i % 3) * 70}>
                <strong>{t}</strong>
                <p>{b}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mc-final">
          <Reveal>
            <span className="mc-eyebrow">FULL SOURCE. NO LOCK-IN.</span>
            <h2>
              Pour it into
              <br />
              <em>your own thing.</em>
            </h2>
            <div className="mc-hero-actions mc-final-actions">
              <TemplateDownloadLink className="mc-button">
                Take the code <ArrowUpRight size={16} />
              </TemplateDownloadLink>
              <Link className="mc-quiet-link" href="/">
                Back to the gallery <span>↗</span>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="mc-footer">
        <Link href="/" className="mc-logo">
          <span className="mc-logo-mark" />
          MERCURY
        </Link>
        <span>MC—001 · LIQUID CHROME RENDER</span>
        <a href="#mc-main">BACK TO TOP ↑</a>
      </footer>
    </>
  );
}
