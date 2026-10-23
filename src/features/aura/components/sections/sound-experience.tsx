'use client';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { Headphones, Pause, Play } from 'lucide-react';
import { useSoundDemo } from '@/features/aura/hooks/use-sound-demo';
import type { SoundMode } from '@/features/aura/components/sound/sound-scene';
import { SceneBoundary } from '@/features/aura/components/ui/scene-boundary';
import { Reveal } from '@/features/aura/components/ui/reveal';
const SoundScene = dynamic(() => import('@/features/aura/components/sound/sound-scene'), {
  ssr: false,
});
export function SoundExperience() {
  const [mode, setMode] = useState<SoundMode>('spatial');
  const [paused, setPaused] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const visible = useInView(container, { margin: '100px' });
  const reduced = useReducedMotion();
  const { playing, error, play, stop } = useSoundDemo();
  return (
    <section className="sound-experience" id="sound">
      <div className="sound-top">
        <p className="eyebrow">A NEW DIMENSION OF LISTENING</p>
        <Reveal>
          <h2>
            Not just around you.
            <br />
            <span>All around you.</span>
          </h2>
        </Reveal>
        <p>
          A voice in front. A rhythm behind.
          <br />
          Discover the feeling of sound with room to move.
        </p>
      </div>
      <div
        className="sound-stage"
        ref={container}
        role="img"
        aria-label={`${mode === 'spatial' ? 'Particles orbit above, below, and around' : 'Particles form two channels to the left and right of'} the headphones`}
      >
        <SceneBoundary>
          <SoundScene
            mode={mode}
            reduced={!!reduced || paused}
            visible={visible}
          />
        </SceneBoundary>
        <span className="sound-axis axis-left">LEFT</span>
        <span className="sound-axis axis-right">RIGHT</span>
        <span className="sound-center">YOU, AT THE CENTER.</span>
      </div>
      <div className="sound-controls">
        <div
          className="sound-modes"
          role="group"
          aria-label="Sound field visualization"
        >
          <button
            aria-pressed={mode === 'stereo'}
            onClick={() => setMode('stereo')}
          >
            Stereo field
          </button>
          <button
            aria-pressed={mode === 'spatial'}
            onClick={() => setMode('spatial')}
          >
            Spatial field
          </button>
        </div>
        <button
          className="sound-pause"
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
        >
          {paused ? <Play size={13} /> : <Pause size={13} />}
          {paused ? 'Resume motion' : 'Pause motion'}
        </button>
      </div>
      <div className="sound-listen">
        <div>
          <Headphones size={18} />
          <span>
            Put on headphones.
            <small>Hear a gentle tone travel from ear to ear.</small>
          </span>
        </div>
        <button className="button" onClick={playing ? stop : play}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? 'Stop listening' : 'Listen · 20 seconds'}
        </button>
      </div>
      <p className="sound-disclaimer">
        Concept visualization · Audio demo uses stereo panning, not a spatial
        audio decoder.
      </p>
      {error && (
        <p className="sound-error" role="status">
          {error}
        </p>
      )}
    </section>
  );
}
