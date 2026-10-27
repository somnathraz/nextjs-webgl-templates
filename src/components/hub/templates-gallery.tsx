'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { TemplateDownloadLink } from '@/components/template-download-link';
import { TEMPLATES, TOPICS, type TemplateTopic } from '@/lib/templates';

export function TemplatesGallery() {
  const [topic, setTopic] = useState<TemplateTopic>('all');
  const active = TOPICS.find((t) => t.id === topic) ?? TOPICS[0];
  const items = useMemo(
    () =>
      topic === 'all'
        ? TEMPLATES
        : TEMPLATES.filter((t) => t.topics.includes(topic)),
    [topic],
  );

  return (
    <div className="tpl">
      <header className="tpl-nav">
        <Link href="/" className="tpl-brand">
          Premium Frontend
        </Link>
        <nav aria-label="Gallery">
          <a href="#topics">Topics</a>
          <a href="#templates">Templates</a>
          <a href="#start">Get started</a>
        </nav>
        <TemplateDownloadLink className="tpl-nav-cta">
          Download ZIP
        </TemplateDownloadLink>
      </header>

      <section className="tpl-hero">
        <p className="tpl-kicker">Template gallery</p>
        <h1>
          Premium interactive
          <br />
          Next.js templates
        </h1>
        <p className="tpl-lead">
          Deploy-ready showcases for product 3D, scroll storytelling, brand
          commerce, architecture, and agent UIs — one domain, one app, a route
          per concept.
        </p>
        <div className="tpl-hero-actions">
          <a className="tpl-btn tpl-btn-primary" href="#templates">
            Browse templates
          </a>
          <TemplateDownloadLink className="tpl-btn tpl-btn-ghost">
            Download starter ZIP
          </TemplateDownloadLink>
        </div>
      </section>

      <section id="topics" className="tpl-topics">
        <div className="tpl-section-head">
          <h2>Topics to read</h2>
          <p>
            Pick a lens. Filter the gallery below, or just skim what each
            showcase is built to demonstrate.
          </p>
        </div>
        <div className="tpl-topic-grid" role="list">
          {TOPICS.filter((t) => t.id !== 'all').map((t) => (
            <button
              key={t.id}
              type="button"
              role="listitem"
              className={
                topic === t.id ? 'tpl-topic-card is-active' : 'tpl-topic-card'
              }
              onClick={() => setTopic(t.id)}
              aria-pressed={topic === t.id}
            >
              <span className="tpl-topic-label">{t.label}</span>
              <strong>{t.title}</strong>
              <span>{t.body}</span>
            </button>
          ))}
        </div>
      </section>

      <section id="templates" className="tpl-templates">
        <div className="tpl-section-head tpl-section-head-row">
          <div>
            <h2>Templates</h2>
            <p>{active.body}</p>
          </div>
          <div className="tpl-filters" role="tablist" aria-label="Filter by topic">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={topic === t.id}
                className={topic === t.id ? 'is-active' : undefined}
                onClick={() => setTopic(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="tpl-grid">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="tpl-card">
                <div
                  className="tpl-card-preview"
                  style={{ background: item.previewTone }}
                >
                  {item.preview ? (
                    <Image
                      src={item.preview}
                      alt=""
                      fill
                      sizes="(max-width: 720px) 100vw, 33vw"
                      className="tpl-card-image"
                    />
                  ) : (
                    <div className="tpl-card-fallback" aria-hidden>
                      <span>{item.name}</span>
                    </div>
                  )}
                </div>
                <div className="tpl-card-body">
                  <div className="tpl-card-top">
                    <h3>{item.name}</h3>
                    <span className="tpl-card-go">Open →</span>
                  </div>
                  <p>{item.blurb}</p>
                  <ul className="tpl-tags">
                    {item.stack.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {items.length === 0 && (
          <p className="tpl-empty">No templates in this topic yet.</p>
        )}
      </section>

      <section id="start" className="tpl-start">
        <div className="tpl-start-copy">
          <h2>Get started</h2>
          <ol>
            <li>Download the ZIP or clone the GitHub repo.</li>
            <li>
              Run <code>npm ci</code> then <code>npm run dev</code>.
            </li>
            <li>
              Open a route — <code>/aura</code>, <code>/offday</code>,{' '}
              <code>/forme</code>, or <code>/relay</code>.
            </li>
            <li>
              Add your own showcase under <code>src/features/&lt;slug&gt;/</code>{' '}
              and ship one deploy.
            </li>
          </ol>
        </div>
        <div className="tpl-start-actions">
          <TemplateDownloadLink className="tpl-btn tpl-btn-primary">
            Download ZIP
          </TemplateDownloadLink>
          <a
            className="tpl-btn tpl-btn-ghost"
            href="https://github.com/somnathraz/premium-frontend"
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub
          </a>
        </div>
      </section>

      <footer className="tpl-footer">
        <span>Premium Frontend</span>
        <span>One Next.js app · Route per template</span>
      </footer>
    </div>
  );
}
