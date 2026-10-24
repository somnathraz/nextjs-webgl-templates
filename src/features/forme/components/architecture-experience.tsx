'use client';
import dynamic from 'next/dynamic';
import { Component, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { ArrowUpRight, Moon, Sun, RotateCcw } from 'lucide-react';
import { useArchitectureScroll } from '../hooks/use-architecture-scroll';
import { MATERIALS, VIEWS } from '../lib/materials';
const PavilionScene = dynamic(() => import('./pavilion-scene'), {
  ssr: false,
  loading: () => (
    <div className="forme-scene-loading">
      Preparing the architectural study…
    </div>
  ),
});
class SceneBoundary extends Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="forme-scene-fallback">
        <p>The Courtyard House</p>
        <span>
          Interactive 3D is unavailable on this device. Explore the project
          below.
        </span>
        <a href="#forme-project">View the project ↗</a>
      </div>
    ) : (
      this.props.children
    );
  }
}
const COPY = [
  [
    'A different point of view.',
    'Follow the light. Find the threshold. Architecture begins with the way we arrive.',
  ],
  [
    'Outside. Inside. In between.',
    'A generous room, open to the courtyard. The landscape becomes part of everyday life.',
  ],
  [
    'Nothing without purpose.',
    'Lift the roof. Read the structure. A simple rhythm of planes, columns, and open space.',
  ],
];
export function ArchitectureExperience() {
  const { section, progress, chapter } = useArchitectureScroll();
  const [material, setMaterial] = useState(0);
  const [night, setNight] = useState(false);
  const [view, setView] = useState<number | null>(null);
  const [orbit, setOrbit] = useState(0);
  const reduced = useReducedMotion();
  const current = view ?? chapter;
  return (
    <section ref={section} className="forme-experience" id="forme-explore">
      <div className={`forme-experience-sticky ${night ? 'is-night' : ''}`}>
        <div className="forme-experience-heading">
          <span className="forme-eyebrow">02 / A STUDY IN SPACE</span>
          <h2>{COPY[current][0]}</h2>
          <p>{COPY[current][1]}</p>
        </div>
        <div
          className="forme-scene"
          role="group"
          aria-label="Interactive architectural model"
        >
          <SceneBoundary>
            <PavilionScene
              material={material}
              night={night}
              progress={progress}
              view={view}
              reduced={!!reduced}
              orbit={orbit}
            />
          </SceneBoundary>
        </div>
        <div className="forme-view-picker" aria-label="Camera view">
          {VIEWS.map((name, i) => (
            <button
              key={name}
              aria-pressed={current === i}
              onClick={() => setView(i)}
            >
              <span>0{i + 1}</span>
              {name}
              <ArrowUpRight size={14} />
            </button>
          ))}
          <button
            className="forme-follow"
            aria-pressed={view === null}
            onClick={() => setView(null)}
          >
            <RotateCcw size={12} /> Follow scroll
          </button>
        </div>
        <div className="forme-materials">
          <span className="forme-eyebrow">MAKE IT YOURS</span>
          <div className="forme-material-buttons">
            {MATERIALS.map((m, i) => (
              <button
                key={m.name}
                aria-label={`Use ${m.name}`}
                aria-pressed={material === i}
                onClick={() => setMaterial(i)}
              >
                <i style={{ background: m.color }} />
                {m.name}
              </button>
            ))}
          </div>
          <span className="forme-material-note">
            {MATERIALS[material].detail}
          </span>
        </div>
        <div className="forme-scene-actions">
          <button onClick={() => setNight(!night)} aria-pressed={night}>
            {night ? <Sun size={15} /> : <Moon size={15} />}{' '}
            {night ? 'Daylight' : 'Blue hour'}
          </button>
          <button
            onClick={() => setOrbit(orbit + Math.PI / 4)}
            aria-label="Rotate architectural model 45 degrees"
          >
            <RotateCcw size={15} /> Rotate
          </button>
        </div>
        <div className="forme-scene-caption">
          <span>COURTYARD HOUSE — SPATIAL STUDY</span>
          <span>SCROLL TO EXPLORE ↓</span>
        </div>
      </div>
    </section>
  );
}
