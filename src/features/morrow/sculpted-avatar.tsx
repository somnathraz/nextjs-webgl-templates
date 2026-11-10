'use client';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { MotionValue } from 'motion/react';

type Props = {
  progress: MotionValue<number>;
  reduced: boolean;
  visible: boolean;
  paused: boolean;
  gender: 'men' | 'women';
};

function Hair({ gender, progress, reduced, paused }: Props) {
  const ref = useRef<THREE.Mesh>(null);
  const time = useRef(0);
  const geometry = useMemo(() => {
    const make = (look: number) => {
      const tubes = Array.from({ length: 120 }, (_, i) => {
        const a = (i / 120) * Math.PI * 2;
        const s = Math.sin(a),
          c = Math.cos(a);
        const front = Math.max(0, c);
        const women = gender === 'women';
        const length = women ? [0.8, 1.55, 2.05][look] : [0, 0.12, 0.35][look];
        const lift = women ? 0.06 : [0.02, 0.22, 0.12][look] * front;
        const sweep = look === 2 ? 0.23 : look === 1 ? -0.12 : 0;
        const points = [
          new THREE.Vector3(s * 0.07, 1.64, 0.08 + c * 0.1),
          new THREE.Vector3(
            s * 0.34 + sweep * front,
            1.61 + lift,
            c * 0.46 + 0.08,
          ),
          new THREE.Vector3(
            s * 0.6 + sweep * front,
            1.37 + lift * 0.7,
            c * 0.69 + 0.08,
          ),
          new THREE.Vector3(
            s * 0.67,
            1.07 - (women && front < 0.7 ? length * 0.35 : 0),
            c * 0.78 + 0.08,
          ),
          new THREE.Vector3(
            s * (0.67 + length * 0.07),
            front > 0.7 ? 1.14 + Math.sin(a * 4) * 0.045 : 0.85 - length,
            c * 0.76 + 0.08 + (look === 2 ? 0.08 : 0),
          ),
        ];
        return new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(points),
          30,
          0.022 + (i % 3) * 0.003,
          5,
          false,
        );
      });
      const merged = mergeGeometries(tubes);
      tubes.forEach((t) => t.dispose());
      return merged;
    };
    const base = make(0),
      second = make(1),
      third = make(2);
    base.morphAttributes.position = [
      second.attributes.position.clone(),
      third.attributes.position.clone(),
    ];
    base.morphAttributes.normal = [
      second.attributes.normal.clone(),
      third.attributes.normal.clone(),
    ];
    second.dispose();
    third.dispose();
    return base;
  }, [gender]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    if (!ref.current?.morphTargetInfluences) return;
    const p = reduced ? 0 : Math.min(1, Math.max(0, progress.get()));
    ref.current.morphTargetInfluences[0] = p < 0.5 ? p * 2 : (1 - p) * 2;
    ref.current.morphTargetInfluences[1] = p < 0.5 ? 0 : (p - 0.5) * 2;
    if (!paused && !reduced) time.current += Math.min(delta, 0.05);
    ref.current.rotation.z = reduced ? 0 : Math.sin(time.current * 1.3) * 0.006;
  });
  return (
    <group>
      <mesh position={[0, 0.83, 0.06]} scale={[0.655, 0.82, 0.79]}>
        <sphereGeometry args={[1, 48, 32, 0, Math.PI * 2, 0, 1.2]} />
        <meshStandardMaterial color="#201b19" roughness={0.72} />
      </mesh>
      <mesh
        ref={(node) => {
          ref.current = node;
          node?.updateMorphTargets();
        }}
        geometry={geometry}
      >
        <meshStandardMaterial
          color={gender === 'men' ? '#29221e' : '#51352a'}
          roughness={0.58}
          metalness={0.02}
        />
      </mesh>
    </group>
  );
}

function Bust(props: Props) {
  const gltf = useLoader(GLTFLoader, '/models/morrow/head.glb');
  const root = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const geometry = useMemo(() => {
    let source: THREE.BufferGeometry | undefined;
    gltf.scene.traverse((o) => {
      if (o instanceof THREE.Mesh) source = o.geometry;
    });
    if (!source) throw new Error('Head model unavailable');
    const result = source.clone();
    result.scale(0.4, 0.4, 0.4);
    if (props.gender === 'women') {
      const p = result.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i);
        const jaw = 1 - Math.max(0, 1 - Math.abs(y) / 0.65) * 0.13;
        p.setX(i, p.getX(i) * jaw * 0.96);
      }
      result.computeVertexNormals();
    }
    return result;
  }, [gltf, props.gender]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(
    () => props.progress.on('change', () => invalidate()),
    [props.progress, invalidate],
  );
  useFrame((state, delta) => {
    if (!root.current) return;
    const p = props.reduced ? 0.2 : props.progress.get();
    const target =
      -0.28 +
      Math.sin(p * Math.PI * 2) * 0.5 +
      (!props.paused && !props.reduced ? state.pointer.x * 0.12 : 0);
    root.current.rotation.y = props.reduced
      ? target
      : THREE.MathUtils.damp(
          root.current.rotation.y,
          target,
          4,
          Math.min(delta, 0.05),
        );
  });
  return (
    <group ref={root} position={[0, -0.05, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={props.gender === 'men' ? '#c3957e' : '#d7ac99'}
          roughness={0.69}
        />
      </mesh>
      <Hair key={props.gender} {...props} />
      <mesh position={[0, -1.65, -0.2]}>
        <cylinderGeometry args={[1.2, 1.25, 0.12, 64]} />
        <meshStandardMaterial color="#9cad8d" roughness={0.7} />
      </mesh>
    </group>
  );
}
export default function SculptedAvatar(props: Props) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.2, 6.5], fov: 42 }}
      frameloop={
        props.visible
          ? props.paused || props.reduced
            ? 'demand'
            : 'always'
          : 'never'
      }
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 4, 5]} intensity={2.1} color="#fff3e9" />
      <directionalLight position={[-4, 2, 1]} intensity={0.8} color="#d4e7c8" />
      <directionalLight position={[0, 3, -4]} intensity={2} color="#f1e2d4" />
      <Suspense fallback={null}>
        <Bust {...props} />
      </Suspense>
    </Canvas>
  );
}
