import type { Metadata } from 'next';
import { Bodoni_Moda, DM_Mono } from 'next/font/google';
import '@/features/midnight/styles/theme.css';

const display = Bodoni_Moda({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--midnight-display',
  display: 'swap',
});

const mono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--midnight-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MIDNIGHT | The last ten minutes of the year',
  description:
    'Scroll through the last ten minutes of the year. Rise from a snowy street past lit windows and sky lanterns, count down from ten, and watch the fireworks at midnight.',
};

export default function MidnightLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`midnight ${display.variable} ${mono.variable}`}>
      {children}
    </div>
  );
}
