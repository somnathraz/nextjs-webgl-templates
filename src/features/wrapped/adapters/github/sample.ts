import { generateDays, generateEvents } from '../../engine/sample-kit';
import type { WrappedData } from '../../engine/types';
import { languageColor } from './languages';

/**
 * Two fake developers for demos and versus mode. Their ids start with an
 * underscore, which GitHub usernames can't contain, so they never shadow a
 * real account.
 */

const slices = (pairs: [string, number][]) =>
  pairs.map(([name, share]) => ({ name, share, color: languageColor(name) }));

export function githubSamples(year: number, until = new Date()) {
  const sample: WrappedData = {
    kind: 'github',
    id: '_sample',
    name: 'Sample Developer',
    handle: 'sample',
    avatar: '',
    year,
    days: generateDays(year, until, {
      seed: 2026,
      weekday: 0.82,
      weekend: 0.32,
      scale: 13,
      weekendScale: 6,
      streak: [128, 171, 2],
      spikes: [
        [73, 38],
        [212, 40],
        [263, 38],
      ],
      gap: [228, 238],
    }),
    breakdown: slices([
      ['TypeScript', 0.46],
      ['GLSL', 0.19],
      ['Rust', 0.15],
      ['Python', 0.12],
      ['CSS', 0.08],
    ]),
    ranking: [
      {
        name: 'shader-garden',
        value: 2140,
        label: 'GLSL',
        color: languageColor('GLSL'),
      },
      {
        name: 'tiny-orm',
        value: 864,
        label: 'Rust',
        color: languageColor('Rust'),
      },
      {
        name: 'dotfiles',
        value: 97,
        label: 'Shell',
        color: languageColor('Shell'),
      },
    ],
    events: generateEvents(until, 77, [
      [21, 3],
      [22, 4],
      [23, 3],
      [14, 1],
      [16, 1],
    ]),
    sample: true,
  };

  const rival: WrappedData = {
    kind: 'github',
    id: '_rival',
    name: 'Rival Developer',
    handle: 'rival',
    avatar: '',
    year,
    days: generateDays(year, until, {
      seed: 909,
      weekday: 0.6,
      weekend: 0.7,
      scale: 18,
      weekendScale: 16,
      spikes: [
        [40, 52],
        [150, 44],
      ],
      gap: [180, 205],
    }),
    breakdown: slices([
      ['Go', 0.38],
      ['TypeScript', 0.3],
      ['Python', 0.2],
      ['Shell', 0.12],
    ]),
    ranking: [
      {
        name: 'queue-lite',
        value: 3310,
        label: 'Go',
        color: languageColor('Go'),
      },
      {
        name: 'k8s-notes',
        value: 412,
        label: 'Shell',
        color: languageColor('Shell'),
      },
      {
        name: 'lint-the-world',
        value: 158,
        label: 'TypeScript',
        color: languageColor('TypeScript'),
      },
    ],
    events: generateEvents(until, 31, [
      [9, 3],
      [10, 4],
      [11, 2],
      [15, 1],
    ]),
    sample: true,
  };

  return { _sample: sample, _rival: rival } as Record<string, WrappedData>;
}
