'use client';

import { animate, stagger, steps } from 'animejs';
import type { StaggerParams } from 'animejs';
import { ScrollScrub } from './ScrollScrub';

export type PixelDissolveDirection = 'down' | 'up' | 'center' | 'random';

export type PixelDissolveProps = {
  /**
   * Nominal tile edge in CSS px against a 1440x900 frame. The grid is a fixed
   * column/row count derived from it, then stretched to whatever the real box
   * is — so no measurement, no layout state, identical markup on the server.
   * Clamped: see MIN_TILE_PX and MAX_TILES.
   */
  tileSize?: number;
  /** Tile colour. Defaults to the page ground, so the wipe reads as a blackout. */
  color?: string;
  className?: string;
  /** Where the wipe starts from. */
  direction?: PixelDissolveDirection;
};

/** Reference frame the nominal tile size is measured against. */
const REF_W = 1440;
const REF_H = 900;
/** Below this a 1440px-wide frame runs into four figures of DOM nodes. */
const MIN_TILE_PX = 40;
/** Hard ceiling on tiles. 80px default lands at 18x11 = 198, well under it. */
const MAX_TILES = 360;
/** Per-tile fade. The stagger span is kept a multiple of this, below. */
const TILE_MS = 90;
/** Stagger span as a multiple of TILE_MS. Under ~1 the wipe reads as a plain fade. */
const SPAN_RATIO = 2.4;

const ORIGIN: Record<PixelDissolveDirection, StaggerParams['from']> = {
  down: 'first',
  up: 'last',
  center: 'center',
  random: 'random',
};

/** Pure: columns and rows for a nominal tile edge, clamped to MAX_TILES. */
function gridFor(tileSize: number): { cols: number; rows: number } {
  const edge = Math.max(tileSize, MIN_TILE_PX);
  const cols = Math.max(4, Math.round(REF_W / edge));
  const rows = Math.max(3, Math.round(REF_H / edge));
  const over = Math.sqrt((cols * rows) / MAX_TILES);
  if (over <= 1) return { cols, rows };
  return { cols: Math.max(4, Math.floor(cols / over)), rows: Math.max(3, Math.floor(rows / over)) };
}

/**
 * A section boundary wiping past as a grid of tiles: each one snaps in and back
 * out in stepped increments, ordered by grid distance from `direction`'s origin,
 * so the whole thing reads as a pixel wipe rather than a crossfade.
 *
 * Overlays its nearest positioned ancestor. Every tile starts and ends fully
 * transparent, and deliberately carries no `data-reveal` — the repo's noscript
 * rule forces `[data-reveal]` elements to `opacity: 1`, which on a curtain would
 * paint a solid block over the copy it is supposed to be revealing.
 */
export function PixelDissolve({
  tileSize = 80,
  color = '#05070d',
  className,
  direction = 'down',
}: PixelDissolveProps) {
  const { cols, rows } = gridFor(tileSize);
  const total = cols * rows;
  const step = (TILE_MS * SPAN_RATIO) / (cols + rows);

  const build = (root: HTMLElement) =>
    animate(root.querySelectorAll<HTMLElement>('[data-tile]'), {
      opacity: [
        { to: 1, duration: TILE_MS * 0.45, ease: steps(4) },
        { to: 0, duration: TILE_MS * 0.55, ease: steps(4) },
      ],
      delay: stagger(step, { grid: [cols, rows], from: ORIGIN[direction] }),
      autoplay: false,
    });

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0${className ? ` ${className}` : ''}`}
    >
      <ScrollScrub className="absolute inset-0" build={build}>
        <div
          // `color` on the container paints nothing; the tiles pick it up via
          // `bg-current`, which keeps their markup to two static classes.
          style={{
            color,
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            height: '100%',
            width: '100%',
          }}
        >
          {Array.from({ length: total }, (_unused, index) => (
            // `opacity: 0` is inline, not a utility class: it is the only thing
            // standing between a failed animation and an opaque block over the
            // copy, so it must not depend on a class being generated. anime.js
            // overwrites it while scrubbing and removes it again on revert.
            <span key={index} data-tile="" className="block bg-current" style={{ opacity: 0 }} />
          ))}
        </div>
      </ScrollScrub>
    </div>
  );
}
