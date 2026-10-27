import * as THREE from 'three';

export function roundedShape(width: number, height: number, radius: number) {
  const x = -width / 2,
    y = -height / 2,
    w = width,
    h = height,
    r = radius;
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

export function shellGeometry(
  width: number,
  height: number,
  depth: number,
  bevel = 0.06,
) {
  const geo = new THREE.ExtrudeGeometry(
    roundedShape(width, height, Math.min(height * 0.4, 0.6)),
    {
      depth,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: bevel,
      bevelThickness: bevel,
      curveSegments: 24,
    },
  );
  geo.translate(0, 0, -depth / 2);
  const position = geo.attributes.position;
  for (let i = 0; i < position.count; i++)
    position.setZ(i, position.getZ(i) - position.getX(i) ** 2 * 0.065);
  geo.computeVertexNormals();
  return geo;
}

export function cushionGeometry() {
  const shape = roundedShape(3.35, 1.43, 0.55);
  for (const x of [-0.78, 0.78]) {
    const hole = new THREE.Path();
    hole.absarc(x, 0, 0.53, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.24,
    bevelEnabled: true,
    bevelSize: 0.04,
    bevelThickness: 0.04,
    bevelSegments: 4,
    steps: 1,
    curveSegments: 36,
  });
  geometry.translate(0, 0, -0.12);
  return geometry;
}

/** Rounded, convex visor with UVs that also act as a window into the environment. */
export function visorGeometry() {
  const vertices: number[] = [],
    uv: number[] = [],
    indices: number[] = [];
  const rings = 20,
    sides = 128;
  for (let ring = 0; ring <= rings; ring++) {
    const r = ring / rings;
    for (let i = 0; i <= sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const c = Math.cos(a),
        s = Math.sin(a);
      const x = Math.sign(c) * Math.abs(c) ** 0.62 * 1.76 * r;
      const y = Math.sign(s) * Math.abs(s) ** 0.72 * 0.71 * r;
      const z = 0.13 - x * x * 0.08 + Math.cos(y * 2) * 0.045;
      vertices.push(x, y, z);
      uv.push(x / 3.52 + 0.5, y / 1.42 + 0.5);
      if (ring < rings && i < sides) {
        const j = ring * (sides + 1) + i;
        indices.push(
          j,
          j + sides + 1,
          j + 1,
          j + 1,
          j + sides + 1,
          j + sides + 2,
        );
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Broad woven band; a closed strip, not a cylinder disguised as fabric. */
export function bandGeometry(top = false) {
  const vertices: number[] = [],
    uv: number[] = [],
    indices: number[] = [];
  const segments = 96;
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      for (let edge = 0; edge < 2; edge++) {
        const v = edge - 0.5;
        if (top)
          vertices.push(
            v * 0.48,
            0.58 + Math.sin(u * Math.PI) * 0.9 + side * 0.045,
            -0.22 - u * 2.2,
          );
        else {
          const a = u * Math.PI;
          const r = 1.75 + side * 0.05;
          vertices.push(
            Math.cos(a) * r,
            v * (0.51 + Math.sin(a) * 0.17) + 0.05,
            -0.25 - Math.sin(a) * 2.15,
          );
        }
        uv.push(u * (top ? 5 : 10), edge * 1.8);
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
    quad(j + 1, j + 3, n + j + 3, n + j + 1);
  }
  quad(0, 1, n + 1, n);
  quad(n - 2, n * 2 - 2, n * 2 - 1, n - 1);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function fabricTexture() {
  const size = 128,
    data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const weave =
        Math.sin(((x + Math.sin(y * 0.35) * 3) * Math.PI) / 4) *
        Math.sin((y * Math.PI) / 8);
      const n = Math.round(155 + weave * 48);
      const j = (y * size + x) * 4;
      data[j] = n;
      data[j + 1] = n;
      data[j + 2] = n;
      data[j + 3] = 255;
    }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
