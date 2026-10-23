import type { Metadata } from 'next';
import Link from 'next/link';
import '@/features/offday/styles/theme.css';

export const metadata: Metadata = {
  title: 'OFFDAY® — Good energy. Great detours.',
  description:
    'A little spark. A lot of possibility. Explore OFFDAY, a premium sparkling energy drink concept, in interactive 3D.',
};

export default function OffdayLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="theme-offday">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Link href="/" className="hub-back" aria-label="Back to gallery">
        All showcases
      </Link>
      {children}
    </div>
  );
}
