'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, RotateCcw, Star } from 'lucide-react';
import { CountUp } from './count-up';
import { Kicker, M, rise } from './motion';
import { ShareActions, cardFont } from './share-actions';
import { ChallengeForm } from './username-form';
import { fmt, units, type Copy } from '../engine/copy';
import type { SlideKey } from '../engine/layouts';
import { renderShareCard } from '../engine/share-card';
import {
  MONTHS,
  WEEKDAYS,
  formatDay,
  formatShortDay,
  hourLabel,
  type Stats,
} from '../engine/stats';
import type { WrappedData } from '../engine/types';

type Props = {
  slide: SlideKey;
  n: number;
  data: WrappedData;
  stats: Stats;
  copy: Copy;
  hours: number[] | null;
  onReplay: () => void;
};

export function Slide({ slide, n, data, stats, copy, hours, onReplay }: Props) {
  const first = data.name.split(/\s+/)[0];
  const many = (v: number) => `${fmt(copy, v)} ${units(copy, v)}`;

  switch (slide) {
    case 'intro':
      return (
        <>
          <Kicker n={0}>Wrapped {data.year}</Kicker>
          {data.avatar && (
            <M variants={rise}>
              <Image
                className="gw-avatar"
                src={data.avatar}
                alt=""
                width={88}
                height={88}
                unoptimized
                priority
              />
            </M>
          )}
          <M variants={rise}>
            <h1 className="gw-h1">
              Hey {first}.<br />
              {copy.introLine} <em>wrapped.</em>
            </h1>
          </M>
          <M variants={rise} className="gw-body">
            {stats.elapsedDays} days. {many(stats.total)}. One skyline built
            from every one of them.
          </M>
          <M variants={rise} className="gw-tap">
            Tap to begin <ArrowRight size={16} />
          </M>
          {data.sample && (
            <M variants={rise}>
              <Link className="gw-chip" href="/wrapped" data-nav-ignore>
                This is a sample year — make yours <ArrowRight size={13} />
              </Link>
            </M>
          )}
        </>
      );

    case 'total':
      return (
        <>
          <Kicker n={n}>The count</Kicker>
          <M variants={rise} className="gw-lead">
            {copy.totalLead}
          </M>
          <M variants={rise} className="gw-huge">
            <CountUp value={stats.total} />
          </M>
          <M variants={rise} className="gw-body">
            {units(copy, stats.total)} across <b>{stats.activeDays}</b> active
            days. Every cube behind this text is one day of your {data.year} —
            the taller, the busier.
          </M>
        </>
      );

    case 'peak': {
      const b = stats.busiest!;
      const avg = stats.activeDays ? stats.total / stats.activeDays : 1;
      const ratio = b.count / avg;
      return (
        <>
          <Kicker n={n}>Your biggest day</Kicker>
          <M variants={rise} className="gw-lead">
            The tallest tower is
          </M>
          <M variants={rise}>
            <h1 className="gw-h1 gw-accent">{formatDay(b.date)}</h1>
          </M>
          <M variants={rise} className="gw-body">
            <b>{many(b.count)}</b> in a single day
            {ratio >= 1.5
              ? ` — ${ratio.toFixed(1)}× your usual pace`
              : ''}. {copy.peakQuip}
          </M>
        </>
      );
    }

    case 'streak':
      return (
        <>
          <Kicker n={n}>The streak</Kicker>
          <M variants={rise} className="gw-huge">
            <CountUp value={stats.streak.length} duration={1.2} />
            <small> days</small>
          </M>
          <M variants={rise} className="gw-body">
            in a row, from <b>{formatShortDay(stats.streak.start)}</b> to{' '}
            <b>{formatShortDay(stats.streak.end)}</b>.
            {stats.streak.length >= 14
              ? ' No breaks. No excuses.'
              : ' Momentum is a habit.'}
          </M>
        </>
      );

    case 'months': {
      const m = stats.topMonth;
      const inMonth = new Date(Date.UTC(data.year, m + 1, 0)).getUTCDate();
      return (
        <>
          <Kicker n={n}>Peak season</Kicker>
          <M variants={rise} className="gw-lead">
            Your most active month was
          </M>
          <M variants={rise}>
            <h1 className="gw-h1 gw-accent">{MONTHS[m]}</h1>
          </M>
          <M variants={rise} className="gw-body">
            <b>
              {stats.monthActive[m]} of {inMonth}
            </b>{' '}
            days were active. Each tower is a month; each cube, a day you showed
            up.
          </M>
        </>
      );
    }

    case 'weekdays': {
      const max = Math.max(...stats.weekdayTotal, 1);
      return (
        <>
          <Kicker n={n}>Your rhythm</Kicker>
          <M variants={rise}>
            <h1 className="gw-h1">
              {copy.weekdayLead}{' '}
              <em className="gw-accent">{WEEKDAYS[stats.topWeekday]}s.</em>
            </h1>
          </M>
          <M variants={rise} className="gw-body">
            <b>{Math.round(stats.topWeekdayShare * 100)}%</b> of everything
            landed on a {WEEKDAYS[stats.topWeekday]}.{' '}
            {stats.weekendShare > 0.3
              ? 'Weekends too, apparently.'
              : 'Weekends stay (mostly) sacred.'}
          </M>
          <M variants={rise} className="gw-week" aria-hidden="true">
            {stats.weekdayTotal.map((v, i) => (
              <span key={i} className={i === stats.topWeekday ? 'is-top' : ''}>
                <i style={{ height: `${8 + (v / max) * 52}px` }} />
                {WEEKDAYS[i][0]}
              </span>
            ))}
          </M>
        </>
      );
    }

    case 'breakdown': {
      const top = data.breakdown[0];
      return (
        <>
          <Kicker n={n}>{copy.breakdownKicker}</Kicker>
          <M variants={rise} className="gw-lead">
            {copy.breakdownLead}
          </M>
          <M variants={rise}>
            <h1 className="gw-h1" style={{ color: top.color }}>
              {top.name}
            </h1>
          </M>
          <M variants={rise}>
            <ol className="gw-list">
              {data.breakdown.map((l) => (
                <li key={l.name}>
                  <span className="gw-dot" style={{ background: l.color }} />
                  <span className="gw-list-name">{l.name}</span>
                  <span className="gw-meter">
                    <i
                      style={{
                        width: `${Math.max(4, l.share * 100)}%`,
                        background: l.color,
                      }}
                    />
                  </span>
                  <span className="gw-list-val">
                    {Math.round(l.share * 100)}%
                  </span>
                </li>
              ))}
            </ol>
          </M>
        </>
      );
    }

    case 'clock': {
      const h = hours!.indexOf(Math.max(...hours!));
      return (
        <>
          <Kicker n={n}>Your hours</Kicker>
          <M variants={rise} className="gw-lead">
            {copy.clockLead}
          </M>
          <M variants={rise}>
            <h1 className="gw-huge gw-accent">{hourLabel(h)}</h1>
          </M>
          <M variants={rise} className="gw-body">
            {copy.chronotype(h)}
            <span className="gw-fine">
              From your recent activity, in your time zone. The ring is a
              24-hour clock.
            </span>
          </M>
        </>
      );
    }

    case 'ranking':
      return (
        <>
          <Kicker n={n}>{copy.rankingKicker}</Kicker>
          <M variants={rise}>
            <h1 className="gw-h1">
              {copy.rankingTitle[0]}{' '}
              <em className="gw-accent">{copy.rankingTitle[1]}</em>
            </h1>
          </M>
          <M variants={rise}>
            <ol className="gw-list gw-list--repos">
              {data.ranking.map((r, i) => (
                <li key={r.name}>
                  <span className="gw-rank">{i + 1}</span>
                  <span className="gw-list-name">
                    {r.name}
                    {r.label && (
                      <small>
                        <span
                          className="gw-dot"
                          style={{ background: r.color }}
                        />{' '}
                        {r.label}
                      </small>
                    )}
                  </span>
                  <span className="gw-list-val">
                    {copy.rankingUnit ? null : <Star size={13} />}{' '}
                    {r.value.toLocaleString('en-US')}
                    {copy.rankingUnit ? ` ${copy.rankingUnit}` : ''}
                  </span>
                </li>
              ))}
            </ol>
          </M>
        </>
      );

    case 'persona':
      return (
        <>
          <Kicker n={n}>
            Your {data.year} {copy.personaKicker}
          </Kicker>
          <M variants={rise}>
            <h1 className="gw-huge gw-persona">{stats.archetype.title}</h1>
          </M>
          <M variants={rise} className="gw-body">
            {stats.archetype.line}
          </M>
        </>
      );

    case 'share':
      return (
        <ShareSlide data={data} stats={stats} copy={copy} onReplay={onReplay} />
      );
  }
}

function ShareSlide({
  data,
  stats,
  copy,
  onReplay,
}: {
  data: WrappedData;
  stats: Stats;
  copy: Copy;
  onReplay: () => void;
}) {
  return (
    <>
      <Kicker n={0}>That&apos;s a wrap</Kicker>
      <M variants={rise} className="gw-card">
        <div className="gw-card-head">
          {data.avatar ? (
            <Image
              src={data.avatar}
              alt=""
              width={44}
              height={44}
              unoptimized
            />
          ) : (
            <span className="gw-card-initial">{data.name[0]}</span>
          )}
          <div>
            <strong>{data.name}</strong>
            <span>{data.sample ? 'sample year' : `@${data.handle}`}</span>
          </div>
          <em>{data.year}</em>
        </div>
        <div className="gw-card-total">
          {fmt(copy, stats.total)}
          <span>{units(copy, stats.total)}</span>
        </div>
        <dl className="gw-card-grid">
          <div>
            <dt>Streak</dt>
            <dd>{stats.streak.length}d</dd>
          </div>
          <div>
            <dt>Best day</dt>
            <dd>{stats.busiest ? formatShortDay(stats.busiest.date) : '—'}</dd>
          </div>
          <div>
            <dt>{copy.breakdownLabel}</dt>
            <dd>{data.breakdown[0]?.name ?? '—'}</dd>
          </div>
          <div>
            <dt>Active</dt>
            <dd>{stats.activeDays}d</dd>
          </div>
        </dl>
        <div className="gw-card-type">{stats.archetype.title}</div>
      </M>
      <ShareActions
        card={() => renderShareCard(data, stats, copy, cardFont())}
        fileName={`wrapped-${data.year}-${data.sample ? 'sample' : data.handle}.png`}
        text={copy.shareText({
          year: data.year,
          total: fmt(copy, stats.total),
          streak: stats.streak.length,
          archetype: stats.archetype.title,
        })}
        path={`/wrapped${data.sample ? '' : `/${data.id}`}`}
      />
      {data.kind === 'github' && (
        <M variants={rise}>
          <ChallengeForm from={data.id} />
        </M>
      )}
      <M variants={rise} className="gw-after" data-nav-ignore>
        <button onClick={onReplay}>
          <RotateCcw size={13} /> Replay
        </button>
        <Link href="/wrapped">
          Wrap someone else <ArrowRight size={13} />
        </Link>
      </M>
    </>
  );
}
