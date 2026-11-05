import * as THREE from 'three';
import { weekdayOf } from './stats';
import type { Day } from './types';

/**
 * Building blocks for scene layouts. A layout is just three typed arrays
 * (position, scale, color per cube) plus a camera — the scene eases every
 * cube from wherever it is toward these targets.
 */

export type Vec3 = [number, number, number];

export type SceneTarget = {
  pos: Float32Array;
  scale: Float32Array;
  color: Float32Array;
  camera: Vec3;
  look: Vec3;
  spin: number; // rad/s; 0 means "settle facing front"
};

export const GAP = 0.3; // grid pitch
export const CUBE = 0.24; // cube edge

export function rand(i: number) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export class Writer {
  pos: Float32Array;
  scale: Float32Array;
  color: Float32Array;
  private c = new THREE.Color();
  private a = new THREE.Color();
  private b = new THREE.Color();
  constructor(n: number) {
    this.pos = new Float32Array(n * 3);
    this.scale = new Float32Array(n * 3);
    this.color = new Float32Array(n * 3);
  }
  put(i: number, p: Vec3, s: Vec3) {
    this.pos.set(p, i * 3);
    this.scale.set(s, i * 3);
  }
  paint(i: number, color: string) {
    this.c.setStyle(color);
    this.color.set([this.c.r, this.c.g, this.c.b], i * 3);
  }
  mix(i: number, from: string, to: string, t: number) {
    this.a.setStyle(from);
    this.b.setStyle(to);
    this.c.copy(this.a).lerp(this.b, THREE.MathUtils.clamp(t, 0, 1));
    this.color.set([this.c.r, this.c.g, this.c.b], i * 3);
  }
  done(camera: Vec3, look: Vec3, spin: number): SceneTarget {
    return {
      pos: this.pos,
      scale: this.scale,
      color: this.color,
      camera,
      look,
      spin,
    };
  }
}

/** Week column / weekday row of day `i`, centered on the origin. */
export function calendarCell(days: Day[], i: number) {
  const first = weekdayOf(days[0]?.date ?? '2026-01-01');
  const idx = i + first;
  const w = Math.floor(idx / 7);
  const d = idx % 7;
  return { x: (w - 26) * GAP, z: (d - 3) * GAP };
}

export function barHeight(count: number, max: number) {
  return count > 0 ? 0.12 + Math.sqrt(count / Math.max(1, max)) * 2.6 : 0.05;
}

/** 0..1 intensity used to tint a bar by how busy its day was. */
export function heat(count: number, max: number) {
  return count ? 0.35 + 0.65 * Math.sqrt(count / Math.max(1, max)) : 0.05;
}

/**
 * Lay a calendar out as a skyline. `offset` is the first cube index this
 * calendar owns and `dz` shifts it along depth — versus mode puts two
 * calendars side by side in one scene.
 */
export function skyline(
  w: Writer,
  days: Day[],
  max: number,
  tint: (i: number, t: number, local: number) => void,
  offset = 0,
  dz = 0,
) {
  for (let j = 0; j < days.length; j++) {
    const { x, z } = calendarCell(days, j);
    const h = barHeight(days[j].count, max);
    w.put(offset + j, [x, h / 2, z + dz], [CUBE, h, CUBE]);
    tint(offset + j, heat(days[j].count, max), j);
  }
}

/** Stack the k-th cube into an n×n footprint tower at (ox, oz). */
export function pileSlot(k: number, n: number, ox: number, oz: number): Vec3 {
  const layer = Math.floor(k / (n * n));
  const r = k % (n * n);
  return [
    ox + ((r % n) - (n - 1) / 2) * GAP,
    CUBE / 2 + layer * GAP,
    oz + (Math.floor(r / n) - (n - 1) / 2) * GAP,
  ];
}

/** Collapse a cube into the floor near its calendar cell. */
export function hide(
  w: Writer,
  days: Day[],
  local: number,
  offset = 0,
  dz = 0,
) {
  const { x, z } = calendarCell(days, local);
  w.put(offset + local, [x * 0.4, 0, (z + dz) * 0.4], [0, 0, 0]);
}

/** Split `n` items by shares, guaranteeing the counts sum to n. */
export function apportion(n: number, shares: number[]) {
  const sum = shares.reduce((a, b) => a + b, 0) || 1;
  const out = shares.map((s) => Math.floor((s / sum) * n));
  let left = n - out.reduce((a, b) => a + b, 0);
  for (let k = 0; left > 0; k = (k + 1) % out.length, left--) out[k]++;
  return out;
}

/** Point `t` (0..1) along a helix wound around a torus. */
export function torusPoint(
  t: number,
  i: number,
  R: number,
  r: number,
  y = 1,
): Vec3 {
  const u = t * Math.PI * 2;
  const v = i * 0.92;
  return [
    (R + r * Math.cos(v)) * Math.cos(u),
    y + r * Math.sin(v),
    (R + r * Math.cos(v)) * Math.sin(u),
  ];
}

/** Random point in a spherical shell around `c`. */
export function shellPoint(
  i: number,
  c: Vec3,
  inner: number,
  outer: number,
): Vec3 {
  const u = rand(i) * Math.PI * 2;
  const v = Math.acos(2 * rand(i + 999) - 1);
  const r = inner + rand(i + 333) * (outer - inner);
  return [
    c[0] + r * Math.sin(v) * Math.cos(u),
    c[1] + r * Math.cos(v),
    c[2] + r * Math.sin(v) * Math.sin(u),
  ];
}
