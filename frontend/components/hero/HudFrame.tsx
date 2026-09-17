'use client';

import type { JSX } from 'react';

export type HudFrameProps = {
  className?: string;
  tag?: string; // small corner label, e.g. 'IEEE RAIT // SYS'
  readouts?: readonly string[]; // telemetry lines, e.g. ['LAT 19.0330', 'SYS ONLINE']
};

const DEFAULT_TAG = 'IEEE RAIT // SYS';
const DEFAULT_READOUTS = ['LAT 19.0330', 'LON 73.0297', 'SYS ONLINE'] as const;

// L-shaped corner brackets: two borders per span, one per corner.
const BRACKETS = [
  'left-2.5 top-2.5 border-l-2 border-t-2',
  'right-2.5 top-2.5 border-r-2 border-t-2',
  'bottom-2.5 left-2.5 border-b-2 border-l-2',
  'bottom-2.5 right-2.5 border-b-2 border-r-2',
] as const;

/**
 * Shared once per page — React 19 dedupes <style> by `href`, so N HUD frames
 * still emit one rule block. The sweep rides on transform + opacity only, and
 * 100cqh (the track is a size container) lets one keyframe span any frame
 * height without measuring. prefers-reduced-motion freezes both animations.
 */
const HUD_CSS = `
.hud-sweep-track { container-type: size; }
.hud-sweep-line {
  position: absolute; left: 0; right: 0; top: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(125, 211, 252, 0.9), transparent);
  box-shadow: 0 0 10px 1px rgba(125, 211, 252, 0.45);
  animation: hudSweep 7s linear infinite;
}
@keyframes hudSweep {
  0% { transform: translateY(0); opacity: 0; }
  10%, 90% { opacity: 0.8; }
  100% { transform: translateY(100cqh); opacity: 0; }
}
.hud-blink { animation: hudBlink 1.8s steps(1, end) infinite; }
@keyframes hudBlink {
  0%, 55% { opacity: 1; }
  56%, 100% { opacity: 0.2; }
}
@media (prefers-reduced-motion: reduce) {
  .hud-sweep-line { animation: none; opacity: 0; }
  .hud-blink { animation: none; opacity: 1; }
}
`;

/**
 * Decorative sci-fi HUD overlay for the hero. Purely presentational: the caller
 * gives it a positioned parent, this renders pointer-events-none + aria-hidden
 * so it never traps focus or clicks. Every prop has a sensible default.
 */
export function HudFrame({
  className,
  tag = DEFAULT_TAG,
  readouts = DEFAULT_READOUTS,
}: HudFrameProps): JSX.Element {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 select-none${className ? ` ${className}` : ''}`}
    >
      <style href="ieee-hud" precedence="default">
        {HUD_CSS}
      </style>

      {/* Hairline frame inset from the edges. */}
      <span className="absolute inset-2.5 border border-[#7dd3fc]/15" />

      {/* Corner brackets. */}
      {BRACKETS.map((corner) => (
        <span key={corner} className={`absolute h-6 w-6 border-[#7dd3fc]/70 ${corner}`} />
      ))}

      {/* Slow vertical scan sweep, clipped to the frame. */}
      <div className="hud-sweep-track absolute inset-2.5 overflow-hidden">
        <span className="hud-sweep-line" />
      </div>

      {/* Tag + blinking status dot, top-left. */}
      <div className="absolute left-5 top-4 flex items-center gap-2">
        <span className="hud-blink h-1.5 w-1.5 rounded-full bg-[#6ee7b7]" />
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.3em] text-[#7dd3fc]/70">
          {tag}
        </span>
      </div>

      {/* Telemetry readouts, bottom-left. */}
      <ul className="absolute bottom-4 left-5 space-y-1">
        {readouts.map((line) => (
          <li
            key={line}
            className="font-mono-tech text-[10px] leading-none tracking-[0.2em] text-[#7dd3fc]/45"
          >
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
