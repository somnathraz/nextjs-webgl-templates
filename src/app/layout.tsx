import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Premium Frontend',
    template: '%s · Premium Frontend',
  },
  description:
    'A collection of premium interactive Next.js showcases — one domain, one deploy, route per concept.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
