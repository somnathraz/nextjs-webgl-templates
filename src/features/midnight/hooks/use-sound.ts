'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Rig = { context: AudioContext; master: GainNode; noise: AudioBuffer };

/**
 * Everything you hear is synthesised: winter air, firework thumps and
 * crackle, a tick for each of the last ten seconds, and a chime at midnight.
 * Silent until the visitor turns it on.
 */
export function useSound() {
  const rig = useRef<Rig | null>(null);
  const [on, setOn] = useState(false);

  const stop = useCallback(() => {
    const current = rig.current;
    if (!current) return;
    rig.current = null;
    current.master.gain.setTargetAtTime(0, current.context.currentTime, 0.15);
    window.setTimeout(() => void current.context.close(), 700);
  }, []);

  const start = useCallback(() => {
    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = 0;
    master.gain.setTargetAtTime(0.6, context.currentTime, 0.6);
    master.connect(context.destination);
    const noise = context.createBuffer(
      1,
      context.sampleRate * 3,
      context.sampleRate,
    );
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    // Cold air: band-passed noise, barely there.
    const wind = context.createBufferSource();
    wind.buffer = noise;
    wind.loop = true;
    const band = context.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 420;
    band.Q.value = 0.4;
    const windGain = context.createGain();
    windGain.gain.value = 0.035;
    wind.connect(band).connect(windGain).connect(master);
    wind.start();
    rig.current = { context, master, noise };
  }, []);

  const toggle = useCallback(() => {
    if (rig.current) {
      stop();
      setOn(false);
      return;
    }
    try {
      start();
      setOn(true);
    } catch {
      setOn(false);
    }
  }, [start, stop]);

  const burst = useCallback(
    (
      type: BiquadFilterType,
      frequency: number,
      level: number,
      decay: number,
      delay: number,
    ) => {
      const current = rig.current;
      if (!current) return;
      const time = current.context.currentTime + delay;
      const source = current.context.createBufferSource();
      source.buffer = current.noise;
      const filter = current.context.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = frequency;
      const gain = current.context.createGain();
      gain.gain.setValueAtTime(level, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);
      source.connect(filter).connect(gain).connect(current.master);
      source.start(time, Math.random() * 2);
      source.stop(time + decay + 0.05);
    },
    [],
  );

  /** A firework going off `distance` world units away. */
  const boom = useCallback(
    (distance: number) => {
      const near = Math.max(0.15, 1 - distance / 140);
      const delay = distance / 340;
      burst('lowpass', 150, 0.9 * near, 0.9, delay);
      for (let i = 0; i < 5; i++)
        burst(
          'highpass',
          3500,
          0.07 * near,
          0.12,
          delay + 0.25 + Math.random() * 0.9,
        );
    },
    [burst],
  );

  const tone = useCallback(
    (frequency: number, level: number, decay: number, delay = 0) => {
      const current = rig.current;
      if (!current) return;
      const time = current.context.currentTime + delay;
      const oscillator = current.context.createOscillator();
      const gain = current.context.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(level, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);
      oscillator.connect(gain).connect(current.master);
      oscillator.start(time);
      oscillator.stop(time + decay + 0.05);
    },
    [],
  );

  const tick = useCallback(() => tone(1320, 0.12, 0.12), [tone]);
  const chime = useCallback(() => {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, i) =>
      tone(frequency, 0.14, 3.2, i * 0.09),
    );
  }, [tone]);

  useEffect(() => stop, [stop]);

  return { on, toggle, boom, tick, chime };
}
