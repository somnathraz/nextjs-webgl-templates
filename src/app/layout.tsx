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
    default: 'Next.js WebGL Templates',
    template: '%s · Next.js WebGL Templates',
  },
  description:
    '14 open-source Next.js + React Three Fiber / WebGL templates — raymarching, GPU fluids, particles, scroll storytelling, and 3D product pages. MIT licensed.',
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
