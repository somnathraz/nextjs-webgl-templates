import { existsSync } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import {
  GITHUB_TEMPLATE_ZIP,
  LOCAL_TEMPLATE_ZIP,
} from '@/lib/template-download';

export function GET(request: Request) {
  const localPath = path.join(
    process.cwd(),
    'public/downloads/premium-frontend-template.zip',
  );
  const target = existsSync(localPath)
    ? new URL(LOCAL_TEMPLATE_ZIP, request.url)
    : GITHUB_TEMPLATE_ZIP;
  return NextResponse.redirect(target, 302);
}
