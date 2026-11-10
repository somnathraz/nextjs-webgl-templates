import * as THREE from 'three';
import type { DiveSignal } from '../hooks/use-dive';
import * as glsl from './shaders';

/** World units of water per zone. The camera sinks five of these. */
const ZONE_HEIGHT = 16;

const TOP = ['#2c9dbd', '#0b6f98', '#052b4f', '#020b1c', '#01040c', '#03050a'];
const BOTTOM = [
  '#0a6394',
  '#053a66',
  '#020f28',
  '#01040e',
  '#000207',
  '#050403',
];

const JELLIES: [number, number, number, number, string][] = [
  [-3.3, -22, 0.6, 1.5, '#ff5fa8'],
  [2.6, -19, -6, 1.0, '#5fe1ff'],
  [-6.2, -26.5, -8, 1.3, '#a98bff'],
  [5.2, -27.5, -4, 0.9, '#7dffd0'],
  [-1.2, -30.5, -10, 1.6, '#5fe1ff'],
  [4.2, -33.5, -2, 0.8, '#ff5fa8'],
  [-5.4, -17.5, -12, 1.1, '#7dffd0'],
  [7.4, -23, -12, 1.4, '#a98bff'],
  [0.6, -25, -17, 2.1, '#ff7fc0'],
  [-2.6, -35.5, -3, 0.7, '#5fe1ff'],
];

const VENTS: [number, number, number][] = [
  [-5, -52, -6.5],
  [-8, -54.5, -10],
  [-2.6, -57, -12],
  [7, -55.5, -12],
  [9.5, -58.5, -9],
];

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Small deterministic PRNG so the ocean is identical on every visit. */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A sardine from six cross-sections: nose, shoulder, belly, taper, wrist, tail. */
function fishGeometry() {
  const stations = [
    [0.5, 0, 0],
    [0.36, 0.07, 0.035],
    [0.1, 0.13, 0.055],
    [-0.2, 0.09, 0.04],
    [-0.4, 0.025, 0.01],
    [-0.58, 0.14, 0.004],
  ];
  const sides = 6;
  const positions: number[] = [];
  const indices: number[] = [];
  stations.forEach(([x, h, w]) => {
    for (let k = 0; k < sides; k++) {
      const angle = (k / sides) * Math.PI * 2;
      positions.push(x, Math.cos(angle) * h, Math.sin(angle) * w);
    }
  });
  for (let i = 0; i < stations.length - 1; i++) {
    for (let k = 0; k < sides; k++) {
      const a = i * sides + k;
      const b = i * sides + ((k + 1) % sides);
      const c = a + sides;
      const d = b + sides;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function instanced(
  base: THREE.BufferGeometry,
  count: number,
  attributes: Record<string, [number[], number]>,
) {
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.index = base.index;
  for (const name of Object.keys(base.attributes))
    geometry.setAttribute(name, base.attributes[name]);
  geometry.instanceCount = count;
  for (const [name, [array, size]] of Object.entries(attributes))
    geometry.setAttribute(
      name,
      new THREE.InstancedBufferAttribute(new Float32Array(array), size),
    );
  return geometry;
}

export type World = ReturnType<typeof createWorld>;

export function createWorld() {
  const random = seeded(1093);
  const group = new THREE.Group();
  const disposables: { dispose(): void }[] = [];
  const top = TOP.map((hex) => new THREE.Color(hex));
  const bottom = BOTTOM.map((hex) => new THREE.Color(hex));

  const shared = {
    uTime: { value: 0 },
    uT: { value: 0 },
    uCamY: { value: 0 },
    uPixel: { value: 1 },
    uAspect: { value: 1 },
    uVelocity: { value: 0 },
    uPointer: { value: new THREE.Vector2() },
    uTorch: { value: new THREE.Vector3() },
    uWater: { value: new THREE.Color() },
    uTop: { value: new THREE.Color() },
    uBottom: { value: new THREE.Color() },
  };

  const material = (
    vertexShader: string,
    fragmentShader: string,
    uniforms: Record<string, THREE.IUniform> = {},
    options: THREE.ShaderMaterialParameters = {},
  ) => {
    const result = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { ...shared, ...uniforms },
      ...options,
    });
    disposables.push(result);
    return result;
  };
  const glow: THREE.ShaderMaterialParameters = {
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  };
  const place = <T extends THREE.Object3D>(object: T) => {
    object.frustumCulled = false;
    group.add(object);
    return object;
  };
  const keep = <T extends THREE.BufferGeometry>(geometry: T) => {
    disposables.push(geometry);
    return geometry;
  };
  const points = (
    count: number,
    fill: (i: number) => number[],
    extra: Record<string, [(i: number) => number[], number]>,
  ) => {
    const geometry = keep(new THREE.BufferGeometry());
    const build = (make: (i: number) => number[]) => {
      const out: number[] = [];
      for (let i = 0; i < count; i++) out.push(...make(i));
      return out;
    };
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(build(fill), 3),
    );
    for (const [name, [make, size]] of Object.entries(extra))
      geometry.setAttribute(
        name,
        new THREE.Float32BufferAttribute(build(make), size),
      );
    return geometry;
  };

  /* Water column */
  const backdrop = place(
    new THREE.Mesh(
      keep(new THREE.PlaneGeometry(2, 2)),
      material(
        glsl.backdropVertex,
        glsl.backdropFragment,
        {},
        {
          depthTest: false,
          depthWrite: false,
        },
      ),
    ),
  );
  backdrop.renderOrder = -1;

  /* Marine snow and surface bubbles */
  place(
    new THREE.Points(
      points(
        3200,
        () => [random() * 40 - 20, random() * 30, random() * 36 - 32],
        { aSeed: [() => [random()], 1] },
      ),
      material(glsl.snowVertex, glsl.snowFragment, {}, glow),
    ),
  );
  place(
    new THREE.Points(
      points(
        170,
        () => [random() * 22 - 11, random() * 16, random() * 17 - 14],
        { aSeed: [() => [random()], 1] },
      ),
      material(glsl.bubbleVertex, glsl.bubbleFragment, {}, glow),
    ),
  );

  /* Sunlight zone: a bait ball of sardines */
  const fishCount = 2400;
  const fishSeeds: number[] = [];
  for (let i = 0; i < fishCount; i++)
    fishSeeds.push(random() * Math.PI * 2, random(), random(), random());
  place(
    new THREE.Mesh(
      keep(
        instanced(keep(fishGeometry()), fishCount, { aSeed: [fishSeeds, 4] }),
      ),
      material(glsl.fishVertex, glsl.fishFragment, {
        uCenter: { value: new THREE.Vector3(3.7, -7.6, -3) },
      }),
    ),
  );

  /* Twilight zone: jellyfish */
  const tint = new THREE.Color();
  const bell = {
    jelly: [] as number[],
    tint: [] as number[],
    phase: [] as number[],
  };
  const tent = {
    jelly: [] as number[],
    tint: [] as number[],
    phase: [] as number[],
    shape: [] as number[],
  };
  JELLIES.forEach(([x, y, z, scale, hex]) => {
    const phase = random() * 6.28;
    tint.set(hex);
    bell.jelly.push(x, y, z, scale);
    bell.tint.push(tint.r, tint.g, tint.b);
    bell.phase.push(phase);
    const strand = (
      angle: number,
      length: number,
      width: number,
      r: number,
    ) => {
      tent.jelly.push(x, y, z, scale);
      tent.tint.push(tint.r, tint.g, tint.b);
      tent.phase.push(phase);
      tent.shape.push(angle, length, width, r);
    };
    for (let i = 0; i < 18; i++)
      strand(
        (i / 18) * 6.283 + random() * 0.2,
        2.2 + random() * 1.8,
        0.03,
        0.96,
      );
    for (let i = 0; i < 5; i++)
      strand(random() * 6.283, 1.1 + random() * 0.9, 0.24, 0.14);
  });
  place(
    new THREE.Mesh(
      keep(
        instanced(
          keep(
            new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2),
          ),
          JELLIES.length,
          {
            aJelly: [bell.jelly, 4],
            aTint: [bell.tint, 3],
            aPhase: [bell.phase, 1],
          },
        ),
      ),
      material(
        glsl.bellVertex,
        glsl.bellFragment,
        {},
        {
          ...glow,
          side: THREE.DoubleSide,
        },
      ),
    ),
  );
  place(
    new THREE.Mesh(
      keep(
        instanced(
          keep(new THREE.PlaneGeometry(1, 1, 1, 36).translate(0, -0.5, 0)),
          tent.phase.length,
          {
            aJelly: [tent.jelly, 4],
            aTint: [tent.tint, 3],
            aPhase: [tent.phase, 1],
            aTent: [tent.shape, 4],
          },
        ),
      ),
      material(
        glsl.tentacleVertex,
        glsl.tentacleFragment,
        {},
        {
          ...glow,
          side: THREE.DoubleSide,
        },
      ),
    ),
  );

  /* Midnight zone: a siphonophore spiralling around the descent */
  const spine = new THREE.CatmullRomCurve3(
    Array.from({ length: 42 }, (_, i) => {
      const angle = i * 0.55;
      const radius = 4.6 + Math.sin(i * 0.7) * 1.6;
      return new THREE.Vector3(
        Math.cos(angle) * radius + Math.sin(i * 0.3),
        -34 - i * 0.42,
        -3.5 + Math.sin(angle) * radius * 0.8,
      );
    }),
  );
  place(
    new THREE.Mesh(
      keep(new THREE.TubeGeometry(spine, 900, 0.04, 6)),
      material(glsl.chainVertex, glsl.chainFragment, {}, glow),
    ),
  );
  const beads = 320;
  place(
    new THREE.Points(
      points(beads, (i) => spine.getPointAt(i / (beads - 1)).toArray(), {
        aU: [(i) => [i / (beads - 1)], 1],
      }),
      material(glsl.beadVertex, glsl.beadFragment, {}, glow),
    ),
  );

  /* Abyssal zone: black smokers and their plumes */
  const rock = (
    geometry: THREE.BufferGeometry,
    amp: number,
    freq: number,
    color: string,
    heatY = 9999,
  ) =>
    place(
      new THREE.Mesh(
        keep(geometry),
        material(
          glsl.rockVertex,
          glsl.rockFragment,
          {
            uAmp: { value: amp },
            uFreq: { value: freq },
            uRock: { value: new THREE.Color(color) },
            uHeatY: { value: heatY },
          },
          { side: THREE.DoubleSide },
        ),
      ),
    );
  VENTS.forEach(([x, y, z], i) => {
    const chimney = rock(
      new THREE.CylinderGeometry(0.32, 1.5 + i * 0.12, 26, 18, 44, true),
      0.55,
      0.55,
      '#5a4a44',
      y,
    );
    chimney.position.set(x, y - 13, z);
  });
  const perVent = 260;
  place(
    new THREE.Points(
      points(VENTS.length * perVent, () => [0, 0, 0], {
        aVent: [(i) => VENTS[Math.floor(i / perVent)], 3],
        aSeed: [() => [random(), random()], 2],
      }),
      material(glsl.plumeVertex, glsl.plumeFragment, {}, glow),
    ),
  );

  /* Hadal zone: trench walls closing in, then the floor */
  for (const side of [-1, 1]) {
    const wall = rock(
      new THREE.PlaneGeometry(64, 30, 110, 52),
      2.6,
      0.22,
      '#56626f',
    );
    wall.position.set(side * 5.2, -76, -7);
    wall.rotation.y = -side * (Math.PI / 2 - 0.16);
  }
  const floor = rock(
    new THREE.PlaneGeometry(80, 80, 110, 110),
    1.3,
    0.3,
    '#69717b',
  );
  floor.position.set(0, -83.6, -14);
  floor.rotation.x = -Math.PI / 2;

  const state = { time: 0, t: 0, velocity: 0, px: 0, py: 0, fov: 0 };
  const target = new THREE.Vector3();
  const direction = new THREE.Vector3();

  return {
    group,
    /** Bloom strength for the current depth; read after update(). */
    bloom: 0.15,
    update(
      elapsed: number,
      signal: DiveSignal,
      camera: THREE.PerspectiveCamera,
      width: number,
      height: number,
      pixelRatio: number,
    ) {
      const delta = Math.min(elapsed, 0.05);
      const still = signal.reduced;
      if (!still) state.time += delta;
      // Easing uses real elapsed time so a throttled tab still catches up.
      const ease = (rate: number) =>
        still ? 1 : 1 - Math.exp(-Math.min(elapsed, 0.5) * rate);
      const previous = state.t;
      state.t += (signal.t - state.t) * ease(3);
      const speed = Math.min(
        2,
        Math.abs(state.t - previous) / Math.max(delta, 0.001),
      );
      state.velocity += (speed - state.velocity) * ease(4);
      state.px += (signal.pointerX - state.px) * ease(2.5);
      state.py += (signal.pointerY - state.py) * ease(2.5);

      const aspect = width / Math.max(1, height);
      const fov = aspect < 1 ? 74 : 50;
      if (fov !== state.fov) {
        state.fov = fov;
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }

      const t = state.t;
      const camY = -t * ZONE_HEIGHT;
      const settle = smoothstep(4.2, 5, t);
      camera.position.set(
        state.px * 0.7 + Math.sin(state.time * 0.2) * 0.15,
        camY + state.py * 0.4 + Math.sin(state.time * 0.31) * 0.08,
        6,
      );
      target.set(state.px * 0.25, camY - 0.3 - settle * 2.6, -6);
      camera.lookAt(target);

      const i = Math.min(TOP.length - 2, Math.floor(t));
      const f = Math.min(1, t - i);
      shared.uTop.value.lerpColors(top[i], top[i + 1], f);
      shared.uBottom.value.lerpColors(bottom[i], bottom[i + 1], f);
      shared.uWater.value.lerpColors(
        shared.uBottom.value,
        shared.uTop.value,
        0.4,
      );
      shared.uTime.value = state.time;
      shared.uT.value = t;
      shared.uCamY.value = camY;
      shared.uPixel.value = (pixelRatio * height) / 900;
      shared.uAspect.value = aspect;
      shared.uVelocity.value = state.velocity;
      shared.uPointer.value.set(state.px, state.py);
      direction
        .set(state.px * 0.9, state.py * 0.6 - settle * 0.25, -1)
        .normalize();
      shared.uTorch.value.copy(camera.position).addScaledVector(direction, 4.5);
      this.bloom = 0.07 + 0.83 * smoothstep(0.3, 1.6, t);
    },
    dispose() {
      disposables.forEach((item) => item.dispose());
    },
  };
}
