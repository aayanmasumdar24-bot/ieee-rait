'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export type ScrollProgressProps = {
  className?: string;
  /** Any CSS color; defaults to the inherited text color. */
  color?: string;
};

const TRACK: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: 2,
  zIndex: 60,
  pointerEvents: 'none',
};

export function ScrollProgress({ className, color = 'currentColor' }: ScrollProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const bar = barRef.current;
    if (!bar) return;

    let frame = 0;

    const paint = () => {
      frame = 0;
      const root = document.documentElement;
      const scrollable = root.scrollHeight - root.clientHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      bar.style.transform = `scaleX(${progress})`;
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div aria-hidden="true" className={className} style={TRACK}>
      <div
        ref={barRef}
        style={{
          height: '100%',
          background: color,
          transform: 'scaleX(0)',
          transformOrigin: '0 50%',
        }}
      />
    </div>
  );
}
