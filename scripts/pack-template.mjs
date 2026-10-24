#!/usr/bin/env node
/**
 * Pack a clean template ZIP from the current git HEAD
 * (respects .gitignore — no node_modules, .next, or archive apps).
 *
 * Usage: node scripts/pack-template.mjs
 * Output: public/downloads/premium-frontend-template.zip
 */
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'downloads');
const outFile = join(outDir, 'premium-frontend-template.zip');

mkdirSync(outDir, { recursive: true });

try {
  execFileSync(
    'git',
    [
      'archive',
      '--format=zip',
      '--prefix=premium-frontend/',
      `-o`,
      outFile,
      'HEAD',
    ],
    { cwd: root, stdio: 'inherit' },
  );
} catch {
  console.error(
    'pack-template: git archive failed. Make sure this is a git repo with at least one commit.',
  );
  process.exit(1);
}

if (!existsSync(outFile)) {
  console.error('pack-template: zip was not created.');
  process.exit(1);
}

console.log(`Template ZIP ready → public/downloads/premium-frontend-template.zip`);
