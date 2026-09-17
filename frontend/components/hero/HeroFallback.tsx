import type { JSX } from 'react';

export type HeroFallbackProps = { className?: string };

// Pure CSS/SVG on ink — no three, no canvas, no JS. Renders as the dynamic-import
// loading state, under reduced-motion, and when WebGL is missing, so it must look
// intentional on its own and never blank. It sits BEHIND hero text.
const GRID_CYAN = 'rgba(125,211,252,0.07)';

const blueprint = {
  backgroundImage: `
    repeating-linear-gradient(0deg, ${GRID_CYAN} 0 1px, transparent 1px 40px),
    repeating-linear-gradient(90deg, ${GRID_CYAN} 0 1px, transparent 1px 40px)
  `,
  // Fade the grid out toward the edges so it reads as atmosphere, not a table.
  maskImage: 'radial-gradient(120% 90% at 68% 50%, #000 30%, transparent 78%)',
  WebkitMaskImage: 'radial-gradient(120% 90% at 68% 50%, #000 30%, transparent 78%)',
} as const;

const glow = {
  background:
    'radial-gradient(38% 46% at 72% 50%, rgba(125,211,252,0.20), rgba(125,211,252,0.06) 45%, transparent 72%)',
} as const;

export function HeroFallback({ className }: HeroFallbackProps): JSX.Element {
  return (
    <div
      aria-hidden
      className={['absolute inset-0 overflow-hidden bg-[#05070d]', className]
        .filter(Boolean)
        .join(' ')}
      style={{ pointerEvents: 'none' }}
    >
      <div className="absolute inset-0" style={blueprint} />
      <div className="absolute inset-0" style={glow} />

      {/* Static circuit traces + nodes where the 3D robot would sit (center-right). */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g stroke="#7dd3fc" strokeWidth="0.18" strokeOpacity="0.5">
          <polyline points="58,22 70,22 70,40 80,40" />
          <polyline points="62,74 62,58 76,58 76,48" />
          <polyline points="84,30 84,66 72,66" />
          <line x1="70" y1="40" x2="70" y2="48" strokeOpacity="0.3" />
        </g>
        <g>
          <circle cx="70" cy="22" r="0.9" fill="#7dd3fc" />
          <circle cx="80" cy="40" r="1.1" fill="#fcd34d" />
          <circle cx="76" cy="48" r="0.9" fill="#6ee7b7" />
          <circle cx="62" cy="58" r="0.8" fill="#7dd3fc" />
          <circle cx="84" cy="30" r="0.7" fill="#7dd3fc" fillOpacity="0.7" />
          <circle cx="72" cy="66" r="1" fill="#fcd34d" fillOpacity="0.85" />
        </g>
        {/* Faint hint of the robot mass: a wireframe torso block. */}
        <rect
          x="64"
          y="38"
          width="16"
          height="20"
          rx="1.5"
          stroke="#7dd3fc"
          strokeWidth="0.2"
          strokeOpacity="0.28"
        />
      </svg>
    </div>
  );
}
