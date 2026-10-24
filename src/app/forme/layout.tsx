import type { Metadata } from 'next';
import '@/features/forme/styles/theme.css';
export const metadata: Metadata = {
  title: 'FORME — Architecture for a slower life',
  description:
    'An architectural exploration of light, material, and the spaces in between. Explore the Courtyard House in three dimensions.',
};
export default function FormeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-forme">
      <a className="forme-skip" href="#forme-main">
        Skip to content
      </a>
      {children}
    </div>
  );
}
