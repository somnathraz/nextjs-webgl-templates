'use client';

import { useEffect, useRef, useState } from 'react';

export function useSound(energy: number) {
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState(false);
  const audio = useRef<{
    context: AudioContext;
    gain: GainNode;
    filter: BiquadFilterNode;
    oscillators: OscillatorNode[];
  } | null>(null);

  async function toggle() {
    try {
      if (!audio.current) {
        const context = new AudioContext();
        const gain = context.createGain();
        const filter = context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 180 + energy * 500;
        gain.gain.value = 0;
        filter.connect(gain);
        gain.connect(context.destination);
        const oscillators = [55, 82.41, 110.3].map((frequency) => {
          const oscillator = context.createOscillator();
          oscillator.type = 'sine';
          oscillator.frequency.value = frequency;
          oscillator.connect(filter);
          oscillator.start();
          return oscillator;
        });
        audio.current = { context, gain, filter, oscillators };
      }
      await audio.current.context.resume();
      audio.current.gain.gain.setTargetAtTime(
        enabled ? 0 : 0.035,
        audio.current.context.currentTime,
        0.35,
      );
      setEnabled(!enabled);
      setError(false);
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    const a = audio.current;
    if (a)
      a.filter.frequency.setTargetAtTime(
        180 + energy * 500,
        a.context.currentTime,
        0.3,
      );
  }, [energy]);
  useEffect(() => {
    const update = () => {
      const a = audio.current;
      if (a)
        a.gain.gain.setTargetAtTime(
          enabled && !document.hidden ? 0.035 : 0,
          a.context.currentTime,
          0.2,
        );
    };
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, [enabled]);
  useEffect(
    () => () => {
      const a = audio.current;
      if (a) {
        a.oscillators.forEach((o) => o.stop());
        void a.context.close();
      }
    },
    [],
  );
  return { enabled, toggle, error };
}
