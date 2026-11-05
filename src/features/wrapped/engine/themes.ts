import type { SlideKey } from './layouts';
import type { VersusKey } from './versus-layouts';

export type SlideTheme = {
  a: string; // background, top
  b: string; // background, bottom
  ink: string; // text + highlighted cubes
  accent: string; // headline color + bright cubes
  base: string; // quiet cubes
};

/** Each slide gets its own color moment — the page eases between them. */
export const THEMES: Record<SlideKey, SlideTheme> = {
  intro: {
    a: '#1a1238',
    b: '#07060d',
    ink: '#ffffff',
    accent: '#c6ff3d',
    base: '#2b2550',
  },
  total: {
    a: '#0b3324',
    b: '#040a07',
    ink: '#ffffff',
    accent: '#c6ff3d',
    base: '#14241c',
  },
  peak: {
    a: '#3b0b4f',
    b: '#0d0414',
    ink: '#ffffff',
    accent: '#ff4fd8',
    base: '#2a1236',
  },
  streak: {
    a: '#4a1704',
    b: '#110503',
    ink: '#fff3e0',
    accent: '#ff7a1a',
    base: '#2c140a',
  },
  months: {
    a: '#08245a',
    b: '#03081a',
    ink: '#ffffff',
    accent: '#3dd9ff',
    base: '#13213f',
  },
  weekdays: {
    a: '#2f2a05',
    b: '#0b0a02',
    ink: '#ffffff',
    accent: '#ffe14a',
    base: '#26230c',
  },
  breakdown: {
    a: '#16164a',
    b: '#05051a',
    ink: '#ffffff',
    accent: '#9b8cff',
    base: '#1b1b3d',
  },
  clock: {
    a: '#04122a',
    b: '#0d1e3d',
    ink: '#ffffff',
    accent: '#ffd36b',
    base: '#14203a',
  },
  ranking: {
    a: '#420a17',
    b: '#0f0306',
    ink: '#ffffff',
    accent: '#ff5a5f',
    base: '#2d0f15',
  },
  persona: {
    a: '#d4ff4d',
    b: '#86d400',
    ink: '#0b0a12',
    accent: '#0b0a12',
    base: '#a6e12a',
  },
  share: {
    a: '#18112f',
    b: '#07060d',
    ink: '#ffffff',
    accent: '#c6ff3d',
    base: '#22203a',
  },
};

/** Versus slides stay dark so both corner colors read on every one. */
export const VS_THEMES: Record<VersusKey, SlideTheme> = {
  'vs-intro': {
    a: '#2a0f3a',
    b: '#07060d',
    ink: '#ffffff',
    accent: '#c6ff3d',
    base: '#262040',
  },
  'vs-total': {
    a: '#10243a',
    b: '#05070e',
    ink: '#ffffff',
    accent: '#c6ff3d',
    base: '#1a2233',
  },
  'vs-streak': {
    a: '#3a1408',
    b: '#0e0503',
    ink: '#ffffff',
    accent: '#ff7a1a',
    base: '#2a1a14',
  },
  'vs-peak': {
    a: '#2c0b3f',
    b: '#0b0412',
    ink: '#ffffff',
    accent: '#ff5ad1',
    base: '#25162f',
  },
  'vs-active': {
    a: '#0b2f22',
    b: '#030a07',
    ink: '#ffffff',
    accent: '#c6ff3d',
    base: '#16241e',
  },
  'vs-overlap': {
    a: '#08224f',
    b: '#030817',
    ink: '#ffffff',
    accent: '#3dd9ff',
    base: '#16203a',
  },
  'vs-verdict': {
    a: '#1b1140',
    b: '#05040b',
    ink: '#ffffff',
    accent: '#ffe14a',
    base: '#221c3c',
  },
  'vs-share': {
    a: '#18112f',
    b: '#07060d',
    ink: '#ffffff',
    accent: '#c6ff3d',
    base: '#22203a',
  },
};
