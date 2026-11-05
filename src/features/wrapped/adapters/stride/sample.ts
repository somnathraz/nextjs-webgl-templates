import { generateDays, generateEvents } from '../../engine/sample-kit';
import type { WrappedData } from '../../engine/types';

/**
 * The engine running on something that isn't code: "Stride", a made-up
 * fitness app. Swap this file for a call to your own API and the whole
 * story — skyline, streaks, clock, share card, OG image — follows.
 */
export function strideSample(year: number, until = new Date()): WrappedData {
  const days = generateDays(year, until, {
    seed: 4242,
    weekday: 0.55,
    weekend: 0.85,
    scale: 11,
    weekendScale: 26, // Sunday long runs
    streak: [60, 96, 4],
    spikes: [
      [116, 40], // spring half-marathon… and a full one
      [278, 38],
    ],
    gap: [196, 214], // calf strain
  });

  return {
    kind: 'stride',
    id: '_stride',
    name: 'Ayo Mensah',
    handle: 'ayo.runs',
    avatar: '',
    year,
    days,
    breakdown: [
      { name: 'Running', share: 0.62, color: '#ff6b35' },
      { name: 'Cycling', share: 0.21, color: '#3dd9ff' },
      { name: 'Swimming', share: 0.1, color: '#4f7cff' },
      { name: 'Hiking', share: 0.07, color: '#9be15d' },
    ],
    ranking: [
      {
        name: 'Riverside loop',
        value: 64,
        label: '8.2 km · flat',
        color: '#ff6b35',
      },
      { name: 'Hill repeats', value: 31, label: '6 × 400 m', color: '#ffd36b' },
      {
        name: 'Bridge to bridge',
        value: 22,
        label: '21.1 km',
        color: '#3dd9ff',
      },
    ],
    events: generateEvents(until, 12, [
      [6, 5],
      [7, 3],
      [18, 2],
    ]),
    sample: true,
  };
}
