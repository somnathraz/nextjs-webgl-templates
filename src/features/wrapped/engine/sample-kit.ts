import type { Day } from './types';

/** mulberry32 — tiny, seedable, good enough for believable fake years. */
export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type YearShape = {
  seed: number;
  weekday: number; // chance of activity on a weekday
  weekend: number; // … and on a weekend day
  scale: number; // typical busy-day size
  weekendScale?: number;
  spikes?: [dayOfYear: number, value: number][];
  streak?: [from: number, to: number, min: number];
  gap?: [from: number, to: number];
  round?: boolean;
};

/** A believable year with a weekly rhythm, seasons, spikes, a streak and a
 *  break. Deterministic, so screenshots and demos never change. */
export function generateDays(
  year: number,
  until: Date,
  shape: YearShape,
): Day[] {
  const rand = rng(shape.seed);
  const days: Day[] = [];
  const end = Math.min(until.getTime(), Date.UTC(year, 11, 31));
  for (let t = Date.UTC(year, 0, 1); t <= end; t += 86400000) {
    const d = new Date(t);
    const doy = days.length;
    const wd = d.getUTCDay();
    const weekend = wd === 0 || wd === 6;
    const season = 0.6 + 0.4 * Math.sin((doy / 365) * Math.PI * 2 - 1.2);
    let count = 0;
    if (rand() < (weekend ? shape.weekend : shape.weekday) * season) {
      const scale = weekend
        ? (shape.weekendScale ?? shape.scale / 2)
        : shape.scale;
      count = rand() ** 1.8 * scale * season + 1;
    }
    const s = shape.streak;
    if (s && doy >= s[0] && doy <= s[1])
      count = Math.max(count, s[2] + rand() * 6);
    for (const [at, value] of shape.spikes ?? [])
      if (doy === at) count = value + rand() * 8;
    const g = shape.gap;
    if (g && doy >= g[0] && doy <= g[1]) count = rand() < 0.15 ? 1 : 0;
    days.push({
      date: d.toISOString().slice(0, 10),
      count: shape.round === false ? count : Math.round(count),
    });
  }
  return days;
}

/** Activity timestamps clustered around chosen local hours. */
export function generateEvents(
  until: Date,
  seed: number,
  hours: [hour: number, weight: number][],
  n = 100,
): string[] {
  const rand = rng(seed);
  const total = hours.reduce((s, [, w]) => s + w, 0);
  const events: string[] = [];
  for (let i = 0; i < n; i++) {
    let pick = rand() * total;
    let hour = hours[0][0];
    for (const [h, w] of hours) {
      if ((pick -= w) <= 0) {
        hour = h;
        break;
      }
    }
    const day = new Date(until.getTime() - Math.floor(rand() * 80) * 86400000);
    day.setHours(hour, Math.floor(rand() * 60), 0, 0);
    events.push(day.toISOString());
  }
  return events;
}
