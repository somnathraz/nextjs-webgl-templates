/** Public path for the packed template ZIP (created by `npm run pack:template` / prebuild). */
export const LOCAL_TEMPLATE_ZIP = '/downloads/nextjs-webgl-templates-template.zip';

/** Fallback when the local ZIP has not been packed yet. */
export const GITHUB_TEMPLATE_ZIP =
  'https://github.com/somnathraz/nextjs-webgl-templates/archive/refs/heads/main.zip';

/** Stable href used in headers — resolves local vs GitHub at request time. */
export const TEMPLATE_DOWNLOAD_HREF = '/api/template-zip';
