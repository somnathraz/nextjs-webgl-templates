import type { Metadata } from 'next';
import '@/features/odyssey/styles/theme.css';

export const metadata: Metadata = {
  title: 'Odyssey — Beyond the known',
  description:
    'An endless passage through a world that has never existed. Fly through procedural mountains, drifting mist, and changing light.',
  openGraph: { images: ['/odyssey/preview.jpg'] },
  twitter: { card: 'summary_large_image' },
};

export default function OdysseyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="odyssey-theme">{children}</div>;
}
