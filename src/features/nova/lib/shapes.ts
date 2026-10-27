/**
 * Particle target geometries. Every particle gets a position in each of the
 * four shapes; the vertex shader blends between adjacent shapes by scroll
 * phase, so the whole field morphs continuously. All shapes are roughly
 * normalized to the same radius so the morph reads as one object reforming.
 */
export const NOVA_COUNT = 90_000;

const TAU = Math.PI * 2;

/** Deterministic pseudo-random so SSR/CSR and reloads stay identical. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export type NovaShapes = {
  sphere: Float32Array;
  galaxy: Float32Array;
  knot: Float32Array;
  field: Float32Array;
  seeds: Float32Array;
};

export function buildNovaShapes(count = NOVA_COUNT): NovaShapes {
  const sphere = new Float32Array(count * 3);
  const galaxy = new Float32Array(count * 3);
  const knot = new Float32Array(count * 3);
  const field = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const rand = rng(0x9e3779b9);

  const golden = Math.PI * (3 - Math.sqrt(5));
  const side = Math.ceil(Math.sqrt(count));

  for (let i = 0; i < count; i++) {
    const o = i * 3;
    seeds[i] = rand();

    // --- Sphere: fibonacci distribution on a shell (slightly fuzzy). ---
    const y = 1 - (i / (count - 1)) * 2;
    const rr = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const shell = 1.75 + (rand() - 0.5) * 0.08;
    sphere[o] = Math.cos(theta) * rr * shell;
    sphere[o + 1] = y * shell;
    sphere[o + 2] = Math.sin(theta) * rr * shell;

    // --- Galaxy: 4-arm logarithmic spiral disk with thickness falloff. ---
    const arms = 4;
    const t = Math.pow(rand(), 0.6);
    const radius = t * 2.25;
    const arm = (i % arms) * (TAU / arms);
    const spread = (rand() - 0.5) * (0.55 - t * 0.35);
    const angle = radius * 2.6 + arm + spread;
    const thickness = (rand() - 0.5) * 0.28 * (1 - t * 0.7);
    galaxy[o] = Math.cos(angle) * radius;
    galaxy[o + 1] = thickness + (1 - t) * (rand() - 0.5) * 0.4;
    galaxy[o + 2] = Math.sin(angle) * radius;

    // --- Torus knot (p=3, q=4) rendered as a fuzzy tube of points. ---
    const u = (i / count) * TAU * 4;
    const p = 3;
    const q = 4;
    const kr = Math.cos(q * u) + 2.4;
    const jx = (rand() - 0.5) * 0.14;
    const jy = (rand() - 0.5) * 0.14;
    const jz = (rand() - 0.5) * 0.14;
    knot[o] = (kr * Math.cos(p * u)) * 0.62 + jx;
    knot[o + 1] = (kr * Math.sin(p * u)) * 0.62 + jy;
    knot[o + 2] = -Math.sin(q * u) * 1.0 + jz;

    // --- Field: flat grid plane (the shader ripples it into a wave). ---
    const gx = i % side;
    const gz = Math.floor(i / side);
    field[o] = (gx / side - 0.5) * 4.4;
    field[o + 1] = (rand() - 0.5) * 0.05;
    field[o + 2] = (gz / side - 0.5) * 4.4;
  }

  return { sphere, galaxy, knot, field, seeds };
}
