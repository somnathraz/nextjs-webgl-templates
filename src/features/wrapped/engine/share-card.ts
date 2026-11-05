import { fmt, units, type Copy } from './copy';
import { formatShortDay, weekdayOf, type Stats } from './stats';
import type { Day, WrappedData } from './types';
import { VS_A, VS_B, verdictLine, type Versus } from './versus';

/**
 * Downloadable 1080×1350 cards (4:5 — the ratio X and Instagram feeds show
 * uncropped). Pure Canvas 2D, so they never depend on WebGL readback.
 */

const W = 1080;
const H = 1350;
const ACCENT = '#c6ff3d';
const BG = '#0b0a12';
const INK = '#f6f5ff';

type Ctx = CanvasRenderingContext2D;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => resolve(null), 4000);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

function shade(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `rgb(${r},${g},${b})`;
}

function mixHex(a: string, b: string, t: number) {
  const x = parseInt(a.slice(1), 16);
  const y = parseInt(b.slice(1), 16);
  const ch = (s: number) =>
    Math.round(((x >> s) & 255) + (((y >> s) & 255) - ((x >> s) & 255)) * t);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}

const cellsOf = (days: Day[]) => {
  const first = weekdayOf(days[0]?.date ?? '2026-01-01');
  return days.map((d, i) => {
    const idx = i + first;
    return { w: Math.floor(idx / 7), d: idx % 7, count: d.count };
  });
};

function drawIsoSkyline(
  ctx: Ctx,
  days: Day[],
  max: number,
  cx: number,
  top: number,
) {
  const a = 14.5;
  const b = 5.2;
  // painter's order: back rows first
  const cells = cellsOf(days).sort((p, q) => p.w + p.d - (q.w + q.d));
  const ox = cx - ((53 - 6) / 2) * a;
  const oy = top + 170;
  const aw = a * 0.78;
  const bh = b * 0.78;
  for (const c of cells) {
    const sx = ox + (c.w - c.d) * a;
    const sy = oy + (c.w + c.d) * b;
    const k = Math.sqrt(c.count / Math.max(1, max));
    const h = c.count ? 6 + k * 150 : 2;
    const color = mixHex('#1c1b29', ACCENT, c.count ? 0.35 + 0.65 * k : 0.04);
    const face = (fill: string, pts: [number, number][]) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.fill();
    };
    face(shade(color, 0.62), [
      [sx - aw, sy - h],
      [sx, sy - h + bh],
      [sx, sy + bh],
      [sx - aw, sy],
    ]);
    face(shade(color, 0.42), [
      [sx + aw, sy - h],
      [sx, sy - h + bh],
      [sx, sy + bh],
      [sx + aw, sy],
    ]);
    face(color, [
      [sx, sy - h - bh],
      [sx + aw, sy - h],
      [sx, sy - h + bh],
      [sx - aw, sy - h],
    ]);
  }
}

function drawHeatmap(
  ctx: Ctx,
  days: Day[],
  max: number,
  x: number,
  y: number,
  color: string,
) {
  const size = 14;
  const step = 17;
  for (const c of cellsOf(days)) {
    const k = c.count ? 0.3 + 0.7 * Math.sqrt(c.count / Math.max(1, max)) : 0;
    ctx.fillStyle = k ? mixHex('#1c1b29', color, k) : 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.roundRect(x + c.w * step, y + c.d * step, size, size, 3);
    ctx.fill();
  }
}

async function drawAvatar(
  ctx: Ctx,
  data: WrappedData,
  cx: number,
  cy: number,
  r: number,
  ring: string,
  font: (w: number, s: number) => string,
) {
  const img = await loadImage(data.avatar);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
  ctx.fillStyle = ring;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  if (img) {
    ctx.clip();
    ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  } else {
    ctx.fillStyle = BG;
    ctx.fill();
    ctx.fillStyle = ring;
    ctx.font = font(800, r);
    ctx.textAlign = 'center';
    ctx.fillText(data.name.slice(0, 1).toUpperCase(), cx, cy + r * 0.36);
  }
  ctx.restore();
  ctx.textAlign = 'left';
}

function canvasFor(): [HTMLCanvasElement, Ctx] | null {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  return ctx ? [canvas, ctx] : null;
}

function backdrop(ctx: Ctx, glowA: string, glowB: string) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  for (const [x, y, c] of [
    [W * 0.85, 120, glowA],
    [80, H - 140, glowB],
  ] as const) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, 760);
    g.addColorStop(0, `${c}38`);
    g.addColorStop(1, `${c}00`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
}

const trim = (s: string, n: number) =>
  s.length > n ? `${s.slice(0, n - 1)}…` : s;
const handleOf = (d: WrappedData) => (d.sample ? 'sample' : `@${d.handle}`);
const blob = (c: HTMLCanvasElement) =>
  new Promise<Blob | null>((resolve) => c.toBlob(resolve, 'image/png'));

export async function renderShareCard(
  data: WrappedData,
  stats: Stats,
  copy: Copy,
  fontFamily: string,
): Promise<Blob | null> {
  await document.fonts?.ready;
  const made = canvasFor();
  if (!made) return null;
  const [canvas, ctx] = made;
  const font = (weight: number, size: number) =>
    `${weight} ${size}px ${fontFamily}`;

  backdrop(ctx, ACCENT, '#7a5cff');

  ctx.fillStyle = ACCENT;
  ctx.font = font(700, 26);
  ctx.letterSpacing = '6px';
  ctx.fillText(`WRAPPED ${data.year}`, 80, 92);
  ctx.letterSpacing = '0px';

  await drawAvatar(ctx, data, 140, 190, 56, ACCENT, font);
  ctx.fillStyle = INK;
  ctx.font = font(700, 46);
  ctx.fillText(trim(data.name, 22), 226, 184);
  ctx.fillStyle = 'rgba(246,245,255,0.55)';
  ctx.font = font(500, 30);
  ctx.fillText(handleOf(data), 226, 226);

  ctx.fillStyle = INK;
  ctx.font = font(800, 196);
  ctx.letterSpacing = '-8px';
  ctx.fillText(fmt(copy, stats.total), 70, 440);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = 'rgba(246,245,255,0.6)';
  ctx.font = font(500, 34);
  ctx.fillText(`${units(copy, stats.total)} in ${data.year}`, 82, 492);

  drawIsoSkyline(ctx, data.days, stats.max, W / 2, 500);

  const cells: [string, string][] = [
    [
      'Longest streak',
      `${stats.streak.length} day${stats.streak.length === 1 ? '' : 's'}`,
    ],
    [
      'Busiest day',
      stats.busiest
        ? `${formatShortDay(stats.busiest.date)} · ${fmt(copy, stats.busiest.count)}`
        : '—',
    ],
    [copy.breakdownLabel, data.breakdown[0]?.name ?? '—'],
    ['Active days', `${stats.activeDays}`],
  ];
  cells.forEach(([label, value], i) => {
    const x = 80 + (i % 2) * 470;
    const y = 960 + Math.floor(i / 2) * 120;
    ctx.fillStyle = 'rgba(246,245,255,0.5)';
    ctx.font = font(500, 24);
    ctx.fillText(label.toUpperCase(), x, y);
    ctx.fillStyle = INK;
    ctx.font = font(700, 50);
    ctx.fillText(trim(value, 16), x, y + 58);
  });

  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.roundRect(70, 1196, W - 140, 92, 46);
  ctx.fill();
  ctx.fillStyle = BG;
  ctx.font = font(800, 44);
  ctx.textAlign = 'center';
  ctx.fillText(stats.archetype.title, W / 2, 1257);

  ctx.fillStyle = 'rgba(246,245,255,0.42)';
  ctx.font = font(500, 22);
  ctx.fillText(`${location.host}/wrapped`, W / 2, 1328);
  ctx.textAlign = 'left';

  return blob(canvas);
}

export async function renderVersusCard(
  a: WrappedData,
  b: WrappedData,
  v: Versus,
  copy: Copy,
  fontFamily: string,
): Promise<Blob | null> {
  await document.fonts?.ready;
  const made = canvasFor();
  if (!made) return null;
  const [canvas, ctx] = made;
  const font = (weight: number, size: number) =>
    `${weight} ${size}px ${fontFamily}`;

  backdrop(ctx, VS_A, VS_B);

  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = font(700, 26);
  ctx.letterSpacing = '6px';
  ctx.fillText(`WRAPPED ${a.year} · VERSUS`, W / 2, 92);
  ctx.letterSpacing = '0px';

  // the two corners
  const sides: [WrappedData, string, number][] = [
    [a, VS_A, 270],
    [b, VS_B, W - 270],
  ];
  for (const [d, color, x] of sides) {
    await drawAvatar(ctx, d, x, 230, 74, color, font);
    ctx.textAlign = 'center';
    ctx.fillStyle = INK;
    ctx.font = font(700, 40);
    ctx.fillText(trim(d.name, 16), x, 368);
    ctx.fillStyle = 'rgba(246,245,255,0.55)';
    ctx.font = font(500, 26);
    ctx.fillText(handleOf(d), x, 406);
  }
  ctx.fillStyle = 'rgba(246,245,255,0.35)';
  ctx.font = font(800, 54);
  ctx.fillText('VS', W / 2, 250);

  // verdict
  const winColor = v.winner === 'a' ? VS_A : v.winner === 'b' ? VS_B : INK;
  ctx.fillStyle = winColor;
  ctx.font = font(800, 92);
  ctx.letterSpacing = '-3px';
  ctx.fillText(verdictLine(v, a, b), W / 2, 540);
  ctx.letterSpacing = '0px';

  // the four rounds
  v.rounds.forEach((r, i) => {
    const y = 640 + i * 96;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.roundRect(70, y - 52, W - 140, 80, 20);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(246,245,255,0.5)';
    ctx.font = font(600, 20);
    ctx.fillText(r.title.toUpperCase(), W / 2, y - 4);
    ([0, 1] as const).forEach((s) => {
      const won = r.winner === (s ? 'b' : 'a');
      ctx.textAlign = s ? 'right' : 'left';
      ctx.fillStyle = won ? (s ? VS_B : VS_A) : 'rgba(246,245,255,0.45)';
      ctx.font = font(won ? 800 : 600, 34);
      ctx.fillText(trim(r.show[s], 18), s ? W - 104 : 104, y);
    });
  });

  // two years, side by side
  ctx.textAlign = 'left';
  // centered on however many weeks have happened so far
  const cols = (d: WrappedData) =>
    Math.ceil((d.days.length + weekdayOf(d.days[0]?.date ?? '2026-01-01')) / 7);
  const left = (W - Math.max(cols(a), cols(b)) * 17 + 3) / 2;
  drawHeatmap(ctx, a.days, v.max, left, 1030, VS_A);
  drawHeatmap(ctx, b.days, v.max, left, 1162, VS_B);

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(246,245,255,0.42)';
  ctx.font = font(500, 22);
  ctx.fillText(`${location.host}/wrapped · ${copy.source}`, W / 2, 1328);
  ctx.textAlign = 'left';

  return blob(canvas);
}
