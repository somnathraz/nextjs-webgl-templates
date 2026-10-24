'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Component, useMemo, useRef } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import { useMotionSignal } from '../hooks/use-motion-signal';
class Boundary extends Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="relay-core-fallback" />
    ) : (
      this.props.children
    );
  }
}
function Field({
  signal,
  reduced,
}: {
  signal: React.RefObject<{ scroll: number; velocity: number }>;
  reduced: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const speed = useRef(0);
  const previousScroll = useRef(-1);
  const shader = useRef<THREE.ShaderMaterial>(null);
  const positions = useMemo(() => {
    const result = new Float32Array(4400 * 3);
    for (let i = 0; i < 4400; i++) {
      const t = (i / 4400) * Math.PI * 2 * 11;
      const lane = (i % 5) * 0.055;
      const radius = 1.55 + 0.48 * Math.cos(t * 3) + lane;
      result[i * 3] = Math.cos(t) * radius;
      result[i * 3 + 1] = Math.sin(t) * radius;
      result[i * 3 + 2] = 0.52 * Math.sin(t * 3) + Math.sin(i * 12.99) * 0.07;
    }
    return result;
  }, []);
  const filaments = useMemo(
    () =>
      Array.from(
        { length: 7 },
        (_, lane) =>
          new THREE.CatmullRomCurve3(
            Array.from({ length: 321 }, (_, i) => {
              const t = (i / 320) * Math.PI * 2;
              const r = 1.25 + 0.42 * Math.cos(3 * t) + lane * 0.022;
              return new THREE.Vector3(
                Math.cos(2 * t) * r,
                Math.sin(2 * t) * r,
                0.55 * Math.sin(3 * t) + lane * 0.018,
              );
            }),
          ),
      ),
    [],
  );
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uBoost: { value: 0 } }),
    [],
  );
  useFrame((state, delta) => {
    if (!group.current) return;
    const d = Math.min(delta, 0.05);
    speed.current = THREE.MathUtils.damp(
      speed.current,
      reduced || previousScroll.current === signal.current.scroll
        ? 0
        : signal.current.velocity,
      2,
      d,
    );
    previousScroll.current = signal.current.scroll;
    if (!reduced) {
      group.current.rotation.z += d * (0.045 + Math.abs(speed.current) * 0.28);
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        state.pointer.y * 0.25 + 0.25,
        3,
        d,
      );
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        state.pointer.x * 0.35 + signal.current.scroll * 0.3,
        3,
        d,
      );
    }
    if (shader.current) {
      shader.current.uniforms.uTime.value = reduced
        ? 0
        : state.clock.elapsedTime;
      shader.current.uniforms.uBoost.value = Math.abs(speed.current);
    }
  });
  return (
    <group ref={group} rotation={[0.25, 0, -0.3]}>
      {filaments.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 320, 0.006, 4, false]} />
          <meshBasicMaterial color="#f4a170" transparent opacity={0.45} />
        </mesh>
      ))}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={shader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={`uniform float uTime; uniform float uBoost; varying float vAlpha; void main(){vec3 p=position;float wave=sin(p.x*3.+p.y*2.+uTime*.8);p+=normalize(p)*wave*.025;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(3.6+uBoost*.8)*(4.0/-mv.z);vAlpha=.65+.55*(p.z+1.)/2.;}`}
          fragmentShader={`varying float vAlpha; void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(1.,.43,.15,(1.-smoothstep(.1,.5,d))*vAlpha);}`}
        />
      </points>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[(i * Math.PI) / 3, Math.PI / 2, i * 0.7]}>
          <torusGeometry args={[1.6, 0.003, 4, 160]} />
          <meshBasicMaterial color="#b94e23" transparent opacity={0.2} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.065, 24, 24]} />
        <meshBasicMaterial color="#ffe0b0" />
      </mesh>
    </group>
  );
}
export default function SignalCore() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: '100px' });
  const reduced = useReducedMotion();
  const signal = useMotionSignal();
  return (
    <div ref={ref} className="relay-core" aria-hidden="true">
      <Boundary>
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 46 }}
          dpr={[1, 1.5]}
          frameloop={visible ? 'always' : 'never'}
          gl={{ alpha: true, antialias: true }}
        >
          <Field signal={signal} reduced={!!reduced} />
        </Canvas>
      </Boundary>
    </div>
  );
}
