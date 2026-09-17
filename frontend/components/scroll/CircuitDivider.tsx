'use client';

import type { JSX } from 'react';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export type CircuitDividerProps = {
  className?: string;
  color?: string; // default '#7dd3fc'
  height?: number; // svg height in px, default ~48
};

// Fixed viewBox width; preserveAspectRatio="none" stretches X to full width,
// while non-scaling strokes keep the line weight constant and the round-cap
// node dots perfectly circular at any container width.
const VB_W = 1200;

/**
 * Shared once per page (React 19 dedupes <style> by `href`). The trace draws in
 * via stroke-dashoffset; nodes fade in after it (group opacity + delay) then
 * pulse. prefers-reduced-motion drops every transition/animation so the reduced
 * state simply snaps to fully drawn.
 */
const CIRCUIT_CSS = `
.circuit-trace { transition: stroke-dashoffset 1200ms cubic-bezier(0.16, 1, 0.3, 1); }
.circuit-nodes { transition: opacity 600ms ease 900ms; }
.circuit-node { animation: circuitNodePulse 2.6s ease-in-out infinite; }
@keyframes circuitNodePulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .circuit-trace,
  .circuit-nodes { transition: none; }
  .circuit-node { animation: none; opacity: 1; }
}
`;

/**
 * Decorative circuit-trace divider for between page sections. Renders fully
 * drawn with no JS: the hidden state is gated on `!isInView && !reduced`, and
 * the hook reports `isInView: true` when IntersectionObserver is missing (SSR /
 * no-JS), so the server output is the drawn state.
 */
export function CircuitDivider({
  className,
  color = '#7dd3fc',
  height = 48,
}: CircuitDividerProps): JSX.Element {
  const reduced = useReducedMotion();
  const { ref, isInView } = useInViewOnce<SVGSVGElement>({ disabled: reduced });
  const undrawn = !isInView && !reduced;

  const mid = height / 2;
  const up = Math.round(height * 0.2);
  const dn = Math.round(height * 0.8);

  // Main line spans the full width with two right-angle bumps; two stubs branch
  // off to dead-end nodes. Dots (near-zero-length round-cap segments) sit on the
  // vertices and stub ends.
  const trace = `M0 ${mid} H210 V${up} H330 V${mid} H470 V${dn} H560 V${mid} H${VB_W} M780 ${mid} V${up} M960 ${mid} V${dn}`;
  const nodes = `M210 ${up} h0.01 M470 ${dn} h0.01 M780 ${up} h0.01 M960 ${dn} h0.01 M1176 ${mid} h0.01`;

  return (
    <>
      <style href="ieee-circuit" precedence="default">
        {CIRCUIT_CSS}
      </style>
      <svg
        ref={ref}
        aria-hidden
        className={`block w-full${className ? ` ${className}` : ''}`}
        width="100%"
        height={height}
        viewBox={`0 0 ${VB_W} ${height}`}
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          className="circuit-trace"
          d={trace}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: undrawn ? 1 : 0 }}
        />
        <g className="circuit-nodes" style={{ opacity: undrawn ? 0 : 1 }}>
          <path
            className="circuit-node"
            d={nodes}
            stroke={color}
            strokeWidth={7}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
    </>
  );
}
