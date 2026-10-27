'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowUpRight, ArrowDown, Paintbrush } from 'lucide-react';
import { TemplateDownloadLink } from '@/components/template-download-link';
import { useFluidSignal } from './hooks/use-fluid-signal';

const FluidScene = dynamic(() => import('./components/fluid-scene'), {
  ssr: false,
  loading: () => <div className="flx-canvas-fallback" />,
});

const CHAPTERS = [
  {
    index: '01',
    kicker: 'ADVECTION',
    title: 'The fluid carries itself.',
    body: 'Every point in the field asks one question: where was I a moment ago? It reaches backward along the flow and pulls that colour forward. Do it for every pixel, every frame, and motion becomes a medium.',
  },
  {
    index: '02',
    kicker: 'INCOMPRESSIBILITY',
    title: 'Nothing is created. Nothing is crushed.',
    body: 'Real fluid cannot pile up. A pressure solve runs twenty-two times a frame, pushing back wherever the flow tries to compress, until the field is perfectly divergence-free — the single step that makes it feel like water instead of smoke.',
  },
  {
    index: '03',
    kicker: 'VORTICITY',
    title: 'Curls that refuse to die.',
    body: 'Numerical fluids lose their swirl too fast. So we measure the spin at every point and feed a little of it back in — vorticity confinement — and the eddies keep turning, the way they should.',
  },
  {
    index: '04',
    kicker: 'PAINT',
    title: 'Your cursor is the only brush.',
    body: 'Move across the field and you inject both colour and momentum. The solver does the rest. No two strokes ever settle the same way.',
  },
];

export function FluxHome() {
  const signal = useFluidSignal();
  return (
    <>
      <div className="flx-canvas" aria-hidden="true">
        <FluidScene signal={signal} />
      </div>

      <header className="flx-nav">
        <Link className="flx-logo" href="/flux">
          <span className="flx-logo-mark" />
          FLUX
        </Link>
        <nav aria-label="Flux navigation">
          <a href="#flx-story">The solver</a>
          <a href="#flx-specs">How it works</a>
          <Link href="/">
            All showcases <ArrowUpRight size={11} />
          </Link>
          <TemplateDownloadLink>
            Download ZIP <ArrowUpRight size={11} />
          </TemplateDownloadLink>
        </nav>
      </header>

      <main id="flx-main" className="flx-shell">
        <section className="flx-hero">
          <span className="flx-eyebrow">
            <span className="flx-dot" /> REAL-TIME NAVIER–STOKES · 512² GRID · LIVE
          </span>
          <h1>
            Fluid,
            <br />
            <span>painted with light.</span>
          </h1>
          <p>
            A real fluid solver running sixty times a second — advection,
            pressure projection, vorticity — entirely on the GPU. Drag your
            cursor and stir the colour. It obeys the same equations as water.
          </p>
          <div className="flx-hero-actions">
            <a className="flx-button" href="#flx-story">
              See the solver <ArrowDown size={16} />
            </a>
            <span className="flx-hint">
              <Paintbrush size={14} /> Drag anywhere to paint the flow
            </span>
          </div>
          <dl className="flx-readout">
            <div>
              <dt>Grid</dt>
              <dd>512²</dd>
            </div>
            <div>
              <dt>Pressure</dt>
              <dd>22<span>Jacobi / frame</span></dd>
            </div>
            <div>
              <dt>Divergence</dt>
              <dd>~0<span>incompressible</span></dd>
            </div>
            <div>
              <dt>Brush</dt>
              <dd>1<span>your cursor</span></dd>
            </div>
          </dl>
        </section>

        <section className="flx-story" id="flx-story">
          {CHAPTERS.map((c, i) => (
            <article
              key={c.index}
              className={`flx-chapter flx-chapter--${i % 2 ? 'right' : 'left'}`}
            >
              <div className="flx-chapter-card">
                <span className="flx-chapter-kicker">
                  {c.index} / {c.kicker}
                </span>
                <h2>{c.title}</h2>
                <p>{c.body}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="flx-specs" id="flx-specs">
          <span className="flx-eyebrow">HOW IT WORKS</span>
          <h2>A water tank in your browser.</h2>
          <div className="flx-spec-grid">
            <div>
              <strong>Semi-Lagrangian advection</strong>
              <p>
                Each cell traces its velocity backward and samples the colour it
                came from — unconditionally stable at any timestep.
              </p>
            </div>
            <div>
              <strong>Jacobi pressure solve</strong>
              <p>
                Twenty-two relaxation passes approximate the pressure that keeps
                the velocity field incompressible.
              </p>
            </div>
            <div>
              <strong>Vorticity confinement</strong>
              <p>
                Curl is measured and re-injected so small eddies survive instead
                of smearing away.
              </p>
            </div>
            <div>
              <strong>Ping-pong fields</strong>
              <p>
                Velocity, dye, pressure and divergence each live in float
                textures, read and rewritten every frame.
              </p>
            </div>
            <div>
              <strong>Colour &amp; momentum splats</strong>
              <p>
                Your cursor injects a gaussian of dye and force; an ambient jet
                keeps the tank alive when you are still.
              </p>
            </div>
            <div>
              <strong>Raw Three.js + R3F</strong>
              <p>
                Nine hand-written GLSL passes, manual render targets. Honors{' '}
                <code>prefers-reduced-motion</code>.
              </p>
            </div>
          </div>
        </section>

        <section className="flx-final">
          <span className="flx-eyebrow">PHYSICS YOU CAN FINGER-PAINT</span>
          <h2>
            Go on,
            <br />
            <em>make a mess.</em>
          </h2>
          <div className="flx-hero-actions flx-final-actions">
            <TemplateDownloadLink className="flx-button">
              Take the code <ArrowUpRight size={16} />
            </TemplateDownloadLink>
            <Link className="flx-quiet-link" href="/">
              Back to the gallery <span>↗</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="flx-footer">
        <Link href="/" className="flx-logo">
          <span className="flx-logo-mark" />
          FLUX
        </Link>
        <span>FLX—001 · STABLE-FLUIDS SOLVER</span>
        <a href="#flx-main">BACK TO TOP ↑</a>
      </footer>
    </>
  );
}
