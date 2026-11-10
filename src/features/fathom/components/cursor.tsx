'use client';

import { useEffect, useRef } from 'react';
import { motion, useSpring } from 'motion/react';

/** A trailing ring that swells and labels itself over interactive things. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ring.current;
    if (!element || !window.matchMedia('(pointer: fine)').matches) return;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let frame = 0;
    let shown = false;
    const move = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!shown) {
        shown = true;
        x = targetX;
        y = targetY;
        element.dataset.shown = 'true';
      }
      const hit =
        event.target instanceof Element
          ? event.target.closest('a, button, [data-cursor]')
          : null;
      element.dataset.active = hit ? 'true' : 'false';
      if (label.current)
        label.current.textContent = hit?.getAttribute('data-cursor') ?? '';
    };
    const tick = () => {
      x += (targetX - x) * 0.18;
      y += (targetY - y) * 0.18;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', move, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
    };
  }, []);

  return (
    <div ref={ring} className="fathom-cursor" aria-hidden="true">
      <span ref={label} />
    </div>
  );
}

/** A button that leans toward the pointer. */
export function Magnetic({
  children,
  className,
  onClick,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
  label?: string;
}) {
  const x = useSpring(0, { stiffness: 180, damping: 14 });
  const y = useSpring(0, { stiffness: 180, damping: 14 });
  return (
    <motion.button
      type="button"
      className={className}
      data-cursor={label}
      style={{ x, y }}
      onClick={onClick}
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse') return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) * 0.35);
        y.set((event.clientY - rect.top - rect.height / 2) * 0.35);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.button>
  );
}
