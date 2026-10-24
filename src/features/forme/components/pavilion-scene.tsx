'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { useInView } from 'motion/react';
import * as THREE from 'three';
import { MATERIALS } from '../lib/materials';
type Props = {
  material: number;
  night: boolean;
  progress: React.RefObject<number>;
  view: number | null;
  reduced: boolean;
  orbit: number;
};
function Block({
  position,
  size,
  color,
  roughness = 0.8,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  roughness?: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}
function Olive({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.12, 1.7, 8]} />
        <meshStandardMaterial color="#625845" />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 2.4) * 0.48,
            1.65 + (i % 3) * 0.2,
            Math.cos(i * 2.4) * 0.4,
          ]}
          scale={[0.65, 0.4, 0.52]}
          castShadow
        >
          <icosahedronGeometry args={[0.65, 1]} />
          <meshStandardMaterial
            color={i % 2 ? '#63705a' : '#7b8366'}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}
function Model({ material, night, progress, view, reduced, orbit }: Props) {
  const root = useRef<THREE.Group>(null),
    roof = useRef<THREE.Group>(null);
  const { size } = useThree();
  const target = useRef(new THREE.Vector3(0, 0.6, 0));
  const palette = MATERIALS[material];
  const grain = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#d6cdbb';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 6000; i++) {
      const x = (i * 73) % 256,
        y = (i * 151 + Math.floor(i / 256) * 17) % 256;
      ctx.fillStyle = `rgba(75,67,52,${0.02 + (i % 5) * 0.013})`;
      ctx.fillRect(x, y, 1 + (i % 3), 1);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => grain.dispose(), [grain]);
  const cameraTarget = useRef(new THREE.Vector3());
  useFrame((state, delta) => {
    const camera = state.camera;
    const phase = view ?? Math.min(2, Math.floor(progress.current * 3));
    const mobile = size.width < 700;
    const shots = mobile
      ? [
          [11, 8, 15],
          [1.4, 1.7, 3.4],
          [10, 11, 13],
        ]
      : [
          [9, 6.2, 11],
          [1.4, 1.7, 3.4],
          [8.8, 9, 10.8],
        ];
    const path =
      view !== null || reduced
        ? phase
        : progress.current < 0.5
          ? THREE.MathUtils.smoothstep(progress.current, 0.08, 0.43)
          : 1 + THREE.MathUtils.smoothstep(progress.current, 0.57, 0.92);
    const from = Math.min(1, Math.floor(path)),
      blend = path - from;
    const shot = shots[from].map((v, i) =>
      THREE.MathUtils.lerp(v, shots[from + 1][i], blend),
    );
    cameraTarget.current.set(shot[0], shot[1], shot[2]);
    if (!reduced && phase === 0) {
      cameraTarget.current.x += state.pointer.x * 0.3;
      cameraTarget.current.y += state.pointer.y * 0.12;
    }
    camera.position.lerp(
      cameraTarget.current,
      reduced ? 1 : 1 - Math.exp(-delta * 2.3),
    );
    const aims = [
      [0, 0.5, 0],
      [-0.2, 1.1, -1.8],
      [0, 1.6, 0],
    ];
    const aim = new THREE.Vector3(
      ...(aims[from].map((v, i) =>
        THREE.MathUtils.lerp(v, aims[from + 1][i], blend),
      ) as [number, number, number]),
    );
    target.current.lerp(aim, reduced ? 1 : 1 - Math.exp(-delta * 2.3));
    camera.lookAt(target.current);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(38, 65, 1 - Math.abs(path - 1));
      camera.updateProjectionMatrix();
    }
    if (root.current)
      root.current.rotation.y = THREE.MathUtils.damp(
        root.current.rotation.y,
        orbit,
        5,
        delta,
      );
    if (roof.current)
      roof.current.position.y = THREE.MathUtils.damp(
        roof.current.position.y,
        Math.max(0, path - 1) * 3,
        reduced ? 100 : 3,
        delta,
      );
  });
  return (
    <group ref={root}>
      <Block
        position={[0.2, 1.75, -1.79]}
        size={[1.7, 1.05, 0.04]}
        color={palette.wood}
      />
      <Block
        position={[0.2, 1.75, -1.76]}
        size={[1.56, 0.91, 0.02]}
        color="#ac926e"
      />
      <Block
        position={[-0.15, 1.75, -1.74]}
        size={[0.12, 0.75, 0.015]}
        color="#e5d8bf"
      />
      <Block
        position={[0.45, 1.58, -1.74]}
        size={[0.5, 0.12, 0.015]}
        color="#574c3a"
      />
      <Block
        position={[0.3, 0.195, 0.3]}
        size={[3.2, 0.02, 2.2]}
        color="#afa58f"
      />
      <mesh position={[0, -0.44, 0]} receiveShadow>
        <boxGeometry args={[13, 0.3, 10]} />
        <meshStandardMaterial
          color={night ? '#76786c' : '#b4b7a3'}
          roughness={1}
        />
      </mesh>
      <Block position={[0, -0.2, 0]} size={[10, 0.22, 7]} color="#bab29e" />
      <Block
        position={[0, -0.02, 0.25]}
        size={[8.8, 0.2, 5.9]}
        color={palette.color}
      />
      <Block
        position={[0, 0.08, 0]}
        size={[7, 0.16, 4]}
        color={palette.color}
      />
      <mesh position={[0, 0.17, 0]} receiveShadow>
        <boxGeometry args={[6.9, 0.035, 3.9]} />
        <meshStandardMaterial
          map={grain}
          color={palette.color}
          roughness={0.85}
        />
      </mesh>
      <Block
        position={[0, 1.47, -1.9]}
        size={[7, 2.6, 0.18]}
        color={palette.color}
      />
      <Block
        position={[-3.35, 1.47, 0]}
        size={[0.3, 2.6, 3.9]}
        color={palette.color}
      />
      <Block
        position={[2.65, 1.47, -0.65]}
        size={[1.15, 2.6, 2.5]}
        color={palette.color}
      />
      {[-2.8, 0, 2.8].map((x) => (
        <Block
          key={x}
          position={[x, 1.47, 1.75]}
          size={[0.075, 2.6, 0.075]}
          color="#4e5149"
        />
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <Block
          key={i}
          position={[-3 + i * 0.12, 1.47, 1.78]}
          size={[0.045, 2.6, 0.12]}
          color={palette.wood}
        />
      ))}
      <group ref={roof}>
        <Block
          position={[0, 2.86, 0]}
          size={[7.6, 0.24, 4.6]}
          color={palette.color}
        />
        <Block
          position={[0, 2.71, 0]}
          size={[7.1, 0.06, 4.1]}
          color={palette.wood}
        />
        {[-1.3, 0, 1.3].map((z) => (
          <Block
            key={z}
            position={[0, 2.65, z]}
            size={[7, 0.08, 0.07]}
            color={palette.wood}
          />
        ))}
      </group>
      <mesh position={[0.6, 1.47, 1.77]}>
        <planeGeometry args={[4.3, 2.5]} />
        <meshPhysicalMaterial
          color="#c7dbd1"
          transparent
          opacity={0.1}
          roughness={0.08}
          metalness={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <Block
        position={[0.4, 0.32, -0.35]}
        size={[2.6, 0.28, 1.05]}
        color={palette.wood}
      />
      <Block
        position={[0.4, 0.58, -0.35]}
        size={[2.5, 0.26, 1]}
        color="#eee7da"
      />
      <Block
        position={[0.4, 0.9, -0.78]}
        size={[2.5, 0.5, 0.16]}
        color="#e2d9c8"
      />
      {[-0.45, 0.5, 1.2].map((x) => (
        <Block
          key={x}
          position={[x, 0.68, -0.35]}
          size={[0.65, 0.12, 0.75]}
          color="#d5cdbc"
        />
      ))}
      <mesh position={[0.4, 0.4, 0.9]} castShadow>
        <cylinderGeometry args={[0.58, 0.58, 0.12, 48]} />
        <meshStandardMaterial color={palette.wood} roughness={0.6} />
      </mesh>
      <Block
        position={[0.4, 0.26, 0.9]}
        size={[0.12, 0.3, 0.12]}
        color={palette.wood}
      />
      <Block
        position={[-1.85, 0.32, -1.3]}
        size={[1, 0.3, 0.65]}
        color={palette.wood}
      />
      <mesh position={[-1.85, 0.75, -1.3]} castShadow>
        <sphereGeometry args={[0.28, 24, 16]} />
        <meshStandardMaterial color="#dbd5c6" roughness={0.8} />
      </mesh>
      <mesh
        position={[-1.1, 0.09, 2.75]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[5.6, 1.2]} />
        <meshPhysicalMaterial
          color={night ? '#283f43' : '#6f9a91'}
          metalness={0.5}
          roughness={0.13}
          clearcoat={1}
        />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <Block
          key={i}
          position={[3.5 - i * 0.4, -0.12 - i * 0.035, 2.6]}
          size={[0.65, 0.1, 1.3]}
          color={palette.color}
        />
      ))}
      <Olive position={[4.5, -0.25, -2.3]} scale={1.3} />
      <Olive position={[-4.8, -0.25, -2.5]} scale={0.9} />
      <mesh position={[4.5, -0.15, -2.3]}>
        <cylinderGeometry args={[0.75, 0.85, 0.2, 40]} />
        <meshStandardMaterial color="#918c73" />
      </mesh>
      {night && (
        <>
          <pointLight
            position={[0, 2, 0]}
            color="#ffc17e"
            intensity={12}
            distance={7}
          />
          <pointLight
            position={[-2.5, 1.7, 0.5]}
            color="#ffd4a0"
            intensity={5}
            distance={4}
          />
        </>
      )}
    </group>
  );
}
export default function PavilionScene(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: '120px' });
  return (
    <div ref={ref} className="forme-canvas">
      <Canvas
        shadows
        camera={{ position: [9, 6.2, 11], fov: 38 }}
        dpr={[1, 1.5]}
        frameloop={visible ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={props.night ? 0.45 : 1.2} />
        <hemisphereLight
          args={[props.night ? '#8d9faf' : '#fff3db', '#6a725e', 1.2]}
        />
        <directionalLight
          position={[-5, 9, 6]}
          intensity={props.night ? 0.7 : 3.5}
          color={props.night ? '#b7c9ed' : '#ffe8c4'}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.001}
        />
        <Model {...props} />
      </Canvas>
    </div>
  );
}
