import type { Metadata } from 'next';
import '@/features/mycelia/styles/theme.css';

export const metadata: Metadata = {
  title: 'Mycelia — Life, grown live',
  description:
    'A GPU slime-mold simulation: over a million Physarum agents deposit and sense a chemical trail, self-organizing into living networks that react to your cursor.',
};

export default function MyceliaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-myc">
      <a className="myc-skip" href="#myc-main">
        Skip to content
      </a>
      {children}
    </div>
  );
}
