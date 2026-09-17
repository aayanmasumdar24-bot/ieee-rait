'use client';

import { createTimeline } from 'animejs';
import { ScrollScrub } from './ScrollScrub';

export type ParallaxTownProps = {
  className?: string;
  /** Multiplies every layer's travel. `0` freezes the camera, `1` is tuned. */
  intensity?: number;
};

const TOWN_SRC = '/background.png';
const SCRUB_MS = 1000;
const INK = '#05070d';

type TownLayer = {
  /** Negative `inset`: how far the layer bleeds past the frame on every side. */
  overhang: string;
  /** Pan range, as a percentage of the layer's own box, so it stays responsive. */
  panX: number;
  panY: number;
  opacity: number;
  blurPx: number;
  /** Feathers the layer in, so a deliberate mismatch reads as haze, not a seam. */
  mask?: string;
};

/**
 * Three reads of one asset, panning at three rates — that difference is the
 * whole depth cue. The far layer is the town; the two faster ones are kept to
 * the lower band, where the diagonal shore is, and float over it.
 *
 * `overhang` must exceed that layer's pan, or translating it exposes an empty
 * edge — which is why it grows in step with `panX`/`panY`.
 */
const LAYERS: readonly TownLayer[] = [
  { overhang: '-7%', panX: 2.2, panY: 1.4, opacity: 1, blurPx: 0 },
  {
    overhang: '-13%',
    panX: 5,
    panY: 3,
    opacity: 0.55,
    blurPx: 2,
    mask: 'linear-gradient(to bottom, transparent 44%, #000 74%)',
  },
  {
    overhang: '-20%',
    panX: 9,
    panY: 5.5,
    opacity: 0.3,
    blurPx: 3,
    mask: 'linear-gradient(to bottom, transparent 66%, #000 94%)',
  },
];

/**
 * The town drifting at scroll-linked depth. Drop-in replacement for a plain
 * pinned visual: it fills its parent, so `<StickyScene visual={<ParallaxTown />}>`
 * is the intended use.
 *
 * The ink scrim, the top/bottom fade and the scanline sit outside the scrubbed
 * subtree on purpose — they are the reason text over this stays readable, and
 * they must not depend on any animation having run.
 */
export function ParallaxTown({ className, intensity = 1 }: ParallaxTownProps) {
  const build = (root: HTMLElement) => {
    const timeline = createTimeline({
      autoplay: false,
      defaults: { ease: 'linear', duration: SCRUB_MS },
    });

    LAYERS.forEach((layer, index) => {
      const element = root.querySelector<HTMLElement>(`[data-town-layer="${index}"]`);
      if (!element) return;
      const x = layer.panX * intensity;
      const y = layer.panY * intensity;
      timeline.add(element, { x: [`${-x}%`, `${x}%`], y: [`${-y}%`, `${y}%`] }, 0);
    });

    return timeline;
  };

  return (
    <div
      aria-hidden
      className={`relative h-full w-full overflow-hidden${className ? ` ${className}` : ''}`}
    >
      <ScrollScrub className="absolute inset-0" build={build}>
        {LAYERS.map((layer, index) => (
          <span
            key={layer.overhang}
            data-town-layer={index}
            className="absolute block"
            style={{
              inset: layer.overhang,
              backgroundImage: `url('${TOWN_SRC}')`,
              // The art is authored for the whole frame. `cover` / `contain`
              // both crop or letterbox it, and the first thing `cover` loses is
              // the centre building and the two side houses — the subject.
              // Stretching to the box is correct here, not a shortcut.
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              opacity: layer.opacity,
              filter: layer.blurPx ? `blur(${layer.blurPx}px)` : undefined,
              maskImage: layer.mask,
              WebkitMaskImage: layer.mask,
            }}
          />
        ))}
      </ScrollScrub>

      <div className="absolute inset-0" style={{ backgroundColor: `${INK}b3` }} />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `linear-gradient(to bottom, ${INK}, transparent, ${INK})` }}
      />
      <div className="scanline absolute inset-0 opacity-20" />
    </div>
  );
}
