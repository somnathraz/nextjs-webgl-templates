import type { Metadata } from 'next';
import '@/features/vela/styles/theme.css';

export const metadata: Metadata = {
  title: 'Vela — A new sense of possibility',
  description:
    'Meet Vela. An original spatial-computing concept, explored through a continuous 3D product journey.',
};

export default function VelaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="theme-vela">{children}</div>;
}
