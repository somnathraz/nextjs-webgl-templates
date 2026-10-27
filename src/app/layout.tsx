import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Newsreader } from 'next/font/google';
import './globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Newsreader({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Premium Frontend',
    template: '%s · Premium Frontend',
  },
  description:
    'A Vercel-style gallery of premium interactive Next.js templates — 3D, storytelling, commerce, architecture, and agents.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
