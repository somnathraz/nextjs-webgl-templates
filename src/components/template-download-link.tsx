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
      download="premium-frontend-template.zip"
      aria-label="Download Premium Frontend template ZIP"
    >
      {children}
    </a>
  );
}
