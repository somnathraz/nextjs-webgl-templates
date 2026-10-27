import type { Metadata } from 'next';
import '@/features/aviary/styles/theme.css';

export const metadata: Metadata = {
  title: 'Aviary — Any voice, any language, any sound',
  description:
    'A generative AI voice model concept: human-grade speech, 30-second voice cloning, birdsong and foley, 70+ languages, end-to-end encrypted.',
};

export default function AviaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="theme-aviary">{children}</div>;
}
