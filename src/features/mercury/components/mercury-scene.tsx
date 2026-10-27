'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import { fragmentShader, vertexShader } from '../lib/mercury-shader';
import type { MercurySignal } from '../hooks/use-mercury-signal';

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
      <div className="mc-canvas-fallback" />
    ) : (
      this.props.children
    );
  }
}

function Blob({
  signal,
  reduced,
}: {
  signal: React.RefObject<MercurySignal>;
  reduced: boolean;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);

  // drag-to-orbit with inertia
  const orbit = useRef({
    yaw: 0.5,
    pitch: 0.12,
    vYaw: 0,
    vPitch: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
  });
  // smoothed pointer + derived velocity the shader actually reads
  const smooth = useRef({ px: 0, py: 0, active: 0, vel: 0 });
  const bufSize = useMemo(() => new THREE.Vector2(), []);

  const uniforms = useMemo(
    () => ({
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uYaw: { value: 0.5 },
      uPitch: { value: 0.12 },
      uDist: { value: 6.4 },
      uScroll: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerA: { value: 0 },
      uPVel: { value: 0 },
      uReduced: { value: reduced ? 1 : 0 },
    }),
    [reduced],
  );

  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      orbit.current.dragging = true;
      orbit.current.lastX = e.clientX;
      orbit.current.lastY = e.clientY;
      orbit.current.vYaw = 0;
      orbit.current.vPitch = 0;
    };
    const move = (e: PointerEvent) => {
      if (!orbit.current.dragging) return;
      const dx = e.clientX - orbit.current.lastX;
      const dy = e.clientY - orbit.current.lastY;
      orbit.current.lastX = e.clientX;
      orbit.current.lastY = e.clientY;
      orbit.current.vYaw = -dx * 0.006;
      orbit.current.vPitch = dy * 0.006;
      orbit.current.yaw += orbit.current.vYaw;
      orbit.current.pitch = THREE.MathUtils.clamp(
        orbit.current.pitch + orbit.current.vPitch,
        -1.2,
        1.2,
      );
      if (reduced) invalidate();
    };
    const up = () => (orbit.current.dragging = false);
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [gl, reduced, invalidate]);

  useFrame((state, delta) => {
    if (!mat.current) return;
    const d = Math.min(delta, 0.05);
    const s = signal.current;
    const o = orbit.current;

    if (!o.dragging) {
      if (!reduced) o.yaw += (0.025 + o.vYaw) * d * 6.0;
      o.vYaw = THREE.MathUtils.damp(o.vYaw, 0, 2.5, d);
      o.vPitch = THREE.MathUtils.damp(o.vPitch, 0, 2.5, d);
      o.pitch = THREE.MathUtils.clamp(o.pitch + o.vPitch, -1.2, 1.2);
    }

    // derive pointer speed from how far the target moved since last frame,
    // then ease pointer + presence so the droplet glides instead of snapping
    const speed = Math.min(
      1,
      Math.hypot(s.px - smooth.current.px, s.py - smooth.current.py) * 5,
    );
    smooth.current.vel = THREE.MathUtils.damp(
      smooth.current.vel,
      speed,
      4,
      d,
    );
    smooth.current.px = THREE.MathUtils.damp(smooth.current.px, s.px, 6, d);
    smooth.current.py = THREE.MathUtils.damp(smooth.current.py, s.py, 6, d);
    smooth.current.active = THREE.MathUtils.damp(
      smooth.current.active,
      s.active,
      5,
      d,
    );

    const u = mat.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uYaw.value = o.yaw;
    u.uPitch.value = o.pitch + s.progress * 0.25;
    u.uDist.value = THREE.MathUtils.damp(
      u.uDist.value,
      6.4 - s.progress * 1.6,
      3,
      d,
    );
    u.uScroll.value = THREE.MathUtils.damp(u.uScroll.value, s.progress, 3, d);
    (u.uPointer.value as THREE.Vector2).set(
      smooth.current.px,
      smooth.current.py,
    );
    u.uPointerA.value = smooth.current.active;
    u.uPVel.value = smooth.current.vel;

    gl.getDrawingBufferSize(bufSize);
    (u.uRes.value as THREE.Vector2).copy(bufSize);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function MercuryScene({
  signal,
}: {
  signal: React.RefObject<MercurySignal>;
}) {
  const reduced = !!useReducedMotion();
  return (
    <Boundary>
      <Canvas
        dpr={[1, 1.4]}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <Blob signal={signal} reduced={reduced} />
      </Canvas>
    </Boundary>
  );
}
