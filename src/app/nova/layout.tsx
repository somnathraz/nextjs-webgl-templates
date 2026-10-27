import type { Metadata } from 'next';
import '@/features/nova/styles/theme.css';

export const metadata: Metadata = {
  title: 'Nova — Pure math, in motion',
  description:
    'A GPU particle engine: 90,000 points morphing through four shapes as you scroll, drawn live in a custom WebGL shader.',
};

export default function NovaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-nova">
      <a className="nova-skip" href="#nova-main">
        Skip to content
      </a>
      {children}
    </div>
  );
}
