import type { Metadata } from 'next';
import '@/features/silo/theme.css';

export const metadata: Metadata = {
  title: 'SILO | Objects in a different light',
  description:
    'An orbital light study. Explore the form, finish, and movement of Orbit 01.',
};

export default function SiloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="silo">{children}</div>;
}
