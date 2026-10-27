import type { Metadata } from 'next';
import '@/features/flux/styles/theme.css';

export const metadata: Metadata = {
  title: 'Flux — Fluid, painted with light',
  description:
    'A real-time GPU fluid simulation: semi-Lagrangian advection, Jacobi pressure projection, and vorticity confinement. Drag to paint the flow.',
};

export default function FluxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-flx">
      <a className="flx-skip" href="#flx-main">
        Skip to content
      </a>
      {children}
    </div>
  );
}
