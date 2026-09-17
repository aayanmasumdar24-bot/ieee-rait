'use client';

import { animate } from 'animejs';
import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export type StatTickerProps = {
  value: string;
  label: string;
  durationMs?: number;
  className?: string;
};

/** First run of digits, separators included: '460,000' -> '460,000', '190+' -> '190'. */
const CORE_PATTERN = /\d(?:[\d.,']*\d)?/;

/**
 * Fills `template`'s digit slots from the right with `digits`, so every frame
 * carries the input's own grouping and nothing else: '460,000' ticks through
 * '12,345', while '1963' ticks through '742' with no separator invented.
 */
function fillTemplate(template: string, digits: string): string {
  let out = '';
  let cursor = digits.length - 1;
  for (let i = template.length - 1; i >= 0 && cursor >= 0; i -= 1) {
    const char = template[i];
    const isDigitSlot = char >= '0' && char <= '9';
    out = (isDigitSlot ? digits[cursor--] : char) + out;
  }
  return out;
}

/**
 * A single stat that counts up once on entry.
 *
 * The final string is what React renders, on the server and on every re-render:
 * crawlers, no-JS readers and reduced-motion users all get the real number, and
 * there is no frame where the markup says 0. The count-up is a post-mount DOM
 * side effect written straight to the node via a ref — React state at 60fps
 * would be 60 re-renders of the whole subtree for one string.
 */
export function StatTicker({
  value,
  label,
  durationMs = 1600,
  className,
}: StatTickerProps): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const { ref, isInView } = useInViewOnce<HTMLDivElement>({ disabled: prefersReducedMotion });
  const numberRef = useRef<HTMLSpanElement | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion || !isInView || hasRun.current) return;

    const element = numberRef.current;
    const match = CORE_PATTERN.exec(value);
    if (!element || !match) return;
    hasRun.current = true;

    const core = match[0];
    const prefix = value.slice(0, match.index);
    const suffix = value.slice(match.index + core.length);
    const write = (current: number) => {
      element.textContent = prefix + fillTemplate(core, String(Math.round(current))) + suffix;
    };

    const state = { count: 0 };
    write(state.count);
    const animation = animate(state, {
      count: Number(core.replace(/\D/g, '')),
      duration: durationMs,
      ease: 'outExpo',
      onUpdate: () => write(state.count),
      // Land on the source string rather than on whatever rounding produced,
      // so '460,000' ends as '460,000' exactly.
      onComplete: () => {
        element.textContent = value;
      },
    });

    return () => {
      animation.revert();
      element.textContent = value;
    };
  }, [isInView, prefersReducedMotion, value, durationMs]);

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-2.5 border-l-2 border-white/10 pl-4${
        className ? ` ${className}` : ''
      }`}
    >
      <span
        ref={numberRef}
        className="font-retro text-[clamp(1.25rem,1rem+1.3vw,2rem)] leading-none tabular-nums"
      >
        {value}
      </span>
      <span className="font-body text-[0.6875rem] uppercase leading-tight tracking-[0.2em] text-white/45">
        {label}
      </span>
    </div>
  );
}
