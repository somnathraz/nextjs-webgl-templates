'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import { CanModel } from './can-model';
import { SceneBoundary } from './scene-boundary';
import { FLAVORS } from '@/features/offday/lib/products';

type Pose = { tilt: number; scale: number };
function TravelingCan({
  rotation,
  pose,
  flavor,
}: {
  rotation: React.RefObject<number>;
  pose: React.RefObject<Pose>;
  flavor: (typeof FLAVORS)[number];
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.z = THREE.MathUtils.damp(
      group.current.rotation.z,
      pose.current.tilt,
      9,
      delta,
    );
    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, pose.current.scale, 9, delta),
    );
  });
  return (
    <group ref={group}>
      <CanModel flavor={flavor} rotation={rotation} reduced />
    </group>
  );
}
export default function JourneyScene({
  rotation,
}: {
  rotation: React.RefObject<number>;
}) {
  const host = useRef<HTMLDivElement>(null);
  const pose = useRef<Pose>({ tilt: 0, scale: 1.3 });
  const [flavor, setFlavor] = useState(FLAVORS[0]);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(true);
  useEffect(() => {
    let frame = 0;
    type Stop = {
      x: number;
      y: number;
      w: number;
      h: number;
      stage: string;
      flavor: string | undefined;
      tilt: number;
      scale: number;
      at: number;
    };
    let stops: Stop[] = [];
    // Expensive layout reads — only runs on mount, resize and flavor swaps,
    // never on every scroll frame. `at`/x/y/w/h are absolute document values
    // so they stay valid regardless of the live scroll position.
    const measure = () => {
      if (!host.current) return;
      const y = window.scrollY,
        vh = window.innerHeight;
      const anchors = Array.from(
        document.querySelectorAll<HTMLElement>('[data-can-stage]'),
      );
      stops = anchors
        .flatMap((el) => {
          const r = el.getBoundingClientRect();
          const stage = el.dataset.canStage!;
          const section = el.closest('section')!;
          const sr = section.getBoundingClientRect();
          const sticky = el.closest('.flight-sticky, .story-sticky');
          const base = {
            x: r.left + r.width / 2,
            y: vh / 2,
            w: r.width,
            h: r.height,
            stage,
            flavor: el.dataset.canFlavor,
            tilt:
              stage === 'benefits' ? 0.22 : stage === 'lifestyle' ? -0.25 : 0,
            scale: stage === 'hero' ? 1.3 : 1,
          };
          if (sticky) {
            base.y = r.top - sticky.getBoundingClientRect().top + r.height / 2;
            return [
              { ...base, at: sr.top + y },
              { ...base, at: sr.bottom + y - vh },
            ];
          }
          if (stage === 'hero')
            return [{ ...base, y: r.top + y + r.height / 2, at: 0 }];
          const stop = { ...base, at: r.top + y + r.height / 2 - vh / 2 };
          if (stage === 'lifestyle' && window.innerWidth <= 700) {
            // Pass along the margin while the stacked lifestyle copy is reading.
            const margin = {
              ...base,
              x: window.innerWidth * 0.98,
              w: window.innerWidth * 0.34,
              h: vh * 0.34,
              tilt: -0.1,
            };
            return [
              stop,
              { ...margin, at: r.bottom + y - vh * 0.35 },
              { ...margin, at: sr.bottom + y - vh * 0.55 },
            ];
          }
          return [stop];
        })
        .sort((a, b) => a.at - b.at);
    };
    // Cheap per-frame work: just read the live scroll offset and interpolate
    // between the cached stops, then write the host transform.
    const apply = () => {
      frame = 0;
      if (!host.current || !stops.length) return;
      const y = window.scrollY,
        vh = window.innerHeight;
      let index = stops.findIndex((s) => s.at > y);
      if (index < 0) index = stops.length;
      const a = stops[Math.max(0, index - 1)],
        b = stops[Math.min(index, stops.length - 1)];
      const raw =
        a === b ? 0 : THREE.MathUtils.clamp((y - a.at) / (b.at - a.at), 0, 1);
      const t = reduced ? (raw < 0.5 ? 0 : 1) : raw * raw * (3 - 2 * raw);
      const mix = (start: number, end: number) => start + (end - start) * t;
      const w = mix(a.w, b.w),
        h = mix(a.h, b.h);
      const cx = mix(a.x, b.x),
        cy = mix(a.y, b.y) + (index === stops.length ? a.at - y : 0);
      host.current.style.width = `${w}px`;
      host.current.style.height = `${h}px`;
      host.current.style.transform = `translate3d(${cx - w / 2}px,${cy - h / 2}px,0)`;
      host.current.style.visibility =
        cy + h / 2 < 0 || cy - h / 2 > vh ? 'hidden' : 'visible';
      setActive(!(cy + h / 2 < 0 || cy - h / 2 > vh));
      pose.current = {
        tilt:
          mix(a.tilt, b.tilt) +
          (reduced || a.stage === b.stage ? 0 : Math.sin(raw * Math.PI) * 0.4),
        scale: mix(a.scale, b.scale),
      };
      const selected = raw < 0.5 ? a : b;
      setFlavor(FLAVORS.find((f) => f.id === selected.flavor) ?? FLAVORS[0]);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const remeasure = () => {
      measure();
      onScroll();
    };
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);
    const mutations = new MutationObserver(remeasure);
    document.querySelectorAll('[data-can-stage]').forEach((el) =>
      mutations.observe(el, {
        attributes: true,
        attributeFilter: ['data-can-flavor'],
      }),
    );
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', remeasure);
    measure();
    apply();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', remeasure);
    };
  }, [reduced]);
  return (
    <div ref={host} className="product-journey" aria-hidden="true">
      <SceneBoundary flavor={flavor}>
        <Canvas
          frameloop={active ? 'always' : 'never'}
          camera={{ position: [0, 0.5, 8.8], fov: 40 }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={1.7} />
          <hemisphereLight args={['#fff8df', '#9b725e', 2]} />
          <directionalLight position={[-4, 5, 5]} intensity={4} />
          <directionalLight position={[4, 1, 1]} intensity={2} />
          <directionalLight position={[0, 3, -4]} intensity={3} />
          <TravelingCan flavor={flavor} rotation={rotation} pose={pose} />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
