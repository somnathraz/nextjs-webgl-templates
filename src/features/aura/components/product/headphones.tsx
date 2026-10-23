'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { smoothRange, storyStep } from '@/features/aura/lib/story';
import type { ProductFinish } from '@/features/aura/types/product';

interface HeadphonesProps {
  finish: ProductFinish;
  exploded: boolean;
  rotation: React.RefObject<number>;
  progress?: React.RefObject<number>;
  reducedMotion: boolean;
  intro?: boolean;
  portal?: boolean;
  onEntranceComplete?: () => void;
  onEntrancePhase?: (phase: 'arrive' | 'zoom') => void;
  annotation?: React.RefObject<HTMLDivElement | null>;
}

function Band({ color, inner = false }: { color: string; inner?: boolean }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = inner ? 1.22 : 1.35;
    const thickness = inner ? 0.1 : 0.12;
    shape.absarc(0, 0.43, radius, 0, Math.PI, false);
    shape.absarc(0, 0.43, radius - thickness, Math.PI, 0, true);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: inner ? 0.3 : 0.35,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.045,
      bevelThickness: 0.045,
      curveSegments: 80,
    });
    geo.translate(0, 0, -0.18);
    return geo;
  }, [inner]);
  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial
        color={color}
        roughness={inner ? 0.88 : 0.36}
        metalness={inner ? 0.02 : 0.65}
      />
    </mesh>
  );
}

function EarCup({
  side,
  finish,
  exploded,
  progress,
  anchor,
}: {
  side: number;
  finish: ProductFinish;
  exploded: boolean;
  progress?: React.RefObject<number>;
  anchor?: React.RefObject<THREE.Group | null>;
}) {
  const assembly = useRef<THREE.Group>(null);
  const cover = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const p = progress?.current ?? 0;
    const open = smoothRange(p, 0.2, 0.4) * (1 - smoothRange(p, 0.59, 0.76));
    const flex = Math.sin(smoothRange(p, 0.76, 1) * Math.PI) * 0.13;
    if (cover.current)
      cover.current.position.z = THREE.MathUtils.damp(
        cover.current.position.z,
        side === 1 ? open * 0.9 : 0,
        6,
        delta,
      );
    if (assembly.current)
      assembly.current.position.x = THREE.MathUtils.damp(
        assembly.current.position.x,
        side * (exploded ? 1.7 : 1.18 + flex),
        5,
        delta,
      );
  });
  return (
    <group
      ref={assembly}
      position={[side * 1.18, -0.52, 0]}
      rotation={[0, side * -0.18, side * -0.09]}
    >
      <mesh position={[0, 0.91, 0]} castShadow>
        <boxGeometry args={[0.095, 0.62, 0.14]} />
        <meshStandardMaterial
          color={finish.metal}
          metalness={0.95}
          roughness={0.22}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[0.76, 1, 1.2]} castShadow>
        <cylinderGeometry args={[0.68, 0.68, 0.3, 64]} />
        <meshStandardMaterial color={finish.cushion} roughness={0.95} />
      </mesh>
      <mesh
        position={[0, 0, 0.21]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.77, 1, 1.2]}
        castShadow
      >
        <cylinderGeometry args={[0.65, 0.67, 0.22, 64]} />
        <meshStandardMaterial
          color={finish.metal}
          metalness={0.8}
          roughness={0.33}
        />
      </mesh>
      <group ref={side === 1 ? anchor : undefined} position={[0, 0, 0.34]}>
        <mesh>
          <circleGeometry args={[0.45, 64]} />
          <meshStandardMaterial
            color="#34382f"
            metalness={0.7}
            roughness={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        {[0.17, 0.27, 0.37, 0.44].map((radius) => (
          <mesh key={radius} position={[0, 0, 0.012]}>
            <torusGeometry args={[radius, 0.012, 8, 64]} />
            <meshStandardMaterial
              color={finish.metal}
              metalness={0.8}
              roughness={0.35}
            />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.025]} scale={[1, 1, 0.35]}>
          <sphereGeometry args={[0.15, 32, 20]} />
          <meshStandardMaterial
            color="#aab39d"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      </group>
      <group ref={cover}>
        <mesh position={[0, 0, 0.35]} scale={[0.79, 1.22, 0.2]} castShadow>
          <sphereGeometry args={[0.66, 64, 48]} />
          <meshStandardMaterial
            color={finish.shell}
            metalness={0.52}
            roughness={0.32}
          />
        </mesh>
        <mesh position={[0, -0.02, 0.481]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.063, 0.008, 8, 40]} />
          <meshStandardMaterial
            color={finish.metal}
            metalness={0.8}
            roughness={0.35}
          />
        </mesh>
      </group>
      {side === 1 && (
        <group position={[0.22, -0.66, 0.22]}>
          <mesh rotation={[0, 0, -0.25]}>
            <cylinderGeometry args={[0.048, 0.048, 0.13, 24]} />
            <meshStandardMaterial
              color={finish.metal}
              metalness={0.9}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[-0.16, -0.04, 0.03]}>
            <boxGeometry args={[0.085, 0.025, 0.035]} />
            <meshStandardMaterial color="#141612" />
          </mesh>
        </group>
      )}
      <mesh position={[0, 0, -0.18]} scale={[0.75, 1.18, 0.26]}>
        <torusGeometry args={[0.47, 0.16, 24, 64]} />
        <meshStandardMaterial color={finish.cushion} roughness={1} />
      </mesh>
    </group>
  );
}

export function Headphones({
  finish,
  exploded,
  rotation,
  progress,
  reducedMotion,
  intro = false,
  annotation,
  portal = false,
  onEntranceComplete,
  onEntrancePhase,
}: HeadphonesProps) {
  const group = useRef<THREE.Group>(null);
  const band = useRef<THREE.Group>(null);
  const driver = useRef<THREE.Group>(null);
  const age = useRef(0);
  const completed = useRef(false);
  const entrancePhase = useRef('loading');
  const point = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, rawDelta) => {
    if (!group.current) return;
    const delta = Math.min(rawDelta, 0.05);
    age.current += delta;
    const p = progress?.current ?? 0;
    const sound = smoothRange(p, 0.18, 0.4);
    const fit = smoothRange(p, 0.6, 0.8);
    const flex = Math.sin(smoothRange(p, 0.76, 1) * Math.PI) * 0.1;
    const mix = THREE.MathUtils.lerp;
    // Poses hold between transitions so the corresponding feature can be read.
    let turn = progress
      ? mix(mix(-0.42, -0.85, sound), 0.12, fit)
      : rotation.current;
    let scale = progress ? mix(mix(1, 1.32, sound), 1.15, fit) : 1;
    let y = progress ? mix(mix(0, 0.48, sound), -0.62, fit) : 0;
    let x = progress ? mix(0, -0.4, sound) * (1 - fit) : 0;
    if (intro && !reducedMotion) {
      const entrance = smoothRange(age.current, 0, 2.4);
      scale *= mix(0.35, 1, entrance);
      turn += mix(-1.1, 0, entrance) + Math.sin(age.current * 0.52) * 0.24;
      y += mix(-0.45, 0, entrance) + Math.sin(age.current * 0.9) * 0.09;
    }
    if (portal && !reducedMotion) {
      const phase = age.current < 1.25 ? 'arrive' : 'zoom';
      if (entrancePhase.current !== phase) {
        entrancePhase.current = phase;
        onEntrancePhase?.(phase);
      }
      const arrival = smoothRange(age.current, 0, 0.8);
      const flyThrough = smoothRange(age.current, 1.25, 3.8);
      scale = mix(0.65, 1, arrival) + flyThrough * 13;
      turn = mix(-0.65, 0, smoothRange(age.current, 0, 2));
      y = 0.45 * (1 - flyThrough);
      if (age.current > 3.7 && !completed.current) {
        completed.current = true;
        onEntranceComplete?.();
      }
    }
    if (reducedMotion) {
      turn = rotation.current;
      scale = 1;
      x = 0;
      y = 0;
    }
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      turn,
      6,
      delta,
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      progress ? mix(0.12, 0.32, fit) : 0.12,
      6,
      delta,
    );
    group.current.rotation.z = THREE.MathUtils.damp(
      group.current.rotation.z,
      progress ? mix(-0.12, 0.04, fit) : -0.12,
      6,
      delta,
    );
    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, scale, 7, delta),
    );
    group.current.position.x = THREE.MathUtils.damp(
      group.current.position.x,
      x,
      6,
      delta,
    );
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      y,
      6,
      delta,
    );
    if (band.current) band.current.scale.x = 1 + (reducedMotion ? 0 : flex);
    if (annotation?.current) {
      group.current.updateWorldMatrix(true, true);
      if (storyStep(p) === 1 && driver.current)
        driver.current.getWorldPosition(point);
      else {
        point.set(0, 1.77, 0.05);
        group.current.localToWorld(point);
      }
      point.project(state.camera);
      const px = (point.x * 0.5 + 0.5) * state.size.width;
      const py = (-point.y * 0.5 + 0.5) * state.size.height;
      annotation.current.style.setProperty(
        'transform',
        `translate3d(${px}px, ${py}px, 0)`,
      );
      annotation.current.style.setProperty(
        'opacity',
        point.z < 1 &&
          px > 0 &&
          px < state.size.width &&
          py > 0 &&
          py < state.size.height
          ? '1'
          : '0',
      );
    }
  });
  return (
    <group
      ref={group}
      rotation={[0.12, -0.42, -0.12]}
      scale={intro && !reducedMotion ? 0.35 : 1}
    >
      <group ref={band}>
        <Band color={finish.shell} />
        <Band color={finish.cushion} inner />
      </group>
      <EarCup
        side={-1}
        finish={finish}
        exploded={exploded}
        progress={progress}
      />
      <EarCup
        side={1}
        finish={finish}
        exploded={exploded}
        progress={progress}
        anchor={driver}
      />
    </group>
  );
}
