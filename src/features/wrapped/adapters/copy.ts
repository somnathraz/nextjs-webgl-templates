import type { Copy } from '../engine/copy';
import { githubCopy } from './github/copy';
import { strideCopy } from './stride/copy';

/** Client-safe: which words each adapter's story uses. Add yours here. */
const COPY: Record<string, Copy> = {
  github: githubCopy,
  stride: strideCopy,
};

export function copyFor(kind: string): Copy {
  return COPY[kind] ?? githubCopy;
}
