import Link from 'next/link';
import {
  ArrowUpRight,
  Bird,
  Check,
  Fingerprint,
  Globe,
  KeyRound,
  Layers,
  Lock,
  ShieldCheck,
  Waves,
  Zap,
} from 'lucide-react';
import { TemplateDownloadLink } from '@/components/template-download-link';
import { Visualizer } from './components/visualizer';
import { Playground } from './components/playground';
import { VoiceGallery } from './components/voice-gallery';
import { LANGUAGES } from './lib/voices';

export function AviaryHome() {
  return (
    <>
      <div className="av-aurora" aria-hidden />
      <div className="av-grain" aria-hidden />
      <a className="av-skip" href="#av-main">
        Skip to content
      </a>

      <header className="av-nav">
        <Link href="/aviary" className="av-logo">
          <span className="av-logo-mark" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          aviary
        </Link>
        <nav aria-label="Aviary">
          <a href="#av-playground">Playground</a>
          <a href="#av-voices">Voices</a>
          <a href="#av-beyond">Sound</a>
          <a href="#av-security">Security</a>
          <a href="#av-pricing">Pricing</a>
          <Link href="/">
            All showcases <ArrowUpRight size={12} />
          </Link>
        </nav>
        <a href="#av-playground" className="av-nav-cta">
          Try it live <ArrowUpRight size={14} />
        </a>
      </header>

      <main id="av-main">
        {/* ——— HERO ——— */}
        <section className="av-hero av-wrap">
          <div className="av-hero-copy">
            <span className="av-eyebrow">Aviary · Voice model v3</span>
            <h1>
              Any voice.
              <br />
              <span className="av-sub">
                Any language. <em>Any sound.</em>
              </span>
            </h1>
            <p>
              A generative audio model that speaks with human emotion, clones a
              voice from thirty seconds, and renders anything from a whisper to
              birdsong — in 70+ languages, end-to-end encrypted.
            </p>
            <div className="av-hero-actions">
              <a href="#av-playground" className="av-btn av-btn-primary">
                Generate speech <ArrowUpRight size={16} />
              </a>
              <a href="#av-voices" className="av-btn av-btn-ghost">
                Hear the voices
              </a>
            </div>
            <div className="av-hero-meta">
              <div>
                <b>140ms</b>
                <span>time to first byte</span>
              </div>
              <div>
                <b>70+</b>
                <span>languages &amp; accents</span>
              </div>
              <div>
                <b>48kHz</b>
                <span>studio-grade output</span>
              </div>
            </div>
          </div>
          <div className="av-hero-stage">
            <div className="av-orb">
              <Visualizer variant="orb" active />
              <span className="av-orb-badge">
                <i /> listening · modelling timbre
              </span>
            </div>
          </div>
        </section>

        {/* ——— LANGUAGE MARQUEE ——— */}
        <div className="av-strip">
          <div className="av-strip-inner">
            {[...LANGUAGES, ...LANGUAGES].map((lang, i) => (
              <span key={i}>
                <Globe size={13} /> {lang}
              </span>
            ))}
          </div>
        </div>

        {/* ——— PLAYGROUND ——— */}
        <section className="av-section av-wrap">
          <div className="av-section-head">
            <span className="av-eyebrow">Live playground</span>
            <h2>
              Type it. <em>Hear it.</em>
            </h2>
            <p>
              Real-time synthesis you can steer — voice, delivery, stability and
              pace. This is a working frontend concept; audio is simulated.
            </p>
          </div>
          <Playground />
        </section>

        {/* ——— VOICE GALLERY ——— */}
        <section className="av-section av-wrap" id="av-voices">
          <div className="av-section-head">
            <span className="av-eyebrow">The flock</span>
            <h2>
              Signature voices,
              <br />
              <em>or clone your own.</em>
            </h2>
            <p>
              Hand-tuned presets for narration, assistants, and broadcast — each
              with its own timbre, pacing, and personality. Preview any of them.
            </p>
          </div>
          <VoiceGallery />
        </section>

        {/* ——— BEYOND SPEECH ——— */}
        <section className="av-section av-wrap" id="av-beyond">
          <div className="av-split">
            <div className="av-split-visual">
              <Visualizer
                variant="ribbon"
                active
                colors={['#5eead4', '#818cf8', '#f0abfc', '#fbbf72']}
              />
            </div>
            <div>
              <span className="av-eyebrow">Beyond speech</span>
              <h2 style={{ marginTop: 18, fontSize: 'clamp(30px,4vw,52px)' }}>
                It mimics the <em>whole world.</em>
              </h2>
              <p style={{ marginTop: 18, color: 'var(--av-muted)' }}>
                Named for the lyrebird — nature&apos;s greatest impersonator —
                Aviary generates far more than talk. Foley, ambience, creatures,
                textures. If you can describe it, the model can voice it.
              </p>
              <div className="av-feature-list">
                <div className="av-feature">
                  <span className="av-feature-ic">
                    <Bird size={18} />
                  </span>
                  <div>
                    <h4>Birdsong &amp; wildlife</h4>
                    <p>
                      Dawn chorus, a lone owl, a reef at night — procedurally
                      generated, never sampled.
                    </p>
                  </div>
                </div>
                <div className="av-feature">
                  <span className="av-feature-ic">
                    <Waves size={18} />
                  </span>
                  <div>
                    <h4>Ambience &amp; foley</h4>
                    <p>
                      Rain on canvas, a crowded café, footsteps on gravel —
                      layerable sound beds for film and games.
                    </p>
                  </div>
                </div>
                <div className="av-feature">
                  <span className="av-feature-ic">
                    <Layers size={18} />
                  </span>
                  <div>
                    <h4>Emotion transfer</h4>
                    <p>
                      Carry the feeling of one performance onto any voice with a
                      single reference clip.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ——— SECURITY / VAULT ——— */}
        <section className="av-section av-wrap" id="av-security">
          <div className="av-vault">
            <div>
              <span className="av-eyebrow">Voiceprint vault</span>
              <h2 style={{ marginTop: 18 }}>
                Your voice is <em>yours.</em>
              </h2>
              <p>
                Every cloned voiceprint is encrypted end-to-end and sealed to
                your account. We never train shared models on your audio, and a
                tamper-evident watermark rides inside every render.
              </p>
              <ul className="av-vault-points">
                <li>
                  <Lock size={17} /> AES-256 encryption at rest, TLS 1.3 in
                  transit.
                </li>
                <li>
                  <Fingerprint size={17} /> Inaudible C2PA watermark on 100% of
                  output.
                </li>
                <li>
                  <KeyRound size={17} /> Consent-gated cloning with verified
                  voice capture.
                </li>
                <li>
                  <ShieldCheck size={17} /> SOC 2 Type II · GDPR · zero-retention
                  mode.
                </li>
              </ul>
            </div>
            <div className="av-vault-shield">
              <span className="av-shield-ring" />
              <span className="av-shield-ring" />
              <span className="av-shield-ring" />
              <span className="av-shield-core">
                <ShieldCheck size={40} strokeWidth={1.4} />
              </span>
            </div>
          </div>
        </section>

        {/* ——— SPECS ——— */}
        <section className="av-section av-wrap">
          <div className="av-section-head">
            <span className="av-eyebrow">The model</span>
            <h2>
              Built for <em>production.</em>
            </h2>
          </div>
          <div className="av-specs">
            <div className="av-spec">
              <b>
                140<em>ms</em>
              </b>
              <span>Streaming latency, first audio byte</span>
            </div>
            <div className="av-spec">
              <b>32k</b>
              <span>Characters per request, long-form ready</span>
            </div>
            <div className="av-spec">
              <b>
                99.9<em>%</em>
              </b>
              <span>Uptime SLA on the enterprise tier</span>
            </div>
            <div className="av-spec">
              <b>
                3<em>s</em>
              </b>
              <span>Audio needed to clone a voice</span>
            </div>
          </div>
        </section>

        {/* ——— PRICING ——— */}
        <section className="av-section av-wrap" id="av-pricing">
          <div className="av-section-head">
            <span className="av-eyebrow">Pricing</span>
            <h2>
              Start free. <em>Scale when you ship.</em>
            </h2>
          </div>
          <div className="av-price-grid">
            <div className="av-price">
              <div className="av-price-name">Starter</div>
              <div className="av-price-amt">
                $0 <span>/ forever</span>
              </div>
              <ul>
                <li>
                  <Check size={16} /> 10k characters / month
                </li>
                <li>
                  <Check size={16} /> 6 signature voices
                </li>
                <li>
                  <Check size={16} /> Standard latency
                </li>
                <li>
                  <Check size={16} /> Personal, non-commercial use
                </li>
              </ul>
              <a href="#av-playground" className="av-btn av-btn-ghost">
                Start free
              </a>
            </div>
            <div className="av-price" data-featured="true">
              <div className="av-price-name">
                Creator <span className="av-price-badge">POPULAR</span>
              </div>
              <div className="av-price-amt">
                $24 <span>/ month</span>
              </div>
              <ul>
                <li>
                  <Check size={16} /> 500k characters / month
                </li>
                <li>
                  <Check size={16} /> Instant voice cloning
                </li>
                <li>
                  <Check size={16} /> Turbo low-latency model
                </li>
                <li>
                  <Check size={16} /> Commercial license + 48kHz export
                </li>
              </ul>
              <a href="#av-playground" className="av-btn av-btn-primary">
                Get Creator <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="av-price">
              <div className="av-price-name">Enterprise</div>
              <div className="av-price-amt">Custom</div>
              <ul>
                <li>
                  <Check size={16} /> Unlimited scale + SLA
                </li>
                <li>
                  <Check size={16} /> Zero-retention &amp; on-prem
                </li>
                <li>
                  <Check size={16} /> Dedicated voiceprint vault
                </li>
                <li>
                  <Check size={16} /> Solutions engineering
                </li>
              </ul>
              <a href="#av-main" className="av-btn av-btn-ghost">
                Talk to us
              </a>
            </div>
          </div>
        </section>

        {/* ——— FINAL CTA ——— */}
        <section className="av-final">
          <div className="av-final-wave" aria-hidden>
            <Visualizer variant="wave" active />
          </div>
          <span className="av-eyebrow" style={{ position: 'relative', zIndex: 2 }}>
            Give it a voice
          </span>
          <h2 style={{ marginTop: 22 }}>
            Make it <em>speak.</em>
          </h2>
          <p>
            A working frontend concept for a premium AI voice product. No
            account, no audio pipeline — just the experience.
          </p>
          <div className="av-hero-actions">
            <a href="#av-playground" className="av-btn av-btn-primary">
              Open the playground <ArrowUpRight size={16} />
            </a>
            <TemplateDownloadLink>
              <span className="av-btn av-btn-ghost">
                Download ZIP <ArrowUpRight size={16} />
              </span>
            </TemplateDownloadLink>
          </div>
        </section>
      </main>

      {/* ——— FOOTER ——— */}
      <footer className="av-footer">
        <div className="av-footer-top">
          <div>
            <Link href="/aviary" className="av-logo">
              <span className="av-logo-mark" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              aviary
            </Link>
            <p>
              A generative voice model concept. The sound of everything, in any
              voice you choose.
            </p>
          </div>
          <div className="av-footer-cols">
            <div className="av-footer-col">
              <h5>Product</h5>
              <a href="#av-playground">Playground</a>
              <a href="#av-voices">Voices</a>
              <a href="#av-beyond">Sound library</a>
              <a href="#av-pricing">Pricing</a>
            </div>
            <div className="av-footer-col">
              <h5>Trust</h5>
              <a href="#av-security">Security</a>
              <a href="#av-security">Watermarking</a>
              <a href="#av-security">Consent &amp; ethics</a>
            </div>
            <div className="av-footer-col">
              <h5>Gallery</h5>
              <Link href="/">All showcases</Link>
              <Link href="/relay">Relay</Link>
              <Link href="/aura">Aura Studio</Link>
            </div>
          </div>
        </div>
        <div className="av-footer-bottom">
          <span>© 2026 Aviary — an original frontend concept.</span>
          <span>
            <Zap size={12} style={{ verticalAlign: 'middle' }} /> Built with
            Next.js · Canvas · Motion
          </span>
          <a href="#av-main">Back to top ↑</a>
        </div>
      </footer>
    </>
  );
}
