'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, RotateCcw, Swords } from 'lucide-react';
import { CountUp } from './count-up';
import { Kicker, M, rise } from './motion';
import { ShareActions, cardFont } from './share-actions';
import { fmt, units, type Copy } from '../engine/copy';
import { renderVersusCard } from '../engine/share-card';
import { formatDay, type Stats } from '../engine/stats';
import type { WrappedData } from '../engine/types';
import type { VersusKey } from '../engine/versus-layouts';
import {
  VS_A,
  VS_B,
  verdictLine,
  type Round,
  type Versus,
} from '../engine/versus';

type Props = {
  slide: VersusKey;
  n: number;
  a: WrappedData;
  b: WrappedData;
  sa: Stats;
  sb: Stats;
  v: Versus;
  copy: Copy;
  onReplay: () => void;
};

const first = (d: WrappedData) => d.name.split(/\s+/)[0];
const who = (d: WrappedData) => (d.sample ? d.name : `@${d.handle}`);

function Face({ data, color }: { data: WrappedData; color: string }) {
  return data.avatar ? (
    <Image
      className="gw-face"
      src={data.avatar}
      alt=""
      width={72}
      height={72}
      unoptimized
      priority
      style={{ borderColor: color }}
    />
  ) : (
    <span
      className="gw-face gw-face--initial"
      style={{ borderColor: color, color }}
    >
      {data.name[0]}
    </span>
  );
}

function Duel({
  round,
  a,
  b,
}: {
  round: Round;
  a: WrappedData;
  b: WrappedData;
}) {
  const top = Math.max(round.a, round.b, 1);
  const rows: [WrappedData, number, string, string, boolean][] = [
    [a, round.a, round.show[0], VS_A, round.winner === 'a'],
    [b, round.b, round.show[1], VS_B, round.winner === 'b'],
  ];
  return (
    <div className="gw-duel">
      {rows.map(([d, value, shown, color, won]) => (
        <div
          key={d.id}
          className={`gw-duel-row${won ? ' is-win' : ''}`}
          style={{ '--side': color } as React.CSSProperties}
        >
          <span className="gw-duel-who">
            {who(d)}
            {won && <em>takes it</em>}
          </span>
          <strong>{shown}</strong>
          <span className="gw-duel-bar">
            <i style={{ width: `${Math.max(3, (value / top) * 100)}%` }} />
          </span>
        </div>
      ))}
    </div>
  );
}

function roundLine(r: Round, a: WrappedData, b: WrappedData, copy: Copy) {
  if (r.winner === 'tie') return 'Dead even. Nobody blinks.';
  const [w, l] = r.winner === 'a' ? [a, b] : [b, a];
  const gap = Math.abs(r.a - r.b);
  if (r.id === 'total')
    return `${first(w)} ${copy.beat} ${first(l)} by ${fmt(copy, gap)} ${units(copy, gap)}.`;
  if (r.id === 'streak')
    return `${first(w)} kept the chain going ${gap} days longer.`;
  if (r.id === 'peak') return `${first(w)}’s best day hit harder.`;
  return `${first(w)} showed up ${gap} more days.`;
}

export function VersusSlide({
  slide,
  n,
  a,
  b,
  sa,
  sb,
  v,
  copy,
  onReplay,
}: Props) {
  const round = (id: Round['id']) => v.rounds.find((r) => r.id === id)!;

  switch (slide) {
    case 'vs-intro':
      return (
        <>
          <Kicker n={0}>Wrapped {a.year} · Versus</Kicker>
          <M variants={rise} className="gw-faceoff">
            <Face data={a} color={VS_A} />
            <span>vs</span>
            <Face data={b} color={VS_B} />
          </M>
          <M variants={rise}>
            <h1 className="gw-h1">
              <span style={{ color: VS_A }}>{first(a)}</span> vs{' '}
              <span style={{ color: VS_B }}>{first(b)}</span>.
            </h1>
          </M>
          <M variants={rise} className="gw-body">
            Two {a.year}s. Four rounds. One winner — fought with{' '}
            {a.days.length + b.days.length} cubes, one per day.
          </M>
          <M variants={rise} className="gw-tap">
            Tap to start round one <ArrowRight size={16} />
          </M>
        </>
      );

    case 'vs-total':
    case 'vs-streak':
    case 'vs-peak':
    case 'vs-active': {
      const r = round(slide.slice(3) as Round['id']);
      return (
        <>
          <Kicker n={n}>{r.kicker}</Kicker>
          <M variants={rise}>
            <h1 className="gw-h1">{r.title}</h1>
          </M>
          <M variants={rise}>
            <Duel round={r} a={a} b={b} />
          </M>
          <M variants={rise} className="gw-body">
            {roundLine(r, a, b, copy)}
          </M>
        </>
      );
    }

    case 'vs-overlap': {
      const best = v.overlap.best;
      return (
        <>
          <Kicker n={n}>Common ground</Kicker>
          <M variants={rise} className="gw-lead">
            You were both active on
          </M>
          <M variants={rise} className="gw-huge">
            <CountUp value={v.overlap.days} duration={1.2} />
            <small> days</small>
          </M>
          <M variants={rise} className="gw-body">
            {best ? (
              <>
                Best day together: <b>{formatDay(best.date)}</b> —{' '}
                {fmt(copy, best.a)} vs {fmt(copy, best.b)}. The white towers are
                the days you both showed up.
              </>
            ) : (
              'Not a single shared day. Ships passing in the night.'
            )}
          </M>
        </>
      );
    }

    case 'vs-verdict': {
      const color =
        v.winner === 'a' ? VS_A : v.winner === 'b' ? VS_B : '#ffffff';
      return (
        <>
          <Kicker n={n}>The verdict</Kicker>
          <M variants={rise}>
            <h1 className="gw-huge gw-persona" style={{ color }}>
              {verdictLine(v, a, b)}
            </h1>
          </M>
          <M variants={rise} className="gw-score">
            {v.rounds.map((r) => (
              <span
                key={r.id}
                style={{
                  background:
                    r.winner === 'a'
                      ? VS_A
                      : r.winner === 'b'
                        ? VS_B
                        : '#ffffff55',
                }}
                title={r.title}
              />
            ))}
          </M>
          <M variants={rise} className="gw-body">
            <b style={{ color: VS_A }}>{first(a)}</b> is {sa.archetype.title}.{' '}
            <b style={{ color: VS_B }}>{first(b)}</b> is {sb.archetype.title}.
          </M>
        </>
      );
    }

    case 'vs-share':
      return (
        <>
          <Kicker n={0}>Settled</Kicker>
          <M variants={rise} className="gw-card gw-card--vs">
            <div className="gw-vs-head">
              {[a, b].map((d, k) => (
                <div key={d.id} style={{ color: k ? VS_B : VS_A }}>
                  <Face data={d} color={k ? VS_B : VS_A} />
                  <strong>{first(d)}</strong>
                </div>
              ))}
            </div>
            <div className="gw-vs-verdict">{verdictLine(v, a, b)}</div>
            <dl className="gw-vs-rounds">
              {v.rounds.map((r) => (
                <div key={r.id}>
                  <dd className={r.winner === 'a' ? 'is-a' : ''}>
                    {r.show[0]}
                  </dd>
                  <dt>{r.title}</dt>
                  <dd className={r.winner === 'b' ? 'is-b' : ''}>
                    {r.show[1]}
                  </dd>
                </div>
              ))}
            </dl>
          </M>
          <ShareActions
            card={() => renderVersusCard(a, b, v, copy, cardFont())}
            fileName={`wrapped-${a.year}-${a.handle}-vs-${b.handle}.png`}
            text={copy.versusText({
              year: a.year,
              a: who(a),
              b: who(b),
              verdict: verdictLine(v, a, b),
            })}
            path={`/wrapped/${a.id}/vs/${b.id}`}
          />
          <M variants={rise} className="gw-after" data-nav-ignore>
            <button onClick={onReplay}>
              <RotateCcw size={13} /> Replay
            </button>
            <Link href={`/wrapped/${b.id}/vs/${a.id}`}>
              <Swords size={13} /> Swap corners
            </Link>
            <Link href={`/wrapped/${a.id}`}>
              Just {first(a)}&apos;s year <ArrowRight size={13} />
            </Link>
          </M>
        </>
      );
  }
}
