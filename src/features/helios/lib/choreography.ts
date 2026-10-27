export type HeliosSignal = {
  scroll: number;
  story: number;
  instrument: number;
  pointerX: number;
  pointerY: number;
  velocity: number;
  burst: number;
  burstStrength: number;
  chargeStart: number;
  rotationX: number;
  rotationY: number;
};

export type InstrumentSettings = {
  aperture: number;
  energy: number;
  finish: 'platinum' | 'copper' | 'obsidian';
  paused: boolean;
};

export const DEFAULT_SETTINGS: InstrumentSettings = {
  aperture: 0.28,
  energy: 0.55,
  finish: 'platinum',
  paused: false,
};

export const CHAPTERS = [
  {
    number: '01',
    label: 'MATTER',
    title: ['Everything begins', 'with a spark.'],
    body: 'Seventy-two sculpted blades. One living center. A machine built around the thing it cannot contain.',
    footnote: 'ANATOMY OF AN IMPOSSIBLE OBJECT',
  },
  {
    number: '02',
    label: 'ORBIT',
    title: ['Let go of', 'the center.'],
    body: 'Structure becomes choreography. Each piece follows its own orbit, held together by an invisible rhythm.',
    footnote: 'ORDER, AT THE EDGE OF CHAOS',
  },
  {
    number: '03',
    label: 'BEYOND',
    title: ['There is no', 'edge to light.'],
    body: 'Leave the object behind. Travel through the energy that brought it to life.',
    footnote: 'A CHANGE IN PERSPECTIVE',
  },
];

export const clamp = (n: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, n));
export const smooth = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};
