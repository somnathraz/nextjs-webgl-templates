'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useMemo, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import type { SceneSignal } from '../hooks/use-scene-signal';

class Boundary extends Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="myc-canvas-fallback" />
    ) : (
      this.props.children
    );
  }
}

const AGENTS = 1024; // 1024 x 1024 = 1,048,576 agents
const SIM = 1024; // trail map resolution

// ---- shaders -------------------------------------------------------------

const quadVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const seedFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    float x = hash(vUv * 12.9 + 1.3);
    float y = hash(vUv * 47.3 + 9.1);
    float a = hash(vUv * 91.7 + 3.7) * 6.2831853;
    gl_FragColor = vec4(x, y, a, 1.0);
  }
`;

const updateFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uAgents;
  uniform sampler2D uTrail;
  uniform float uTime;
  uniform vec2  uPointer;      // sim-space target, or (-1,-1) when inactive
  uniform float uSensorAngle;
  uniform float uSensorDist;
  uniform float uTurn;
  uniform float uSpeed;
  uniform float uPointerForce;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float sense(vec2 p, float ang) {
    vec2 s = p + vec2(cos(ang), sin(ang)) * uSensorDist;
    return texture2D(uTrail, fract(s)).r;
  }

  void main() {
    vec4 a = texture2D(uAgents, vUv);
    vec2 p = a.xy;
    float ang = a.z;
    float rnd = hash(vUv + fract(uTime));

    float f = sense(p, ang);
    float l = sense(p, ang + uSensorAngle);
    float r = sense(p, ang - uSensorAngle);

    if (f > l && f > r) {
      // stay the course
    } else if (f < l && f < r) {
      ang += (rnd < 0.5 ? -uTurn : uTurn);
    } else if (r > l) {
      ang -= uTurn;
    } else if (l > r) {
      ang += uTurn;
    }

    // cursor acts like a strong attractant
    if (uPointer.x >= 0.0) {
      vec2 toM = uPointer - p;
      toM -= floor(toM + 0.5); // wrap-aware shortest vector
      float d = length(toM);
      if (d < 0.14) {
        float desired = atan(toM.y, toM.x);
        float diff = atan(sin(desired - ang), cos(desired - ang));
        ang += diff * uPointerForce * (1.0 - d / 0.14);
      }
    }

    p += vec2(cos(ang), sin(ang)) * uSpeed;
    p = fract(p);
    gl_FragColor = vec4(p, ang, 1.0);
  }
`;

const depositVert = /* glsl */ `
  uniform sampler2D uAgents;
  attribute vec2 aRef;
  void main() {
    vec4 a = texture2D(uAgents, aRef);
    gl_Position = vec4(a.xy * 2.0 - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;
  }
`;

const depositFrag = /* glsl */ `
  precision highp float;
  uniform float uDeposit;
  void main() { gl_FragColor = vec4(uDeposit, uDeposit, uDeposit, 1.0); }
`;

const diffuseFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTrail;
  uniform vec2 uTexel;
  uniform float uDecay;
  varying vec2 vUv;
  void main() {
    vec4 sum = vec4(0.0);
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        sum += texture2D(uTrail, fract(vUv + vec2(float(x), float(y)) * uTexel));
      }
    }
    gl_FragColor = (sum / 9.0) * uDecay;
  }
`;

const displayFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTrail;
  uniform vec2 uCover;
  uniform float uTime;
  varying vec2 vUv;

  vec3 palette(float t) {
    vec3 c = mix(vec3(0.015, 0.01, 0.045), vec3(0.11, 0.0, 0.33), smoothstep(0.0, 0.22, t));
    c = mix(c, vec3(0.0, 0.62, 0.72), smoothstep(0.22, 0.5, t));
    c = mix(c, vec3(0.35, 1.0, 0.55), smoothstep(0.5, 0.78, t));
    c = mix(c, vec3(1.0, 0.97, 0.8), smoothstep(0.78, 1.0, t));
    return c;
  }

  void main() {
    vec2 uv = (vUv - 0.5) * uCover + 0.5;
    float v = texture2D(uTrail, fract(uv)).r;
    float t = 1.0 - exp(-v * 1.7);
    vec3 col = palette(t);
    // gentle vignette
    float vig = smoothstep(1.25, 0.35, length(vUv - 0.5) * 1.9);
    col *= 0.55 + 0.45 * vig;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// ---- simulation resources ------------------------------------------------

function makeTarget(dim: number, type: THREE.TextureDataType, filter: THREE.MagnificationTextureFilter) {
  return new THREE.WebGLRenderTarget(dim, dim, {
    type,
    format: THREE.RGBAFormat,
    minFilter: filter,
    magFilter: filter,
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
  });
}

function buildSim() {
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.PlaneGeometry(2, 2);

  const seedMat = new THREE.ShaderMaterial({ vertexShader: quadVert, fragmentShader: seedFrag });
  const updateMat = new THREE.ShaderMaterial({
    vertexShader: quadVert,
    fragmentShader: updateFrag,
    uniforms: {
      uAgents: { value: null },
      uTrail: { value: null },
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(-1, -1) },
      uSensorAngle: { value: 0.5 },
      uSensorDist: { value: 0.013 },
      uTurn: { value: 0.32 },
      uSpeed: { value: 0.0016 },
      uPointerForce: { value: 0.16 },
    },
  });
  const diffuseMat = new THREE.ShaderMaterial({
    vertexShader: quadVert,
    fragmentShader: diffuseFrag,
    uniforms: {
      uTrail: { value: null },
      uTexel: { value: new THREE.Vector2(1 / SIM, 1 / SIM) },
      uDecay: { value: 0.955 },
    },
  });
  const displayMat = new THREE.ShaderMaterial({
    vertexShader: quadVert,
    fragmentShader: displayFrag,
    uniforms: {
      uTrail: { value: null },
      uCover: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
    },
  });

  // deposit points: one vertex per agent, referencing its texel in the agent map
  const N = AGENTS * AGENTS;
  const refs = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    refs[i * 2] = ((i % AGENTS) + 0.5) / AGENTS;
    refs[i * 2 + 1] = (Math.floor(i / AGENTS) + 0.5) / AGENTS;
  }
  const depositGeo = new THREE.BufferGeometry();
  depositGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  depositGeo.setAttribute('aRef', new THREE.BufferAttribute(refs, 2));
  depositGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);
  const depositMat = new THREE.ShaderMaterial({
    vertexShader: depositVert,
    fragmentShader: depositFrag,
    uniforms: { uAgents: { value: null }, uDeposit: { value: 0.2 } },
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const makeScene = (obj: THREE.Object3D) => {
    const scene = new THREE.Scene();
    scene.add(obj);
    return scene;
  };
  const seedScene = makeScene(new THREE.Mesh(quad, seedMat));
  const updateScene = makeScene(new THREE.Mesh(quad, updateMat));
  const diffuseScene = makeScene(new THREE.Mesh(quad, diffuseMat));
  const displayScene = makeScene(new THREE.Mesh(quad, displayMat));
  const depositPoints = new THREE.Points(depositGeo, depositMat);
  depositPoints.frustumCulled = false;
  const depositScene = makeScene(depositPoints);

  return {
    cam,
    agentA: makeTarget(AGENTS, THREE.FloatType, THREE.NearestFilter),
    agentB: makeTarget(AGENTS, THREE.FloatType, THREE.NearestFilter),
    trailA: makeTarget(SIM, THREE.HalfFloatType, THREE.LinearFilter),
    trailB: makeTarget(SIM, THREE.HalfFloatType, THREE.LinearFilter),
    seedMat,
    updateMat,
    diffuseMat,
    displayMat,
    depositMat,
    seedScene,
    updateScene,
    diffuseScene,
    displayScene,
    depositScene,
    seeded: false,
    frames: 0,
  };
}

type Sim = ReturnType<typeof buildSim>;

function Simulation({
  signal,
  reduced,
}: {
  signal: React.RefObject<SceneSignal>;
  reduced: boolean;
}) {
  const sim = useMemo(() => buildSim(), []);
  const size = useThree((s) => s.size);
  const simRef = useRef<Sim>(sim);

  useFrame(({ gl, clock }) => {
    const s = simRef.current;
    const sig = signal.current;

    // aspect-correct "cover" mapping for the square trail texture
    const aspect = size.width / Math.max(1, size.height);
    const coverX = aspect >= 1 ? 1 : aspect;
    const coverY = aspect >= 1 ? 1 / aspect : 1;
    (s.displayMat.uniforms.uCover.value as THREE.Vector2).set(coverX, coverY);
    s.displayMat.uniforms.uTime.value = clock.elapsedTime;

    const runCompute = !reduced || s.frames < 90;
    if (runCompute) {
      if (!s.seeded) {
        gl.setRenderTarget(s.agentA);
        gl.render(s.seedScene, s.cam);
        gl.setRenderTarget(s.trailA);
        gl.setClearColor(0x000000, 1);
        gl.clear();
        gl.setRenderTarget(s.trailB);
        gl.clear();
        s.seeded = true;
      }

      // scroll gently morphs the behavioural regime
      s.updateMat.uniforms.uSensorAngle.value = 0.42 + sig.progress * 0.75;
      s.updateMat.uniforms.uSensorDist.value = 0.011 + sig.progress * 0.02;
      s.updateMat.uniforms.uTurn.value = 0.28 + sig.progress * 0.25;
      s.updateMat.uniforms.uTime.value = clock.elapsedTime;

      // the cursor only tugs while it is actually moving, then releases so the
      // network relaxes back instead of collapsing into a point
      const movedRecently = performance.now() - sig.moved < 420;
      if (movedRecently && !reduced) {
        const su = sig.px * 0.5 + 0.5;
        const sv = sig.py * 0.5 + 0.5;
        (s.updateMat.uniforms.uPointer.value as THREE.Vector2).set(
          (su - 0.5) * coverX + 0.5,
          (sv - 0.5) * coverY + 0.5,
        );
      } else {
        (s.updateMat.uniforms.uPointer.value as THREE.Vector2).set(-1, -1);
      }

      // 1 — update agents (reads current trail)
      s.updateMat.uniforms.uAgents.value = s.agentA.texture;
      s.updateMat.uniforms.uTrail.value = s.trailA.texture;
      gl.setRenderTarget(s.agentB);
      gl.render(s.updateScene, s.cam);
      [s.agentA, s.agentB] = [s.agentB, s.agentA];

      // 2 — diffuse + decay the trail
      s.diffuseMat.uniforms.uTrail.value = s.trailA.texture;
      gl.setRenderTarget(s.trailB);
      gl.render(s.diffuseScene, s.cam);

      // 3 — deposit agents additively onto the diffused trail
      s.depositMat.uniforms.uAgents.value = s.agentA.texture;
      gl.autoClear = false;
      gl.setRenderTarget(s.trailB);
      gl.render(s.depositScene, s.cam);
      gl.autoClear = true;
      [s.trailA, s.trailB] = [s.trailB, s.trailA];

      s.frames++;
    }

    // 4 — present
    s.displayMat.uniforms.uTrail.value = s.trailA.texture;
    gl.setRenderTarget(null);
    gl.render(s.displayScene, s.cam);
  }, 1);

  return null;
}

export default function PhysarumScene({
  signal,
}: {
  signal: React.RefObject<SceneSignal>;
}) {
  const reduced = !!useReducedMotion();
  return (
    <Boundary>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        frameloop="always"
      >
        <Simulation signal={signal} reduced={reduced} />
      </Canvas>
    </Boundary>
  );
}
