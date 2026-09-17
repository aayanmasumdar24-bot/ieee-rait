'use client';

import type { ComponentType, CSSProperties, ElementType, ReactNode, Ref } from 'react';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export type RevealFrom = 'up' | 'down' | 'left' | 'right' | 'scale';

export type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  from?: RevealFrom;
  delayMs?: number;
  className?: string;
};

/**
 * What we actually pass to the polymorphic tag. `as` stays `ElementType` in the
 * public API, but at the JSX site the tag is cast to this concrete component
 * type: @react-three/fiber v9 ambiently augments `JSX.IntrinsicElements`, and a
 * bare `ElementType` tag then resolves against that polluted union and collapses
 * these props to `never`. The cast sidesteps intrinsic-union resolution.
 */
type RevealTagProps = {
  ref?: Ref<HTMLElement>;
  'data-reveal'?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

const DURATION_MS = 620;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

const HIDDEN_TRANSFORM: Record<RevealFrom, string> = {
  up: 'translate3d(0, 28px, 0)',
  down: 'translate3d(0, -28px, 0)',
  left: 'translate3d(-28px, 0, 0)',
  right: 'translate3d(28px, 0, 0)',
  scale: 'scale(0.94)',
};

export function Reveal({
  children,
  as: Tag = 'div',
  from = 'up',
  delayMs = 0,
  className,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref, isInView } = useInViewOnce<HTMLElement>({ disabled: prefersReducedMotion });

  const style: CSSProperties | undefined = prefersReducedMotion
    ? undefined
    : {
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'none' : HIDDEN_TRANSFORM[from],
        transition: `opacity ${DURATION_MS}ms ${EASE} ${delayMs}ms, transform ${DURATION_MS}ms ${EASE} ${delayMs}ms`,
        willChange: isInView ? undefined : 'opacity, transform',
      };

  const Component = Tag as unknown as ComponentType<RevealTagProps>;

  return (
    // data-reveal is always present so a <noscript> stylesheet can force
    // opacity/transform back on the element that carries the inline style.
    <Component ref={ref as Ref<HTMLElement>} data-reveal="" className={className} style={style}>
      {children}
    </Component>
  );
}
