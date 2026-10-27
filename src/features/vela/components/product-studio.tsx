'use client';

import { useState } from 'react';
import { Check, Copy, RotateCcw } from 'lucide-react';
import {
  FINISHES,
  type VelaFinish,
  type VelaSettings,
  type VelaView,
} from '../lib/experience';

export function ProductStudio({
  settings,
  onChange,
}: {
  settings: VelaSettings;
  onChange: (settings: VelaSettings) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  function change(next: VelaSettings) {
    setCopied(false);
    setError(false);
    onChange(next);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `Vela Spatial — ${FINISHES[settings.finish].name} finish. View: ${settings.view}. Original interactive product concept.`,
      );
      setCopied(true);
      setError(false);
    } catch {
      setError(true);
    }
  }
  return (
    <section
      className="vela-studio"
      id="vela-studio"
      aria-labelledby="vela-studio-title"
    >
      <div className="vela-studio-caption">
        <span className="vela-small-plus">+</span> DESIGNED AROUND YOU.
      </div>
      <div className="vela-studio-panel">
        <p className="vela-eyebrow">A PERSONAL PERSPECTIVE</p>
        <h2 id="vela-studio-title">
          Distinctly Vela.
          <br />
          <span>Entirely yours.</span>
        </h2>
        <p className="vela-studio-lead">
          Find the finish that feels like you.
          <br />
          Explore every angle.
        </p>
        <div className="vela-finish-label">
          Finish <span>{FINISHES[settings.finish].name}</span>
        </div>
        <div
          className="vela-finishes"
          role="group"
          aria-label="Choose a finish"
        >
          {(Object.keys(FINISHES) as VelaFinish[]).map((finish) => (
            <button
              key={finish}
              type="button"
              aria-label={`${FINISHES[finish].name} finish`}
              aria-pressed={settings.finish === finish}
              onClick={() => change({ ...settings, finish })}
            >
              <span style={{ background: FINISHES[finish].tone }}>
                {settings.finish === finish ? <Check size={16} /> : null}
              </span>
            </button>
          ))}
        </div>
        <div className="vela-views" role="group" aria-label="Headset viewpoint">
          {(['front', 'profile', 'optics'] as VelaView[]).map((view) => (
            <button
              key={view}
              type="button"
              aria-pressed={settings.view === view}
              onClick={() => change({ ...settings, view })}
            >
              {view === 'optics' ? 'Inside' : view}
            </button>
          ))}
        </div>
        <div className="vela-studio-actions">
          <button
            type="button"
            onClick={copy}
            className="vela-button vela-button-dark"
          >
            {copied ? 'Configuration copied' : 'Copy your configuration'}
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
          <button
            type="button"
            className="vela-reset"
            aria-label="Reset configuration"
            onClick={() => change({ finish: 'cloud', view: 'front' })}
          >
            <RotateCcw size={16} />
          </button>
        </div>
        <p className="vela-concept-note" role="status">
          {error
            ? 'Clipboard unavailable. Your selection is shown above.'
            : 'An original product concept. Made to be explored.'}
        </p>
      </div>
    </section>
  );
}
