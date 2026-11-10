'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Rig = {
  context: AudioContext;
  master: GainNode;
  filter: BiquadFilterNode;
  drone: OscillatorNode;
  timer: number;
};

/**
 * Procedural underwater ambience: filtered brown noise that closes in as you
 * descend, a sub drone, and a sonar ping. Nothing is downloaded and nothing
 * plays until the visitor turns it on.
 */
export function useAmbience() {
  const rig = useRef<Rig | null>(null);
  const depth = useRef(0);
  const [on, setOn] = useState(false);

  const stop = useCallback(() => {
    const current = rig.current;
    if (!current) return;
    rig.current = null;
    window.clearInterval(current.timer);
    const { context, master } = current;
    master.gain.setTargetAtTime(0, context.currentTime, 0.2);
    window.setTimeout(() => void context.close(), 900);
  }, []);

  const start = useCallback(() => {
    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = 0;
    master.gain.setTargetAtTime(0.5, context.currentTime, 0.8);
    master.connect(context.destination);

    // Brown noise: integrate white noise so the low end dominates.
    const buffer = context.createBuffer(
      1,
      context.sampleRate * 4,
      context.sampleRate,
    );
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last * 3.5;
    }
    const noise = context.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.7;
    noise.connect(filter).connect(master);
    noise.start();

    const drone = context.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 62;
    const droneGain = context.createGain();
    droneGain.gain.value = 0.12;
    drone.connect(droneGain).connect(master);
    drone.start();

    const ping = () => {
      const time = context.currentTime;
      const tone = context.createOscillator();
      const gain = context.createGain();
      const echo = context.createDelay(1);
      const feedback = context.createGain();
      tone.frequency.setValueAtTime(1180 - depth.current * 90, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.09, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.4);
      echo.delayTime.value = 0.42;
      feedback.gain.value = 0.38;
      tone.connect(gain);
      gain.connect(master);
      gain.connect(echo);
      echo.connect(feedback).connect(echo);
      echo.connect(master);
      tone.start(time);
      tone.stop(time + 1.5);
    };
    const timer = window.setInterval(ping, 5200);
    window.setTimeout(ping, 500);
    rig.current = { context, master, filter, drone, timer };
  }, []);

  const toggle = useCallback(() => {
    if (rig.current) {
      stop();
      setOn(false);
    } else {
      try {
        start();
        setOn(true);
      } catch {
        setOn(false);
      }
    }
  }, [start, stop]);

  /** Called from the scroll loop with the zone coordinate (0..5). */
  const setDepth = useCallback((t: number) => {
    depth.current = t;
    const current = rig.current;
    if (!current) return;
    const time = current.context.currentTime;
    current.filter.frequency.setTargetAtTime(900 - t * 150, time, 0.3);
    current.drone.frequency.setTargetAtTime(62 - t * 4, time, 0.3);
  }, []);

  useEffect(() => stop, [stop]);

  return { on, toggle, setDepth };
}
