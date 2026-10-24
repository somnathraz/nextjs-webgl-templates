'use client';
import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
const SERIES = {
  Sequential: [190, 185, 175, 178, 148, 152, 125, 114, 120, 85, 90, 52, 60, 33],
  Parallel: [190, 160, 168, 123, 142, 95, 105, 73, 89, 49, 60, 30, 42, 18],
};
export function Telemetry() {
  const [mode, setMode] = useState<keyof typeof SERIES>('Parallel');
  const reduced = useReducedMotion();
  const path = SERIES[mode]
    .map((v, i) => `${i ? 'L' : 'M'} ${30 + i * 39} ${v}`)
    .join(' ');
  return (
    <div className="relay-telemetry">
      <div className="relay-telemetry-top">
        <span className="relay-eyebrow">SIGNAL, NOT NOISE.</span>
        <div>
          {(['Sequential', 'Parallel'] as const).map((m) => (
            <button
              key={m}
              aria-pressed={m === mode}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <svg
        viewBox="0 0 580 245"
        role="img"
        aria-label={`${mode} illustrative work-completion curve`}
      >
        {[40, 90, 140, 190].map((y) => (
          <line
            key={y}
            x1="30"
            x2="550"
            y1={y}
            y2={y}
            stroke="#303635"
            strokeDasharray="3 5"
          />
        ))}
        <motion.path
          animate={{ d: path }}
          transition={{ duration: reduced ? 0 : 0.8 }}
          fill="none"
          stroke="#e99b6c"
          strokeWidth="2"
        />
        <motion.path
          animate={{ d: `${path} L 537 210 L 30 210 Z` }}
          fill="#e99b6c"
          fillOpacity=".06"
          transition={{ duration: reduced ? 0 : 0.8 }}
        />
        <text x="30" y="235" fill="#78827e" fontFamily="monospace" fontSize="8">
          INTENT
        </text>
        <text
          x="490"
          y="235"
          fill="#78827e"
          fontFamily="monospace"
          fontSize="8"
        >
          OUTCOME
        </text>
      </svg>
      <div className="relay-telemetry-bottom">
        <span>
          Work moves forward.
          <br />
          You keep the full picture.
        </span>
        <small>
          ILLUSTRATIVE DATA
          <br />
          NOT A PERFORMANCE BENCHMARK
        </small>
      </div>
    </div>
  );
}
