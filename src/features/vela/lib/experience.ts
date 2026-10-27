export type VelaSignal = {
  hero: number;
  story: number;
  world: number;
  studio: number;
  pointerX: number;
  pointerY: number;
};
export type VelaFinish = 'cloud' | 'graphite' | 'sage';
export type VelaView = 'front' | 'profile' | 'optics';
export type VelaSettings = { finish: VelaFinish; view: VelaView };

export const FINISHES = {
  cloud: {
    name: 'Cloud',
    frame: '#cdd0cd',
    fabric: '#e7e3da',
    tone: '#dedbd2',
  },
  graphite: {
    name: 'Graphite',
    frame: '#51585d',
    fabric: '#444b50',
    tone: '#596166',
  },
  sage: { name: 'Sage', frame: '#a0aaa0', fabric: '#a6afa0', tone: '#a9b3a5' },
};

export const clamp = (n: number) => Math.min(1, Math.max(0, n));
export const smooth = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};
