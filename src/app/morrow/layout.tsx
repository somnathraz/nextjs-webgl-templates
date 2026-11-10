import type { Metadata } from 'next';
import '@/features/morrow/theme.css';
export const metadata: Metadata = {
  title: 'Morrow | A good hair day starts here',
  description:
    'A considered cut. Colour with character. Discover Morrow hair studio and plan your next salon visit.',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="morrow">{children}</div>;
}
