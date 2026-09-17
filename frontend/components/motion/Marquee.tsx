import type { CSSProperties, JSX } from 'react';

export type MarqueeProps = {
  items: readonly string[];
  direction?: 'left' | 'right';
  durationSec?: number;
  className?: string;
};

/**
 * One shared keyframe set for every instance on the page — React 19 dedupes the
 * <style> by `href`, so N marquees still emit one rule block. Speed and heading
 * ride in as inline custom properties instead of per-instance keyframes, which
 * is what stops two marquees from overwriting each other's animation.
 *
 * The track holds the item list twice, so translating it by exactly -50% lands
 * copy two where copy one started: the loop has no seam and needs no measuring.
 */
const MARQUEE_CSS = `
.ieee-marquee {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
}
.ieee-marquee-track {
  display: flex;
  width: max-content;
  animation: ieee-marquee-scroll var(--ieee-marquee-duration) linear infinite;
  animation-direction: var(--ieee-marquee-direction);
}
.ieee-marquee:hover .ieee-marquee-track,
.ieee-marquee:focus-within .ieee-marquee-track {
  animation-play-state: paused;
}
@keyframes ieee-marquee-scroll {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .ieee-marquee-track { animation: none; }
}
`;

/**
 * A decorative infinite ticker. Pure CSS: no JS animation loop, no scroll
 * listener, so it costs nothing on the main thread and runs before hydration.
 */
export function Marquee({
  items,
  direction = 'left',
  durationSec = 40,
  className,
}: MarqueeProps): JSX.Element {
  // Custom properties are not in CSSProperties' key set; the cast is the
  // narrowest way to pass them without reaching for `any`.
  const instanceStyle = {
    '--ieee-marquee-duration': `${durationSec}s`,
    '--ieee-marquee-direction': direction === 'right' ? 'reverse' : 'normal',
  } as CSSProperties;

  const copy = (isDuplicate: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={isDuplicate || undefined}>
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="flex shrink-0 items-center">
          <span className="font-retro text-[0.5rem] uppercase leading-none tracking-[0.4em]">
            {item}
          </span>
          <span className="mx-5 size-[3px] shrink-0 bg-current opacity-40" />
        </span>
      ))}
    </div>
  );

  return (
    <div
      aria-hidden
      className={`ieee-marquee${className ? ` ${className}` : ''}`}
      style={instanceStyle}
    >
      <style href="ieee-marquee" precedence="default">
        {MARQUEE_CSS}
      </style>
      <div className="ieee-marquee-track">
        {copy(false)}
        {copy(true)}
      </div>
    </div>
  );
}
