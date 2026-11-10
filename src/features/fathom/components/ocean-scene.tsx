'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, type RefObject } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import type { DiveSignal } from '../hooks/use-dive';
import { createWorld } from '../lib/world';

/** Bloom so anything that glows down there actually glows. */
function createPost(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
) {
  const composer = new EffectComposer(gl);
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.75, 0.12);
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

function Ocean({
  signal,
  onReady,
}: {
  signal: RefObject<DiveSignal>;
  onReady: () => void;
}) {
  const { gl, scene, camera, size } = useThree();
  const world = useMemo(() => createWorld(), []);
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

export default function OceanScene({
  signal,
  onReady,
}: {
  signal: RefObject<DiveSignal>;
  onReady: () => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ fov: 50, near: 0.1, far: 140, position: [0, 0, 6] }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
      }}
    >
      <Ocean signal={signal} onReady={onReady} />
    </Canvas>
  );
}
