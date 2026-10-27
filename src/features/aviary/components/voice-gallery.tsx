'use client';

import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Visualizer } from './visualizer';
import { VOICES } from '../lib/voices';

export function VoiceGallery() {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <div className="av-voice-grid">
      {VOICES.map((v) => {
        const isPlaying = playing === v.id;
        return (
          <article key={v.id} className="av-voice-card">
            <div className="av-voice-card-top">
              <div>
                <div className="av-voice-name">{v.name}</div>
                <div className="av-voice-tag">{v.tag}</div>
              </div>
              <button
                className="av-voice-play"
                data-active={isPlaying}
                aria-label={`${isPlaying ? 'Pause' : 'Preview'} ${v.name}`}
                onClick={() => setPlaying(isPlaying ? null : v.id)}
              >
                {isPlaying ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
              </button>
            </div>
            <div className="av-voice-wave">
              <Visualizer
                variant="wave"
                active={isPlaying}
                colors={[v.color, '#818cf8', '#f0abfc']}
                seed={v.seed}
              />
            </div>
            <div className="av-voice-chips">
              {v.traits.map((trait) => (
                <span key={trait}>{trait}</span>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
