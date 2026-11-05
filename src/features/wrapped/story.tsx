'use client';
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { copyFor } from './adapters/copy';
import { Slide } from './components/slides';
import { StoryShell } from './components/story-shell';
import { buildLayout, type SlideKey } from './engine/layouts';
import { computeStats, hourHistogram } from './engine/stats';
import { THEMES } from './engine/themes';
import type { WrappedData } from './engine/types';

// Local hours depend on the viewer's time zone, so they only exist on the client.
const noopSubscribe = () => () => {};
const histograms = new WeakMap<string[], number[] | null>();
function localHours(events: string[]) {
  if (!histograms.has(events)) histograms.set(events, hourHistogram(events));
  return histograms.get(events)!;
}

export function WrappedStory({ data }: { data: WrappedData }) {
  const copy = copyFor(data.kind);
  const stats = useMemo(() => computeStats(data, copy), [data, copy]);
  const hours = useSyncExternalStore(
    noopSubscribe,
    () => localHours(data.events),
    () => null,
  );

  // chapters only appear when there's data to tell them with
  const slides = useMemo(() => {
    const s: SlideKey[] = ['intro', 'total'];
    if (stats.busiest) s.push('peak');
    if (stats.streak.length >= 2) s.push('streak');
    if (stats.activeDays >= 7) s.push('months', 'weekdays');
    if (data.breakdown.length) s.push('breakdown');
    if (hours && stats.activeDays) s.push('clock');
    if (data.ranking.length && stats.activeDays) s.push('ranking');
    s.push('persona', 'share');
    return s;
  }, [stats, hours, data]);

  const buildTarget = useCallback(
    (key: SlideKey) =>
      buildLayout(key, { data, stats, hours, palette: THEMES[key] }),
    [data, stats, hours],
  );

  return (
    <StoryShell
      slides={slides}
      themes={THEMES}
      buildTarget={buildTarget}
      year={data.year}
      who={data.sample ? 'sample year' : `@${data.handle}`}
      render={(key, n, replay) => (
        <Slide
          slide={key}
          n={n}
          data={data}
          stats={stats}
          copy={copy}
          hours={hours}
          onReplay={replay}
        />
      )}
    />
  );
}
