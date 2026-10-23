'use client';
import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useInView, useReducedMotion } from 'motion/react';
import { SceneBoundary } from './scene-boundary';
import { CanModel } from './can-model';
import type { Flavor } from '@/features/offday/types/product';
export default function CanScene({
  flavor,
  interactive = false,
  progress,
  entrance = false,
}: {
  flavor: Flavor;
  interactive?: boolean;
  progress?: React.RefObject<number>;
  entrance?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotation = useRef(0);
  const pointer = useRef<number | null>(null);
  const visible = useInView(ref, { margin: '80px' });
  const reduced = useReducedMotion();
  return (
    <div
      className={`can-scene ${interactive ? 'can-interactive' : ''}`}
      ref={ref}
      role={interactive ? 'group' : 'img'}
      aria-label={`${flavor.name} energy drink can${interactive ? '. Drag or use arrow keys to rotate.' : ''}`}
      tabIndex={interactive ? 0 : undefined}
      onPointerDown={(e) => {
        if (!interactive) return;
        pointer.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (pointer.current === null) return;
        rotation.current += (e.clientX - pointer.current) * 0.015;
        pointer.current = e.clientX;
      }}
      onPointerUp={() => {
        pointer.current = null;
      }}
      onPointerCancel={() => {
        pointer.current = null;
      }}
      onKeyDown={(e) => {
        if (interactive && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          rotation.current += e.key === 'ArrowLeft' ? -0.25 : 0.25;
        }
      }}
    >
      <SceneBoundary flavor={flavor}>
        <Canvas
          camera={{ position: [0, 0.6, 7], fov: 34 }}
          dpr={[1, 1.7]}
          frameloop={visible ? 'always' : 'never'}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.8} />
          <hemisphereLight args={['#fff5df', '#a18770', 2]} />
          <directionalLight position={[-3, 4, 5]} intensity={4} />
          <directionalLight
            position={[4, 1, 1]}
            intensity={2}
            color="#fff3d6"
          />
          <directionalLight position={[0, 4, -2]} intensity={4} />
          <CanModel
            flavor={flavor}
            rotation={rotation}
            progress={progress}
            reduced={!!reduced}
            entrance={entrance}
          />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
