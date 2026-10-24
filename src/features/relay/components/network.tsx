'use client';
import { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';
const LAYOUTS = [
  [
    [90, 220],
    [290, 110],
    [290, 330],
    [510, 220],
    [720, 220],
  ],
  [
    [85, 220],
    [300, 90],
    [300, 350],
    [510, 220],
    [720, 220],
  ],
  [
    [85, 220],
    [265, 220],
    [445, 220],
    [625, 220],
    [790, 220],
  ],
];
const EDGES = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [3, 4],
];
export function Network({
  chapter = 0,
  active = -1,
  selected,
  onSelect,
  labels = ['INTENT', 'RESEARCH', 'REASON', 'REVIEW', 'DELIVER'],
}: {
  chapter?: number;
  active?: number;
  selected: number;
  onSelect: (i: number) => void;
  labels?: string[];
}) {
  const reduced = useReducedMotion();
  const patternId = useId();
  const points = LAYOUTS[chapter];
  return (
    <div className="relay-network">
      <svg
        viewBox="0 0 880 440"
        role="img"
        aria-label="Agent workflow connections"
      >
        <defs>
          <pattern
            id={patternId}
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r=".8" fill="#ffffff13" />
          </pattern>
          <filter id="relay-glow">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <rect width="880" height="440" fill={`url(#${patternId})`} />
        {EDGES.map(([a, b], i) => {
          const start = points[a],
            end = points[b];
          const d = `M ${start[0]} ${start[1]} C ${(start[0] + end[0]) / 2} ${start[1]}, ${(start[0] + end[0]) / 2} ${end[1]}, ${end[0]} ${end[1]}`;
          return (
            <g key={i}>
              <motion.path
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                animate={{ d }}
                transition={{ duration: reduced ? 0 : 1 }}
                fill="none"
                stroke="#3f4444"
                strokeWidth="1"
              />
              <motion.path
                animate={{ d, opacity: active >= a ? 0.95 : 0.35 }}
                transition={{ duration: reduced ? 0 : 1 }}
                fill="none"
                stroke="#ef8b57"
                strokeWidth="1.5"
                strokeDasharray="9 180"
                className={reduced ? '' : 'relay-flow-line'}
                style={{ animationDelay: `${i * -0.6}s` }}
              />
            </g>
          );
        })}
        {points.map(([x, y], i) => (
          <motion.g
            key={i}
            animate={{ x, y }}
            transition={{ duration: reduced ? 0 : 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <circle
              r={selected === i ? 33 : 27}
              fill={active === i ? '#df7b42' : '#161b1c'}
              stroke={selected === i || active === i ? '#f3a875' : '#49504e'}
              strokeWidth="1"
            />
            {active === i && !reduced && (
              <circle
                r="35"
                fill="none"
                stroke="#ed9054"
                opacity=".5"
                className="relay-node-pulse"
              />
            )}
            <path
              d={
                i === 0
                  ? 'M -8 0 H 8 M 0 -8 V 8'
                  : i === 4
                    ? 'M -8 0 L -2 6 L 9 -7'
                    : 'M -8 -5 L 0 -10 L 8 -5 V 5 L 0 10 L -8 5 Z'
              }
              fill="none"
              stroke={active === i ? '#141819' : '#ebd6bc'}
              strokeWidth="1.5"
            />
            <text
              y="52"
              textAnchor="middle"
              fill="#a3aaa6"
              fontSize="9"
              letterSpacing="1.4"
              fontFamily="monospace"
            >
              {labels[i]}
            </text>
            <text
              y="-45"
              textAnchor="middle"
              fill="#676f6c"
              fontSize="8"
              fontFamily="monospace"
            >
              0{i + 1}
            </text>
          </motion.g>
        ))}
      </svg>
      {points.map(([x, y], i) => (
        <button
          key={i}
          className="relay-node-target"
          aria-label={`Inspect ${labels[i].toLowerCase()} agent`}
          aria-pressed={selected === i}
          style={{ left: `${(x / 880) * 100}%`, top: `${(y / 440) * 100}%` }}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
}
