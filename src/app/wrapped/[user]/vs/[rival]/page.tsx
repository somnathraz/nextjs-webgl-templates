import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getWrapped } from '@/features/wrapped/adapters';
import { copyFor } from '@/features/wrapped/adapters/copy';
import { WrappedMissing } from '@/features/wrapped/components/missing';
import { computeStats } from '@/features/wrapped/engine/stats';
import { compare, verdictLine } from '@/features/wrapped/engine/versus';
import { VersusStory } from '@/features/wrapped/versus-story';

type Props = { params: Promise<{ user: string; rival: string }> };

async function load({ params }: Props) {
  const { user, rival } = await params;
  const [a, b] = await Promise.all([getWrapped(user), getWrapped(rival)]);
  return { user, rival, a, b };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { a, b } = await load(props);
  if (!a.ok || !b.ok) return { title: 'Wrapped 2026 — Versus' };
  const copy = copyFor(a.data.kind);
  const sa = computeStats(a.data, copy);
  const sb = computeStats(b.data, copy);
  const v = compare(a.data, sa, b.data, sb, copy);
  return {
    title: `${a.data.name} vs ${b.data.name} — ${a.data.year}, wrapped`,
    description: `Four rounds, two years, one winner. ${verdictLine(v, a.data, b.data)}`,
    twitter: { card: 'summary_large_image' },
  };
}

export default async function VersusPage(props: Props) {
  const { user, rival, a, b } = await load(props);
  if (!a.ok)
    return (
      <WrappedMissing login={decodeURIComponent(user)} reason={a.reason} />
    );
  if (!b.ok)
    return (
      <WrappedMissing login={decodeURIComponent(rival)} reason={b.reason} />
    );
  // you can't fight yourself, and km can't fight commits
  if (a.data.id === b.data.id || a.data.kind !== b.data.kind)
    redirect(`/wrapped/${a.data.id}`);
  return <VersusStory a={a.data} b={b.data} />;
}
