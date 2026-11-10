import type { Metadata } from 'next';
import { Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import '@/features/fathom/styles/theme.css';

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--fathom-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--fathom-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FATHOM | A descent in five zones',
  description:
    'Scroll from the sunlit surface to the floor of the Mariana Trench. A real-time ocean of sardines, jellyfish, black smokers, and 10,935 metres of water.',
};

export default function FathomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`fathom ${display.variable} ${mono.variable}`}>
      {children}
    </div>
  );
}
