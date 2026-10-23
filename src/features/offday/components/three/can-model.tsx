'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Flavor } from '@/features/offday/types/product';

function createLabel(flavor: Flavor) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = flavor.label;
  ctx.fillRect(0, 0, 1024, 1024);
  // The front of the cylinder is centered on this label; the sides carry wraparound bands.
  ctx.fillStyle = flavor.accent;
  ctx.fillRect(0, 70, 1024, 18);
  ctx.fillRect(0, 930, 1024, 18);
  ctx.textAlign = 'center';
  ctx.fillStyle = flavor.ink;
  ctx.font = 'bold 29px Arial';
  ctx.fillText('GOOD ENERGY. GREAT DETOURS.', 512, 145);
  ctx.save();
  ctx.translate(512, 520);
  ctx.rotate(-Math.PI / 2);
  ctx.font = '900 176px Arial';
  ctx.fillText('OFFDAY', 0, 60);
  ctx.restore();
  ctx.fillStyle = flavor.accent;
  ctx.font = 'bold 38px Arial';
  ctx.fillText(flavor.name.toUpperCase(), 512, 839);
  ctx.fillStyle = flavor.ink;
  ctx.font = '22px Arial';
  ctx.fillText('SPARKLING ENERGY  /  250 mL', 512, 889);
  ctx.save();
  ctx.translate(512, 228);
  ctx.beginPath();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 ? 21 : 33;
    const x = Math.cos(a) * r,
      y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = flavor.accent;
  ctx.fill();
  ctx.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
export function CanModel({
  flavor,
  rotation,
  progress,
  reduced = false,
  entrance = false,
}: {
  flavor: Flavor;
  rotation: React.RefObject<number>;
  progress?: React.RefObject<number>;
  reduced?: boolean;
  entrance?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const texture = useMemo(() => createLabel(flavor), [flavor]);
  useEffect(() => () => texture.dispose(), [texture]);
  const drops = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => {
        const a = i * 2.39996;
        return {
          x: Math.sin(a) * 0.716,
          z: Math.cos(a) * 0.716,
          y: (((i * 37) % 100) / 100) * 2.65 - 1.325,
          scale: 0.012 + (i % 4) * 0.007,
        };
      }),
    [],
  );
  useFrame((_, delta) => {
    if (!group.current) return;
    elapsed.current += Math.min(delta, 0.05);
    const p = progress?.current ?? 0;
    const intro =
      entrance && !reduced
        ? THREE.MathUtils.smoothstep(elapsed.current, 0, 1.8)
        : 1;
    const targetY =
      rotation.current +
      (progress && !reduced ? p * Math.PI * 2 : 0) +
      (!progress && entrance && !reduced
        ? Math.sin(elapsed.current * 0.45) * 0.12
        : 0);
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      targetY,
      5,
      delta,
    );
    group.current.rotation.z = THREE.MathUtils.damp(
      group.current.rotation.z,
      progress ? -0.22 + p * 0.4 : -0.22,
      5,
      delta,
    );
    group.current.position.y = reduced
      ? 0
      : Math.sin(elapsed.current * 0.9) * 0.045;
    group.current.scale.setScalar(
      (0.55 + intro * 0.45) * (progress ? 1 + Math.sin(p * Math.PI) * 0.08 : 1),
    );
  });
  return (
    <group
      ref={group}
      rotation={[0.14, 0, -0.22]}
      scale={entrance && !reduced ? 0.55 : 1}
    >
      <mesh rotation={[0, Math.PI, 0]}>
        <cylinderGeometry args={[0.715, 0.715, 2.95, 96, 1, true]} />
        <meshStandardMaterial map={texture} roughness={0.38} metalness={0.32} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.635, 0.715, 0.15, 96]} />
        <meshStandardMaterial
          color="#d1d4cd"
          metalness={0.86}
          roughness={0.24}
        />
      </mesh>
      <mesh position={[0, -1.51, 0]}>
        <cylinderGeometry args={[0.715, 0.635, 0.16, 96]} />
        <meshStandardMaterial
          color="#bbc1b9"
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>
      {[1.59, -1.6].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.625, 0.035, 12, 96]} />
          <meshStandardMaterial
            color="#edf1e8"
            metalness={0.92}
            roughness={0.18}
          />
        </mesh>
      ))}
      <mesh position={[0, 1.585, 0]}>
        <cylinderGeometry args={[0.61, 0.61, 0.014, 96]} />
        <meshStandardMaterial color="#c1c7bf" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh
        position={[0, 1.603, 0.22]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[0.7, 1, 1]}
      >
        <circleGeometry args={[0.2, 32]} />
        <meshStandardMaterial color="#444b42" roughness={0.6} />
      </mesh>
      <mesh
        position={[0, 1.624, -0.04]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.65, 1, 1]}
      >
        <torusGeometry args={[0.19, 0.055, 10, 36]} />
        <meshStandardMaterial
          color="#e4e8e0"
          metalness={0.96}
          roughness={0.2}
        />
      </mesh>
      {drops.map((drop, i) => (
        <mesh
          key={i}
          position={[drop.x, drop.y, drop.z]}
          scale={[drop.scale, drop.scale * 1.4, drop.scale]}
        >
          <sphereGeometry args={[1, 6, 6]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.38}
            roughness={0.04}
            metalness={0.05}
            clearcoat={1}
          />
        </mesh>
      ))}
    </group>
  );
}
