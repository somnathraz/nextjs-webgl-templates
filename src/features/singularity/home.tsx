'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowUpRight, ArrowDown, Move3d } from 'lucide-react';
import { TemplateDownloadLink } from '@/components/template-download-link';
import { useSceneSignal } from './hooks/use-scene-signal';

const BlackholeScene = dynamic(() => import('./components/blackhole-scene'), {
  ssr: false,
  loading: () => <div className="sg-canvas-fallback" />,
});

const CHAPTERS = [
  {
    index: '01',
    kicker: 'THE PHOTON RING',
    title: 'Light that circled, then escaped.',
    body: 'That razor-thin ring of fire is light that looped the hole one or more times before flying to your eye. Nothing about it is a texture — it is the actual path of photons, bent by gravity, step by step on the GPU.',
  },
  {
    index: '02',
    kicker: 'THE ACCRETION DISK',
    title: 'A plane of plasma, folded over itself.',
    body: 'The disk is flat. You see it arcing above and below the hole because spacetime bends the light from its far side up and over the horizon. One side burns brighter — matter racing toward you is Doppler-beamed.',
  },
  {
    index: '03',
    kicker: 'GRAVITATIONAL LENSING',
    title: 'The sky, wrapped around a drain.',
    body: 'Every background star behind the hole is smeared into an Einstein ring. Drag to orbit and watch the whole starfield slide and warp as your line of sight threads the curved space around the mass.',
  },
  {
    index: '04',
    kicker: 'THE EVENT HORIZON',
    title: 'Where the math returns nothing.',
    body: 'Inside the horizon, every photon path ends at the singularity — so the center returns pure black. Keep scrolling and the camera falls inward; there is no coming back out.',
  },
];

export function SingularityHome() {
  const signal = useSceneSignal();
  return (
    <>
      <div className="sg-canvas" aria-hidden="true">
        <BlackholeScene signal={signal} />
      </div>

      <header className="sg-nav">
        <Link className="sg-logo" href="/singularity">
          <span className="sg-logo-mark" />
          SINGULARITY
        </Link>
        <nav aria-label="Singularity navigation">
          <a href="#sg-story">The phenomena</a>
          <a href="#sg-specs">How it works</a>
          <Link href="/">
            All showcases <ArrowUpRight size={11} />
          </Link>
          <TemplateDownloadLink>
            Download ZIP <ArrowUpRight size={11} />
          </TemplateDownloadLink>
        </nav>
      </header>

      <main id="sg-main" className="sg-shell">
        <section className="sg-hero">
          <span className="sg-eyebrow">
            <span className="sg-dot" /> REAL-TIME · RAYMARCHED · ONE FRAGMENT SHADER
          </span>
          <h1>
            A black hole,
            <br />
            <span>traced by hand.</span>
          </h1>
          <p>
            No video. No model. Every frame, this page fires a photon through
            curved spacetime for each pixel on your screen — and lets gravity
            decide where it lands.
          </p>
          <div className="sg-hero-actions">
            <a className="sg-button" href="#sg-story">
              Fall in <ArrowDown size={16} />
            </a>
            <span className="sg-hint">
              <Move3d size={14} /> Drag to orbit the horizon
            </span>
          </div>
          <dl className="sg-readout">
            <div>
              <dt>Mass</dt>
              <dd>
                1.0<span>M⊙ (sim)</span>
              </dd>
            </div>
            <div>
              <dt>rₛ</dt>
              <dd>
                1.0<span>units</span>
              </dd>
            </div>
            <div>
              <dt>Steps / px</dt>
              <dd>
                150<span>geodesic</span>
              </dd>
            </div>
            <div>
              <dt>Escape</dt>
              <dd>
                c<span>always</span>
              </dd>
            </div>
          </dl>
        </section>

        <section className="sg-story" id="sg-story">
          {CHAPTERS.map((c, i) => (
            <article
              key={c.index}
              className={`sg-chapter sg-chapter--${i % 2 ? 'right' : 'left'}`}
            >
              <div className="sg-chapter-card">
                <span className="sg-chapter-kicker">
                  {c.index} / {c.kicker}
                </span>
                <h2>{c.title}</h2>
                <p>{c.body}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="sg-specs" id="sg-specs">
          <span className="sg-eyebrow">HOW IT WORKS</span>
          <h2>Gravity, in a loop.</h2>
          <div className="sg-spec-grid">
            <div>
              <strong>Per-pixel geodesics</strong>
              <p>
                Each fragment marches a photon and bends its velocity toward the
                singularity with an inverse-square pull every step.
              </p>
            </div>
            <div>
              <strong>The folded disk</strong>
              <p>
                Bent rays cross the equatorial plane two or three times, so a
                flat disk reads as a halo arcing over the hole.
              </p>
            </div>
            <div>
              <strong>Doppler beaming</strong>
              <p>
                Plasma rotating toward the camera is brightened; the approaching
                edge of the disk glows hotter and whiter.
              </p>
            </div>
            <div>
              <strong>Lensed starfield</strong>
              <p>
                The background is sampled by the photon&apos;s final direction,
                so stars smear into an Einstein ring around the shadow.
              </p>
            </div>
            <div>
              <strong>Blackbody color</strong>
              <p>
                Disk temperature drives a cool-to-hot ramp, tonemapped with an
                ACES filmic curve for that cinematic core.
              </p>
            </div>
            <div>
              <strong>Raw Three.js + R3F</strong>
              <p>
                A single fullscreen plane, one <code>ShaderMaterial</code>, no
                post-processing dependency. Honors reduced motion.
              </p>
            </div>
          </div>
        </section>

        <section className="sg-final">
          <span className="sg-eyebrow">FULL FREEDOM. NO RESTRICTIONS.</span>
          <h2>
            This is the
            <br />
            <em>ceiling.</em>
          </h2>
          <div className="sg-hero-actions sg-final-actions">
            <TemplateDownloadLink className="sg-button">
              Take the code <ArrowUpRight size={16} />
            </TemplateDownloadLink>
            <Link className="sg-quiet-link" href="/">
              Back to the gallery <span>↗</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="sg-footer">
        <Link href="/" className="sg-logo">
          <span className="sg-logo-mark" />
          SINGULARITY
        </Link>
        <span>SGR—001 · SCHWARZSCHILD RENDER</span>
        <a href="#sg-main">BACK TO TOP ↑</a>
      </footer>
    </>
  );
}
