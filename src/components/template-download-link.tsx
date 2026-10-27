import { TEMPLATE_DOWNLOAD_HREF } from '@/lib/template-download';

type Props = {
  className?: string;
  children?: React.ReactNode;
};

/** Download the starter template ZIP — safe in client or server components. */
export function TemplateDownloadLink({
  className,
  children = 'Download ZIP',
}: Props) {
  return (
    <a
      className={className}
      href={TEMPLATE_DOWNLOAD_HREF}
      download="nextjs-webgl-templates-template.zip"
      aria-label="Download all templates as a ZIP"
    >
      {children}
    </a>
  );
}
