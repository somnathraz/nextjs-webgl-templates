import type { Metadata } from 'next';
import { getWrapped } from '@/features/wrapped/adapters';
import { copyFor } from '@/features/wrapped/adapters/copy';
import { WrappedMissing } from '@/features/wrapped/components/missing';
import { fmt, units } from '@/features/wrapped/engine/copy';
import { computeStats } from '@/features/wrapped/engine/stats';
import { WrappedStory } from '@/features/wrapped/story';

type Props = { params: Promise<{ user: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { user } = await params;
  const result = await getWrapped(user);
  if (!result.ok) return { title: 'Wrapped 2026' };
  const { data } = result;
  const copy = copyFor(data.kind);
  const stats = computeStats(data, copy);
  const who = data.sample ? data.name : `@${data.handle}`;
  return {
    title: `${data.name}'s ${data.year}, wrapped`,
    description: `${who}: ${fmt(copy, stats.total)} ${units(copy, stats.total)} in ${data.year}, a ${stats.streak.length}-day streak, and ${stats.archetype.title}.`,
    twitter: { card: 'summary_large_image' },
  };
}

export default async function WrappedUserPage({ params }: Props) {
  const { user } = await params;
  const result = await getWrapped(user);
  if (!result.ok)
    return (
      <WrappedMissing login={decodeURIComponent(user)} reason={result.reason} />
    );
  return <WrappedStory data={result.data} />;
}
