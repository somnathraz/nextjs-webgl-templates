import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import '@/features/wrapped/styles/theme.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-gw',
  display: 'swap',
});

const site = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  // absolute URLs for the per-user OG image; on Vercel, Next falls back to the deployment URL
  ...(site ? { metadataBase: new URL(site) } : {}),
  title: 'Wrapped 2026 — Your GitHub year in 3D',
  description:
    'Type a GitHub username and watch your year rebuild itself in 3D: every contribution a cube, morphing through a skyline, streaks, languages, a 24-hour clock, and your coder type — then a share card.',
  twitter: { card: 'summary_large_image' },
};

export default function WrappedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`theme-gw ${display.variable}`}>
      <a className="gw-skip" href="#gw-main">
        Skip to content
      </a>
      {children}
    </div>
  );
}
