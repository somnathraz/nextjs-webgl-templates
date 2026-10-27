'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Component, useMemo, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import { buildNovaShapes, NOVA_COUNT } from '../lib/shapes';
import type { NovaSignal } from '../hooks/use-nova-signal';

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
      <div className="nova-canvas-fallback" />
    ) : (
      this.props.children
    );
  }
}

const vertexShader = /* glsl */ `
  attribute vec3 aSphere;
  attribute vec3 aGalaxy;
  attribute vec3 aKnot;
  attribute vec3 aField;
  attribute float aSeed;

  uniform float uTime;
  uniform float uPhase;   // 0..3, which shapes to blend
  uniform vec2  uPointer; // world-ish pointer on the z=0 plane
  uniform float uForce;   // mouse repulsion strength
  uniform float uSize;

  varying float vSeed;
  varying float vGlow;

  // cyclic triangular weight so phase wraps cleanly across 4 shapes
  float wphase(float p, float i) {
    float d = abs(p - i);
    d = min(d, 4.0 - d);
    return max(0.0, 1.0 - d);
  }

  void main() {
    float w0 = wphase(uPhase, 0.0);
    float w1 = wphase(uPhase, 1.0);
    float w2 = wphase(uPhase, 2.0);
    float w3 = wphase(uPhase, 3.0);
    float ws = max(0.0001, w0 + w1 + w2 + w3);

    vec3 pos = (aSphere * w0 + aGalaxy * w1 + aKnot * w2 + aField * w3) / ws;

    // organic pseudo-curl flow — cheap, no texture lookups
    float t = uTime * 0.18 + aSeed * 6.2831;
    vec3 flow = vec3(
      sin(pos.y * 1.5 + t) + sin(pos.z * 1.1 - t * 1.3),
      sin(pos.z * 1.4 + t * 1.1) + sin(pos.x * 1.2 + t * 0.7),
      sin(pos.x * 1.3 - t) + sin(pos.y * 1.0 + t * 0.9)
    );
    pos += flow * (0.028 + aSeed * 0.03);

    // extra ripple while the field (w3) is dominant
    pos.y += sin(pos.x * 2.0 + pos.z * 2.0 + uTime * 1.2) * 0.35 * w3;

    // slow breathing
    pos *= 1.0 + 0.035 * sin(uTime * 0.5);

    // pointer repulsion in the view plane
    vec2 toM = pos.xy - uPointer;
    float dm = dot(toM, toM) + 0.22;
    pos.xy += normalize(toM + 1e-4) * (uForce / dm);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aSeed) * (26.0 / -mv.z);

    vSeed = aSeed;
    vGlow = clamp((3.2 - -mv.z) * 0.35, 0.25, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying float vSeed;
  varying float vGlow;
  uniform float uTime;

  vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(
      abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
      0.0, 1.0
    );
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
  }

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = pow(smoothstep(0.5, 0.0, d), 1.6);

    // iridescent palette: cyan -> violet -> magenta, gold sparkle on high seed
    float hue = 0.52 + vSeed * 0.34 + 0.03 * sin(uTime * 0.2 + vSeed * 10.0);
    vec3 col = hsl2rgb(vec3(hue, 0.85, 0.62));
    col = mix(col, vec3(1.0, 0.84, 0.5), smoothstep(0.86, 1.0, vSeed));

    gl_FragColor = vec4(col * (0.7 + vGlow), a * (0.55 + vGlow * 0.45));
  }
`;

function Field({
  signal,
  reduced,
}: {
  signal: React.RefObject<NovaSignal>;
  reduced: boolean;
}) {
  const points = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const phase = useRef(0);
  const ptr = useRef(new THREE.Vector2());

  const shapes = useMemo(() => buildNovaShapes(NOVA_COUNT), []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPhase: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uForce: { value: 0 },
      uSize: { value: 2.0 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const s = signal.current;

    if (mat.current) {
      mat.current.uniforms.uTime.value = reduced ? 0 : state.clock.elapsedTime;
      // scroll drives the morph: sphere -> galaxy -> knot -> field
      const target = s.progress * 3;
      phase.current = THREE.MathUtils.damp(phase.current, target, 3, d);
      mat.current.uniforms.uPhase.value = phase.current;

      ptr.current.set(s.px * 2.4, s.py * 1.6);
      (mat.current.uniforms.uPointer.value as THREE.Vector2).lerp(
        ptr.current,
        1 - Math.exp(-6 * d),
      );
      mat.current.uniforms.uForce.value = 0.5;
    }

    if (points.current) {
      // gentle auto-orbit + pointer parallax tilt
      if (!reduced) points.current.rotation.y += d * 0.07;
      points.current.rotation.x = THREE.MathUtils.damp(
        points.current.rotation.x,
        s.py * 0.3,
        3,
        d,
      );
    }

    // dolly the camera in slightly as you progress through the story
    const camZ = 5.6 - s.progress * 1.3;
    state.camera.position.z = THREE.MathUtils.damp(
      state.camera.position.z,
      camZ,
      3,
      d,
    );
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[shapes.sphere, 3]}
        />
        <bufferAttribute attach="attributes-aSphere" args={[shapes.sphere, 3]} />
        <bufferAttribute attach="attributes-aGalaxy" args={[shapes.galaxy, 3]} />
        <bufferAttribute attach="attributes-aKnot" args={[shapes.knot, 3]} />
        <bufferAttribute attach="attributes-aField" args={[shapes.field, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[shapes.seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ParticleField({
  signal,
}: {
  signal: React.RefObject<NovaSignal>;
}) {
  const reduced = useReducedMotion();
  return (
    <Boundary>
      <Canvas
        camera={{ position: [0, 0, 5.6], fov: 48 }}
        dpr={[1, 1.75]}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <Field signal={signal} reduced={!!reduced} />
      </Canvas>
    </Boundary>
  );
}
