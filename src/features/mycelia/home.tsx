'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowUpRight, ArrowDown, MousePointer2 } from 'lucide-react';
import { TemplateDownloadLink } from '@/components/template-download-link';
import { useSceneSignal } from './hooks/use-scene-signal';

const PhysarumScene = dynamic(() => import('./components/physarum-scene'), {
  ssr: false,
  loading: () => <div className="myc-canvas-fallback" />,
});

const CHAPTERS = [
  {
    index: '01',
    kicker: 'DEPOSIT',
    title: 'A million wanderers leave a trail.',
    body: 'Every agent drops a faint chemical mark wherever it goes. Alone, each mark is nothing. Together, over thousands of frames, they become a map the colony can read.',
  },
  {
    index: '02',
    kicker: 'SENSE',
    title: 'Three sensors. One simple rule.',
    body: 'Each agent sniffs left, ahead, and right, then steers toward the strongest scent. That is the entire intelligence — no planning, no memory, just a turn toward more of what it already laid down.',
  },
  {
    index: '03',
    kicker: 'REINFORCE',
    title: 'Paths that work get wider.',
    body: 'The trail diffuses and fades every frame. Routes that agents keep reusing are reinforced faster than they decay; the rest dissolve. Efficiency survives. Waste evaporates.',
  },
  {
    index: '04',
    kicker: 'EMERGE',
    title: 'Networks no one designed.',
    body: 'From that loop — deposit, sense, reinforce — vein-like networks appear, split, and heal. It is the same math a real slime mold uses to solve mazes. Move your cursor and the whole colony comes to you.',
  },
];

export function MyceliaHome() {
  const signal = useSceneSignal();
  return (
    <>
      <div className="myc-canvas" aria-hidden="true">
        <PhysarumScene signal={signal} />
      </div>

      <header className="myc-nav">
        <Link className="myc-logo" href="/mycelia">
          <span className="myc-logo-mark" />
          MYCELIA
        </Link>
        <nav aria-label="Mycelia navigation">
          <a href="#myc-story">The rules</a>
          <a href="#myc-specs">How it works</a>
          <Link href="/">
            All showcases <ArrowUpRight size={11} />
          </Link>
          <TemplateDownloadLink>
            Download ZIP <ArrowUpRight size={11} />
          </TemplateDownloadLink>
        </nav>
      </header>

      <main id="myc-main" className="myc-shell">
        <section className="myc-hero">
          <span className="myc-eyebrow">
            <span className="myc-dot" /> ARTIFICIAL LIFE · 1,048,576 AGENTS · LIVE ON THE GPU
          </span>
          <h1>
            Life,
            <br />
            <span>grown live.</span>
          </h1>
          <p>
            A million simple agents, each following one rule, kept alive in
            texture memory. No one scripts the shapes they make — they organize
            themselves. Move your cursor and the colony flows toward it.
          </p>
          <div className="myc-hero-actions">
            <a className="myc-button" href="#myc-story">
              Watch it think <ArrowDown size={16} />
            </a>
            <span className="myc-hint">
              <MousePointer2 size={14} /> Move your cursor through the colony
            </span>
          </div>
          <dl className="myc-readout">
            <div>
              <dt>Agents</dt>
              <dd>1.05M</dd>
            </div>
            <div>
              <dt>Rule</dt>
              <dd>1<span>sense + turn</span></dd>
            </div>
            <div>
              <dt>Memory</dt>
              <dd>2<span>ping-pong buffers</span></dd>
            </div>
            <div>
              <dt>Repeat</dt>
              <dd>0<span>frames alike</span></dd>
            </div>
          </dl>
        </section>

        <section className="myc-story" id="myc-story">
          {CHAPTERS.map((c, i) => (
            <article
              key={c.index}
              className={`myc-chapter myc-chapter--${i % 2 ? 'right' : 'left'}`}
            >
              <div className="myc-chapter-card">
                <span className="myc-chapter-kicker">
                  {c.index} / {c.kicker}
                </span>
                <h2>{c.title}</h2>
                <p>{c.body}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="myc-specs" id="myc-specs">
          <span className="myc-eyebrow">HOW IT WORKS</span>
          <h2>Compute without a compute shader.</h2>
          <div className="myc-spec-grid">
            <div>
              <strong>Agents live in a texture</strong>
              <p>
                Each pixel of a 1024×1024 float texture stores one agent&apos;s
                position and heading — over a million lives in one image.
              </p>
            </div>
            <div>
              <strong>Ping-pong framebuffers</strong>
              <p>
                A fragment pass reads the agent texture and the trail, computes
                each new state, and writes to a second texture. Then they swap.
              </p>
            </div>
            <div>
              <strong>Deposit as points</strong>
              <p>
                A million-vertex draw reads each agent&apos;s position in the
                vertex shader and additively stamps it into the trail map.
              </p>
            </div>
            <div>
              <strong>Diffuse &amp; decay</strong>
              <p>
                A blur-plus-fade pass spreads and dims the trail every frame, so
                only reinforced paths persist.
              </p>
            </div>
            <div>
              <strong>Scroll changes the rules</strong>
              <p>
                Sensor angle, distance, and turn speed shift as you read — watch
                the same colony reorganize into new regimes.
              </p>
            </div>
            <div>
              <strong>Raw Three.js + R3F</strong>
              <p>
                Hand-written GLSL, custom render targets, manual pass
                sequencing. Honors <code>prefers-reduced-motion</code>.
              </p>
            </div>
          </div>
        </section>

        <section className="myc-final">
          <span className="myc-eyebrow">SIMPLE RULES. ENDLESS FORM.</span>
          <h2>
            It&apos;s alive,
            <br />
            <em>and it&apos;s yours.</em>
          </h2>
          <div className="myc-hero-actions myc-final-actions">
            <TemplateDownloadLink className="myc-button">
              Take the code <ArrowUpRight size={16} />
            </TemplateDownloadLink>
            <Link className="myc-quiet-link" href="/">
              Back to the gallery <span>↗</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="myc-footer">
        <Link href="/" className="myc-logo">
          <span className="myc-logo-mark" />
          MYCELIA
        </Link>
        <span>MYC—001 · PHYSARUM ENGINE</span>
        <a href="#myc-main">BACK TO TOP ↑</a>
      </footer>
    </>
  );
}
