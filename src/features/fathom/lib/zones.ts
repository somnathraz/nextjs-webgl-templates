export type Zone = {
  id: string;
  index: string;
  name: string;
  science: string;
  from: number;
  to: number;
  title: string[];
  body: string;
  facts: { label: string; value: string }[];
  side: 'left' | 'right';
};

/** The five layers of the open ocean. Depths in metres. */
export const ZONES: Zone[] = [
  {
    id: 'sunlight',
    index: '01',
    name: 'Sunlight zone',
    science: 'Epipelagic',
    from: 0,
    to: 200,
    title: ['Where', 'the', 'light', 'still', 'reaches.'],
    body: 'The top two hundred metres hold almost every fish you have ever seen. Sardines turn as one body, flashing silver to confuse whatever hunts them from below.',
    facts: [
      { label: 'Share of ocean volume', value: '2%' },
      { label: 'Share of marine life', value: '90%' },
      { label: 'Surface temperature', value: '24 °C' },
    ],
    side: 'left',
  },
  {
    id: 'twilight',
    index: '02',
    name: 'Twilight zone',
    science: 'Mesopelagic',
    from: 200,
    to: 1000,
    title: ['Blue', 'fades', 'into', 'something', 'slower.'],
    body: 'Photosynthesis ends here. What drifts through the dusk is soft, patient, and mostly water: bells that pulse upward every night in the largest migration on Earth.',
    facts: [
      { label: 'Sunlight remaining', value: '< 1%' },
      { label: 'Nightly migration', value: '10 bn t' },
      { label: 'Temperature', value: '4–20 °C' },
    ],
    side: 'right',
  },
  {
    id: 'midnight',
    index: '03',
    name: 'Midnight zone',
    science: 'Bathypelagic',
    from: 1000,
    to: 4000,
    title: ['The', 'only', 'light', 'left', 'is', 'alive.'],
    body: 'No sunlight has ever arrived this far. Colonies of siphonophores trail for forty metres, lit from within, signalling in a language made entirely of glow.',
    facts: [
      { label: 'Animals that glow', value: '76%' },
      { label: 'Longest colony', value: '45 m' },
      { label: 'Temperature', value: '4 °C' },
    ],
    side: 'left',
  },
  {
    id: 'abyssal',
    index: '04',
    name: 'Abyssal zone',
    science: 'Abyssopelagic',
    from: 4000,
    to: 6000,
    title: ['Heat', 'rises', 'from', 'the', 'planet', 'itself.'],
    body: 'Black smokers vent water at four hundred degrees into a sea barely above freezing. Whole ecosystems live on chemistry alone, without ever needing the sun.',
    facts: [
      { label: 'Vent temperature', value: '400 °C' },
      { label: 'Pressure', value: '600 atm' },
      { label: 'Seafloor covered', value: '83%' },
    ],
    side: 'right',
  },
  {
    id: 'hadal',
    index: '05',
    name: 'Hadal zone',
    science: 'Hadopelagic',
    from: 6000,
    to: 10935,
    title: ['Fewer', 'visitors', 'than', 'the', 'Moon.'],
    body: 'The trenches fall further than Everest rises. At the bottom of the Challenger Deep the water presses down with the weight of a hundred elephants on every hand-width.',
    facts: [
      { label: 'Deepest point', value: '10,935 m' },
      { label: 'Pressure', value: '1,086 atm' },
      { label: 'People who have been', value: '< 30' },
    ],
    side: 'left',
  },
];

export const MAX_DEPTH = 10935;

export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

/** Zone coordinate (0..5, fractional) to metres. */
export function depthAt(t: number) {
  const i = Math.min(ZONES.length - 1, Math.floor(clamp(t, 0, ZONES.length)));
  const zone = ZONES[i];
  return zone.from + (zone.to - zone.from) * clamp(t - i);
}

export function pressureAt(depth: number) {
  return 1 + depth / 10.07;
}

export function temperatureAt(depth: number) {
  if (depth < 200) return 24 - (depth / 200) * 6;
  if (depth < 1000) return 18 - ((depth - 200) / 800) * 14;
  if (depth < 4000) return 4 - ((depth - 1000) / 3000) * 1.8;
  return 2.2 - ((depth - 4000) / 6935) * 1.1;
}

/** Percent of surface light left; roughly 1% at 200 m. */
export function lightAt(depth: number) {
  return 100 * Math.exp(-depth / 43.4);
}

export type Specimen = {
  name: string;
  latin: string;
  depth: string;
  note: string;
  hue: number;
};

export const SPECIMENS: Specimen[] = [
  {
    name: 'Moon jelly',
    latin: 'Aurelia aurita',
    depth: '0–200 m',
    note: 'Four pale rings, no brain, 500 million years of practice.',
    hue: 196,
  },
  {
    name: 'Lanternfish',
    latin: 'Myctophidae',
    depth: '300–1,500 m',
    note: 'The most numerous vertebrate on the planet. Each wears its own pattern of lights.',
    hue: 172,
  },
  {
    name: 'Crown jelly',
    latin: 'Atolla wyvillei',
    depth: '1,000–4,000 m',
    note: 'When attacked it spins a ring of blue light, a burglar alarm to summon something bigger.',
    hue: 328,
  },
  {
    name: 'Giant siphonophore',
    latin: 'Praya dubia',
    depth: '700–1,000 m',
    note: 'Not one animal but thousands, cloned and specialised, chained into a single hunter.',
    hue: 262,
  },
  {
    name: 'Dumbo octopus',
    latin: 'Grimpoteuthis',
    depth: '3,000–7,000 m',
    note: 'Flies on ear-like fins above the abyssal plain, the deepest octopus known.',
    hue: 24,
  },
  {
    name: 'Hadal snailfish',
    latin: 'Pseudoliparis swirei',
    depth: '6,000–8,200 m',
    note: 'Translucent, boneless-soft, and the deepest fish ever filmed alive.',
    hue: 210,
  },
];
