import {
  CUBE,
  Writer,
  hide,
  pileSlot,
  rand,
  shellPoint,
  skyline,
  torusPoint,
  type SceneTarget,
} from './scene-kit';
import type { Stats } from './stats';
import type { WrappedData } from './types';
import { VS_A, VS_B, type Versus } from './versus';

/**
 * Two calendars in one scene: A's cubes come first, B's follow. Skylines sit
 * on parallel tracks (A behind, B in front) so every round is a face-off.
 */

export type VersusKey =
  | 'vs-intro'
  | 'vs-total'
  | 'vs-streak'
  | 'vs-peak'
  | 'vs-active'
  | 'vs-overlap'
  | 'vs-verdict'
  | 'vs-share';

export type VersusCtx = {
  a: WrappedData;
  b: WrappedData;
  sa: Stats;
  sb: Stats;
  v: Versus;
  base: string;
  ink: string;
};

const TRACK = 1.25; // half the gap between the two skylines

export function buildVersusLayout(key: VersusKey, ctx: VersusCtx): SceneTarget {
  const { a, b, sa, sb, v, base, ink } = ctx;
  const na = a.days.length;
  const w = new Writer(na + b.days.length);
  const sides = [
    { data: a, stats: sa, offset: 0, dz: -TRACK, color: VS_A },
    { data: b, stats: sb, offset: na, dz: TRACK, color: VS_B },
  ];

  const bothSkylines = (
    tint: (
      i: number,
      t: number,
      local: number,
      side: (typeof sides)[number],
    ) => void,
  ) => {
    for (const s of sides)
      skyline(
        w,
        s.data.days,
        v.max,
        (i, t, j) => tint(i, t, j, s),
        s.offset,
        s.dz,
      );
  };

  switch (key) {
    case 'vs-intro': {
      sides.forEach((s, k) => {
        s.data.days.forEach((_, j) => {
          const i = s.offset + j;
          const sz = CUBE * (0.45 + rand(i + 77) * 0.6);
          w.put(i, shellPoint(i, [k ? 3.3 : -3.3, 0, 0], 1.2, 2.8), [
            sz,
            sz,
            sz,
          ]);
          w.mix(i, base, s.color, 0.25 + rand(i + 5) * 0.75);
        });
      });
      return w.done([0, 0.6, 11.5], [0, 0, 0], 0.12);
    }

    case 'vs-total':
    case 'vs-share': {
      bothSkylines((i, t, _, s) => w.mix(i, base, s.color, t));
      return key === 'vs-total'
        ? w.done([6.4, 6.2, 10.4], [0, 0.6, 0], 0.06)
        : w.done([0, 9.8, 13.6], [0, 0.4, 0], 0.1);
    }

    case 'vs-streak': {
      const ranges = sides.map((s) => [
        s.data.days.findIndex((d) => d.date === s.stats.streak.start),
        s.data.days.findIndex((d) => d.date === s.stats.streak.end),
      ]);
      bothSkylines((i, t, j, s) => {
        const [lo, hi] = ranges[s.offset ? 1 : 0];
        if (j >= lo && j <= hi) w.mix(i, s.color, ink, 0.1 + t * 0.35);
        else w.mix(i, base, s.color, t * 0.22);
      });
      return w.done([0, 8.2, 10.2], [0, 0.4, 0], 0);
    }

    case 'vs-peak': {
      const peaks = sides.map((s) =>
        s.stats.busiest ? s.data.days.indexOf(s.stats.busiest) : -1,
      );
      bothSkylines((i, t, j, s) => {
        if (j === peaks[s.offset ? 1 : 0]) w.paint(i, s.color);
        else w.mix(i, base, s.color, t * 0.2);
      });
      return w.done([4.2, 6.4, 9.6], [0, 1.0, 0], 0);
    }

    case 'vs-active': {
      // every active day becomes a brick in that person's tower
      sides.forEach((s, k) => {
        let seen = 0;
        s.data.days.forEach((d, j) => {
          const i = s.offset + j;
          if (!d.count) return hide(w, s.data.days, j, s.offset, s.dz);
          w.put(i, pileSlot(seen++, 4, k ? 1.5 : -1.5, 0), [CUBE, CUBE, CUBE]);
          w.mix(i, s.color, ink, rand(i) * 0.25);
        });
      });
      const tallest = Math.max(sa.activeDays, sb.activeDays) / 16;
      return w.done(
        [0, 2 + tallest * 0.18, 9.6 + tallest * 0.12],
        [0, tallest * 0.16, 0],
        0.08,
      );
    }

    case 'vs-overlap': {
      const other = sides.map(
        (s) => new Map(s.data.days.map((d) => [d.date, d.count])),
      );
      bothSkylines((i, t, j, s) => {
        const d = s.data.days[j];
        const theirs = other[s.offset ? 0 : 1].get(d.date) ?? 0;
        if (d.count > 0 && theirs > 0) w.mix(i, ink, s.color, 0.15);
        else w.mix(i, base, s.color, t * 0.18);
      });
      return w.done([0, 8.8, 9.2], [0, 0.2, 0], 0);
    }

    case 'vs-verdict': {
      const win = v.winner === 'tie' ? -1 : v.winner === 'a' ? 0 : 1;
      sides.forEach((s, k) => {
        const n = s.data.days.length;
        const big = win === -1 || win === k;
        s.data.days.forEach((d, j) => {
          const i = s.offset + j;
          const heat = d.count ? Math.sqrt(d.count / v.max) : 0;
          const sz = big
            ? d.count
              ? 0.14 + 0.16 * heat
              : 0.08
            : 0.07 + 0.06 * heat;
          const R = win === -1 ? (k ? 2.1 : 3.0) : big ? 2.9 : 1.15;
          w.put(
            i,
            torusPoint(
              j / n + (k ? 0.5 / n : 0),
              j + k * 7,
              R,
              big ? 0.7 : 0.3,
              big ? 1 : 0.6,
            ),
            [sz, sz, sz],
          );
          if (big) w.mix(i, base, s.color, d.count ? 0.55 + 0.45 * heat : 0.2);
          else w.mix(i, base, s.color, 0.3);
        });
      });
      return w.done([0, 4.8, 7.8], [0, 0.9, 0], 0.3);
    }
  }
}
