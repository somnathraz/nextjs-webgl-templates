'use client';

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  bandGeometry,
  cushionGeometry,
  fabricTexture,
  shellGeometry,
  visorGeometry,
} from '../lib/geometry';
import {
  FINISHES,
  smooth,
  type VelaSettings,
  type VelaSignal,
} from '../lib/experience';

type Props = {
  signal: React.RefObject<VelaSignal>;
  settings: VelaSettings;
  reduced: boolean;
  onReady: () => void;
  onFailure: () => void;
};

class Boundary extends Component<
  { children: React.ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Lighting({ onReady, reduced }: Pick<Props, 'onReady' | 'reduced'>) {
  const get = useThree((s) => s.get);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const { gl, scene, camera } = get();
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(gl);
    const environment = pmrem.fromScene(room, 0.025);
    scene.environment = environment.texture;
    scene.environmentIntensity = 1.1;
    let disposed = false;
    gl.compileAsync(scene, camera).then(() => {
      if (!disposed) {
        onReady();
        invalidate();
      }
    });
    room.dispose();
    pmrem.dispose();
    return () => {
      disposed = true;
      scene.environment = null;
      environment.dispose();
    };
  }, [get, onReady, invalidate]);
  useEffect(() => {
    if (!reduced) return;
    const update = () => requestAnimationFrame(() => invalidate());
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [reduced, invalidate]);
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 5, 4]} intensity={3.0} color="#fffaf3" />
      <directionalLight
        position={[-4, 2, -3]}
        intensity={2.5}
        color="#c8d8e7"
      />
    </>
  );
}

const reflectionVertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const reflectionFragment = `varying vec2 vUv; void main(){float stripe=exp(-pow((vUv.y-vUv.x*.15-.82)*18.,2.));float edge=pow(abs(vUv.x-.5)*2.,5.);gl_FragColor=vec4(.79,.87,.94,stripe*.18+edge*.07);}`;

function Product({
  signal,
  settings,
  reduced,
}: Pick<Props, 'signal' | 'settings' | 'reduced'>) {
  const model = useRef<THREE.Group>(null);
  const front = useRef<THREE.Group>(null);
  const band = useRef<THREE.Group>(null);
  const optics = useRef<THREE.Group>(null);
  const shellMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const panorama = useRef<THREE.MeshBasicMaterial>(null);
  const timeline = useRef({
    hero: 0,
    story: 0,
    studio: 0,
    rx: 0.16,
    ry: -0.35,
    explode: 0,
  });
  const intro = useRef(0);
  const time = useRef(0);
  const viewport = useThree((s) => s.size);
  const small = viewport.width < 760;
  const texture = useLoader(THREE.TextureLoader, '/vela/alpine-dawn.png');
  const geometry = useMemo(
    () => ({
      shell: shellGeometry(3.6, 1.52, 0.32),
      gasket: cushionGeometry(),
      visor: visorGeometry(),
      band: bandGeometry(),
      top: bandGeometry(true),
      weave: fabricTexture(),
    }),
    [],
  );
  const finish = FINISHES[settings.finish];

  const panoramaTexture = useMemo(() => {
    const copy = texture.clone();
    copy.colorSpace = THREE.SRGBColorSpace;
    return copy;
  }, [texture]);
  useEffect(() => () => panoramaTexture.dispose(), [panoramaTexture]);
  useEffect(
    () => () => Object.values(geometry).forEach((item) => item.dispose()),
    [geometry],
  );

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.04),
      s = signal.current,
      m = timeline.current;
    const blend = reduced ? 1 : 1 - Math.exp(-4.5 * d);
    m.hero += (s.hero - m.hero) * blend;
    m.story += (s.story - m.story) * blend;
    m.studio += (s.studio - m.studio) * blend;
    intro.current = reduced ? 1 : Math.min(1, intro.current + d * 0.5);
    if (!reduced) time.current += d;
    const t = time.current;
    const detailing = smooth(0.02, 0.3, m.story);
    const reveal =
      smooth(0.32, 0.47, m.story) * (1 - smooth(0.59, 0.7, m.story));
    const enter = smooth(0.7, 0.99, m.story) * (1 - m.studio);
    const manual = m.studio;
    const viewY =
      settings.view === 'profile'
        ? -1.15
        : settings.view === 'optics'
          ? Math.PI - 0.2
          : -0.15;
    const targetY = THREE.MathUtils.lerp(
      (-0.35 - detailing * 0.75 + reveal * 0.4) * (1 - enter),
      viewY,
      manual,
    );
    const targetX = THREE.MathUtils.lerp(
      0.14 + detailing * 0.05 - enter * 0.14,
      settings.view === 'optics' ? -0.12 : 0.16,
      manual,
    );
    m.rx += (targetX - m.rx) * blend;
    m.ry += (targetY - m.ry) * blend;
    m.explode += (reveal - m.explode) * blend;
    if (model.current) {
      const x = small
        ? 0
        : m.hero * 1.5 * (1 - enter) * (1 - manual) - manual * 1.55;
      const y = small
        ? -0.65 - m.hero * 0.6 * (1 - manual) + manual * 1.4
        : -0.88 + m.hero * 0.73;
      model.current.position.set(x, y * (1 - enter), 0);
      model.current.rotation.set(
        m.rx + (reduced ? 0 : s.pointerY * 0.025),
        m.ry + (reduced ? 0 : s.pointerX * 0.05),
        -0.03 * (1 - enter),
      );
      const scale = (small ? 0.69 : 0.92 + m.hero * 0.08) * (1 + enter * 4.8);
      model.current.scale.setScalar(scale);
      if (!reduced)
        model.current.position.y += Math.sin(t * 0.75) * 0.025 * (1 - enter);
    }
    if (front.current) front.current.position.z = 0.15 + m.explode * 1.35;
    if (band.current) band.current.position.z = -m.explode * 0.65;
    if (optics.current) optics.current.position.z = -0.31 + m.explode * 0.48;
    if (shellMaterial.current)
      shellMaterial.current.opacity = 1 - m.explode * 0.91;
    if (panorama.current)
      panorama.current.opacity = smooth(0.68, 0.79, m.story) * (1 - manual);
    const z = (small ? 7.6 : 6.5) + m.hero * 0.6 - (1 - intro.current) * 1.35;
    state.camera.position.z +=
      (z - state.camera.position.z) * (reduced ? 1 : 1 - Math.exp(-4 * d));
  });

  return (
    <group ref={model}>
      <group ref={band}>
        <mesh geometry={geometry.band}>
          <meshStandardMaterial
            color={finish.fabric}
            roughness={0.95}
            bumpMap={geometry.weave}
            bumpScale={0.025}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh geometry={geometry.top}>
          <meshStandardMaterial
            color={finish.fabric}
            roughness={0.95}
            bumpMap={geometry.weave}
            bumpScale={0.018}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh geometry={geometry.gasket} position={[0, 0, -0.32]}>
          <meshStandardMaterial
            color="#292e31"
            roughness={0.9}
            bumpMap={geometry.weave}
            bumpScale={0.018}
          />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 1.78, 0.04, -0.44]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <capsuleGeometry args={[0.12, 0.66, 5, 16]} />
              <meshStandardMaterial
                color={finish.frame}
                metalness={0.65}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[side * 0.06, 0.02, -0.1]}>
              <boxGeometry args={[0.04, 0.055, 0.38]} />
              <meshStandardMaterial color="#454d50" roughness={0.7} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.05, -2.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.07, 48]} />
          <meshStandardMaterial
            color={finish.frame}
            roughness={0.35}
            metalness={0.6}
          />
        </mesh>
      </group>

      <mesh geometry={geometry.shell}>
        <meshStandardMaterial
          ref={shellMaterial}
          color={finish.frame}
          metalness={0.8}
          roughness={0.28}
          transparent
        />
      </mesh>

      <group ref={front} position={[0, 0, 0.31]}>
        <mesh geometry={geometry.visor}>
          <meshPhysicalMaterial
            color="#0d131b"
            roughness={0.13}
            metalness={0.32}
            clearcoat={1}
            clearcoatRoughness={0.08}
            envMapIntensity={1.6}
          />
        </mesh>
        <mesh geometry={geometry.visor} position={[0, 0, 0.004]}>
          <shaderMaterial
            vertexShader={reflectionVertex}
            fragmentShader={reflectionFragment}
            transparent
            depthWrite={false}
          />
        </mesh>
        <mesh geometry={geometry.visor} position={[0, 0, 0.009]}>
          <meshBasicMaterial
            ref={panorama}
            map={panoramaTexture}
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
        {[-1.22, -0.69, 0.69, 1.22].map((x, i) => (
          <group key={x} position={[x, -0.42, 0.19 - x * x * 0.08]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry
                args={[i % 2 ? 0.055 : 0.08, i % 2 ? 0.055 : 0.08, 0.018, 32]}
              />
              <meshStandardMaterial
                color="#05070a"
                metalness={0.2}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[0, 0, 0.012]}>
              <circleGeometry args={[i % 2 ? 0.04 : 0.058, 32]} />
              <meshPhysicalMaterial
                color="#102838"
                metalness={0.5}
                roughness={0.08}
                clearcoat={1}
              />
            </mesh>
          </group>
        ))}
        <mesh position={[1.45, 0.25, -0.02]}>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshBasicMaterial color="#b2decd" />
        </mesh>
      </group>

      <group ref={optics} position={[0, 0, -0.31]}>
        {[-0.78, 0.78].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh>
              <torusGeometry args={[0.52, 0.08, 12, 72]} />
              <meshStandardMaterial
                color="#34393d"
                roughness={0.4}
                metalness={0.55}
              />
            </mesh>
            <mesh position={[0, 0, 0.01]} scale={[1, 1, 0.24]}>
              <sphereGeometry args={[0.48, 40, 32]} />
              <meshPhysicalMaterial
                color="#4b6179"
                metalness={0.8}
                roughness={0.1}
                clearcoat={1}
                envMapIntensity={2}
              />
            </mesh>
            {[0.3, 0.37, 0.44].map((radius) => (
              <mesh key={radius} position={[0, 0, 0.105]}>
                <torusGeometry args={[radius, 0.003, 4, 64]} />
                <meshBasicMaterial color="#9baecd" transparent opacity={0.36} />
              </mesh>
            ))}
            <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]}>
              <circleGeometry args={[0.46, 64]} />
              <meshPhysicalMaterial
                color="#405a73"
                metalness={0.75}
                roughness={0.07}
                clearcoat={1}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}
      </group>

      <group position={[1.15, 0.84, -0.14]}>
        <mesh>
          <cylinderGeometry args={[0.145, 0.145, 0.09, 48]} />
          <meshStandardMaterial
            color={finish.frame}
            roughness={0.3}
            metalness={0.85}
          />
        </mesh>
        {Array.from({ length: 28 }, (_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 28) * Math.PI * 2) * 0.144,
              0,
              Math.sin((i / 28) * Math.PI * 2) * 0.144,
            ]}
            rotation={[0, (-i / 28) * Math.PI * 2, 0]}
          >
            <boxGeometry args={[0.008, 0.07, 0.008]} />
            <meshStandardMaterial
              color="#7f898d"
              metalness={0.8}
              roughness={0.4}
            />
          </mesh>
        ))}
      </group>
      <mesh position={[-1.17, 0.82, -0.1]} scale={[1.9, 0.25, 1]}>
        <sphereGeometry args={[0.085, 24, 12]} />
        <meshStandardMaterial
          color={finish.frame}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>
      {Array.from({ length: 17 }, (_, i) => (
        <mesh
          key={i}
          position={[-0.68 + i * 0.085, 0.782, 0.02]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <capsuleGeometry args={[0.008, 0.065, 2, 6]} />
          <meshStandardMaterial color="#656e70" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export default function Headset(props: Props) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const change = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  return (
    <Boundary onFailure={props.onFailure}>
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 36 }}
        dpr={[1, 1.65]}
        frameloop={!visible ? 'never' : props.reduced ? 'demand' : 'always'}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => gl.setClearColor(0xf5f4f0, 0)}
      >
        <Suspense fallback={null}>
          <Product {...props} />
          <Lighting onReady={props.onReady} reduced={props.reduced} />
        </Suspense>
      </Canvas>
    </Boundary>
  );
}
