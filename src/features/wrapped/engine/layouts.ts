import {
  CUBE,
  Writer,
  apportion,
  barHeight,
  calendarCell,
  hide,
  pileSlot,
  rand,
  shellPoint,
  skyline,
  torusPoint,
  type SceneTarget,
} from './scene-kit';
import type { Stats } from './stats';
import { monthOf, weekdayOf } from './stats';
import type { WrappedData } from './types';

/**
 * Every cube in the scene is one day of the year. Each slide is just a new
 * set of targets for those same cubes — skyline, piles, planets, a clock —
 * and the scene eases every instance from wherever it is to where it should be.
 */

export type SlideKey =
  | 'intro'
  | 'total'
  | 'peak'
  | 'streak'
  | 'months'
  | 'weekdays'
  | 'breakdown'
  | 'clock'
  | 'ranking'
  | 'persona'
  | 'share';

export type Palette = { base: string; accent: string; ink: string };

export type LayoutCtx = {
  data: WrappedData;
  stats: Stats;
  hours: number[] | null;
  palette: Palette;
};

export function buildLayout(key: SlideKey, ctx: LayoutCtx): SceneTarget {
  const { days } = ctx.data;
  const { stats, palette } = ctx;
  const n = days.length;
  const w = new Writer(n);
  const active = days
    .map((d, i) => (d.count > 0 ? i : -1))
    .filter((i) => i >= 0);
  const hideEmpty = () => {
    for (let i = 0; i < n; i++) if (!days[i].count) hide(w, days, i);
  };

  switch (key) {
    case 'intro': {
      for (let i = 0; i < n; i++) {
        const s = CUBE * (0.45 + rand(i + 77) * 0.6);
        w.put(i, shellPoint(i, [0, 0, 0], 3.2, 5.4), [s, s, s]);
        w.mix(i, palette.base, palette.accent, 0.15 + rand(i + 5) * 0.7);
      }
      return w.done([0, 0.4, 10.5], [0, 0, 0], 0.18);
    }

    case 'total':
    case 'share': {
      skyline(w, days, stats.max, (i, t) =>
        w.mix(i, palette.base, palette.accent, t),
      );
      return key === 'total'
        ? w.done([6.2, 5.6, 9.4], [0, 0.6, 0], 0.09)
        : w.done([0, 8.5, 12.5], [0, 0.4, 0], 0.12);
    }

    case 'peak': {
      const peak = stats.busiest ? days.indexOf(stats.busiest) : -1;
      skyline(w, days, stats.max, (i, t) =>
        i === peak
          ? w.paint(i, palette.ink)
          : w.mix(i, palette.base, palette.accent, t * 0.32),
      );
      if (peak < 0) return w.done([6.2, 5.6, 9.4], [0, 0.6, 0], 0);
      const { x, z } = calendarCell(days, peak);
      const h = barHeight(stats.busiest!.count, stats.max);
      return w.done([x + 2.6, h + 1.6, z + 4.4], [x, h * 0.55, z], 0);
    }

    case 'streak': {
      const a = days.findIndex((d) => d.date === stats.streak.start);
      const b = days.findIndex((d) => d.date === stats.streak.end);
      skyline(w, days, stats.max, (i, t) =>
        i >= a && i <= b
          ? w.mix(i, palette.accent, palette.ink, 0.15 + t * 0.6)
          : w.mix(i, palette.base, palette.accent, t * 0.28),
      );
      const ca = calendarCell(days, Math.max(0, a));
      const cb = calendarCell(days, Math.max(0, b));
      const mx = (ca.x + cb.x) / 2;
      const span = Math.abs(cb.x - ca.x);
      return w.done(
        [mx + 1.6, 4.2 + span * 0.15, 6.4 + span * 0.55],
        [mx, 0.4, 0],
        0,
      );
    }

    case 'months': {
      // center on the months that exist so far, not on a full year
      const mid = monthOf(days[n - 1]?.date ?? '2026-12-31') / 2;
      const seen = Array(12).fill(0);
      hideEmpty();
      for (const i of active) {
        const m = monthOf(days[i].date);
        w.put(i, pileSlot(seen[m]++, 2, (m - mid) * 1.02, 0), [
          CUBE,
          CUBE,
          CUBE,
        ]);
        if (m === stats.topMonth)
          w.mix(i, palette.accent, palette.ink, rand(i) * 0.35);
        else w.mix(i, palette.base, palette.accent, 0.3 + rand(i) * 0.2);
      }
      return w.done([0.6, 2.6, 9.2], [0, 1.1, 0], 0);
    }

    case 'weekdays': {
      const seen = Array(7).fill(0);
      hideEmpty();
      for (const i of active) {
        const d = weekdayOf(days[i].date);
        const angle = ((d - 3) / 7) * 1.6;
        w.put(
          i,
          pileSlot(
            seen[d]++,
            3,
            Math.sin(angle) * 4.4,
            -Math.cos(angle) * 4.4 + 4.4,
          ),
          [CUBE, CUBE, CUBE],
        );
        if (d === stats.topWeekday)
          w.mix(i, palette.accent, palette.ink, rand(i) * 0.35);
        else w.mix(i, palette.base, palette.accent, 0.28 + rand(i) * 0.2);
      }
      return w.done([0, 3.0, 9.6], [0, 0.8, 0.6], 0);
    }

    case 'breakdown': {
      const slices = ctx.data.breakdown;
      const split = apportion(
        active.length,
        slices.map((l) => l.share),
      );
      let k = 0;
      hideEmpty();
      slices.forEach((slice, li) => {
        const count = split[li];
        const a = (li / slices.length) * Math.PI * 2 + 0.4;
        const ring = slices.length > 1 ? 2.7 : 0;
        const cx = Math.cos(a) * ring;
        const cz = Math.sin(a) * ring;
        const radius = 0.32 * Math.cbrt(count) + 0.1;
        for (let j = 0; j < count; j++, k++) {
          const i = active[k];
          // golden-spiral directions, cube-root radii → evenly filled ball
          const y = 1 - (2 * (j + 0.5)) / count;
          const rr = Math.sqrt(1 - y * y);
          const t = j * 2.399963;
          const r = radius * Math.cbrt((j + 0.5) / count);
          const s = CUBE * 0.82;
          w.put(
            i,
            [cx + Math.cos(t) * rr * r, 1.2 + y * r, cz + Math.sin(t) * rr * r],
            [s, s, s],
          );
          w.mix(i, slice.color, palette.ink, rand(i) * 0.18);
        }
      });
      return w.done([0, 4.4, 8.4], [0, 1.0, 0], 0.22);
    }

    case 'clock': {
      const hours = ctx.hours ?? Array(24).fill(1);
      const split = apportion(active.length, hours);
      const peak = hours.indexOf(Math.max(...hours));
      let k = 0;
      hideEmpty();
      for (let h = 0; h < 24; h++) {
        const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
        const ox = Math.cos(a) * 3.3;
        const oz = Math.sin(a) * 3.3;
        const daylight = (Math.cos(((h - 14) / 24) * Math.PI * 2) + 1) / 2;
        for (let j = 0; j < split[h]; j++, k++) {
          const i = active[k];
          w.put(i, pileSlot(j, 2, ox, oz), [CUBE, CUBE, CUBE]);
          if (h === peak) w.paint(i, palette.ink);
          else w.mix(i, '#3b2a8f', palette.accent, daylight * 0.85 + 0.15);
        }
      }
      return w.done([0, 11.2, 9.8], [0, 0.2, 0], 0);
    }

    case 'ranking': {
      const items = ctx.data.ranking;
      const shares = [0.5, 0.3, 0.2].slice(0, items.length);
      const split = apportion(active.length, shares);
      const xs =
        items.length === 1
          ? [0]
          : items.length === 2
            ? [-0.9, 0.9]
            : [0, -1.7, 1.7];
      let k = 0;
      hideEmpty();
      items.forEach((item, ri) => {
        for (let j = 0; j < split[ri]; j++, k++) {
          const i = active[k];
          w.put(i, pileSlot(j, 4, xs[ri], 0), [CUBE, CUBE, CUBE]);
          w.mix(
            i,
            item.color,
            palette.ink,
            ri === 0 ? rand(i) * 0.3 : 0.15 + rand(i) * 0.2,
          );
        }
      });
      return w.done([0.4, 2.8, 8.0], [0, 1.0, 0], 0.1);
    }

    case 'persona': {
      for (let i = 0; i < n; i++) {
        const c = days[i].count;
        const s = c ? 0.14 + 0.16 * Math.sqrt(c / stats.max) : 0.08;
        w.put(i, torusPoint(i / n, i, 2.7, 0.75), [s, s, s]);
        w.mix(
          i,
          palette.base,
          palette.ink,
          c ? 0.55 + 0.45 * Math.sqrt(c / stats.max) : 0.15,
        );
      }
      return w.done([0, 4.6, 7.6], [0, 0.9, 0], 0.32);
    }
  }
}
