'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import type { SceneTarget } from '../engine/scene-kit';

class Boundary extends Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const TAU = Math.PI * 2;

function Days({ target, reduced }: { target: SceneTarget; reduced: boolean }) {
  const count = target.pos.length / 3;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  // live state every instance eases through; starts collapsed at the origin
  const cur = useRef<{
    pos: Float32Array;
    scale: Float32Array;
    color: Float32Array;
  } | null>(null);
  const delays = useMemo(() => {
    const d = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = Math.sin(i * 91.7) * 1e4;
      d[i] = (i / count) * 0.45 + (r - Math.floor(r)) * 0.25;
    }
    return d;
  }, [count]);

  const changedAt = useRef(0);
  const cam = useRef({
    pos: new THREE.Vector3(0, 2, 14),
    look: new THREE.Vector3(),
  });
  const spin = useRef({ angle: 0 });

  useEffect(() => {
    changedAt.current = performance.now() / 1000;
  }, [target]);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(count * 3),
      3,
    );
    m.instanceColor.setUsage(THREE.DynamicDrawUsage);
    cur.current = {
      pos: new Float32Array(count * 3),
      scale: new Float32Array(count * 3),
      color: new Float32Array(count * 3).fill(0.2),
    };
  }, [count]);

  const goalCam = useMemo(() => new THREE.Vector3(), []);
  const goalLook = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const m = mesh.current;
    const g = group.current;
    const c = cur.current;
    if (!m || !g || !c || !m.instanceColor) return;
    const d = Math.min(delta, 1 / 20);
    const since = performance.now() / 1000 - changedAt.current;
    const k = reduced ? 1 : 1 - Math.exp(-5.5 * d);

    const mat = m.instanceMatrix.array as Float32Array;
    const col = m.instanceColor.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const o = i * 3;
      if (reduced || since > delays[i]) {
        for (let a = 0; a < 3; a++) {
          c.pos[o + a] += (target.pos[o + a] - c.pos[o + a]) * k;
          c.scale[o + a] += (target.scale[o + a] - c.scale[o + a]) * k;
          c.color[o + a] += (target.color[o + a] - c.color[o + a]) * k;
        }
      }
      // scale + translate, no rotation: write the matrix directly
      const e = i * 16;
      mat[e] = c.scale[o];
      mat[e + 5] = c.scale[o + 1];
      mat[e + 10] = c.scale[o + 2];
      mat[e + 12] = c.pos[o];
      mat[e + 13] = c.pos[o + 1];
      mat[e + 14] = c.pos[o + 2];
      mat[e + 15] = 1;
      col[o] = c.color[o];
      col[o + 1] = c.color[o + 1];
      col[o + 2] = c.color[o + 2];
    }
    m.instanceMatrix.needsUpdate = true;
    m.instanceColor.needsUpdate = true;

    // spinning layouts keep turning; still layouts settle on the nearest front
    const s = spin.current;
    if (target.spin && !reduced) s.angle += target.spin * d;
    else
      s.angle +=
        (Math.round(s.angle / TAU) * TAU - s.angle) *
        (reduced ? 1 : 1 - Math.exp(-2.5 * d));
    g.rotation.y = s.angle;

    // pull the camera back on portrait screens so wide layouts still fit
    const aspect = size.width / Math.max(1, size.height);
    const fit = aspect < 1.1 ? THREE.MathUtils.clamp(1.25 / aspect, 1, 2.3) : 1;
    goalLook.set(...target.look);
    goalCam
      .set(...target.camera)
      .sub(goalLook)
      .multiplyScalar(fit)
      .add(goalLook);
    const kc = reduced ? 1 : 1 - Math.exp(-2.2 * d);
    cam.current.pos.lerp(goalCam, kc);
    cam.current.look.lerp(goalLook, kc);
    camera.position.copy(cam.current.pos);
    camera.lookAt(cam.current.look);
  });

  return (
    <group ref={group}>
      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.42} metalness={0.08} />
      </instancedMesh>
    </group>
  );
}

export default function YearScene({ target }: { target: SceneTarget }) {
  const reduced = !!useReducedMotion();
  return (
    <Boundary>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 38, position: [0, 2, 14], near: 0.1, far: 80 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <hemisphereLight args={['#ffffff', '#1a1430', 1.1]} />
        <directionalLight position={[5, 9, 6]} intensity={2.4} />
        <directionalLight
          position={[-6, 3, -4]}
          intensity={0.7}
          color="#9db4ff"
        />
        <Days target={target} reduced={reduced} />
      </Canvas>
    </Boundary>
  );
}
