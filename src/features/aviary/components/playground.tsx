'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Pause, Play, Sparkles } from 'lucide-react';
import { Visualizer } from './visualizer';
import { STYLE_CHIPS, VOICES } from '../lib/voices';

const SAMPLE =
  'The lyrebird can imitate almost any sound it hears — a chainsaw, a camera shutter, another bird. Now, so can you.';

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function Playground() {
  const [text, setText] = useState(SAMPLE);
  const [voice, setVoice] = useState(VOICES[0].id);
  const [style, setStyle] = useState('narration');
  const [stability, setStability] = useState(62);
  const [speed, setSpeed] = useState(100);
  const [phase, setPhase] = useState<'idle' | 'synth' | 'playing'>('idle');
  const [elapsed, setElapsed] = useState(0);

  const activeVoice = VOICES.find((v) => v.id === voice) ?? VOICES[0];
  const duration = Math.max(3, Math.min(30, text.length / 15));

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const clearTimer = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => () => clearTimer(), []);

  const synth = () => {
    if (phase === 'synth') return;
    clearTimer();
    setPhase('synth');
    setElapsed(0);
    // simulated generation, then "playback"
    window.setTimeout(() => {
      setPhase('playing');
      timer.current = setInterval(() => {
        setElapsed((e) => {
          const next = e + 0.1 * (speed / 100);
          if (next >= duration) {
            clearTimer();
            setPhase('idle');
            return 0;
          }
          return next;
        });
      }, 100);
    }, 900);
  };

  const toggle = () => {
    if (phase === 'playing') {
      clearTimer();
      setPhase('idle');
    } else {
      synth();
    }
  };

  const colors =
    activeVoice.id === 'echo'
      ? ['#c4b5fd', '#818cf8', '#f0abfc']
      : [activeVoice.color, '#818cf8', '#f0abfc', '#fbbf72'];

  return (
    <div className="av-play" id="av-playground">
      <div className="av-play-top">
        <span className="av-play-dot">
          <i />
          <i />
          <i />
        </span>
        <span className="av-play-tag">aviary · live synthesis</span>
        <span className="av-play-tag">v3 turbo</span>
      </div>
      <div className="av-play-body">
        <div className="av-play-left">
          <div className="av-play-label">Script</div>
          <textarea
            value={text}
            maxLength={450}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            aria-label="Text to synthesize"
          />

          <div className="av-play-label" style={{ marginTop: 24 }}>
            Voice
          </div>
          <div className="av-chip-row">
            {VOICES.slice(0, 5).map((v) => (
              <button
                key={v.id}
                className="av-chip"
                data-active={voice === v.id}
                onClick={() => setVoice(v.id)}
              >
                <span
                  className="av-swatch"
                  style={{ background: v.color }}
                />
                {v.name}
              </button>
            ))}
          </div>

          <div className="av-play-label" style={{ marginTop: 24 }}>
            Delivery
          </div>
          <div className="av-chip-row">
            {STYLE_CHIPS.map((s) => (
              <button
                key={s.id}
                className="av-chip"
                data-active={style === s.id}
                onClick={() => setStyle(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="av-slider-row">
            <label className="av-slider">
              <span className="av-slider-head">
                Stability <b>{stability}%</b>
              </span>
              <input
                className="av-range"
                type="range"
                min={0}
                max={100}
                value={stability}
                onChange={(e) => setStability(+e.target.value)}
              />
            </label>
            <label className="av-slider">
              <span className="av-slider-head">
                Speed <b>{(speed / 100).toFixed(2)}×</b>
              </span>
              <input
                className="av-range"
                type="range"
                min={50}
                max={150}
                value={speed}
                onChange={(e) => setSpeed(+e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="av-play-right">
          <div className="av-visualizer">
            <Visualizer
              variant="bars"
              active={phase === 'playing'}
              colors={colors}
              seed={activeVoice.seed}
            />
          </div>
          <div className="av-transport">
            <span className="av-transport-time">
              {fmt(elapsed)} / {fmt(duration)}
            </span>
            <button
              className="av-play-btn"
              onClick={toggle}
              disabled={phase === 'synth'}
            >
              {phase === 'synth' ? (
                <>
                  <Sparkles size={17} /> Synthesizing…
                </>
              ) : phase === 'playing' ? (
                <>
                  <Pause size={17} /> Pause
                </>
              ) : (
                <>
                  <Play size={17} /> Generate speech
                </>
              )}
            </button>
            <button
              className="av-icon-btn"
              aria-label="Download audio"
              title="Download .mp3"
            >
              <Download size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
