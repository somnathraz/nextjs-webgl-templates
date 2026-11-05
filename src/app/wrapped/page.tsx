import { WrappedHome } from '@/features/wrapped/home';
import { WRAPPED_YEAR } from '@/features/wrapped/engine/year';

export default function WrappedPage() {
  return <WrappedHome year={WRAPPED_YEAR} />;
}
