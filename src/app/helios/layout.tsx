import type { Metadata } from 'next';
import '@/features/helios/styles/theme.css';

export const metadata: Metadata = {
  title: 'HELIOS — A study in captured light',
  description:
    'An interactive kinetic sculpture. Travel through matter, orbit, and light, then take control of the instrument.',
};

export default function HeliosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="theme-helios">{children}</div>;
}
