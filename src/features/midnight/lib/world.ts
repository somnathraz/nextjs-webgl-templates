import * as THREE from 'three';
import type { NightSignal } from '../hooks/use-night';
import * as glsl from './shaders';

/** Camera keyframes at t = 0, 1, 2, 3, 4: street, windows, rooftops, sky, sky. */
const CAMERA_Y = [1.7, 11, 23, 33, 37];
const CAMERA_Z = [10, 12, 15, 22, 26];
const TARGET_Y = [8, 15, 26, 37, 42];

const PALETTES: [string, string][] = [
  ['#ffd27a', '#ff7a3c'],
  ['#ff6fb0', '#8f6bff'],
  ['#7fe9ff', '#3f7bff'],
  ['#ff5a4f', '#ffd27a'],
  ['#9dffb0', '#3fd6c0'],
  ['#ffffff', '#ffd27a'],
];

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sample a keyframe track at fractional t with eased segments. */
function track(keys: number[], t: number) {
  const i = Math.min(keys.length - 2, Math.max(0, Math.floor(t)));
  return keys[i] + (keys[i + 1] - keys[i]) * smoothstep(0, 1, t - i);
}

export type World = ReturnType<typeof createWorld>;

/**
 * Builds the whole night: sky, city, street, traffic, snow, lanterns and a
 * pool of fireworks. `onBurst` fires when a shell goes off, with its distance
 * from the camera, so the page can play a thump.
 */
export function createWorld(onBurst: (distance: number) => void) {
  const random = seeded(2027);
  const group = new THREE.Group();
  const disposables: { dispose(): void }[] = [];

  const shared = {
    uTime: { value: 0 },
    uPixel: { value: 1 },
    uCamY: { value: 0 },
    uLanterns: { value: 0 },
    uHaze: { value: new THREE.Color('#171233') },
    uFlash: { value: new THREE.Color(0, 0, 0) },
    uFlashPos: { value: new THREE.Vector3(0, 40, -30) },
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
  const attribute = (
    geometry: THREE.BufferGeometry,
    name: string,
    values: number[],
    size: number,
    perInstance = false,
  ) =>
    geometry.setAttribute(
      name,
      perInstance
        ? new THREE.InstancedBufferAttribute(new Float32Array(values), size)
        : new THREE.Float32BufferAttribute(values, size),
    );
  const instanced = (base: THREE.BufferGeometry, count: number) => {
    const geometry = keep(new THREE.InstancedBufferGeometry());
    geometry.index = base.index;
    for (const name of Object.keys(base.attributes))
      geometry.setAttribute(name, base.attributes[name]);
    geometry.instanceCount = count;
    return geometry;
  };

  /* Sky */
  const sky = place(
    new THREE.Mesh(
      keep(new THREE.IcosahedronGeometry(1, 3)),
      material(
        glsl.skyVertex,
        glsl.skyFragment,
        {
          uZenith: { value: new THREE.Color('#03040f') },
          uHorizon: { value: new THREE.Color('#241a48') },
          uMoon: { value: new THREE.Vector3(-0.42, 0.5, -0.76) },
        },
        { side: THREE.BackSide, depthWrite: false, depthTest: false },
      ),
    ),
  );
  sky.renderOrder = -1;

  /* City: a grid of towers with the avenue left open down the middle */
  const boxes: number[] = [];
  const infos: number[] = [];
  for (let x = -72; x <= 72; x += 5.2) {
    for (let z = -118; z <= 4; z += 5.6) {
      if (Math.abs(x) < 5.4) continue;
      if (random() < 0.08) continue;
      const downtown = Math.exp(-(x * x + (z + 34) * (z + 34)) / 1100);
      const canyon = Math.abs(x) < 11 ? 9 : 0;
      const height = Math.min(
        38,
        5 + random() * random() * 24 + downtown * 15 + canyon * random(),
      );
      boxes.push(
        x + (random() - 0.5) * 1.2,
        z + (random() - 0.5) * 1.2,
        2.8 + random() * 1.6,
        2.8 + random() * 1.8,
      );
      infos.push(height, random());
    }
  }
  const tower = keep(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
  const city = instanced(tower, infos.length / 2);
  attribute(city, 'aBox', boxes, 4, true);
  attribute(city, 'aInfo', infos, 2, true);
  place(new THREE.Mesh(city, material(glsl.cityVertex, glsl.cityFragment)));

  /* Street */
  const ground = place(
    new THREE.Mesh(
      keep(new THREE.PlaneGeometry(400, 400)),
      material(glsl.groundVertex, glsl.groundFragment),
    ),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = -80;

  /* Traffic */
  const cars = 150;
  const traffic = keep(new THREE.BufferGeometry());
  const carData: number[] = [];
  for (let i = 0; i < cars; i++) {
    const lane =
      (random() < 0.5 ? -1 : 1) * (0.9 + Math.floor(random() * 2) * 1.5);
    carData.push(lane, random() * 150, 6 + random() * 7);
  }
  attribute(traffic, 'position', new Array(cars * 3).fill(0), 3);
  attribute(traffic, 'aCar', carData, 3);
  place(
    new THREE.Points(
      traffic,
      material(glsl.trafficVertex, glsl.spriteFragment, {}, glow),
    ),
  );

  /* Snow */
  const flakes = 3600;
  const snow = keep(new THREE.BufferGeometry());
  const flakePositions: number[] = [];
  const flakeSeeds: number[] = [];
  for (let i = 0; i < flakes; i++) {
    flakePositions.push(random() * 70 - 35, random() * 36, random() * 80 - 50);
    flakeSeeds.push(random());
  }
  attribute(snow, 'position', flakePositions, 3);
  attribute(snow, 'aSeed', flakeSeeds, 1);
  place(
    new THREE.Points(
      snow,
      material(glsl.snowVertex, glsl.spriteFragment, {}, glow),
    ),
  );

  /* Sky lanterns */
  const lanternCount = 90;
  const lanternData: number[] = [];
  for (let i = 0; i < lanternCount; i++)
    lanternData.push(
      random() * 60 - 30,
      random() * 60 - 55,
      random(),
      0.5 + random() * 0.7,
    );
  const lanterns = instanced(
    keep(new THREE.CylinderGeometry(0.34, 0.24, 0.62, 10, 1, true)),
    lanternCount,
  );
  attribute(lanterns, 'aLantern', lanternData, 4, true);
  place(
    new THREE.Mesh(
      lanterns,
      material(
        glsl.lanternVertex,
        glsl.lanternFragment,
        {},
        {
          side: THREE.DoubleSide,
        },
      ),
    ),
  );

  /* Fireworks: a pool of shells sharing one geometry */
  const sparks = 620;
  const trail = 5;
  const fire = keep(new THREE.BufferGeometry());
  const dirs: number[] = [];
  const fireInfo: number[] = [];
  const v = new THREE.Vector3();
  for (let i = 0; i < sparks; i++) {
    v.set(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1);
    if (v.lengthSq() > 1 || v.lengthSq() < 0.001) {
      i--;
      continue;
    }
    v.normalize();
    const seed = random();
    for (let k = 0; k < trail; k++) {
      dirs.push(v.x, v.y, v.z);
      fireInfo.push(seed, k / trail, 0);
    }
  }
  for (let k = 0; k < 16; k++) {
    dirs.push(0, 0, 0);
    fireInfo.push(random(), k / 16, 1);
  }
  attribute(fire, 'position', new Array(dirs.length).fill(0), 3);
  attribute(fire, 'aDir', dirs, 3);
  attribute(fire, 'aInfo', fireInfo, 3);
  const shells = Array.from({ length: 22 }, () => {
    const shell = material(
      glsl.fireVertex,
      glsl.spriteFragment,
      {
        uOrigin: { value: new THREE.Vector3() },
        uLaunch: { value: new THREE.Vector3() },
        uStart: { value: -100 },
        uRise: { value: 1 },
        uColorA: { value: new THREE.Color() },
        uColorB: { value: new THREE.Color() },
        uSpeed: { value: 10 },
        uGravity: { value: 1 },
        uLife: { value: 2.4 },
        uRing: { value: 0 },
      },
      glow,
    );
    place(new THREE.Points(fire, shell));
    return shell;
  });

  const state = {
    time: 0,
    t: 0,
    px: 0,
    py: 0,
    fov: 0,
    nextShell: 0,
    nextAuto: 3,
    wasMidnight: false,
  };
  const pending: { at: number; color: THREE.Color; position: THREE.Vector3 }[] =
    [];
  const target = new THREE.Vector3();
  const ray = new THREE.Vector3();

  const launch = (x: number, y: number, z: number, delay = 0, rise = 1.1) => {
    const shell = shells[state.nextShell++ % shells.length];
    const u = shell.uniforms;
    const [a, b] = PALETTES[Math.floor(random() * PALETTES.length)];
    const kind = random();
    u.uOrigin.value.set(x, y, z);
    u.uLaunch.value.set(x + (random() - 0.5) * 5, y - 26, z);
    u.uStart.value = state.time + delay + rise;
    u.uRise.value = rise;
    u.uColorA.value.set(a);
    u.uColorB.value.set(b);
    u.uRing.value = 0;
    if (kind < 0.18) {
      u.uRing.value = 1;
      u.uSpeed.value = 11;
      u.uLife.value = 2.2;
      u.uGravity.value = 0.7;
    } else if (kind < 0.4) {
      // Willow: slow gold strands that hang and fall.
      u.uColorA.value.set('#ffe2a0');
      u.uColorB.value.set('#ff9a3c');
      u.uSpeed.value = 9;
      u.uLife.value = 3.8;
      u.uGravity.value = 2.1;
    } else {
      u.uSpeed.value = 10 + random() * 6;
      u.uLife.value = 2.2 + random() * 0.9;
      u.uGravity.value = 1.1;
    }
    pending.push({
      at: u.uStart.value,
      color: u.uColorA.value,
      position: u.uOrigin.value,
    });
  };
  const launchOverCity = (delay = 0, rise = 1.1, far = false) =>
    launch(
      (random() - 0.5) * (far ? 90 : 56),
      (far ? 34 : 36) + random() * 14,
      far ? -70 - random() * 30 : -18 - random() * 30,
      delay,
      rise,
    );

  return {
    group,
    bloom: 0.5,
    update(
      elapsed: number,
      signal: NightSignal,
      camera: THREE.PerspectiveCamera,
      width: number,
      height: number,
      pixelRatio: number,
    ) {
      const still = signal.reduced;
      const delta = Math.min(elapsed, 0.05);
      if (!still) state.time += delta;
      // Easing uses real elapsed time so a throttled tab still catches up.
      const ease = (rate: number) =>
        still ? 1 : 1 - Math.exp(-Math.min(elapsed, 0.5) * rate);
      state.t += (signal.t - state.t) * ease(3);
      state.px += (signal.pointerX - state.px) * ease(2.5);
      state.py += (signal.pointerY - state.py) * ease(2.5);
      const t = state.t;

      const aspect = width / Math.max(1, height);
      const fov = aspect < 1 ? 78 : 55;
      if (fov !== state.fov) {
        state.fov = fov;
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
      const camY = track(CAMERA_Y, t);
      camera.position.set(
        state.px * 1.1 + Math.sin(state.time * 0.17) * 0.2,
        camY + state.py * 0.5,
        track(CAMERA_Z, t),
      );
      target.set(state.px * 2.5, track(TARGET_Y, t) + state.py * 1.5, -40);
      camera.lookAt(target);

      /* Fireworks the visitor asked for */
      while (signal.launches.length) {
        const [nx, ny] = signal.launches.shift()!;
        if (still) continue;
        ray.set(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize();
        launch(
          camera.position.x + ray.x * 50,
          Math.max(14, camera.position.y + ray.y * 50),
          camera.position.z + ray.z * 50,
          0,
          0.7,
        );
      }

      /* The show: a few distant shells all evening, everything at midnight */
      const midnight = signal.t >= 2.995;
      if (!still) {
        if (midnight && !state.wasMidnight) {
          for (let i = 0; i < 8; i++) launchOverCity(i * 0.16, 0.55);
          state.nextAuto = state.time + 1.6;
        }
        if (state.time >= state.nextAuto) {
          if (midnight) {
            launchOverCity();
            if (random() < 0.4) launchOverCity(0.2);
            state.nextAuto = state.time + 0.35 + random() * 0.5;
          } else {
            launchOverCity(0, 1.3, true);
            state.nextAuto = state.time + 4 + random() * 5;
          }
        }
      }
      state.wasMidnight = midnight;

      /* Each burst flashes the scene and reports to the page */
      const flash = shared.uFlash.value;
      flash.multiplyScalar(Math.exp(-delta * 2.6));
      for (let i = pending.length - 1; i >= 0; i--) {
        const item = pending[i];
        if (state.time < item.at) continue;
        pending.splice(i, 1);
        flash.add(item.color);
        const peak = Math.max(flash.r, flash.g, flash.b);
        if (peak > 1.1) flash.multiplyScalar(1.1 / peak);
        shared.uFlashPos.value.copy(item.position);
        onBurst(camera.position.distanceTo(item.position));
      }

      shared.uTime.value = state.time;
      shared.uPixel.value = (pixelRatio * height) / 900;
      shared.uCamY.value = camY;
      shared.uLanterns.value =
        smoothstep(0.9, 1.5, t) * (1 - 0.65 * smoothstep(2.7, 3.1, t));
      this.bloom = 0.35 + 0.4 * smoothstep(2.8, 3.1, t);
    },
    dispose() {
      disposables.forEach((item) => item.dispose());
    },
  };
}
