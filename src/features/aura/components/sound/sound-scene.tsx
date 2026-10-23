'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Headphones } from '@/features/aura/components/product/headphones';
import { FINISHES } from '@/features/aura/lib/product';
export type SoundMode = 'spatial' | 'stereo';
const COUNT = 480;
function Field({ mode, reduced }: { mode: SoundMode; reduced: boolean }) {
  const particles = useRef<THREE.Points>(null);
  const mix = useRef(mode === 'spatial' ? 1 : 0);
  const time = useRef(0);
  const rotation = useRef(-0.25);
  const positions = useMemo(() => new Float32Array(COUNT * 3), []);
  const colors = useMemo(() => {
    const values = new Float32Array(COUNT * 3);
    const color = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
      color.set(i % 4 === 0 ? '#c4ef74' : '#7a9282');
      color.toArray(values, i * 3);
    }
    return values;
  }, []);
  useFrame((_, delta) => {
    if (!particles.current) return;
    time.current += reduced ? 0 : Math.min(delta, 0.05);
    mix.current = reduced
      ? Number(mode === 'spatial')
      : THREE.MathUtils.damp(mix.current, Number(mode === 'spatial'), 4, delta);
    const attribute = particles.current.geometry.getAttribute('position');
    for (let i = 0; i < COUNT; i++) {
      const lane = i % 6;
      const angle =
        (i / COUNT) * Math.PI * 12 + time.current * (0.12 + lane * 0.035);
      const radius = 1.65 + lane * 0.17;
      const spatialX = Math.cos(angle) * radius;
      const stereoX = (i % 2 ? 1 : -1) * (1.5 + (i % 40) * 0.027);
      const x = THREE.MathUtils.lerp(stereoX, spatialX, mix.current);
      const y = Math.sin(angle * 1.5 + lane) * (0.14 + mix.current * 0.95);
      const z = Math.sin(angle) * radius * (0.15 + mix.current * 0.85);
      attribute.setXYZ(i, x, y, z);
    }
    attribute.needsUpdate = true;
  });
  return (
    <group rotation={[0.14, 0, -0.06]}>
      <group scale={0.48}>
        <Headphones
          finish={FINISHES[1]}
          rotation={rotation}
          exploded={false}
          reducedMotion
        />
      </group>
      <points ref={particles}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          vertexColors
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {[1.75, 2.15, 2.55].map((radius, index) => (
        <mesh
          key={radius}
          rotation={[Math.PI / 2 + index * 0.12, 0.2 * index, 0]}
        >
          <torusGeometry args={[radius, 0.004, 4, 128]} />
          <meshBasicMaterial
            color="#819478"
            transparent
            opacity={mode === 'spatial' ? 0.25 : 0.06}
          />
        </mesh>
      ))}
    </group>
  );
}
export default function SoundScene({
  mode,
  reduced,
  visible,
}: {
  mode: SoundMode;
  reduced: boolean;
  visible: boolean;
}) {
  return (
    <Canvas
      frameloop={visible ? 'always' : 'never'}
      camera={{ position: [0, 1.2, 7.4], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={2} />
      <directionalLight position={[3, 4, 5]} intensity={4} />
      <directionalLight position={[-3, 2, -2]} intensity={3} color="#c4ef74" />
      <Field mode={mode} reduced={reduced} />
    </Canvas>
  );
}
