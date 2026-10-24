/** Public path for the packed template ZIP (created by `npm run pack:template` / prebuild). */
export const LOCAL_TEMPLATE_ZIP = '/downloads/premium-frontend-template.zip';

/** Fallback when the local ZIP has not been packed yet. */
export const GITHUB_TEMPLATE_ZIP =
  'https://github.com/somnathraz/premium-frontend/archive/refs/heads/main.zip';

/** Stable href used in headers — resolves local vs GitHub at request time. */
export const TEMPLATE_DOWNLOAD_HREF = '/api/template-zip';
