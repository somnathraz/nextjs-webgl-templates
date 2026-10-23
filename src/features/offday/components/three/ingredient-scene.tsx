'use client';
import { Canvas } from '@react-three/fiber';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { SceneBoundary } from './scene-boundary';
import { FruitCluster } from './fruit-models';
import type { Flavor } from '@/features/offday/types/product';
export default function IngredientScene({ flavor }: { flavor: Flavor }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: '80px' });
  return (
    <div
      ref={ref}
      className="ingredient-canvas"
      role="img"
      aria-label="Sculpted cream product podium"
    >
      <SceneBoundary flavor={flavor}>
        <Canvas
          frameloop={visible ? 'always' : 'never'}
          camera={{ position: [0, 0.5, 8.8], fov: 40 }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={1.7} />
          <hemisphereLight args={['#fff8df', '#9b725e', 2]} />
          <directionalLight position={[-4, 5, 5]} intensity={4} />
          <directionalLight position={[4, 1, 1]} intensity={2} />
          <directionalLight position={[0, 3, -4]} intensity={3} />
          <group>
            <FruitCluster flavorId={flavor.id} />
            <mesh position={[0, -1.95, 0]}>
              <cylinderGeometry args={[1.22, 1.22, 0.65, 96]} />
              <meshStandardMaterial color="#f7eedb" roughness={0.72} />
            </mesh>
            <mesh position={[0, -2.43, 0]}>
              <cylinderGeometry args={[1.72, 1.72, 0.32, 96]} />
              <meshStandardMaterial color="#d8c6a5" roughness={0.8} />
            </mesh>
            <mesh position={[-1.9, -2.25, -0.75]}>
              <cylinderGeometry args={[0.7, 0.7, 0.65, 64]} />
              <meshStandardMaterial color="#c4b293" roughness={0.8} />
            </mesh>
            <mesh position={[1.8, -2.1, -0.8]}>
              <cylinderGeometry args={[0.65, 0.65, 0.95, 64]} />
              <meshStandardMaterial color="#e8dac0" roughness={0.8} />
            </mesh>
            <mesh position={[0, -1.618, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.72, 64]} />
              <meshBasicMaterial color="#8c795c" transparent opacity={0.16} />
            </mesh>
          </group>
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
