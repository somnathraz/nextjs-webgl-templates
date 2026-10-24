import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Plus } from 'lucide-react';
import { TemplateDownloadLink } from '@/components/template-download-link';
import { ArchitectureExperience } from './components/architecture-experience';
import { Reveal } from './components/reveal';
import { ProjectDetails } from './components/project-details';
export function FormeHome() {
  return (
    <>
      <header className="forme-nav">
        <Link href="/forme" className="forme-logo" aria-label="FORME home">
          forme<span>®</span>
        </Link>
        <nav aria-label="FORME navigation">
          <a href="#forme-project">Selected work</a>
          <a href="#forme-studio">Our approach</a>
          <Link href="/">
            All showcases <ArrowUpRight size={13} />
          </Link>
          <TemplateDownloadLink>
            Download ZIP <ArrowUpRight size={13} />
          </TemplateDownloadLink>
        </nav>
        <a className="forme-nav-cta" href="#forme-contact">
          Let’s talk <ArrowUpRight size={15} />
        </a>
      </header>
      <main id="forme-main">
        <section className="forme-hero">
          <Image
            src="/forme/courtyard-house.png"
            alt="A travertine courtyard house opening onto a still pool and Mediterranean landscape"
            fill
            priority
            sizes="100vw"
            className="forme-hero-image"
          />
          <div className="forme-hero-shade" />
          <div className="forme-hero-top">
            <span>ARCHITECTURE & INTERIORS</span>
            <span>SPACES FOR A SLOWER LIFE.</span>
          </div>
          <div className="forme-hero-copy">
            <Reveal>
              <h1>
                Room to
                <br />
                <em>feel.</em>
              </h1>
            </Reveal>
            <p>
              We shape spaces.
              <br />
              Life gives them meaning.
            </p>
          </div>
          <a className="forme-explore-link" href="#forme-explore">
            <span>STEP INSIDE</span>
            <ArrowDown size={19} />
          </a>
          <div className="forme-hero-bottom">
            <a href="#forme-project">
              <span>FEATURED RESIDENCE / 001</span>
              <strong>
                The Courtyard House <ArrowUpRight size={19} />
              </strong>
            </a>
            <span>LIGHT. MATERIAL. A SENSE OF BELONGING.</span>
          </div>
        </section>
        <section className="forme-intro" id="forme-studio">
          <div className="forme-section-label">
            <span className="forme-eyebrow">01 / THE WAY WE SEE IT</span>
            <Plus size={18} />
          </div>
          <Reveal>
            <h2>
              Less, but
              <br />
              <em>more meaningful.</em>
            </h2>
          </Reveal>
          <div className="forme-intro-bottom">
            <span className="forme-coordinate">
              38° 42′ N / 09° 08′ W<br />
              ROOTED IN PLACE. OPEN TO POSSIBILITY.
            </span>
            <p>
              We believe the most remarkable spaces don’t ask for attention.
              They invite you to stay. Our practice brings together
              architecture, interiors, and the quiet intelligence of natural
              materials.
            </p>
          </div>
        </section>
        <ArchitectureExperience />
        <section className="forme-project" id="forme-project">
          <div className="forme-section-label">
            <span className="forme-eyebrow">03 / IN FOCUS</span>
            <span className="forme-eyebrow">A PLACE TO SIMPLY BE</span>
          </div>
          <Reveal className="forme-project-title">
            <h2>
              The Courtyard
              <br />
              <em>House.</em>
            </h2>
            <p>
              A home shaped around
              <br />
              the space it leaves open.
            </p>
          </Reveal>
          <div className="forme-project-photo">
            <Image
              src="/forme/courtyard-house.png"
              alt="The courtyard residence: limestone terraces, reflective water, and floor-to-ceiling glazing"
              fill
              sizes="(max-width:700px) 100vw, 90vw"
            />
            <span>RESIDENTIAL / CONCEPT NO. 001</span>
          </div>
          <div className="forme-project-info">
            <div>
              <h3>A dialogue with the landscape.</h3>
              <p>
                A sheltered courtyard. A roof that seems to float. A sequence of
                rooms that opens gradually to the horizon. This is our study of
                living with less between you and the world outside.
              </p>
            </div>
            <dl>
              <div>
                <dt>Discipline</dt>
                <dd>Architecture & interiors</dd>
              </div>
              <div>
                <dt>Setting</dt>
                <dd>Mediterranean coast</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Independent design study</dd>
              </div>
            </dl>
            <ProjectDetails />
          </div>
        </section>
        <section className="forme-material-story">
          <div className="forme-material-photo">
            <Image
              src="/forme/courtyard-house.png"
              alt="Detail of warm stone and timber in the Courtyard House"
              fill
              sizes="(max-width:700px) 100vw, 50vw"
            />
          </div>
          <div className="forme-material-story-copy">
            <span className="forme-eyebrow">04 / MADE TO AGE BEAUTIFULLY</span>
            <Reveal>
              <h2>
                Honest materials.
                <br />
                <em>Lasting character.</em>
              </h2>
              <p>
                The grain of timber. The texture of stone. The way a wall holds
                the afternoon light. We start with what is real, and let it
                become something personal.
              </p>
            </Reveal>
            <a href="#forme-explore">
              Explore the material palette <ArrowUpRight size={17} />
            </a>
          </div>
        </section>
        <section className="forme-contact" id="forme-contact">
          <span className="forme-eyebrow">
            EVERY SPACE STARTS WITH A CONVERSATION.
          </span>
          <Reveal>
            <h2>
              What do you
              <br />
              <em>have in mind?</em>
            </h2>
          </Reveal>
          <a href="mailto:hello@example.com?subject=FORME%20project%20inquiry">
            Start a conversation <ArrowUpRight size={24} />
          </a>
          <p>
            Template preview · replace the contact address before publishing.
          </p>
        </section>
      </main>
      <footer className="forme-footer">
        <div>
          <Link href="/">Back to the gallery ↗</Link>
          <span>ARCHITECTURE. INTERIORS. POSSIBILITIES.</span>
          <a href="#forme-main">Back to top ↑</a>
        </div>
        <span className="forme-footer-wordmark" aria-hidden="true">
          forme<span>®</span>
        </span>
        <div>
          <span>© 2026 FORME — AN INDEPENDENT CONCEPT</span>
          <span>BUILT FOR THE WAY WE LIVE.</span>
        </div>
      </footer>
    </>
  );
}
