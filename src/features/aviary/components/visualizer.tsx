'use client';

// audio-reactive visualizer — orb / bars / wave / ribbon
import { useEffect, useRef } from 'react';

type Variant = 'orb' | 'bars' | 'wave' | 'ribbon';

type Props = {
  variant: Variant;
  /** 0 = idle shimmer, 1 = full energy */
  active?: boolean;
  colors?: string[];
  seed?: number;
  className?: string;
};

const SPECTRUM = ['#5eead4', '#818cf8', '#f0abfc', '#fbbf72'];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16,
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(stops: string[], t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(scaled));
  const f = scaled - i;
  const a = hexToRgb(stops[i]);
  const b = hexToRgb(stops[i + 1]);
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(
    a[1] + (b[1] - a[1]) * f,
  )},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
}

/** rgb(a,b,c) -> rgba(a,b,c,alpha) */
function withAlpha(rgb: string, alpha: number) {
  return rgb.replace('rgb(', 'rgba(').replace(')', `,${alpha})`);
}

export function Visualizer({
  variant,
  active = true,
  colors = SPECTRUM,
  seed = 1,
  className,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    const start = performance.now();
    // eased energy — ramps toward target so play/pause feels physical
    let energy = active ? 1 : 0.18;

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const target = activeRef.current ? 1 : 0.18;
      energy += (target - energy) * 0.06;
      ctx.clearRect(0, 0, w, h);

      if (variant === 'orb') drawOrb(ctx, w, h, t, energy, colors, seed);
      else if (variant === 'bars') drawBars(ctx, w, h, t, energy, colors, seed);
      else if (variant === 'wave') drawWave(ctx, w, h, t, energy, colors, seed);
      else drawRibbon(ctx, w, h, t, energy, colors, seed);

      if (!reduce) raf = requestAnimationFrame(draw);
    };
    // paint one frame immediately so there is always content, even before
    // rAF starts (e.g. a hidden tab) or when motion is reduced
    draw(reduce ? start + 2000 : performance.now());

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // colors/seed/variant are stable per instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={ref} className={className ?? 'av-canvas'} />;
}

/* ——— the lyrebird orb: layered radial frequency rings ——— */
function drawOrb(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  e: number,
  colors: string[],
  seed: number,
) {
  const cx = w / 2;
  const cy = h / 2;
  const base = Math.min(w, h) * 0.3;
  const rings = 3;

  for (let r = 0; r < rings; r++) {
    const pts = 180;
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const n =
        Math.sin(a * 3 + t * 1.3 + r * 1.7 + seed) * 0.5 +
        Math.sin(a * 6 - t * 0.9 + seed * 2) * 0.28 +
        Math.sin(a * 11 + t * 2.1 + r) * 0.16;
      const radius =
        base * (1 + r * 0.26) + n * base * (0.18 + e * 0.42);
      const x = cx + Math.cos(a) * radius;
      const y = cy + Math.sin(a) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    const col = lerpColor(colors, r / (rings - 1));
    ctx.strokeStyle = col;
    ctx.globalAlpha = 0.5 - r * 0.1 + e * 0.3;
    ctx.lineWidth = 1.4;
    ctx.shadowBlur = 24 * e;
    ctx.shadowColor = col;
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // glowing core
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 1.1);
  grad.addColorStop(0, `rgba(255,255,255,${0.14 + e * 0.22})`);
  grad.addColorStop(0.4, withAlpha(lerpColor(colors, 0.4), 0.33));
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, base * 1.1, 0, Math.PI * 2);
  ctx.fill();

  // orbiting sparks
  for (let i = 0; i < 5; i++) {
    const a = t * (0.4 + i * 0.12) + i * 1.9 + seed;
    const rad = base * (1.3 + Math.sin(t + i) * 0.1);
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    ctx.beginPath();
    ctx.arc(x, y, 1.6 + e * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = lerpColor(colors, i / 4);
    ctx.globalAlpha = 0.5 + e * 0.5;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ——— spectrogram bars ——— */
function drawBars(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  e: number,
  colors: string[],
  seed: number,
) {
  const count = Math.max(28, Math.floor(w / 11));
  const gap = 3;
  const bw = (w - gap * (count - 1)) / count;
  for (let i = 0; i < count; i++) {
    const p = i / count;
    const env = Math.sin(p * Math.PI); // taller in middle
    const n =
      Math.sin(i * 0.5 + t * 4 + seed) * 0.5 +
      Math.sin(i * 0.23 - t * 2.3) * 0.3 +
      Math.sin(i * 0.9 + t * 6) * 0.2;
    const mag = (0.18 + Math.abs(n) * (0.25 + e * 0.75)) * env;
    const bh = Math.max(2, mag * h);
    const x = i * (bw + gap);
    const y = (h - bh) / 2;
    const col = lerpColor(colors, p);
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.35 + e * 0.6;
    roundRect(ctx, x, y, bw, bh, Math.min(bw / 2, 3));
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ——— flowing waveform line ——— */
function drawWave(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  e: number,
  colors: string[],
  seed: number,
) {
  const cy = h / 2;
  const layers = 3;
  for (let l = 0; l < layers; l++) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const p = x / w;
      const env = Math.sin(p * Math.PI);
      const y =
        cy +
        Math.sin(p * 10 + t * 2 + l * 2 + seed) *
          h *
          0.18 *
          env *
          (0.4 + e) +
        Math.sin(p * 22 - t * 3 + l) * h * 0.06 * env * e;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    const col = lerpColor(colors, l / (layers - 1));
    ctx.strokeStyle = col;
    ctx.globalAlpha = 0.3 + l * 0.2 + e * 0.2;
    ctx.lineWidth = 1.6;
    ctx.shadowBlur = 16 * e;
    ctx.shadowColor = col;
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

/* ——— flowing ribbon field (beyond speech) ——— */
function drawRibbon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  e: number,
  colors: string[],
  seed: number,
) {
  const lines = 26;
  for (let l = 0; l < lines; l++) {
    const p = l / lines;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 6) {
      const xp = x / w;
      const y =
        h * p +
        Math.sin(xp * 6 + t * 1.2 + p * 8 + seed) * 18 * (0.5 + e) +
        Math.sin(xp * 3 - t * 0.7 + p * 4) * 14;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = lerpColor(colors, p);
    ctx.globalAlpha = 0.14 + e * 0.22;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
