'use client';
import { motion, type Variants } from 'motion/react';

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

export const rise: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -14,
    filter: 'blur(6px)',
    transition: { duration: 0.28 },
  },
};

export const M = motion.div;

export function Kicker({
  n,
  children,
}: {
  n: number;
  children: React.ReactNode;
}) {
  return (
    <M variants={rise} className="gw-kicker">
      {n > 0 && <span>{String(n).padStart(2, '0')}</span>}
      {children}
    </M>
  );
}
