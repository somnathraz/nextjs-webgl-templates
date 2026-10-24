import Link from 'next/link';
import { TemplateDownloadLink } from '@/components/template-download-link';

const SHOWCASES = [
  {
    href: '/relay',
    index: '04',
    name: 'Relay',
    blurb:
      'Agent orchestration in motion. WebGL signals, interactive workflows, and a visible execution trace.',
  },
  {
    href: '/forme',
    index: '03',
    name: 'FORME Architecture',
    blurb:
      'An immersive architectural study. Explore space, light, and materials.',
  },
  {
    href: '/aura',
    index: '01',
    name: 'Aura Studio',
    blurb: 'Luxury headphone storytelling and interactive 3D configuration.',
  },
  {
    href: '/offday',
    index: '02',
    name: 'Offday Energy',
    blurb: 'Sparkling energy brand with 3D packaging, scroll story, and shop.',
  },
] as const;

export default function GalleryPage() {
  return (
    <main className="hub">
      <div className="hub-top">
        <p className="hub-brand">Premium Frontend</p>
        <p className="hub-note">
          One domain. One Next.js deploy. Each concept is a route.
        </p>
      </div>
      <ul className="hub-list">
        {SHOWCASES.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>
              <span className="index">{item.index}</span>
              <span>
                <h2>{item.name}</h2>
                <p>{item.blurb}</p>
              </span>
              <span className="go">Open →</span>
            </Link>
          </li>
        ))}
      </ul>
      <aside className="hub-download">
        <div>
          <p className="hub-download-label">Starter template</p>
          <p className="hub-download-copy">
            Full Next.js hub as a ZIP — routes, features, and scoped themes.
            Unzip, run <code>npm ci</code>, then <code>npm run dev</code>.
          </p>
        </div>
        <TemplateDownloadLink className="hub-download-btn" />
      </aside>
    </main>
  );
}
