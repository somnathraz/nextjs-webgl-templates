'use client';
import { useEffect, useRef, useState } from 'react';
import { Network } from './network';
import { NODES } from '../lib/workflows';
const CHAPTERS = [
  [
    'One intent.',
    'A world of possibility.',
    'Start with an outcome. Relay maps the work into clear responsibilities, with context shared from the first step.',
  ],
  [
    'Many minds.',
    'One direction.',
    'Specialists work together. Research and reasoning take parallel paths, then meet at a shared review.',
  ],
  [
    'Every step.',
    'In the open.',
    'Follow the handoffs, inspect the evidence, and keep a person in control of the final outcome.',
  ],
];
export function ScrollStory() {
  const section = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!section.current) return;
      const r = section.current.getBoundingClientRect();
      setChapter(
        Math.min(
          2,
          Math.max(
            0,
            Math.floor((-r.top / Math.max(1, r.height - innerHeight)) * 3),
          ),
        ),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
  return (
    <section ref={section} className="relay-story" id="relay-system">
      <div className="relay-story-sticky">
        <div className="relay-section-top">
          <span className="relay-eyebrow">01 / THE ORCHESTRATION LAYER</span>
          <span className="relay-eyebrow">A CONNECTED WAY TO WORK</span>
        </div>
        <div className="relay-story-heading">
          <h2>
            {CHAPTERS[chapter][0]}
            <br />
            <span>{CHAPTERS[chapter][1]}</span>
          </h2>
          <p>{CHAPTERS[chapter][2]}</p>
        </div>
        <Network
          chapter={chapter}
          active={chapter === 0 ? 0 : chapter === 1 ? 2 : 4}
          selected={selected}
          onSelect={setSelected}
        />
        <div className="relay-story-bottom">
          <div className="relay-chapter-marks">
            {CHAPTERS.map((_, i) => (
              <span className={chapter === i ? 'active' : ''} key={i}>
                0{i + 1}
              </span>
            ))}
          </div>
          <div className="relay-node-detail" aria-live="polite">
            <strong>{NODES[selected].name}</strong>
            <p>{NODES[selected].detail}</p>
          </div>
          <span className="relay-eyebrow">SELECT A NODE TO EXPLORE ↗</span>
        </div>
      </div>
    </section>
  );
}
