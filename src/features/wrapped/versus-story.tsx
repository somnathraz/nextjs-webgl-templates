'use client';
import { useCallback, useMemo } from 'react';
import { copyFor } from './adapters/copy';
import { StoryShell } from './components/story-shell';
import { VersusSlide } from './components/versus-slides';
import { computeStats } from './engine/stats';
import { VS_THEMES } from './engine/themes';
import type { WrappedData } from './engine/types';
import { compare } from './engine/versus';
import { buildVersusLayout, type VersusKey } from './engine/versus-layouts';

const SLIDES: VersusKey[] = [
  'vs-intro',
  'vs-total',
  'vs-streak',
  'vs-peak',
  'vs-active',
  'vs-overlap',
  'vs-verdict',
  'vs-share',
];

export function VersusStory({ a, b }: { a: WrappedData; b: WrappedData }) {
  const copy = copyFor(a.kind);
  const sa = useMemo(() => computeStats(a, copy), [a, copy]);
  const sb = useMemo(() => computeStats(b, copy), [b, copy]);
  const v = useMemo(() => compare(a, sa, b, sb, copy), [a, sa, b, sb, copy]);

  const buildTarget = useCallback(
    (key: VersusKey) =>
      buildVersusLayout(key, {
        a,
        b,
        sa,
        sb,
        v,
        base: VS_THEMES[key].base,
        ink: VS_THEMES[key].ink,
      }),
    [a, b, sa, sb, v],
  );

  const name = (d: WrappedData) => (d.sample ? d.name : `@${d.handle}`);

  return (
    <StoryShell
      slides={SLIDES}
      themes={VS_THEMES}
      buildTarget={buildTarget}
      year={a.year}
      who={`${name(a)} vs ${name(b)}`}
      render={(key, n, replay) => (
        <VersusSlide
          slide={key}
          n={n}
          a={a}
          b={b}
          sa={sa}
          sb={sb}
          v={v}
          copy={copy}
          onReplay={replay}
        />
      )}
    />
  );
}
