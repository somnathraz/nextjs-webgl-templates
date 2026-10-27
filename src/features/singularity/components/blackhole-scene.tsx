'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import { fragmentShader, vertexShader } from '../lib/blackhole-shader';
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
      <div className="sg-canvas-fallback" />
    ) : (
      this.props.children
    );
  }
}

function Hole({
  signal,
  reduced,
}: {
  signal: React.RefObject<SceneSignal>;
  reduced: boolean;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);

  // orbit state with drag + inertia
  const orbit = useRef({
    yaw: 0.6,
    pitch: 0.22,
    vYaw: 0,
    vPitch: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
  });
  const bufSize = useMemo(() => new THREE.Vector2(), []);

  const uniforms = useMemo(
    () => ({
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uYaw: { value: 0.6 },
      uPitch: { value: 0.22 },
      uDist: { value: 15.5 },
      uFall: { value: 0 },
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
      orbit.current.vYaw = -dx * 0.005;
      orbit.current.vPitch = dy * 0.005;
      orbit.current.yaw += orbit.current.vYaw;
      orbit.current.pitch = THREE.MathUtils.clamp(
        orbit.current.pitch + orbit.current.vPitch,
        -1.3,
        1.3,
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
      if (!reduced) o.yaw += (0.03 + o.vYaw) * d * 6.0;
      o.vYaw = THREE.MathUtils.damp(o.vYaw, 0, 2.5, d);
      o.vPitch = THREE.MathUtils.damp(o.vPitch, 0, 2.5, d);
      o.pitch = THREE.MathUtils.clamp(o.pitch + o.vPitch, -1.3, 1.3);
    }

    const u = mat.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uYaw.value = o.yaw;
    // ease the viewing angle a touch higher as you fall in (the money shot)
    u.uPitch.value = o.pitch + s.progress * 0.18 + s.py * 0.05;
    u.uDist.value = THREE.MathUtils.damp(
      u.uDist.value,
      15.5 - s.progress * 7.5,
      3,
      d,
    );
    u.uFall.value = THREE.MathUtils.damp(u.uFall.value, s.progress, 3, d);

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

export default function BlackholeScene({
  signal,
}: {
  signal: React.RefObject<SceneSignal>;
}) {
  const reduced = !!useReducedMotion();
  return (
    <Boundary>
      <Canvas
        dpr={[1, 1.3]}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <Hole signal={signal} reduced={reduced} />
      </Canvas>
    </Boundary>
  );
}
