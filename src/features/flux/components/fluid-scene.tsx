'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useMemo, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import type { FluidSignal } from '../hooks/use-fluid-signal';

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
      <div className="flx-canvas-fallback" />
    ) : (
      this.props.children
    );
  }
}

const SIM = 512; // square simulation grid
const PRESSURE_ITERS = 22;
const DT = 0.016;

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const splatFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTarget;
  uniform vec2 uPoint;
  uniform vec3 uValue;
  uniform float uRadius;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - uPoint;
    float g = exp(-dot(p, p) / uRadius);
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + g * uValue, 1.0);
  }
`;

const advectFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform float uDt;
  uniform float uDissipation;
  varying vec2 vUv;
  void main() {
    vec2 vel = texture2D(uVelocity, vUv).xy;
    vec2 coord = vUv - uDt * vel;
    gl_FragColor = uDissipation * texture2D(uSource, coord);
    gl_FragColor.a = 1.0;
  }
`;

const curlFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform vec2 uTexel;
  varying vec2 vUv;
  void main() {
    float l = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).y;
    float r = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).y;
    float b = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).x;
    float t = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).x;
    float curl = 0.5 * ((r - l) - (t - b));
    gl_FragColor = vec4(curl, 0.0, 0.0, 1.0);
  }
`;

const vorticityFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform sampler2D uCurl;
  uniform vec2 uTexel;
  uniform float uCurlStrength;
  uniform float uDt;
  varying vec2 vUv;
  void main() {
    float l = texture2D(uCurl, vUv - vec2(uTexel.x, 0.0)).x;
    float r = texture2D(uCurl, vUv + vec2(uTexel.x, 0.0)).x;
    float b = texture2D(uCurl, vUv - vec2(0.0, uTexel.y)).x;
    float t = texture2D(uCurl, vUv + vec2(0.0, uTexel.y)).x;
    float c = texture2D(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(t) - abs(b), abs(r) - abs(l));
    force /= length(force) + 1e-4;
    force *= uCurlStrength * c;
    force.y *= -1.0;
    vec2 vel = texture2D(uVelocity, vUv).xy;
    gl_FragColor = vec4(vel + force * uDt, 0.0, 1.0);
  }
`;

const divergenceFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform vec2 uTexel;
  varying vec2 vUv;
  void main() {
    float l = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
    float r = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
    float b = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
    float t = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).y;
    float div = 0.5 * ((r - l) + (t - b));
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

const pressureFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  uniform vec2 uTexel;
  varying vec2 vUv;
  void main() {
    float l = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
    float r = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
    float b = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
    float t = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
    float div = texture2D(uDivergence, vUv).x;
    float p = (l + r + b + t - div) * 0.25;
    gl_FragColor = vec4(p, 0.0, 0.0, 1.0);
  }
`;

const gradientFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  uniform vec2 uTexel;
  varying vec2 vUv;
  void main() {
    float l = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
    float r = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
    float b = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
    float t = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
    vec2 vel = texture2D(uVelocity, vUv).xy;
    vel -= 0.5 * vec2(r - l, t - b);
    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

const decayFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uFactor;
  varying vec2 vUv;
  void main() { gl_FragColor = texture2D(uTex, vUv) * uFactor; }
`;

const displayFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uDye;
  uniform vec2 uCover;
  varying vec2 vUv;
  void main() {
    vec2 uv = (vUv - 0.5) * uCover + 0.5;
    vec3 c = texture2D(uDye, uv).rgb;
    c = 1.0 - exp(-c * 1.35);          // soft tonemap
    c = pow(c, vec3(0.86));            // lift mids for glow
    float vig = smoothstep(1.3, 0.3, length(vUv - 0.5) * 1.85);
    c *= 0.6 + 0.4 * vig;
    gl_FragColor = vec4(c, 1.0);
  }
`;

function makeRT() {
  return new THREE.WebGLRenderTarget(SIM, SIM, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
  });
}

function buildFluid() {
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.PlaneGeometry(2, 2);
  const texel = new THREE.Vector2(1 / SIM, 1 / SIM);

  const mat = (fragmentShader: string, uniforms: Record<string, THREE.IUniform>) =>
    new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader, uniforms });

  const splatMat = mat(splatFrag, {
    uTarget: { value: null },
    uPoint: { value: new THREE.Vector2(0.5, 0.5) },
    uValue: { value: new THREE.Vector3() },
    uRadius: { value: 0.0002 },
  });
  const advectMat = mat(advectFrag, {
    uVelocity: { value: null },
    uSource: { value: null },
    uDt: { value: DT },
    uDissipation: { value: 1 },
  });
  const curlMat = mat(curlFrag, { uVelocity: { value: null }, uTexel: { value: texel } });
  const vorticityMat = mat(vorticityFrag, {
    uVelocity: { value: null },
    uCurl: { value: null },
    uTexel: { value: texel },
    uCurlStrength: { value: 25 },
    uDt: { value: DT },
  });
  const divergenceMat = mat(divergenceFrag, { uVelocity: { value: null }, uTexel: { value: texel } });
  const pressureMat = mat(pressureFrag, {
    uPressure: { value: null },
    uDivergence: { value: null },
    uTexel: { value: texel },
  });
  const gradientMat = mat(gradientFrag, {
    uPressure: { value: null },
    uVelocity: { value: null },
    uTexel: { value: texel },
  });
  const decayMat = mat(decayFrag, { uTex: { value: null }, uFactor: { value: 0.8 } });
  const displayMat = mat(displayFrag, {
    uDye: { value: null },
    uCover: { value: new THREE.Vector2(1, 1) },
  });

  const scene = new THREE.Scene();
  const mesh = new THREE.Mesh(quad);
  scene.add(mesh);
  const renderPass = (gl: THREE.WebGLRenderer, material: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null) => {
    mesh.material = material;
    gl.setRenderTarget(target);
    gl.render(scene, cam);
  };

  return {
    cam,
    renderPass,
    splatMat,
    advectMat,
    curlMat,
    vorticityMat,
    divergenceMat,
    pressureMat,
    gradientMat,
    decayMat,
    displayMat,
    velA: makeRT(),
    velB: makeRT(),
    dyeA: makeRT(),
    dyeB: makeRT(),
    prsA: makeRT(),
    prsB: makeRT(),
    div: makeRT(),
    curl: makeRT(),
    cleared: false,
  };
}

type Fluid = ReturnType<typeof buildFluid>;

function hsv(h: number, s: number, v: number) {
  const f = (n: number) => {
    const k = (n + h * 6) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return new THREE.Vector3(f(5), f(3), f(1));
}

function Simulation({
  signal,
  reduced,
}: {
  signal: React.RefObject<FluidSignal>;
  reduced: boolean;
}) {
  const sim = useMemo(() => buildFluid(), []);
  const fluidRef = useRef<Fluid>(sim);
  const lastPtr = useRef({ x: 0.5, y: 0.5, init: false });
  const size = useThree((s) => s.size);

  const splat = (
    gl: THREE.WebGLRenderer,
    px: number,
    py: number,
    value: THREE.Vector3,
    radius: number,
    which: 'vel' | 'dye',
  ) => {
    const f = fluidRef.current;
    const src = which === 'vel' ? f.velA : f.dyeA;
    const dst = which === 'vel' ? f.velB : f.dyeB;
    f.splatMat.uniforms.uTarget.value = src.texture;
    (f.splatMat.uniforms.uPoint.value as THREE.Vector2).set(px, py);
    (f.splatMat.uniforms.uValue.value as THREE.Vector3).copy(value);
    f.splatMat.uniforms.uRadius.value = radius;
    f.renderPass(gl, f.splatMat, dst);
    if (which === 'vel') [f.velA, f.velB] = [f.velB, f.velA];
    else [f.dyeA, f.dyeB] = [f.dyeB, f.dyeA];
  };

  useFrame(({ gl, clock }) => {
    const f = fluidRef.current;
    const sig = signal.current;
    const t = clock.elapsedTime;

    const aspect = size.width / Math.max(1, size.height);
    const coverX = aspect >= 1 ? 1 : aspect;
    const coverY = aspect >= 1 ? 1 / aspect : 1;

    if (!f.cleared) {
      gl.setClearColor(0x000000, 1);
      for (const rt of [f.velA, f.velB, f.dyeA, f.dyeB, f.prsA, f.prsB]) {
        gl.setRenderTarget(rt);
        gl.clear();
      }
      f.cleared = true;
    }

    if (!reduced) {
      // ambient emitter: a wandering, colour-cycling jet keeps it alive
      const ex = 0.5 + 0.33 * Math.sin(t * 0.27) * coverX;
      const ey = 0.5 + 0.33 * Math.sin(t * 0.41 + 1.7) * coverY;
      const tang = new THREE.Vector3(Math.cos(t * 0.27), Math.sin(t * 0.41 + 1.7), 0)
        .multiplyScalar(0.2);
      splat(gl, ex, ey, tang, 0.0003, 'vel');
      splat(gl, ex, ey, hsv((t * 0.06) % 1, 0.85, 0.95).multiplyScalar(0.22), 0.0003, 'dye');

      // cursor paints when moving — delta is derived here, never on the signal
      const last = lastPtr.current;
      if (!last.init) {
        last.x = sig.px;
        last.y = sig.py;
        last.init = true;
      }
      if (performance.now() - sig.moved < 120) {
        const dvx = sig.px - last.x;
        const dvy = sig.py - last.y;
        if (dvx !== 0 || dvy !== 0) {
          const px = (sig.px - 0.5) * coverX + 0.5;
          const py = (sig.py - 0.5) * coverY + 0.5;
          const force = new THREE.Vector3(dvx, dvy, 0).multiplyScalar(9);
          splat(gl, px, py, force, 0.0004, 'vel');
          splat(gl, px, py, hsv((t * 0.12 + 0.4) % 1, 0.85, 1).multiplyScalar(0.62), 0.0004, 'dye');
        }
      }
      last.x = sig.px;
      last.y = sig.py;

      // curl -> vorticity confinement
      f.curlMat.uniforms.uVelocity.value = f.velA.texture;
      f.renderPass(gl, f.curlMat, f.curl);
      f.vorticityMat.uniforms.uVelocity.value = f.velA.texture;
      f.vorticityMat.uniforms.uCurl.value = f.curl.texture;
      f.renderPass(gl, f.vorticityMat, f.velB);
      [f.velA, f.velB] = [f.velB, f.velA];

      // divergence
      f.divergenceMat.uniforms.uVelocity.value = f.velA.texture;
      f.renderPass(gl, f.divergenceMat, f.div);

      // decay pressure, then Jacobi solve
      f.decayMat.uniforms.uTex.value = f.prsA.texture;
      f.decayMat.uniforms.uFactor.value = 0.8;
      f.renderPass(gl, f.decayMat, f.prsB);
      [f.prsA, f.prsB] = [f.prsB, f.prsA];
      for (let i = 0; i < PRESSURE_ITERS; i++) {
        f.pressureMat.uniforms.uPressure.value = f.prsA.texture;
        f.pressureMat.uniforms.uDivergence.value = f.div.texture;
        f.renderPass(gl, f.pressureMat, f.prsB);
        [f.prsA, f.prsB] = [f.prsB, f.prsA];
      }

      // subtract pressure gradient -> divergence-free velocity
      f.gradientMat.uniforms.uPressure.value = f.prsA.texture;
      f.gradientMat.uniforms.uVelocity.value = f.velA.texture;
      f.renderPass(gl, f.gradientMat, f.velB);
      [f.velA, f.velB] = [f.velB, f.velA];

      // advect velocity, then dye
      f.advectMat.uniforms.uVelocity.value = f.velA.texture;
      f.advectMat.uniforms.uSource.value = f.velA.texture;
      f.advectMat.uniforms.uDissipation.value = 0.997;
      f.renderPass(gl, f.advectMat, f.velB);
      [f.velA, f.velB] = [f.velB, f.velA];

      f.advectMat.uniforms.uVelocity.value = f.velA.texture;
      f.advectMat.uniforms.uSource.value = f.dyeA.texture;
      f.advectMat.uniforms.uDissipation.value = 0.9935;
      f.renderPass(gl, f.advectMat, f.dyeB);
      [f.dyeA, f.dyeB] = [f.dyeB, f.dyeA];
    }

    // present
    f.displayMat.uniforms.uDye.value = f.dyeA.texture;
    (f.displayMat.uniforms.uCover.value as THREE.Vector2).set(coverX, coverY);
    gl.autoClear = true;
    f.renderPass(gl, f.displayMat, null);
  }, 1);

  return null;
}

export default function FluidScene({
  signal,
}: {
  signal: React.RefObject<FluidSignal>;
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
