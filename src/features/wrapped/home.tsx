'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo } from 'react';
import { Activity, ArrowUpRight, Code2, Swords } from 'lucide-react';
import { TemplateDownloadLink } from '@/components/template-download-link';
import { githubCopy } from './adapters/github/copy';
import { EXAMPLES } from './adapters/examples';
import { githubSamples } from './adapters/github/sample';
import { UsernameForm } from './components/username-form';
import { buildLayout } from './engine/layouts';
import type { Vec3 } from './engine/scene-kit';
import { computeStats } from './engine/stats';
import { THEMES } from './engine/themes';

const YearScene = dynamic(() => import('./components/year-scene'), {
  ssr: false,
});

export function WrappedHome({ year }: { year: number }) {
  // a fixed sample year spins behind the hero — no network needed
  const target = useMemo(() => {
    const data = githubSamples(year, new Date(Date.UTC(year, 11, 31)))._sample;
    const layout = buildLayout('total', {
      data,
      stats: computeStats(data, githubCopy),
      hours: null,
      palette: THEMES.intro,
    });
    // pulled back so the whole skyline sits clear of the headline
    return { ...layout, camera: [8.4, 7.2, 12.6] as Vec3 };
  }, [year]);

  const vars = {
    '--gw-a': THEMES.intro.a,
    '--gw-b': THEMES.intro.b,
  } as React.CSSProperties;

  return (
    <div className="gw-home" style={vars}>
      <div className="gw-bg" aria-hidden="true" />
      <div className="gw-canvas gw-canvas--home" aria-hidden="true">
        <YearScene target={target} />
      </div>
      <div className="gw-shade gw-shade--home" aria-hidden="true" />

      <header className="gw-nav">
        <Link className="gw-brand" href="/wrapped">
          Wrapped<sup>&rsquo;{String(year).slice(2)}</sup>
        </Link>
        <nav aria-label="Wrapped navigation">
          <Link href={`/wrapped/${EXAMPLES.sample}`}>Sample</Link>
          <Link href="/">
            All showcases <ArrowUpRight size={11} />
          </Link>
          <TemplateDownloadLink>
            Download ZIP <ArrowUpRight size={11} />
          </TemplateDownloadLink>
        </nav>
      </header>

      <main className="gw-hero" id="gw-main">
        <span className="gw-kicker">
          <span className="gw-live" /> {year} · Your GitHub year in 3D
        </span>
        <h1 className="gw-display">
          Your year in code,
          <br />
          <em>wrapped.</em>
        </h1>
        <p className="gw-body">
          Every contribution becomes a cube. Every cube becomes a skyline, a
          streak, a clock, a coder type — then a card you&apos;ll actually want
          to post. Or put a friend in the other corner and settle it.
        </p>
        <UsernameForm autoFocus />
        <Link className="gw-sample" href={`/wrapped/${EXAMPLES.sample}`}>
          No GitHub? Play the sample year <ArrowUpRight size={13} />
        </Link>

        <section className="gw-engine" aria-labelledby="gw-engine-title">
          <h2 id="gw-engine-title">
            Not just GitHub. A Wrapped engine for your product.
          </h2>
          <p>
            Feed it one number per day — commits, km, orders, minutes — and it
            builds the whole story, share card and OG image. Swap the adapter,
            keep the show.
          </p>
          <ul className="gw-features">
            <li>
              <Link href={`/wrapped/${EXAMPLES.sample}/vs/${EXAMPLES.rival}`}>
                <Swords size={15} /> Versus mode
              </Link>
            </li>
            <li>
              <Link href={`/wrapped/${EXAMPLES.stride}`}>
                <Activity size={15} /> Same engine, fitness data
              </Link>
            </li>
            <li>
              <TemplateDownloadLink>
                <Code2 size={15} /> Build your own adapter
              </TemplateDownloadLink>
            </li>
          </ul>
        </section>
      </main>

      <footer className="gw-foot">
        Public data only · No sign-in · Not affiliated with GitHub, Inc.
      </footer>
    </div>
  );
}
