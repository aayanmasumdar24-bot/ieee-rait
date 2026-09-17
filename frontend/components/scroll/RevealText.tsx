'use client';

import type { ComponentType, CSSProperties, ElementType, ReactNode, Ref } from 'react';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export type RevealTextProps = {
  /** One entry per visual line; each line reveals after the previous one. */
  lines: string[];
  as?: ElementType;
  staggerMs?: number;
  className?: string;
};

/**
 * `as` stays `ElementType` publicly; at the JSX site the tag is cast to this
 * concrete type so it stops resolving against @react-three/fiber's ambient
 * `JSX.IntrinsicElements` augmentation (which otherwise collapses the tag's
 * props to `never` once R3F is anywhere in the program).
 */
type HeadingTagProps = {
  ref?: Ref<HTMLElement>;
  className?: string;
  children?: ReactNode;
};

const DURATION_MS = 700;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

// Lines stay real DOM text in reading order, so the accessible name is the
// whole headline — no aria-hidden fragments to reassemble.
const PLAIN_LINE: CSSProperties = { display: 'block' };

function lineStyle(isInView: boolean, delayMs: number): CSSProperties {
  return {
    display: 'block',
    opacity: isInView ? 1 : 0,
    transform: isInView ? 'none' : 'translate3d(0, 0.5em, 0)',
    transition: `opacity ${DURATION_MS}ms ${EASE} ${delayMs}ms, transform ${DURATION_MS}ms ${EASE} ${delayMs}ms`,
    willChange: isInView ? undefined : 'opacity, transform',
  };
}

export function RevealText({
  lines,
  as: Tag = 'h2',
  staggerMs = 90,
  className,
}: RevealTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref, isInView } = useInViewOnce<HTMLElement>({ disabled: prefersReducedMotion });

  const Component = Tag as unknown as ComponentType<HeadingTagProps>;

  return (
    <Component ref={ref as Ref<HTMLElement>} className={className}>
      {lines.map((line, index) => (
        <span
          key={`${index}-${line}`}
          data-reveal=""
          style={prefersReducedMotion ? PLAIN_LINE : lineStyle(isInView, index * staggerMs)}
        >
          {line}
        </span>
      ))}
    </Component>
  );
}
