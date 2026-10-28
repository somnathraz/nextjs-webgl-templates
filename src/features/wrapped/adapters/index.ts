import { cache } from 'react';
import { WRAPPED_YEAR } from '../engine/year';
import type { WrappedResult } from '../engine/types';
import { fetchGithubWrapped } from './github/fetch';
import { githubSamples } from './github/sample';
import { strideSample } from './stride/sample';

/**
 * Server-side entry: turn a URL segment into engine data.
 *
 * Ids that start with "_" are built-in examples (they can never collide with
 * a GitHub username). Everything else is treated as a GitHub login. To wrap
 * your own product, add an example here or swap `fetchGithubWrapped` for a
 * function that queries your database and returns `WrappedData`.
 */
async function load(raw: string): Promise<WrappedResult> {
  const id = decodeURIComponent(raw).trim().toLowerCase();
  if (id === '_stride') return { ok: true, data: strideSample(WRAPPED_YEAR) };
  if (id.startsWith('_')) {
    const sample = githubSamples(WRAPPED_YEAR)[id];
    return sample
      ? { ok: true, data: sample }
      : { ok: false, reason: 'not-found' };
  }
  return fetchGithubWrapped(id);
}

/** Deduped per request, so a page, its metadata and versus share fetches. */
export const getWrapped = cache(load);
