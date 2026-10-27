'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowUpRight, ArrowDown, MousePointer2, Orbit } from 'lucide-react';
import { TemplateDownloadLink } from '@/components/template-download-link';
import { useNovaSignal } from './hooks/use-nova-signal';

const ParticleField = dynamic(() => import('./components/particle-field'), {
  ssr: false,
  loading: () => <div className="nova-canvas-fallback" />,
});

const CHAPTERS = [
  {
    index: '01',
    kicker: 'FORM',
    title: 'A sphere of ninety thousand points.',
    body: 'Every particle starts life on a fibonacci shell — perfectly even, quietly breathing. Nothing is a texture. Nothing is a model file. It is pure math, drawn on the GPU.',
    align: 'left',
  },
  {
    index: '02',
    kicker: 'DISPERSE',
    title: 'The shell unwinds into a galaxy.',
    body: 'Scroll and the same points spiral outward into four logarithmic arms. No particle is created or destroyed — each one simply interpolates toward its next home in the vertex shader.',
    align: 'right',
  },
  {
    index: '03',
    kicker: 'KNOT',
    title: 'Order folds into a torus knot.',
    body: 'A (3, 4) knot, rendered as a fuzzy tube of light. Curl-flow noise keeps it alive; your cursor pushes the field aside with an inverse-square force.',
    align: 'left',
  },
  {
    index: '04',
    kicker: 'FIELD',
    title: 'And finally, a rippling plane.',
    body: 'The points settle into a grid and a wave rolls across it. One continuous morph, driven entirely by how far you have scrolled.',
    align: 'right',
  },
];

export function NovaHome() {
  const signal = useNovaSignal();
  return (
    <>
      <div className="nova-canvas" aria-hidden="true">
        <ParticleField signal={signal} />
        <div className="nova-vignette" />
      </div>

      <header className="nova-nav">
        <Link className="nova-logo" href="/nova">
          <span className="nova-logo-mark" />
          NOVA
        </Link>
        <nav aria-label="Nova navigation">
          <a href="#nova-story">The morph</a>
          <a href="#nova-specs">Under the hood</a>
          <Link href="/">
            All showcases <ArrowUpRight size={11} />
          </Link>
          <TemplateDownloadLink>
            Download ZIP <ArrowUpRight size={11} />
          </TemplateDownloadLink>
        </nav>
      </header>

      <main id="nova-main" className="nova-shell">
        <section className="nova-hero">
          <span className="nova-eyebrow">
            <span className="nova-dot" /> GPU PARTICLE ENGINE · 90,000 POINTS
          </span>
          <h1>
            Pure math,
            <br />
            <span>in motion.</span>
          </h1>
          <p>
            A single buffer of ninety thousand particles, morphing through four
            shapes as you scroll — rendered live in a custom WebGL shader.
            Move your cursor to push the field around.
          </p>
          <div className="nova-hero-actions">
            <a className="nova-button" href="#nova-story">
              Begin the morph <ArrowDown size={16} />
            </a>
            <span className="nova-hint">
              <MousePointer2 size={13} /> Drag your cursor across the field
            </span>
          </div>
          <div className="nova-stats" role="list">
            <div role="listitem">
              <strong>90k</strong>
              <span>particles</span>
            </div>
            <div role="listitem">
              <strong>4</strong>
              <span>morph targets</span>
            </div>
            <div role="listitem">
              <strong>1</strong>
              <span>draw call</span>
            </div>
            <div role="listitem">
              <strong>0</strong>
              <span>textures</span>
            </div>
          </div>
        </section>

        <section className="nova-story" id="nova-story">
          {CHAPTERS.map((c) => (
            <article
              key={c.index}
              className={`nova-chapter nova-chapter--${c.align}`}
            >
              <div className="nova-chapter-card">
                <span className="nova-chapter-kicker">
                  {c.index} / {c.kicker}
                </span>
                <h2>{c.title}</h2>
                <p>{c.body}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="nova-specs" id="nova-specs">
          <span className="nova-eyebrow">
            <Orbit size={12} /> UNDER THE HOOD
          </span>
          <h2>No models. No textures. Just the GPU.</h2>
          <div className="nova-spec-grid">
            <div>
              <strong>Vertex-shader morph</strong>
              <p>
                Each point carries its position in all four shapes as attributes;
                a cyclic weight blends the two nearest by scroll phase.
              </p>
            </div>
            <div>
              <strong>Pseudo-curl flow</strong>
              <p>
                Layered sine fields perturb every particle so the form never
                sits still — organic motion with zero noise-texture lookups.
              </p>
            </div>
            <div>
              <strong>Pointer force</strong>
              <p>
                Your cursor is projected onto the view plane and repels nearby
                points with an inverse-square falloff, right in the shader.
              </p>
            </div>
            <div>
              <strong>Additive iridescence</strong>
              <p>
                Color is computed per-point from an HSL palette and depth glow,
                composited with additive blending for a bloom-like core.
              </p>
            </div>
            <div>
              <strong>Built to behave</strong>
              <p>
                Honors <code>prefers-reduced-motion</code>, caps device pixel
                ratio, and renders the whole field in a single draw call.
              </p>
            </div>
            <div>
              <strong>Raw Three.js + R3F</strong>
              <p>
                No drei, no post-processing dependency — just{' '}
                <code>@react-three/fiber</code>, <code>three</code>, and a
                hand-written GLSL program.
              </p>
            </div>
          </div>
        </section>

        <section className="nova-final">
          <span className="nova-eyebrow">THE CEILING, ON ONE ROUTE</span>
          <h2>
            This is what
            <br />
            <em>max looks like.</em>
          </h2>
          <div className="nova-hero-actions nova-final-actions">
            <TemplateDownloadLink className="nova-button">
              Take the code <ArrowUpRight size={16} />
            </TemplateDownloadLink>
            <Link className="nova-quiet-link" href="/">
              Back to the gallery <span>↗</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="nova-footer">
        <Link href="/" className="nova-logo">
          <span className="nova-logo-mark" />
          NOVA
        </Link>
        <span>NVA—001 · PARTICLE MORPH ENGINE</span>
        <a href="#nova-main">BACK TO TOP ↑</a>
      </footer>
    </>
  );
}
