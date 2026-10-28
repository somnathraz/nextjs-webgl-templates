import type { Archetype, ArchetypeId, Copy } from './copy';
import type { Day, WrappedData } from './types';

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export type Stats = {
  total: number;
  activeDays: number;
  elapsedDays: number;
  max: number;
  busiest: Day | null;
  streak: { length: number; start: string; end: string };
  monthActive: number[];
  monthTotal: number[];
  topMonth: number;
  weekdayTotal: number[];
  topWeekday: number;
  topWeekdayShare: number;
  weekendShare: number;
  archetype: Archetype;
};

export const weekdayOf = (date: string) =>
  new Date(`${date}T00:00:00Z`).getUTCDay();
export const monthOf = (date: string) => Number(date.slice(5, 7)) - 1;

export function formatDay(date: string) {
  return `${MONTHS[monthOf(date)]} ${Number(date.slice(8, 10))}`;
}
export function formatShortDay(date: string) {
  return `${MONTHS[monthOf(date)].slice(0, 3)} ${Number(date.slice(8, 10))}`;
}

const argmax = (xs: number[]) =>
  xs.reduce((best, x, i) => (x > xs[best] ? i : best), 0);

function pickArchetype(
  s: Omit<Stats, 'archetype'>,
  data: WrappedData,
): ArchetypeId {
  const avg = s.activeDays ? s.total / s.activeDays : 0;
  const top = data.breakdown[0];
  if (s.total === 0) return 'quiet';
  if (s.streak.length >= 30) return 'streak';
  if (s.weekendShare >= 0.35) return 'weekend';
  if (data.breakdown.length >= 4 && top && top.share < 0.4) return 'variety';
  if (s.busiest && s.busiest.count >= avg * 6 && s.busiest.count >= avg + 10)
    return 'sprinter';
  if (s.elapsedDays && s.activeDays / s.elapsedDays >= 0.6) return 'daily';
  return 'steady';
}

export function computeStats(data: WrappedData, copy: Copy): Stats {
  const { days } = data;
  let total = 0;
  let activeDays = 0;
  let max = 0;
  let busiest: Day | null = null;
  const monthActive = Array(12).fill(0);
  const monthTotal = Array(12).fill(0);
  const weekdayTotal = Array(7).fill(0);
  let streak = { length: 0, start: '', end: '' };
  let run = 0;
  let runStart = '';

  for (const d of days) {
    total += d.count;
    if (d.count > max) max = d.count;
    if (d.count > 0) {
      activeDays++;
      monthActive[monthOf(d.date)]++;
      if (!busiest || d.count > busiest.count) busiest = d;
      if (run === 0) runStart = d.date;
      run++;
      if (run > streak.length)
        streak = { length: run, start: runStart, end: d.date };
    } else {
      run = 0;
    }
    monthTotal[monthOf(d.date)] += d.count;
    weekdayTotal[weekdayOf(d.date)] += d.count;
  }

  const topWeekday = argmax(weekdayTotal);
  const base = {
    total,
    activeDays,
    elapsedDays: days.length,
    max,
    busiest,
    streak,
    monthActive,
    monthTotal,
    topMonth: argmax(monthActive),
    weekdayTotal,
    topWeekday,
    topWeekdayShare: total ? weekdayTotal[topWeekday] / total : 0,
    weekendShare: total ? (weekdayTotal[0] + weekdayTotal[6]) / total : 0,
  };
  const id = pickArchetype(base, data);
  const a = copy.archetypes[id];
  return {
    ...base,
    archetype: {
      id,
      title: a.title,
      line: a.line({ streak: streak.length, variety: data.breakdown.length }),
    },
  };
}

/** Bucket event timestamps into the viewer's local hours. Client-only. */
export function hourHistogram(events: string[]): number[] | null {
  if (events.length < 8) return null;
  const hours = Array(24).fill(0);
  for (const t of events) hours[new Date(t).getHours()]++;
  return hours;
}

export function hourLabel(h: number) {
  const suffix = h < 12 ? 'AM' : 'PM';
  return `${h % 12 === 0 ? 12 : h % 12} ${suffix}`;
}
