'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { makeBlade, makeDust } from '../lib/geometry';
import {
  coreFragment,
  coreVertex,
  dustFragment,
  dustVertex,
} from '../lib/shaders';
import {
  smooth,
  type HeliosSignal,
  type InstrumentSettings,
} from '../lib/choreography';

type Props = {
  signal: React.RefObject<HeliosSignal>;
  settings: InstrumentSettings;
  reduced: boolean;
  onProgress: (value: number) => void;
  onUnavailable: () => void;
};

class SceneBoundary extends Component<
  { children: React.ReactNode; onUnavailable: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onUnavailable();
  }
  render() {
    return this.state.failed ? (
      <div className="hel-fallback-orbit" />
    ) : (
      this.props.children
    );
  }
}

function Pipeline({ onProgress }: Pick<Props, 'onProgress'>) {
  const get = useThree((state) => state.get);
  const size = useThree((state) => state.size);
  const composer = useRef<EffectComposer | null>(null);
  const antialias = useRef<ShaderPass | null>(null);

  useEffect(() => {
    const { gl, scene, camera } = get();
    let cancelled = false;
    onProgress(32);
    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromScene(environment, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.65;
    environment.dispose();
    pmrem.dispose();
    const effects = new EffectComposer(gl);
    const render = new RenderPass(scene, camera);
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.35, 0.5, 1.8);
    // Preserve scene alpha: typography sits behind the solid object.
    bloom.blendMaterial.blending = THREE.CustomBlending;
    bloom.blendMaterial.blendSrc = THREE.OneFactor;
    bloom.blendMaterial.blendDst = THREE.OneFactor;
    bloom.blendMaterial.blendSrcAlpha = THREE.ZeroFactor;
    bloom.blendMaterial.blendDstAlpha = THREE.OneFactor;
    const output = new OutputPass();
    const fxaa = new ShaderPass(FXAAShader);
    const ratio = gl.getPixelRatio();
    fxaa.uniforms.resolution.value.set(
      1 / (gl.domElement.clientWidth * ratio),
      1 / (gl.domElement.clientHeight * ratio),
    );
    effects.addPass(render);
    effects.addPass(bloom);
    effects.addPass(output);
    effects.addPass(fxaa);
    effects.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight);
    composer.current = effects;
    antialias.current = fxaa;
    onProgress(68);
    gl.compileAsync(scene, camera)
      .then(() => {
        if (!cancelled) onProgress(100);
      })
      .catch(() => {
        if (!cancelled) onProgress(100);
      });
    return () => {
      cancelled = true;
      composer.current = null;
      antialias.current = null;
      scene.environment = null;
      target.dispose();
      bloom.dispose();
      output.dispose();
      fxaa.dispose();
      render.dispose();
      effects.dispose();
    };
  }, [get, onProgress]);

  useEffect(() => {
    composer.current?.setSize(size.width, size.height);
    const ratio = get().gl.getPixelRatio();
    antialias.current?.uniforms.resolution.value.set(
      1 / (size.width * ratio),
      1 / (size.height * ratio),
    );
  }, [size, get]);
  useFrame((state, delta) => {
    if (composer.current) composer.current.render(delta);
    else state.gl.render(state.scene, state.camera);
  }, 1);
  return null;
}

function ReducedMotionUpdates({ reduced }: { reduced: boolean }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (!reduced) return;
    // Demand rendering still follows native scroll and live instrument changes.
    const update = () => {
      requestAnimationFrame(() => invalidate());
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [invalidate, reduced]);
  return null;
}

function Artifact({
  signal,
  settings,
  reduced,
}: Pick<Props, 'signal' | 'settings' | 'reduced'>) {
  const blades = useRef<THREE.InstancedMesh>(null);
  const assembly = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Group>(null);
  const tunnel = useRef<THREE.InstancedMesh>(null);
  const tunnelMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const clock = useRef(0);
  const intro = useRef(0);
  const smoothed = useRef({
    story: 0,
    instrument: 0,
    scroll: 0,
    energy: 0.55,
    aperture: 0.28,
  });
  const { size } = useThree();
  const small = size.width < 760;
  const bladeGeometry = useMemo(() => makeBlade(), []);
  const transform = useRef(new THREE.Object3D());
  const coreMaterial = useRef<THREE.ShaderMaterial>(null);
  const dustMaterial = useRef<THREE.ShaderMaterial>(null);
  const particles = useMemo(() => makeDust(small ? 1800 : 4000), [small]);
  const coreUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uEnergy: { value: 0.55 } }),
    [],
  );
  const dustUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTravel: { value: 0 },
      uEnergy: { value: 0.55 },
      uBurst: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
    }),
    [],
  );
  const color = { platinum: '#aab3b5', copper: '#c28860', obsidian: '#45494d' }[
    settings.finish
  ];

  useEffect(() => () => bladeGeometry.dispose(), [bladeGeometry]);

  useFrame((state, delta) => {
    const dummy = transform.current;
    const d = Math.min(delta, 0.04);
    const s = signal.current;
    const m = smoothed.current;
    const blend = reduced ? 1 : 1 - Math.exp(-4.2 * d);
    m.story += (s.story - m.story) * blend;
    m.instrument += (s.instrument - m.instrument) * blend;
    m.scroll += (s.scroll - m.scroll) * blend;
    m.energy += (settings.energy - m.energy) * blend;
    m.aperture += (settings.aperture - m.aperture) * blend;
    intro.current = reduced ? 1 : Math.min(1, intro.current + d * 0.44);
    if (!reduced && !settings.paused)
      clock.current += d * (0.35 + m.energy * 0.8);
    const t = clock.current;
    const enter = 1 - Math.pow(1 - intro.current, 4);
    const unfold = smooth(0.03, 0.34, m.story);
    const orbit = smooth(0.32, 0.65, m.story);
    const travel = smooth(0.65, 0.98, m.story) * (1 - m.instrument);
    const manual = m.instrument;
    const open = unfold * (1 - manual) + m.aperture * manual;
    const burst = reduced
      ? 0
      : Math.max(0, 1 - (performance.now() - s.burst) / 1600);

    if (tunnel.current) {
      tunnel.current.visible = travel > 0.015;
      for (let i = 0; i < 24; i++) {
        const depth = ((i * 1.5 + t * 0.7 + travel * 28) % 36) - 29;
        dummy.position.set(
          Math.sin(i * 0.3) * 0.25,
          Math.cos(i * 0.3) * 0.25,
          depth,
        );
        dummy.rotation.set(
          Math.sin(i * 0.4) * 0.18,
          Math.cos(i * 0.4) * 0.18,
          i * 0.18 + t * 0.05,
        );
        dummy.scale.set(
          1 + Math.sin(i * 0.3) * 0.1,
          1 + Math.cos(i * 0.3) * 0.1,
          1,
        );
        dummy.updateMatrix();
        tunnel.current.setMatrixAt(i, dummy.matrix);
      }
      tunnel.current.instanceMatrix.needsUpdate = true;
      if (tunnelMaterial.current)
        tunnelMaterial.current.opacity = travel * 0.48;
    }

    if (blades.current) {
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        const stagger = Math.sin(i * 0.9 + t * 0.3);
        const expansion =
          open * 0.6 + orbit * (1 - manual) * 0.9 + burst * 0.38;
        dummy.position.set(
          Math.cos(a) * expansion,
          Math.sin(a) * expansion,
          Math.sin(a * 3 + t * 0.23) * orbit * (1 - manual) * 1.3 +
            Math.sin(a * 2) * open * 0.16,
        );
        dummy.rotation.set(
          open * 0.55 + orbit * (1 - manual) * stagger * 0.8,
          open * Math.sin(a) * 0.3,
          a + t * 0.07,
        );
        dummy.scale.setScalar(1 - travel * 0.65);
        dummy.position.z -= travel * (i * 0.22 + 1);
        dummy.updateMatrix();
        blades.current.setMatrixAt(i, dummy.matrix);
      }
      blades.current.instanceMatrix.needsUpdate = true;
    }
    if (assembly.current) {
      const x = small
        ? 0
        : (m.scroll * 1.65 * (1 - manual) - manual * 1.7) * (1 - travel);
      assembly.current.position.set(
        x,
        small
          ? -0.15 - m.scroll * 0.75 * (1 - manual) + manual * 1.15
          : -0.12 + m.scroll * 0.05,
        0,
      );
      assembly.current.rotation.set(
        0.18 + Math.sin(t * 0.22) * 0.08 + s.pointerY * (reduced ? 0 : 0.06),
        -0.38 + orbit * 0.8 * (1 - manual) + s.pointerX * (reduced ? 0 : 0.12),
        -0.18 + t * 0.035,
      );
      assembly.current.scale.setScalar(
        (small ? 0.78 - m.scroll * 0.1 * (1 - manual) : 1) *
          (0.9 + enter * 0.1),
      );
    }
    if (rings.current) {
      rings.current.rotation.y = t * 0.13 + open * 1.2;
      rings.current.rotation.x = t * 0.09 + orbit * 0.7;
      rings.current.scale.setScalar(1 + open * 0.18 + burst * 0.12);
      rings.current.visible = travel < 0.9;
    }
    if (core.current)
      core.current.scale.setScalar(
        (1 + Math.sin(t * 1.5) * 0.035 + burst * 0.35) * (1 - travel * 0.95),
      );
    if (halo.current) {
      halo.current.rotation.z = -t * 0.055;
      halo.current.scale.setScalar(1 + orbit * 0.28 + travel * 4);
      halo.current.position.z = -travel * 6;
    }
    if (coreMaterial.current) {
      coreMaterial.current.uniforms.uTime.value = t;
      coreMaterial.current.uniforms.uEnergy.value = m.energy + burst;
    }
    if (dustMaterial.current) {
      dustMaterial.current.uniforms.uTime.value = t;
      dustMaterial.current.uniforms.uTravel.value = travel;
      dustMaterial.current.uniforms.uEnergy.value = m.energy;
      dustMaterial.current.uniforms.uBurst.value = burst;
      dustMaterial.current.uniforms.uPointer.value.set(s.pointerX, s.pointerY);
    }
    const cameraZ =
      (small ? 8.5 : 6.8) + m.scroll * 0.8 - travel * 2.1 + (1 - enter) * -2.3;
    state.camera.position.z +=
      (cameraZ - state.camera.position.z) *
      (reduced ? 1 : 1 - Math.exp(-3 * d));
  });

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 5, 4]} intensity={1.6} color="#fff2d9" />
      <directionalLight position={[-4, 1, -2]} intensity={2} color="#bbcbdc" />
      <pointLight
        position={[0, 0, 1]}
        intensity={9}
        color="#ff6b20"
        distance={7}
        decay={2}
      />
      <group ref={assembly}>
        <instancedMesh
          ref={blades}
          args={[bladeGeometry, undefined, 72]}
          frustumCulled={false}
        >
          <meshStandardMaterial
            color={color}
            metalness={1}
            roughness={0.25}
            envMapIntensity={0.9}
          />
        </instancedMesh>
        <group ref={rings}>
          {[0, 1, 2].map((i) => (
            <group key={i} rotation={[i * 0.95, i * 0.75, 0]}>
              <mesh>
                <torusGeometry args={[0.67 + i * 0.08, 0.025, 8, 128]} />
                <meshStandardMaterial
                  color="#c5b9a1"
                  metalness={0.95}
                  roughness={0.22}
                />
              </mesh>
              <mesh rotation={[0, 0, i * 2]}>
                <torusGeometry args={[0.67 + i * 0.08, 0.009, 6, 64, 1.5]} />
                <meshBasicMaterial
                  color={[3.5, 0.8, 0.12]}
                  toneMapped={false}
                />
              </mesh>
            </group>
          ))}
        </group>
        <mesh ref={core}>
          <sphereGeometry args={[0.43, 48, 48]} />
          <shaderMaterial
            ref={coreMaterial}
            vertexShader={coreVertex}
            fragmentShader={coreFragment}
            uniforms={coreUniforms}
          />
        </mesh>
        <group ref={halo}>
          <mesh rotation={[0.08, 0.12, 0]}>
            <torusGeometry args={[2.35, 0.005, 4, 180]} />
            <meshBasicMaterial color="#777369" transparent opacity={0.35} />
          </mesh>
          <mesh rotation={[-0.2, 0.2, 0.7]}>
            <torusGeometry args={[2.5, 0.007, 4, 180, 4.5]} />
            <meshBasicMaterial color="#be6e39" transparent opacity={0.55} />
          </mesh>
          {Array.from({ length: 60 }, (_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 60) * Math.PI * 2) * 2.34,
                Math.sin((i / 60) * Math.PI * 2) * 2.34,
                0,
              ]}
              rotation={[0, 0, (i / 60) * Math.PI * 2]}
            >
              <boxGeometry args={[i % 5 === 0 ? 0.065 : 0.022, 0.005, 0.006]} />
              <meshBasicMaterial color="#8c8372" transparent opacity={0.5} />
            </mesh>
          ))}
        </group>
      </group>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={dustMaterial}
          uniforms={dustUniforms}
          vertexShader={dustVertex}
          fragmentShader={dustFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <instancedMesh
        ref={tunnel}
        args={[undefined, undefined, 24]}
        frustumCulled={false}
      >
        <torusGeometry args={[2.8, 0.012, 5, 128, Math.PI * 1.85]} />
        <meshBasicMaterial
          ref={tunnelMaterial}
          color={[1.6, 0.48, 0.12]}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </instancedMesh>
    </>
  );
}

export default function Sculpture(props: Props) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return (
    <SceneBoundary onUnavailable={props.onUnavailable}>
      <Canvas
        camera={{ position: [0, 0, 6.8], fov: 45 }}
        dpr={[1, 1.5]}
        frameloop={!visible ? 'never' : props.reduced ? 'demand' : 'always'}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: 'high-performance',
        }}
        fallback={<div className="hel-fallback-orbit" />}
        onCreated={({ gl }) => {
          gl.setClearColor(0x080a0b, 0);
        }}
      >
        <Artifact
          signal={props.signal}
          settings={props.settings}
          reduced={props.reduced}
        />
        <Pipeline onProgress={props.onProgress} />
        <ReducedMotionUpdates reduced={props.reduced} />
      </Canvas>
    </SceneBoundary>
  );
}
