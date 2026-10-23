'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/** User-triggered, quiet stereo demo. No audio files, autoplay, or external services. */
export function useSoundDemo() {
  const context = useRef<AudioContext | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    const current = context.current;
    context.current = null;
    if (current && current.state !== 'closed') void current.close();
    setPlaying(false);
  }, []);
  const play = useCallback(async () => {
    if (pending.current || context.current) return;
    pending.current = true;
    setError('');
    try {
      const audio = new AudioContext();
      context.current = audio;
      await audio.resume();
      if (context.current !== audio) return;
      const volume = audio.createGain();
      volume.gain.setValueAtTime(0, audio.currentTime);
      volume.gain.linearRampToValueAtTime(0.035, audio.currentTime + 1);
      volume.gain.setValueAtTime(0.035, audio.currentTime + 18);
      volume.gain.linearRampToValueAtTime(0, audio.currentTime + 20);
      const pan = audio.createStereoPanner();
      volume.connect(pan).connect(audio.destination);
      [174.61, 220, 261.63].forEach((frequency) => {
        const tone = audio.createOscillator();
        tone.type = 'sine';
        tone.frequency.value = frequency;
        tone.connect(volume);
        tone.start();
        tone.stop(audio.currentTime + 20);
      });
      const orbit = audio.createOscillator();
      orbit.frequency.value = 0.16;
      const width = audio.createGain();
      width.gain.value = 0.9;
      orbit.connect(width).connect(pan.pan);
      orbit.start();
      orbit.stop(audio.currentTime + 20);
      setPlaying(true);
      timer.current = setTimeout(stop, 20500);
    } catch {
      stop();
      setError(
        'Audio is unavailable in this browser. You can still explore the visualization.',
      );
    } finally {
      pending.current = false;
    }
  }, [stop]);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) stop();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      if (timer.current) clearTimeout(timer.current);
      if (context.current && context.current.state !== 'closed')
        void context.current.close();
      context.current = null;
    };
  }, [stop]);
  return { playing, error, play, stop };
}
