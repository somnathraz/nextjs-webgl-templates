'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

type Props = {
  color: string;
  lit: boolean;
  moving: boolean;
  reduced: boolean;
  visible: boolean;
  angle: number;
};

function Lamp({ color, lit, moving, reduced, angle }: Props) {
  const root = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const { gl, get, invalidate } = useThree();
  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const environment = generator.fromScene(room);
    const scene = get().scene;
    scene.environment = environment.texture;
    invalidate();
    return () => {
      scene.environment = null;
      environment.dispose();
      room.dispose();
      generator.dispose();
    };
  }, [gl, get, invalidate]);
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    if (moving && !reduced) elapsed.current += delta;
    if (root.current) {
      const turn = angle + (!reduced && moving ? state.pointer.x * 0.13 : 0);
      root.current.rotation.y = reduced
        ? turn
        : THREE.MathUtils.damp(root.current.rotation.y, turn, 4, delta);
    }
    if (orbit.current)
      orbit.current.rotation.z = -0.42 + Math.sin(elapsed.current * 0.5) * 0.18;
  });
  return (
    <group ref={root} position={[0, -0.1, 0]} rotation={[0, angle, 0]}>
      <mesh position={[0, -1.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.84, 0.16, 80]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.23} />
      </mesh>
      <mesh position={[0, -1.18, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.055, 1.05, 24]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.2} />
      </mesh>
      <group
        ref={orbit}
        position={[0, 0.56, 0]}
        rotation={[0.18, -0.28, -0.42]}
      >
        <mesh castShadow>
          <torusGeometry args={[1.45, 0.105, 24, 128]} />
          <meshStandardMaterial
            color={color}
            metalness={0.94}
            roughness={0.19}
          />
        </mesh>
        <group rotation={[0.65, 0.95, 0]}>
          <mesh castShadow>
            <torusGeometry args={[1.27, 0.07, 20, 128]} />
            <meshStandardMaterial
              color={color}
              metalness={0.88}
              roughness={0.24}
            />
          </mesh>
          <mesh position={[0, 0, 0.065]}>
            <torusGeometry args={[1.27, 0.036, 16, 128]} />
            <meshStandardMaterial
              color={lit ? '#fff8d6' : '#c7c8c3'}
              emissive="#ffdd92"
              emissiveIntensity={lit ? 2.8 : 0}
            />
          </mesh>
          <mesh position={[0, 1.27, 0]}>
            <sphereGeometry args={[0.12, 24, 16]} />
            <meshStandardMaterial
              color={color}
              metalness={0.85}
              roughness={0.2}
            />
          </mesh>
        </group>
      </group>
      {lit && (
        <pointLight
          position={[0, 0.6, 0]}
          color="#ffe8b2"
          intensity={5}
          distance={5}
        />
      )}
    </group>
  );
}

export default function SiloScene(props: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.5, 7.8], fov: 40 }}
      frameloop={
        props.visible
          ? props.reduced || !props.moving
            ? 'demand'
            : 'always'
          : 'never'
      }
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[3, 7, 5]}
        intensity={3}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
      />
      <directionalLight position={[-4, 1, 3]} intensity={1.5} />
      <Lamp {...props} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.89, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <shadowMaterial transparent opacity={0.12} />
      </mesh>
    </Canvas>
  );
}
