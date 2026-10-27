import type { Metadata } from 'next';
import '@/features/mercury/styles/theme.css';

export const metadata: Metadata = {
  title: 'Mercury — Liquid chrome, raymarched in real time',
  description:
    'A real-time liquid-metal blob: sphere-traced metaballs reflecting a procedural studio, with chromatic reflections, a Fresnel rim, and a cursor-chasing droplet — one GLSL fragment shader.',
  twitter: { card: 'summary_large_image' },
};

export default function MercuryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-mc">
      <a className="mc-skip" href="#mc-main">
        Skip to content
      </a>
      {children}
    </div>
  );
}
