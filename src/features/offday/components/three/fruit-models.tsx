'use client';
import { useMemo, useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
function usePeel(lime: boolean) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = lime ? '#759b20' : '#f68c1b';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5500; i++) {
      const x = (i * 73.79) % 256,
        y = (i * 47.33) % 256;
      ctx.fillStyle = i % 2 ? '#ffffff20' : '#54250022';
      ctx.beginPath();
      ctx.arc(x, y, 0.4 + (i % 3) * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [lime]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}
export function Citrus({
  lime = false,
  slice = false,
}: {
  lime?: boolean;
  slice?: boolean;
}) {
  const texture = usePeel(lime);
  if (!slice)
    return (
      <group>
        <mesh scale={lime ? [1, 1.15, 0.95] : [1, 0.93, 1]}>
          <sphereGeometry args={[0.58, 40, 28]} />
          <meshStandardMaterial map={texture} roughness={0.68} />
        </mesh>
        <Leaf position={[0.16, 0.55, 0.05]} />
      </group>
    );
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.14, 64]} />
        <meshStandardMaterial map={texture} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0, 0.078]}>
        <circleGeometry args={[0.65, 64]} />
        <meshStandardMaterial color="#fff0c5" roughness={0.7} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[0, 0, 0.084]}>
          <circleGeometry
            args={[0.595, 16, (i * Math.PI) / 5 + 0.035, Math.PI / 5 - 0.07]}
          />
          <meshPhysicalMaterial
            color={
              lime
                ? i % 2
                  ? '#c7db53'
                  : '#aeca49'
                : i % 2
                  ? '#ffac37'
                  : '#f8931c'
            }
            roughness={0.32}
            clearcoat={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.088]}>
        <circleGeometry args={[0.055, 20]} />
        <meshStandardMaterial color="#fff0cb" />
      </mesh>
    </group>
  );
}
export function Leaf({
  position = [0, 0, 0],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position} rotation={[0.3, 0, -0.7]}>
      <mesh scale={[0.45, 0.11, 0.18]}>
        <sphereGeometry args={[1, 20, 12]} />
        <meshStandardMaterial color="#426932" roughness={0.55} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.009, 0.009, 0.8, 6]} />
        <meshStandardMaterial color="#9cb066" />
      </mesh>
    </group>
  );
}
export function Berry() {
  return (
    <group>
      {Array.from({ length: 22 }, (_, i) => {
        const a = i * 2.39996;
        const y = 1 - i / 11;
        const r = Math.sqrt(Math.max(0, 1 - y * y)) * 0.39;
        return (
          <mesh key={i} position={[Math.cos(a) * r, y * 0.46, Math.sin(a) * r]}>
            <sphereGeometry args={[0.16, 14, 12]} />
            <meshPhysicalMaterial
              color={i % 3 ? '#a82b49' : '#c73e58'}
              roughness={0.3}
              clearcoat={0.7}
            />
          </mesh>
        );
      })}
      <Leaf position={[0, 0.5, 0]} />
    </group>
  );
}
function Floating({
  position,
  speed = 1,
  scale = 1,
  children,
}: {
  position: [number, number, number];
  speed?: number;
  scale?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const [seed] = useState(() => Math.random() * Math.PI * 2);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * speed + seed) * 0.16;
    ref.current.rotation.y = t * 0.35 * speed + seed;
    ref.current.rotation.z = Math.sin(t * 0.5 + seed) * 0.14;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      {children}
    </group>
  );
}
export function FruitCluster({ flavorId }: { flavorId: string }) {
  if (flavorId === 'berry') {
    return (
      <group>
        <Floating position={[-2, 1.5, -0.4]} speed={0.9}>
          <Berry />
        </Floating>
        <Floating position={[2.05, 1.05, -0.2]} speed={1.15} scale={0.82}>
          <Berry />
        </Floating>
        <Floating position={[0.3, 2.35, -1]} speed={1.0} scale={0.6}>
          <Berry />
        </Floating>
      </group>
    );
  }
  const lime = flavorId === 'lime';
  return (
    <group>
      <Floating position={[-2, 1.5, -0.4]} speed={0.9}>
        <Citrus lime={lime} />
      </Floating>
      <Floating position={[2.05, 1.05, -0.2]} speed={1.15}>
        <Citrus lime={lime} slice />
      </Floating>
      <Floating position={[0.35, 2.35, -1]} speed={1.0} scale={0.7}>
        <Citrus lime={lime} />
      </Floating>
    </group>
  );
}
