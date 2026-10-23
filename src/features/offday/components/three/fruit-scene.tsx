'use client';
import { Canvas } from '@react-three/fiber';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { SceneBoundary } from './scene-boundary';
import { FruitCluster } from './fruit-models';
import type { Flavor } from '@/features/offday/types/product';
export default function FruitScene({ flavor }: { flavor: Flavor }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: '80px' });
  return (
    <div ref={ref} className="fruit-canvas" aria-hidden="true">
      <SceneBoundary flavor={flavor}>
        <Canvas
          frameloop={visible ? 'always' : 'never'}
          camera={{ position: [0, 0.3, 8.6], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={1.7} />
          <hemisphereLight args={['#fff8df', '#9b725e', 2]} />
          <directionalLight position={[-4, 5, 5]} intensity={3.6} />
          <directionalLight position={[4, 1, 2]} intensity={1.9} />
          <FruitCluster flavorId={flavor.id} />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
