import { getWrapped } from '@/features/wrapped/adapters';
import { OG_SIZE, fallbackOg, singleOg } from '@/features/wrapped/og';

export const alt = 'A year, wrapped in 3D';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ user: string }>;
}) {
  const { user } = await params;
  const result = await getWrapped(user);
  return result.ok ? singleOg(result.data) : fallbackOg();
}
