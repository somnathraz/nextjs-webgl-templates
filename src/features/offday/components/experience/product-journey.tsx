'use client';
import dynamic from 'next/dynamic';
import { createContext, useContext, useRef } from 'react';
import { useExperienceReady } from './entrance';
import type { Flavor } from '@/features/offday/types/product';
const JourneyScene = dynamic(() => import('../three/journey-scene'), {
  ssr: false,
});
const RotationContext = createContext<React.RefObject<number>>({ current: 0 });
export function ProductJourney({ children }: { children: React.ReactNode }) {
  const rotation = useRef(0);
  const ready = useExperienceReady();
  return (
    <RotationContext.Provider value={rotation}>
      {children}
      {ready && <JourneyScene rotation={rotation} />}
    </RotationContext.Provider>
  );
}
export function JourneyAnchor({
  className,
  flavor,
  stage,
}: {
  className: string;
  flavor: Flavor;
  stage: string;
}) {
  const rotationRef = useContext(RotationContext);
  const pointer = useRef<number | null>(null);
  return (
    <div
      className={className}
      data-can-stage={stage}
      data-can-flavor={flavor.id}
      role="group"
      aria-label={`${flavor.name} can. Drag or use arrow keys to rotate.`}
      tabIndex={0}
      onPointerDown={(e) => {
        pointer.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (pointer.current !== null) {
          rotationRef.current += (e.clientX - pointer.current) * 0.015;
          pointer.current = e.clientX;
        }
      }}
      onPointerUp={() => {
        pointer.current = null;
      }}
      onPointerCancel={() => {
        pointer.current = null;
      }}
      onKeyDown={(e) => {
        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          rotationRef.current += e.key === 'ArrowLeft' ? -0.25 : 0.25;
        }
      }}
    />
  );
}
