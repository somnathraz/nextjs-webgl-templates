'use client';

import { ArrowUpRight, Pause, Play, RotateCcw, Zap } from 'lucide-react';
import { DEFAULT_SETTINGS, type InstrumentSettings } from '../lib/choreography';

type Props = {
  settings: InstrumentSettings;
  onChange: (settings: InstrumentSettings) => void;
  onPulse: () => void;
  unavailable: boolean;
};

export function Instrument({
  settings,
  onChange,
  onPulse,
  unavailable,
}: Props) {
  return (
    <section
      className="hel-instrument"
      id="helios-instrument"
      aria-labelledby="hel-instrument-title"
    >
      <div className="hel-instrument-caption">
        <span className="hel-cross">+</span> YOUR TOUCH. YOUR ORBIT.
      </div>
      <div className="hel-console">
        <p className="hel-kicker">
          <span /> 04 / THE INSTRUMENT
        </p>
        <h2 id="hel-instrument-title">
          Light, in
          <br />
          <em>your hands.</em>
        </h2>
        <p className="hel-console-intro">A small universe. Make it your own.</p>
        {unavailable ? (
          <p className="hel-unavailable" role="status">
            The 3D instrument needs WebGL. You can still explore the story and
            field notes.
          </p>
        ) : null}
        <fieldset disabled={unavailable}>
          <legend className="hel-sr-only">Sculpture controls</legend>
          <div className="hel-range">
            <label htmlFor="hel-aperture">
              Aperture{' '}
              <output>
                {Math.round(settings.aperture * 100)}
                <span>%</span>
              </output>
            </label>
            <input
              id="hel-aperture"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.aperture}
              onChange={(e) =>
                onChange({ ...settings, aperture: Number(e.target.value) })
              }
            />
            <div>
              <span>CLOSED</span>
              <span>EXPANDED</span>
            </div>
          </div>
          <div className="hel-range">
            <label htmlFor="hel-energy">
              Energy{' '}
              <output>
                {Math.round(settings.energy * 100)}
                <span>%</span>
              </output>
            </label>
            <input
              id="hel-energy"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.energy}
              onChange={(e) =>
                onChange({ ...settings, energy: Number(e.target.value) })
              }
            />
            <div>
              <span>STILLNESS</span>
              <span>INTENSITY</span>
            </div>
          </div>
          <div
            className="hel-finishes"
            role="group"
            aria-label="Material finish"
          >
            {(['platinum', 'copper', 'obsidian'] as const).map((finish) => (
              <button
                key={finish}
                type="button"
                aria-pressed={settings.finish === finish}
                onClick={() => onChange({ ...settings, finish })}
              >
                <span className={`hel-swatch hel-swatch--${finish}`} />
                {finish}
              </button>
            ))}
          </div>
          <div className="hel-console-actions">
            <button className="hel-pulse" type="button" onClick={onPulse}>
              <Zap size={15} /> Release a pulse <ArrowUpRight size={16} />
            </button>
            <button
              className="hel-icon-button"
              type="button"
              aria-label={
                settings.paused ? 'Resume sculpture' : 'Pause sculpture'
              }
              aria-pressed={settings.paused}
              onClick={() =>
                onChange({ ...settings, paused: !settings.paused })
              }
            >
              {settings.paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button
              className="hel-icon-button"
              type="button"
              aria-label="Reset sculpture"
              onClick={() => onChange({ ...DEFAULT_SETTINGS })}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </fieldset>
        <p className="hel-console-note">
          {settings.paused
            ? 'MOTION PAUSED — CONTROLS REMAIN LIVE'
            : 'LIVE RENDER / EVERY MOVEMENT IS YOURS'}
        </p>
      </div>
    </section>
  );
}
