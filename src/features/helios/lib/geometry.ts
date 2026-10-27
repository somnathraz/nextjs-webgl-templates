import * as THREE from 'three';

/** A solid swept blade, including its back and edge surfaces. */
export function makeBlade() {
  const positions: number[] = [];
  const indices: number[] = [];
  const segments = 24;
  for (let layer = 0; layer < 2; layer++) {
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      for (let side = 0; side < 2; side++) {
        const v = side - 0.5;
        const radius = 0.78 + u * 1.35;
        const angle = u * 0.68 + v * (0.085 + u * 0.055);
        positions.push(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          Math.sin(u * Math.PI) * 0.38 + v * 0.28 + (layer - 0.5) * 0.045,
        );
      }
    }
  }
  const n = (segments + 1) * 2;
  const quad = (a: number, b: number, c: number, d: number) =>
    indices.push(a, b, d, b, c, d);
  for (let i = 0; i < segments; i++) {
    const j = i * 2;
    quad(j, j + 2, j + 3, j + 1);
    quad(n + j + 1, n + j + 3, n + j + 2, n + j);
    quad(j, n + j, n + j + 2, j + 2);
    quad(j + 3, n + j + 3, n + j + 1, j + 1);
  }
  quad(1, n + 1, n, 0);
  quad(n - 2, n * 2 - 2, n * 2 - 1, n - 1);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function makeDust(count: number) {
  const data = new Float32Array(count * 3);
  let seed = 821;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    data[i * 3] = random();
    data[i * 3 + 1] = random();
    data[i * 3 + 2] = random();
  }
  return data;
}
