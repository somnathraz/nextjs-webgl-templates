export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

/**
 * Which New Year the page is about. For the first three days of January it
 * keeps celebrating the year that just arrived; after that it looks ahead.
 */
export function getYears(now = new Date()) {
  const arrived = now.getMonth() === 0 && now.getDate() <= 3;
  const next = arrived ? now.getFullYear() : now.getFullYear() + 1;
  return { previous: next - 1, next, arrived };
}

/** Real time left until the New Year, in the visitor's own time zone. */
export function timeLeft(next: number, now = new Date()) {
  const ms = Math.max(0, new Date(next, 0, 1).getTime() - now.getTime());
  const seconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
  };
}

/**
 * The page's own clock. Scroll coordinate t runs 0..4:
 * 0..2 covers 23:50:00 to 23:59:50, 2..3 is the last ten seconds,
 * and everything after 3 is the new year.
 */
export function clockAt(t: number) {
  const start = 23 * 3600 + 50 * 60;
  const seconds =
    t <= 2
      ? start + (t / 2) * 590
      : t <= 3
        ? start + 590 + (t - 2) * 10
        : start + 600 + (t - 3) * 24;
  const whole = Math.floor(seconds) % 86400;
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(Math.floor(whole / 3600))}:${pad(Math.floor(whole / 60) % 60)}:${pad(whole % 60)}`;
}

export const CHAPTER_LABELS = [
  'The last night',
  'Look back',
  'Let go',
  'Countdown',
  'Midnight',
];

export function chapterAt(t: number) {
  return t < 0.1 ? 0 : t < 1.1 ? 1 : t < 2 ? 2 : t < 3 ? 3 : 4;
}

export const MONTHS = [
  ['January', 'The plans you made while it was still dark at four.'],
  ['February', 'The short one. It asked for patience and little else.'],
  ['March', 'The first evening you noticed the light had come back.'],
  ['April', 'Something you started without telling anyone.'],
  ['May', 'A long walk that fixed more than it should have.'],
  ['June', 'The longest day, and what you did with the extra hour.'],
  ['July', 'Windows open. A song you will always pin to this year.'],
  ['August', 'The week nothing happened, which was the whole point.'],
  ['September', 'New pencils, at any age. The year’s second January.'],
  ['October', 'The thing that changed, and how quietly it happened.'],
  ['November', 'A table, some people, more than enough.'],
  ['December', 'Tonight. Ten minutes left, and all of it still yours.'],
] as const;

export const LET_GO = [
  'Someday',
  'Almost',
  'Doomscrolling',
  'Perfect',
  'Too busy',
  'What they think',
  'The snooze button',
  'Sorry I’m late',
];
