import type { Metadata } from 'next';
import '@/features/relay/styles/theme.css';

export const metadata: Metadata = {
  title: 'Relay — Intelligence in motion',
  description:
    'An interactive agent orchestration concept. Follow the signal from intent to outcome.',
};

export default function RelayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-relay">
      <a className="relay-skip" href="#relay-main">
        Skip to content
      </a>
      {children}
    </div>
  );
}
