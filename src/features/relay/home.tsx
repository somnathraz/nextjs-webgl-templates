import Link from 'next/link';
import {
  ArrowUpRight,
  Command,
  GitBranch,
  ScanLine,
  ShieldCheck,
} from 'lucide-react';
import { TemplateDownloadLink } from '@/components/template-download-link';
import { Hero } from './components/hero';
import { ScrollStory } from './components/scroll-story';
import { Playground } from './components/playground';
import { Telemetry } from './components/telemetry';
import { Guide } from './components/guide';
export function RelayHome() {
  return (
    <>
      <header className="relay-nav">
        <Link className="relay-logo" href="/relay">
          <span className="relay-brand-mark">
            <i />
            <i />
            <i />
          </span>
          relay<span className="relay-logo-period">.</span>
        </Link>
        <nav aria-label="Relay navigation">
          <a href="#relay-system">System</a>
          <a href="#relay-playground">Playground</a>
          <Guide />
          <Link href="/">
            All showcases <ArrowUpRight size={11} />
          </Link>
          <TemplateDownloadLink>
            Download ZIP <ArrowUpRight size={11} />
          </TemplateDownloadLink>
        </nav>
        <a href="#relay-playground" className="relay-nav-cta">
          Try the demo <ArrowUpRight size={13} />
        </a>
      </header>
      <main id="relay-main">
        <Hero />
        <div className="relay-capabilities">
          <span>ONE CONNECTED SYSTEM</span>
          <div>
            <Command size={16} /> Model agnostic
          </div>
          <div>
            <GitBranch size={16} /> Multi-agent by design
          </div>
          <div>
            <ScanLine size={16} /> Every step, observable
          </div>
          <div>
            <ShieldCheck size={16} /> Human in control
          </div>
        </div>
        <ScrollStory />
        <Playground />
        <section className="relay-observe" id="relay-observe">
          <div className="relay-observe-copy">
            <span className="relay-eyebrow">
              03 / NOTHING LOST IN THE HANDOFF
            </span>
            <h2>
              Autonomy.
              <br />
              <span>With a clear view.</span>
            </h2>
            <p>
              Useful agents need more than a good answer. They need context,
              boundaries, and a trace you can actually follow.
            </p>
            <ul>
              <li>
                <span>01</span> Shared context, without starting over.
              </li>
              <li>
                <span>02</span> Clear ownership at every handoff.
              </li>
              <li>
                <span>03</span> Human review before the final action.
              </li>
            </ul>
          </div>
          <Telemetry />
        </section>
        <section className="relay-final">
          <span className="relay-eyebrow">THE NEXT MOVE IS YOURS.</span>
          <h2>
            Put possibility
            <br />
            <em>in motion.</em>
          </h2>
          <a className="relay-button" href="#relay-playground">
            Give the team a mission <ArrowUpRight size={18} />
          </a>
          <span className="relay-final-note">
            A working frontend concept. No account required.
          </span>
          <div className="relay-final-orbit" aria-hidden="true" />
        </section>
      </main>
      <footer className="relay-footer">
        <div>
          <Link href="/" className="relay-logo">
            relay.
          </Link>
          <span>INTELLIGENCE IS A TEAM SPORT.</span>
          <Link href="/">Back to gallery ↗</Link>
        </div>
        <div>
          <span>© 2026 RELAY — AN ORIGINAL CONCEPT</span>
          <span>DESIGNED FOR THE WORK AHEAD.</span>
          <a href="#relay-main">BACK TO TOP ↑</a>
        </div>
      </footer>
    </>
  );
}
