import type { Metadata } from 'next';
import '@/features/singularity/styles/theme.css';

export const metadata: Metadata = {
  title: 'Singularity — A black hole, traced by hand',
  description:
    'A real-time, raymarched black hole: gravitational lensing, a Doppler-beamed accretion disk, and a photon ring — every pixel a photon traced through curved spacetime in a GLSL shader.',
  openGraph: { images: ['/singularity/preview.jpg'] },
  twitter: { card: 'summary_large_image' },
};

export default function SingularityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-sg">
      <a className="sg-skip" href="#sg-main">
        Skip to content
      </a>
      {children}
    </div>
  );
}
