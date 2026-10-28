import { fmt, units, type Copy } from './copy';
import { formatShortDay, type Stats } from './stats';
import type { WrappedData } from './types';

/** Versus is two subjects, four rounds, one verdict. */

export const VS_A = '#c6ff3d';
export const VS_B = '#ff5ad1';

export type Side = 'a' | 'b' | 'tie';

export type Round = {
  id: 'total' | 'streak' | 'peak' | 'active';
  kicker: string;
  title: string;
  a: number;
  b: number;
  show: [string, string];
  winner: Side;
};

export type Versus = {
  rounds: Round[];
  score: [number, number];
  winner: Side;
  overlap: {
    days: number;
    best: { date: string; a: number; b: number } | null;
  };
  max: number; // shared bar scale, so the two skylines are comparable
};

const pick = (a: number, b: number): Side =>
  a === b ? 'tie' : a > b ? 'a' : 'b';

export function compare(
  a: WrappedData,
  sa: Stats,
  b: WrappedData,
  sb: Stats,
  copy: Copy,
): Versus {
  const day = (s: Stats) =>
    s.busiest
      ? `${fmt(copy, s.busiest.count)} on ${formatShortDay(s.busiest.date)}`
      : '—';
  const rounds: Round[] = [
    {
      id: 'total',
      kicker: 'Round 1 — Volume',
      title: `Who did more?`,
      a: sa.total,
      b: sb.total,
      show: [
        `${fmt(copy, sa.total)} ${units(copy, sa.total)}`,
        `${fmt(copy, sb.total)} ${units(copy, sb.total)}`,
      ],
      winner: pick(sa.total, sb.total),
    },
    {
      id: 'streak',
      kicker: 'Round 2 — Consistency',
      title: 'Longest streak',
      a: sa.streak.length,
      b: sb.streak.length,
      show: [`${sa.streak.length} days`, `${sb.streak.length} days`],
      winner: pick(sa.streak.length, sb.streak.length),
    },
    {
      id: 'peak',
      kicker: 'Round 3 — Biggest day',
      title: 'Best single day',
      a: sa.busiest?.count ?? 0,
      b: sb.busiest?.count ?? 0,
      show: [day(sa), day(sb)],
      winner: pick(sa.busiest?.count ?? 0, sb.busiest?.count ?? 0),
    },
    {
      id: 'active',
      kicker: 'Round 4 — Showing up',
      title: 'Active days',
      a: sa.activeDays,
      b: sb.activeDays,
      show: [`${sa.activeDays} days`, `${sb.activeDays} days`],
      winner: pick(sa.activeDays, sb.activeDays),
    },
  ];

  const score: [number, number] = [
    rounds.filter((r) => r.winner === 'a').length,
    rounds.filter((r) => r.winner === 'b').length,
  ];
  // a 2–2 split goes to whoever did more overall
  const winner =
    score[0] !== score[1]
      ? score[0] > score[1]
        ? 'a'
        : 'b'
      : rounds[0].winner;

  const bByDate = new Map(b.days.map((d) => [d.date, d.count]));
  let days = 0;
  let best: Versus['overlap']['best'] = null;
  for (const d of a.days) {
    const other = bByDate.get(d.date) ?? 0;
    if (d.count > 0 && other > 0) {
      days++;
      if (!best || Math.min(d.count, other) > Math.min(best.a, best.b))
        best = { date: d.date, a: d.count, b: other };
    }
  }

  return {
    rounds,
    score,
    winner,
    overlap: { days, best },
    max: Math.max(sa.max, sb.max, 1),
  };
}

export function verdictLine(v: Versus, a: WrappedData, b: WrappedData) {
  const first = (d: WrappedData) => d.name.split(/\s+/)[0];
  const [x, y] = v.score;
  if (v.winner === 'tie') return `Dead heat, ${x}–${y}.`;
  const w = v.winner === 'a' ? a : b;
  const hi = Math.max(x, y);
  const lo = Math.min(x, y);
  return hi === lo
    ? `${first(w)} wins the tiebreak.`
    : `${first(w)} wins ${hi}–${lo}.`;
}
