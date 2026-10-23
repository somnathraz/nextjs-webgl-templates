import Link from 'next/link';

const SHOWCASES = [
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
    </main>
  );
}
