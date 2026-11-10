'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, type RefObject } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import type { NightSignal } from '../hooks/use-night';
import { createWorld } from '../lib/world';

/** Bloom: windows, lanterns and fireworks should bleed light. */
function createPost(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
) {
  const composer = new EffectComposer(gl);
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.55, 0.55);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  return {
    resize(width: number, height: number, pixelRatio: number) {
      composer.setPixelRatio(pixelRatio);
      composer.setSize(width, height);
    },
    render(strength: number) {
      bloom.strength = strength;
      composer.render();
    },
    dispose() {
      composer.dispose();
    },
  };
}

type Props = {
  signal: RefObject<NightSignal>;
  onReady: () => void;
  onBurst: (distance: number) => void;
};

function Night({ signal, onReady, onBurst }: Props) {
  const { gl, scene, camera, size } = useThree();
  const world = useMemo(() => createWorld(onBurst), [onBurst]);
  const post = useMemo(
    () => createPost(gl, scene, camera),
    [gl, scene, camera],
  );

  useEffect(() => {
    post.resize(size.width, size.height, gl.getPixelRatio());
  }, [post, gl, size]);

  useEffect(() => {
    onReady();
    return () => {
      world.dispose();
      post.dispose();
    };
  }, [world, post, onReady]);

  useFrame((_, rawDelta) => {
    world.update(
      rawDelta,
      signal.current,
      camera as THREE.PerspectiveCamera,
      size.width,
      size.height,
      gl.getPixelRatio(),
    );
    post.render(world.bloom);
  }, 1);

  return <primitive object={world.group} />;
}

export default function NightScene(props: Props) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ fov: 55, near: 0.1, far: 600, position: [0, 1.7, 10] }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
      }}
    >
      <Night {...props} />
    </Canvas>
  );
}
