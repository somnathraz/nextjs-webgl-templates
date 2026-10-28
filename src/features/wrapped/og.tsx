import { ImageResponse } from 'next/og';
import { copyFor } from './adapters/copy';
import { fmt, units } from './engine/copy';
import { computeStats, weekdayOf } from './engine/stats';
import type { Day, WrappedData } from './engine/types';
import { VS_A, VS_B, compare, verdictLine } from './engine/versus';

/** Link-preview images (1200×630) for single and versus stories. */

export const OG_SIZE = { width: 1200, height: 630 };

const LIME = '#c6ff3d';
const BG = '#0b0a12';
const MONTH = 60 * 60 * 24 * 30;

/** Satori needs TTF; Google serves it to clients that don't ask for woff2. */
async function loadFont(weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@${weight}`,
        { next: { revalidate: MONTH } },
      )
    ).text();
    const url =
      /src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype)'\)/.exec(
        css,
      )?.[1];
    if (!url) return null;
    return await (
      await fetch(url, { next: { revalidate: MONTH } })
    ).arrayBuffer();
  } catch {
    return null;
  }
}

async function fonts() {
  const [bold, semi] = await Promise.all([loadFont(800), loadFont(600)]);
  return [
    ...(bold ? [{ name: 'Bricolage', data: bold, weight: 800 as const }] : []),
    ...(semi ? [{ name: 'Bricolage', data: semi, weight: 600 as const }] : []),
  ];
}

function hexAlpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a.toFixed(2)})`;
}

function Heatmap({
  days,
  max,
  color,
  cell,
}: {
  days: Day[];
  max: number;
  color: string;
  cell: number;
}) {
  const first = weekdayOf(days[0]?.date ?? '2026-01-01');
  const weeks: number[][] = Array.from({ length: 53 }, () => Array(7).fill(-1));
  days.forEach((d, i) => {
    const idx = i + first;
    if (idx < 53 * 7) weeks[Math.floor(idx / 7)][idx % 7] = d.count;
  });
  const gap = Math.max(2, Math.round(cell / 4));
  return (
    <div style={{ display: 'flex', gap }}>
      {weeks.map((week, w) => (
        <div key={w} style={{ display: 'flex', flexDirection: 'column', gap }}>
          {week.map((c, d) => (
            <div
              key={d}
              style={{
                width: cell,
                height: cell,
                borderRadius: cell / 4,
                background:
                  c < 0
                    ? 'transparent'
                    : c === 0
                      ? 'rgba(255,255,255,0.06)'
                      : hexAlpha(
                          color,
                          0.3 + 0.7 * Math.sqrt(c / Math.max(1, max)),
                        ),
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Avatar({
  data,
  size,
  color,
}: {
  data: WrappedData;
  size: number;
  color: string;
}) {
  return data.avatar ? (
    // satori renders plain <img>; next/image doesn't exist there
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={data.avatar}
      width={size}
      height={size}
      style={{ borderRadius: size, border: `3px solid ${color}` }}
      alt=""
    />
  ) : (
    <div
      style={{
        display: 'flex',
        width: size,
        height: size,
        borderRadius: size,
        border: `3px solid ${color}`,
        color,
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        fontWeight: 800,
      }}
    >
      {data.name[0]}
    </div>
  );
}

const frame = {
  display: 'flex',
  flexDirection: 'column' as const,
  width: '100%',
  height: '100%',
  color: '#f6f5ff',
  fontFamily: 'Bricolage',
};

const handleOf = (d: WrappedData) =>
  d.sample ? 'sample year' : `@${d.handle}`;

export async function fallbackOg() {
  return new ImageResponse(
    <div
      style={{
        ...frame,
        background: BG,
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 96,
        fontWeight: 800,
        flexDirection: 'row',
      }}
    >
      Wrapped <span style={{ color: LIME, marginLeft: 20 }}>2026</span>
    </div>,
    { ...OG_SIZE, fonts: await fonts() },
  );
}

export async function singleOg(data: WrappedData) {
  const copy = copyFor(data.kind);
  const stats = computeStats(data, copy);
  const facts = [
    ['Streak', `${stats.streak.length}d`],
    ['Active', `${stats.activeDays}d`],
    [copy.breakdownLabel, data.breakdown[0]?.name ?? '—'],
  ];

  return new ImageResponse(
    <div
      style={{
        ...frame,
        padding: '52px 64px 48px',
        background: `radial-gradient(circle at 92% 0%, rgba(198,255,61,0.25), rgba(198,255,61,0) 55%), radial-gradient(circle at 0% 100%, rgba(122,92,255,0.28), rgba(122,92,255,0) 55%), ${BG}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Avatar data={data} size={64} color={LIME} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
            {data.name}
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, opacity: 0.6 }}>
            {handleOf(data)}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            marginLeft: 'auto',
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: -1,
          }}
        >
          Wrapped<span style={{ color: LIME, marginLeft: 8 }}>{data.year}</span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 40,
          marginTop: 26,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 150,
              fontWeight: 800,
              letterSpacing: -7,
              lineHeight: 0.9,
            }}
          >
            {fmt(copy, stats.total)}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              opacity: 0.6,
              marginTop: 6,
            }}
          >
            {units(copy, stats.total)}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginLeft: 'auto',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', gap: 28 }}>
            {facts.map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    opacity: 0.5,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                  }}
                >
                  {k}
                </div>
                <div style={{ fontSize: 30, fontWeight: 800 }}>{v}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              padding: '10px 24px',
              borderRadius: 999,
              background: LIME,
              color: BG,
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: -0.5,
            }}
          >
            {stats.archetype.title}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', marginTop: 'auto' }}>
        <Heatmap days={data.days} max={stats.max} color={LIME} cell={16} />
      </div>
    </div>,
    { ...OG_SIZE, fonts: await fonts() },
  );
}

export async function versusOg(a: WrappedData, b: WrappedData) {
  const copy = copyFor(a.kind);
  const sa = computeStats(a, copy);
  const sb = computeStats(b, copy);
  const v = compare(a, sa, b, sb, copy);
  const winColor =
    v.winner === 'a' ? VS_A : v.winner === 'b' ? VS_B : '#ffffff';

  const corner = (
    d: WrappedData,
    color: string,
    total: number,
    right: boolean,
  ) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        flexDirection: right ? 'row-reverse' : 'row',
      }}
    >
      <Avatar data={d} size={84} color={color} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: right ? 'flex-end' : 'flex-start',
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
          {d.name}
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, opacity: 0.6 }}>
          {handleOf(d)}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color }}>
          {`${fmt(copy, total)} ${units(copy, total)}`}
        </div>
      </div>
    </div>
  );

  return new ImageResponse(
    <div
      style={{
        ...frame,
        padding: '44px 60px 40px',
        background: `radial-gradient(circle at 0% 0%, ${hexAlpha(VS_A, 0.22)}, ${hexAlpha(VS_A, 0)} 50%), radial-gradient(circle at 100% 0%, ${hexAlpha(VS_B, 0.24)}, ${hexAlpha(VS_B, 0)} 50%), ${BG}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {corner(a, VS_A, sa.total, false)}
        <div
          style={{
            display: 'flex',
            fontSize: 40,
            fontWeight: 800,
            opacity: 0.4,
          }}
        >
          VS
        </div>
        {corner(b, VS_B, sb.total, true)}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 4,
            opacity: 0.55,
          }}
        >
          WRAPPED {a.year} · VERSUS
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 78,
            fontWeight: 800,
            letterSpacing: -3,
            color: winColor,
          }}
        >
          {verdictLine(v, a, b)}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginTop: 'auto',
          alignItems: 'center',
        }}
      >
        <Heatmap days={a.days} max={v.max} color={VS_A} cell={13} />
        <Heatmap days={b.days} max={v.max} color={VS_B} cell={13} />
      </div>
    </div>,
    { ...OG_SIZE, fonts: await fonts() },
  );
}
