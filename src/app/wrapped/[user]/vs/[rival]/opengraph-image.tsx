import { getWrapped } from '@/features/wrapped/adapters';
import { OG_SIZE, fallbackOg, versusOg } from '@/features/wrapped/og';

export const alt = 'Two years, settled in 3D';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ user: string; rival: string }>;
}) {
  const { user, rival } = await params;
  const [a, b] = await Promise.all([getWrapped(user), getWrapped(rival)]);
  return a.ok && b.ok && a.data.kind === b.data.kind
    ? versusOg(a.data, b.data)
    : fallbackOg();
}
