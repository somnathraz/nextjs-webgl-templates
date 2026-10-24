import Link from 'next/link';
import { TemplateDownloadLink } from '@/components/template-download-link';

/** Fixed top-right tools shown on showcase routes. */
export function ShowcaseChrome() {
  return (
    <nav className="hub-chrome" aria-label="Showcase tools">
      <Link href="/" className="hub-back">
        All showcases
      </Link>
      <TemplateDownloadLink className="hub-download-chip" />
    </nav>
  );
}
