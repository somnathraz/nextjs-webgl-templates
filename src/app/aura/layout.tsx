import type { Metadata } from 'next';
import Link from 'next/link';
import '@/features/aura/styles/theme.css';

export const metadata: Metadata = {
  title: 'Aura One — A world of your own',
  description:
    'Explore Aura One. An immersive headphone concept with a live 3D configurator, considered materials, and sound that feels personal.',
};

export default function AuraLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="theme-aura">
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
