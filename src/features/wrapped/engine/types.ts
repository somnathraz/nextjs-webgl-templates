/**
 * The engine's whole input contract. An adapter (GitHub, a fitness app, your
 * SaaS) only has to produce one of these — every slide, layout, card and OG
 * image is derived from it.
 */

export type Day = {
  date: string; // YYYY-MM-DD
  count: number; // anything countable: commits, km, orders, minutes
};

/** A share of the year — languages, sports, product categories. */
export type Slice = {
  name: string;
  color: string;
  share: number; // 0..1, slices sum to 1
};

/** A ranked favourite — repos, routes, best-selling products. */
export type RankItem = {
  name: string;
  value: number;
  label?: string; // secondary line, e.g. the repo's language
  color: string;
};

export type WrappedData = {
  kind: string; // adapter id — selects the copy deck
  id: string; // the URL segment that loads this subject
  name: string;
  handle: string; // shown as "@handle" unless sample
  avatar: string;
  year: number;
  days: Day[]; // Jan 1 → today, one entry per day
  breakdown: Slice[];
  ranking: RankItem[];
  /** Recent activity timestamps (ISO). Bucketed into local hours on the client. */
  events: string[];
  sample: boolean;
};

export type WrappedResult =
  | { ok: true; data: WrappedData }
  | { ok: false; reason: 'not-found' | 'unavailable' };
