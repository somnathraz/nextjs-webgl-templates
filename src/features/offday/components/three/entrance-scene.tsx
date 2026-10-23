'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { CanModel } from './can-model';
import { FLAVORS } from '@/features/offday/lib/products';
function RevealCan({
  running,
  onReady,
  onComplete,
}: {
  running: boolean;
  onReady: () => void;
  onComplete: () => void;
}) {
  const model = useRef<THREE.Group>(null);
  const rotation = useRef(0);
  const clock = useRef(0);
  const first = useRef(true);
  const complete = useRef(false);
  useFrame((_, delta) => {
    if (first.current) {
      first.current = false;
      onReady();
    }
    if (!model.current) return;
    if (!running) {
      model.current.scale.setScalar(0.001);
      return;
    }
    clock.current += Math.min(delta, 0.05);
    const appear = THREE.MathUtils.smoothstep(clock.current, 0, 1.35);
    const fly = THREE.MathUtils.smoothstep(clock.current, 1.8, 4.6);
    model.current.scale.setScalar(0.18 + appear * 0.82 + fly * 13);
    model.current.rotation.y = (1 - appear) * -0.85;
    model.current.rotation.z = fly * 0.14;
    if (clock.current > 4.6 && !complete.current) {
      complete.current = true;
      onComplete();
    }
  });
  return (
    <group ref={model} scale={0.001}>
      <CanModel flavor={FLAVORS[0]} rotation={rotation} reduced />
    </group>
  );
}
export default function EntranceScene(props: {
  running: boolean;
  onReady: () => void;
  onComplete: () => void;
}) {
  return (
    <Canvas camera={{ position: [0, 0.5, 7], fov: 34 }} dpr={[1, 1.5]}>
      <ambientLight intensity={2} />
      <hemisphereLight args={['#fff5df', '#a18770', 2]} />
      <directionalLight position={[-3, 4, 5]} intensity={4} />
      <directionalLight position={[3, 2, -2]} intensity={3} />
      <RevealCan {...props} />
    </Canvas>
  );
}
