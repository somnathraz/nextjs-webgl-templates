'use client';
import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { Headphones } from './headphones';
import type { ProductFinish } from '@/features/aura/types/product';

import { SceneBoundary } from '@/features/aura/components/ui/scene-boundary';

export default function ProductScene({
  finish,
  exploded = false,
  interactive = false,
  progress,
  intro = false,
  annotation,
  portal = false,
  onEntranceComplete,
  onEntrancePhase,
}: {
  finish: ProductFinish;
  exploded?: boolean;
  interactive?: boolean;
  progress?: React.RefObject<number>;
  intro?: boolean;
  portal?: boolean;
  onEntranceComplete?: () => void;
  onEntrancePhase?: (phase: 'arrive' | 'zoom') => void;
  annotation?: React.RefObject<HTMLDivElement | null>;
}) {
  const rotation = useRef(-0.42);
  const drag = useRef<number | null>(null);
  const reduced = useReducedMotion();
  const container = useRef<HTMLDivElement>(null);
  const visible = useInView(container, { margin: '100px' });
  return (
    <div
      ref={container}
      className={`product-canvas ${interactive ? 'interactive' : ''}`}
      role={interactive ? 'group' : 'img'}
      aria-label={
        interactive
          ? '3D headphone preview. Drag to rotate or use left and right arrow keys.'
          : `Aura One headphones in ${finish.name}`
      }
      tabIndex={interactive ? 0 : undefined}
      onPointerDown={(e) => {
        if (!interactive) return;
        drag.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (drag.current === null) return;
        rotation.current += (e.clientX - drag.current) * 0.012;
        drag.current = e.clientX;
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          e.preventDefault();
          rotation.current += e.key === 'ArrowLeft' ? -0.2 : 0.2;
        }
      }}
    >
      <SceneBoundary>
        <Canvas
          frameloop={visible ? 'always' : 'never'}
          camera={{ position: [0, 0.25, 6.8], fov: 39 }}
          dpr={[1, 1.7]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.3} />
          <hemisphereLight args={['#fffdf5', '#8b887f', 2.5]} />
          <directionalLight
            position={[3, 5, 4]}
            intensity={4}
            color="#fff9e8"
          />
          <directionalLight
            position={[-4, 2, 1]}
            intensity={2.5}
            color="#e0e8ff"
          />
          <directionalLight position={[0, 2, -4]} intensity={5} />
          <Headphones
            finish={finish}
            exploded={exploded}
            rotation={rotation}
            progress={progress}
            reducedMotion={!!reduced}
            intro={intro}
            portal={portal}
            onEntranceComplete={onEntranceComplete}
            onEntrancePhase={onEntrancePhase}
            annotation={annotation}
          />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
