'use client';

import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import {
  antialiasShader,
  fragmentShader,
  vertexShader,
} from '../lib/terrain-shader';

export type FlightSignal = {
  progress: number;
  cruise: boolean;
  paused: boolean;
  reduced: boolean;
  light: number;
  distance: number;
};

export default function TerrainScene({
  signal,
  onStatus,
}: {
  signal: RefObject<FlightSignal>;
  onStatus: (status: 'ready' | 'unavailable') => void;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      onStatus('unavailable');
      return;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const uniforms = {
      uResolution: { value: new THREE.Vector2() },
      uPointer: { value: new THREE.Vector2() },
      uTravel: { value: 0 },
      uTime: { value: 0 },
      uLight: { value: 0 },
      uSeed: { value: 8.4 },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));
    const target = new THREE.WebGLRenderTarget(1, 1, {
      depthBuffer: false,
      stencilBuffer: false,
    });
    const output = new THREE.Scene();
    const antialias = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: antialiasShader,
      uniforms: {
        uScene: { value: target.texture },
        uResolution: uniforms.uResolution,
      },
      depthTest: false,
      depthWrite: false,
    });
    output.add(new THREE.Mesh(geometry, antialias));
    container.appendChild(renderer.domElement);
    let failed = false;
    renderer.debug.onShaderError = () => {
      failed = true;
      onStatus('unavailable');
    };
    const maximumScale = Math.min(window.devicePixelRatio, 1.5);
    let scale = maximumScale;
    const resize = () => {
      renderer.setPixelRatio(scale);
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.getDrawingBufferSize(uniforms.uResolution.value);
      target.setSize(
        uniforms.uResolution.value.x,
        uniforms.uResolution.value.y,
      );
    };
    resize();
    const pointer = new THREE.Vector2();
    const stillPointer = new THREE.Vector2();
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointer.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        1 - (event.clientY / window.innerHeight) * 2,
      );
    };
    let frame = 0;
    let previous = performance.now();
    let elapsed = 0;
    let drift = 0;
    let frames = 0;
    let sample = previous;
    let announced = false;
    const render = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      const state = signal.current;
      if (!state.paused && !state.reduced) {
        elapsed += delta;
        drift += delta * (state.cruise ? 2.2 : 0.1);
      }
      const destination = state.progress * 105 + drift;
      if (!state.paused) {
        uniforms.uTravel.value = state.reduced
          ? destination
          : THREE.MathUtils.damp(
              uniforms.uTravel.value,
              destination,
              2.2,
              delta,
            );
        uniforms.uPointer.value.lerp(
          state.reduced ? stillPointer : pointer,
          1 - Math.exp(-delta * 2),
        );
      }
      uniforms.uTime.value = elapsed;
      uniforms.uLight.value = THREE.MathUtils.damp(
        uniforms.uLight.value,
        state.light,
        1.5,
        delta,
      );
      state.distance = uniforms.uTravel.value;
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(output, camera);
      if (!announced && !failed) {
        announced = true;
        onStatus('ready');
      }
      // Preserve at least one render pixel per CSS pixel; never upscale a half-resolution landscape.
      frames++;
      if (frames >= 90) {
        const fps = (frames * 1000) / (now - sample);
        if (fps < 27 && scale > 1) {
          scale = Math.max(1, scale - 0.25);
          resize();
        }
        frames = 0;
        sample = now;
      }
      if (!failed) frame = requestAnimationFrame(render);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden && !failed) {
        previous = performance.now();
        sample = previous;
        frames = 0;
        frame = requestAnimationFrame(render);
      }
    };
    const lost = (event: Event) => {
      event.preventDefault();
      failed = true;
      cancelAnimationFrame(frame);
      onStatus('unavailable');
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    renderer.domElement.addEventListener('webglcontextlost', lost);
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', move);
      document.removeEventListener('visibilitychange', visibility);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      geometry.dispose();
      material.dispose();
      antialias.dispose();
      target.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [signal, onStatus]);

  return <div className="od-terrain" ref={host} />;
}
