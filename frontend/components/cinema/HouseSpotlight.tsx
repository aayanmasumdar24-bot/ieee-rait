'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export type HouseSpotlightProps = {
  /**
   * Accent of the house currently in view — any CSS colour. Controlled: the
   * caller owns step tracking (`StickyScene`'s `onStepChange` already does it),
   * so there is no second observer in here.
   */
  accent: string;
  className?: string;
};

const FADE_MS = 520;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
/** Full-strength accent in the gradient; the wrapper's opacity is the dimmer. */
const REST_OPACITY = 0.32;

/** Bloom off the houses, plus a low wash rising from the shore. */
function wash(accent: string): string {
  return [
    `radial-gradient(58% 42% at 50% 56%, ${accent} 0%, transparent 68%)`,
    `radial-gradient(120% 55% at 50% 108%, ${accent} 0%, transparent 62%)`,
  ].join(', ');
}

/**
 * The accent wash behind the active house. Two stacked layers: the front one is
 * declarative and always holds the current accent, the ghost is written to
 * imperatively and only ever holds the outgoing one on its way to nothing.
 *
 * Both layers' resting opacities are their declared values, so a cancelled or
 * never-started animation lands exactly where the markup already says — there
 * is no fill-forwards state to clean up.
 */
export function HouseSpotlight({ accent, className }: HouseSpotlightProps) {
  const prefersReducedMotion = useReducedMotion();
  const frontRef = useRef<HTMLSpanElement | null>(null);
  const ghostRef = useRef<HTMLSpanElement | null>(null);
  const prevAccentRef = useRef(accent);

  useEffect(() => {
    const previous = prevAccentRef.current;
    prevAccentRef.current = accent;

    const front = frontRef.current;
    const ghost = ghostRef.current;
    if (previous === accent || !front || !ghost) return;
    if (prefersReducedMotion || typeof front.animate !== 'function') return;

    ghost.style.backgroundImage = wash(previous);
    const options: KeyframeAnimationOptions = { duration: FADE_MS, easing: EASE };
    const fadeIn = front.animate([{ opacity: 0 }, { opacity: 1 }], options);
    const fadeOut = ghost.animate([{ opacity: 1 }, { opacity: 0 }], options);

    return () => {
      fadeIn.cancel();
      fadeOut.cancel();
    };
  }, [accent, prefersReducedMotion]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0${className ? ` ${className}` : ''}`}
      style={{ opacity: REST_OPACITY }}
    >
      <span
        ref={frontRef}
        className="absolute inset-0 block"
        style={{ backgroundImage: wash(accent) }}
      />
      {/* No declared background: it is set imperatively to the outgoing accent. */}
      <span ref={ghostRef} className="absolute inset-0 block" style={{ opacity: 0 }} />
    </div>
  );
}
