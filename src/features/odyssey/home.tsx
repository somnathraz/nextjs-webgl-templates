'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  AudioLines,
  Maximize,
  Minimize,
  Mountain,
  Pause,
  Play,
  Plus,
  Sun,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { FlightSignal } from './components/terrain-scene';

const TerrainScene = dynamic(() => import('./components/terrain-scene'), {
  ssr: false,
});
const CHAPTERS = [
  {
    name: 'The departure',
    title: 'Beyond the known.',
    description: 'Somewhere, where no one has ever been.',
  },
  {
    name: 'The passage',
    title: 'Let the world unfold.',
    description: 'Through quiet valleys. Into the spaces between.',
  },
  {
    name: 'The ascent',
    title: 'A little closer to infinity.',
    description: 'Another ridge. Another reason to keep going.',
  },
  {
    name: 'The beyond',
    title: 'There is no edge.',
    description: 'The horizon is only the beginning.',
  },
];

export function OdysseyHome() {
  const signal = useRef<FlightSignal>({
    progress: 0,
    cruise: false,
    paused: false,
    reduced: false,
    light: 0,
    distance: 0,
  });
  const root = useRef<HTMLElement>(null);
  const distance = useRef<HTMLOutputElement>(null);
  const guide = useRef<HTMLDialogElement>(null);
  const guideTrigger = useRef<HTMLButtonElement>(null);
  const audio = useRef<{ context: AudioContext; gain: GainNode } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>(
    'loading',
  );
  const [chapter, setChapter] = useState(0);
  const [cruise, setCruise] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(false);
  const [dusk, setDusk] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState('');
  const onStatus = useCallback(
    (next: 'ready' | 'unavailable') => setStatus(next),
    [],
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => {
      signal.current.reduced = media.matches;
    };
    preference();
    media.addEventListener('change', preference);
    let ticking = false;
    let frame = 0;
    const update = () => {
      ticking = false;
      const progress = Math.min(
        1,
        Math.max(
          0,
          window.scrollY /
            (document.documentElement.scrollHeight - window.innerHeight),
        ),
      );
      signal.current.progress = progress;
      root.current?.style.setProperty('--od-progress', String(progress));
      root.current?.style.setProperty(
        '--od-intro',
        String(Math.max(0, 1 - progress * 6)),
      );
      setChapter(Math.min(3, Math.floor(progress * 4)));
    };
    const scroll = () => {
      if (!ticking) {
        ticking = true;
        frame = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', scroll);
    const readout = window.setInterval(() => {
      if (distance.current)
        distance.current.value = `${(signal.current.distance * 0.048).toFixed(2)} KM`;
    }, 250);
    const full = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', full);
    const quiet = () => {
      const active = audio.current;
      if (!active) return;
      if (document.hidden) void active.context.suspend();
      else if (active.gain.gain.value > 0) void active.context.resume();
    };
    document.addEventListener('visibilitychange', quiet);
    return () => {
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', scroll);
      media.removeEventListener('change', preference);
      document.removeEventListener('fullscreenchange', full);
      document.removeEventListener('visibilitychange', quiet);
      cancelAnimationFrame(frame);
      clearInterval(readout);
      void audio.current?.context.close();
      audio.current = null;
    };
  }, []);

  const travelTo = (index: number) => {
    setPaused(false);
    signal.current.paused = false;
    window.scrollTo({
      top:
        ((document.documentElement.scrollHeight - window.innerHeight) * index) /
        3,
      behavior: signal.current.reduced ? 'instant' : 'smooth',
    });
  };
  const toggleCruise = () => {
    signal.current.cruise = !cruise;
    signal.current.paused = false;
    setPaused(false);
    setCruise(!cruise);
  };
  const toggleSound = async () => {
    try {
      if (!audio.current) {
        const context = new AudioContext();
        const gain = context.createGain();
        gain.gain.value = 0;
        gain.connect(context.destination);
        const buffer = context.createBuffer(
          1,
          context.sampleRate * 6,
          context.sampleRate,
        );
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < data.length; i++) {
          last = (last + (Math.random() * 2 - 1) * 0.02) / 1.02;
          data[i] = last * 3.5;
        }
        const wind = context.createBufferSource();
        wind.buffer = buffer;
        wind.loop = true;
        const filter = context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 650;
        wind.connect(filter).connect(gain);
        wind.start();
        [65.41, 98, 130.81].forEach((frequency) => {
          const oscillator = context.createOscillator();
          oscillator.frequency.value = frequency;
          const level = context.createGain();
          level.gain.value = 0.035;
          oscillator.connect(level).connect(gain);
          oscillator.start();
        });
        audio.current = { context, gain };
      }
      const { context, gain } = audio.current;
      await context.resume();
      gain.gain.setTargetAtTime(sound ? 0 : 0.45, context.currentTime, 0.6);
      setSound(!sound);
    } catch {
      setNotice('Ambient sound is unavailable in this browser.');
    }
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen)
        await document.documentElement.requestFullscreen();
      else setNotice('Use your browser’s full-screen mode for a wider view.');
    } catch {
      setNotice('Full screen is unavailable in this browser.');
    }
  };

  return (
    <main className="od-experience" id="odyssey" ref={root}>
      <a className="od-skip" href="#od-controls">
        Skip to flight controls
      </a>
      <div
        className={`od-stage ${status === 'ready' ? 'is-ready' : ''}`}
        aria-hidden="true"
      >
        <div className="od-fallback" />
        <TerrainScene signal={signal} onStatus={onStatus} />
        <div className="od-shade" />
      </div>

      <header className="od-header">
        <Link
          href="/"
          className="od-wordmark"
          aria-label="Odyssey — back to gallery"
        >
          <Mountain size={23} strokeWidth={1.3} />
          <span>
            ODYSSEY<span className="od-wordmark-period">®</span>
          </span>
        </Link>
        <span className="od-header-note">AN EXPLORATION OF THE ENDLESS</span>
        <button
          className="od-guide-link"
          ref={guideTrigger}
          onClick={() => guide.current?.showModal()}
        >
          Field guide <Plus size={15} />
        </button>
      </header>

      <div className="od-fixed-copy">
        <section
          className="od-intro"
          aria-label="Odyssey introduction"
          aria-hidden={chapter > 0}
        >
          <p className="od-eyebrow">
            <span /> A WORLD WITHOUT AN EDGE
          </p>
          <h1>ODYSSEY</h1>
          <div className="od-title-rule">
            <span>EST. NOWHERE</span>
            <i />
            <span>BOUND FOR EVERYWHERE</span>
          </div>
          <p className="od-tagline">Beyond the known.</p>
          <p className="od-intro-description">
            An endless passage through a world
            <br />
            that has never existed.
          </p>
        </section>
        <section
          className={`od-chapter ${chapter > 0 ? 'is-visible' : ''}`}
          aria-live="polite"
          aria-atomic="true"
          aria-hidden={chapter === 0}
        >
          <div key={chapter}>
            <span className="od-eyebrow">
              0{chapter + 1} / {CHAPTERS[chapter].name.toUpperCase()}
            </span>
            <h2>{CHAPTERS[chapter].title}</h2>
            <p>{CHAPTERS[chapter].description}</p>
            {chapter === 3 && (
              <button className="od-beyond" onClick={toggleCruise}>
                {cruise ? 'Leave auto flight' : 'Keep flying'}{' '}
                <ArrowUpRight size={16} />
              </button>
            )}
          </div>
        </section>
      </div>

      <nav className="od-waypoints" aria-label="Journey chapters">
        {CHAPTERS.map((item, index) => (
          <button
            key={item.name}
            onClick={() => travelTo(index)}
            className={chapter === index ? 'is-active' : ''}
            aria-label={`Go to ${item.name}`}
            aria-current={chapter === index ? 'step' : undefined}
          >
            <span>0{index + 1}</span>
            <i />
            <span className="od-waypoint-label">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="od-bottom-story">
        <div className="od-location">
          <span className="od-eyebrow">THE UNCHARTED HIGHLANDS</span>
          <p>
            {CHAPTERS[chapter].name} <span> / 0{chapter + 1}</span>
          </p>
        </div>
        <button
          className="od-scroll-invitation"
          onClick={() => travelTo(chapter === 3 ? 0 : chapter + 1)}
        >
          <span>
            {chapter === 3 ? 'RETURN TO THE BEGINNING' : 'SCROLL TO EXPLORE'}
          </span>
          <ArrowDown size={17} strokeWidth={1.2} />
        </button>
        <div className="od-coordinates">
          <span className="od-eyebrow">DISTANCE TRAVELED</span>
          <output ref={distance}>0.00 KM</output>
        </div>
      </div>

      <footer className="od-toolbar" id="od-controls" tabIndex={-1}>
        <div className="od-live">
          <span className={status === 'ready' ? 'is-live' : ''} />
          <span>
            {status === 'loading'
              ? 'OPENING THE HORIZON'
              : status === 'ready'
                ? 'AN INFINITE EXPEDITION'
                : 'LANDSCAPE PREVIEW'}
          </span>
        </div>
        <div className="od-controls">
          <button
            onClick={toggleSound}
            aria-pressed={sound}
            aria-label={sound ? 'Mute ambient sound' : 'Enable ambient sound'}
          >
            {sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>SOUND {sound ? 'ON' : 'OFF'}</span>
          </button>
          <span className="od-control-divider" />
          <button
            onClick={toggleCruise}
            aria-pressed={cruise}
            disabled={status !== 'ready'}
          >
            <AudioLines size={15} />
            <span>AUTO FLIGHT {cruise ? 'ON' : 'OFF'}</span>
          </button>
          <button
            className="od-icon-button"
            aria-label={paused ? 'Resume motion' : 'Pause motion'}
            aria-pressed={paused}
            disabled={status !== 'ready'}
            onClick={() => {
              signal.current.paused = !paused;
              setPaused(!paused);
            }}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button
            className="od-icon-button"
            aria-label={dusk ? 'Switch to dawn light' : 'Switch to dusk light'}
            aria-pressed={dusk}
            disabled={status !== 'ready'}
            onClick={() => {
              signal.current.light = dusk ? 0 : 1;
              setDusk(!dusk);
            }}
          >
            <Sun size={17} />
          </button>
        </div>
        <button
          className="od-fullscreen"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Exit full screen' : 'Enter full screen'}
        >
          {fullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          <span>FULL SCREEN</span>
        </button>
      </footer>
      <div className="od-progress" aria-hidden="true" />
      {notice && (
        <div className="od-notice" role="status">
          {notice}
          <button aria-label="Dismiss notice" onClick={() => setNotice('')}>
            <X size={15} />
          </button>
        </div>
      )}
      {status === 'unavailable' && (
        <p className="od-unavailable" role="status">
          A still horizon. Live flight requires WebGL — try reloading in a
          supported browser.
        </p>
      )}

      <dialog
        ref={guide}
        className="od-guide"
        aria-labelledby="od-guide-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) guide.current?.close();
        }}
        onClose={() => guideTrigger.current?.focus()}
      >
        <div className="od-guide-inner">
          <button
            className="od-guide-close"
            aria-label="Close field guide"
            onClick={() => guide.current?.close()}
          >
            <X size={22} />
          </button>
          <Mountain size={30} strokeWidth={1} />
          <span className="od-eyebrow">A FEW NOTES BEFORE YOU GO</span>
          <h2 id="od-guide-title">Follow your curiosity.</h2>
          <p>
            There is no destination here. Just mountains, mist, and a little
            room to breathe.
          </p>
          <dl>
            <div>
              <dt>Find your pace</dt>
              <dd>
                Scroll or swipe to fly. Use the numbered waypoints to skip
                ahead.
              </dd>
            </div>
            <div>
              <dt>Let go</dt>
              <dd>
                Turn on auto flight for an endless journey. Pause whenever you
                find a view worth keeping.
              </dd>
            </div>
            <div>
              <dt>Set the atmosphere</dt>
              <dd>
                Put on headphones for ambient wind. Tap the sun to move between
                dawn and dusk.
              </dd>
            </div>
          </dl>
          <p className="od-guide-note">
            Every ridge is generated in real time. No two moments are quite the
            same. Reduced-motion preferences disable automatic travel and
            pointer movement.
          </p>
          <Link href="/">
            Explore all showcases <ArrowUpRight size={15} />
          </Link>
        </div>
      </dialog>
    </main>
  );
}
