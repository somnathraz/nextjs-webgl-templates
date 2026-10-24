export const MATERIALS = [
  {
    name: 'Travertine',
    color: '#c6b99d',
    detail: 'Warm stone. Quiet permanence.',
    wood: '#574331',
  },
  {
    name: 'Limestone',
    color: '#e5e0d1',
    detail: 'Pale surfaces. A softer light.',
    wood: '#89735a',
  },
  {
    name: 'Basalt',
    color: '#555b58',
    detail: 'Dark mineral. Strong contrast.',
    wood: '#765137',
  },
] as const;
export const VIEWS = ['Approach', 'Inhabit', 'Unfold'] as const;
export type ViewName = (typeof VIEWS)[number];
