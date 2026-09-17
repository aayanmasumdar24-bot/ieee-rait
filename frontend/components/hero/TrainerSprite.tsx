'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';

const SHEET_COLS = 4;
const SHEET_ROWS = 4;
const ROW_DOWN = 0;
const ROW_RIGHT = 1;
const ROW_LEFT = 2;

/** 125ms matches the frameRate: 8 walk cycle MainScene uses in the game. */
const FRAME_MS = 125;
const SPEED_PX_PER_SEC = 54;
/** How much of the band the walk covers, leaving a margin at both ends. */
const TRAVEL_RATIO = 0.92;
/** A backgrounded tab hands back one huge delta; cap it so nobody teleports. */
const MAX_DELTA_MS = 64;

/** Feet sit at ~86% down a 256px frame — MainScene's body box is y 120..220. */
const FEET_RATIO = 0.14;

const SHADOW_PATTERN: readonly (readonly number[])[] = [
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
];

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToMotionPreference(onChange: () => void): () => void {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

type Props = {
  /** Rendered edge of one frame, in px. The sheet is 4x4 frames of 256px. */
  size?: number;
};

export function TrainerSprite({ size = 96 }: Props) {
  const bandRef = useRef<HTMLDivElement | null>(null);
  const actorRef = useRef<HTMLDivElement | null>(null);
  const spriteRef = useRef<HTMLDivElement | null>(null);
  // Server snapshot assumes motion is fine; hydration corrects it if not.
  const isReduced = useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );

  useEffect(() => {
    const band = bandRef.current;
    const actor = actorRef.current;
    const sprite = spriteRef.current;
    if (!band || !actor || !sprite) return;

    if (isReduced) {
      actor.style.transform = 'translate3d(0px, 0px, 0px)';
      sprite.style.backgroundPosition = `0px -${ROW_DOWN * size}px`;
      return;
    }

    let travel = Math.max(0, band.clientWidth - size) * TRAVEL_RATIO;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      travel = Math.max(0, width - size) * TRAVEL_RATIO;
    });
    observer.observe(band);

    let frameId = 0;
    let last = performance.now();
    let x = 0;
    let direction = 1;
    let clock = 0;

    const tick = (now: number) => {
      const delta = Math.min(now - last, MAX_DELTA_MS);
      last = now;
      clock += delta;
      x += (direction * SPEED_PX_PER_SEC * delta) / 1000;

      if (x >= travel) {
        x = travel;
        direction = -1;
      } else if (x <= 0) {
        x = 0;
        direction = 1;
      }

      const col = Math.floor(clock / FRAME_MS) % SHEET_COLS;
      const row = direction > 0 ? ROW_RIGHT : ROW_LEFT;
      actor.style.transform = `translate3d(${Math.round(x)}px, 0px, 0px)`;
      sprite.style.backgroundPosition = `-${col * size}px -${row * size}px`;
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [isReduced, size]);

  const pixel = Math.max(2, Math.floor(size / 16));
  const shadowBottom = Math.round(size * FEET_RATIO - pixel * 1.5);

  return (
    <div
      ref={bandRef}
      aria-hidden
      /* Percentages, because the backdrop is object-fit: fill — the same
         percentage lands on the same painted ground at every aspect ratio.
         Narrow viewports park the walk below the copy; lg puts it on the road
         beside the headline, in the band the text block never reaches. */
      className="pointer-events-none absolute bottom-[9%] left-[56%] right-[5%] h-0 select-none sm:bottom-[13%] sm:left-[60%] lg:bottom-[53%] lg:left-[54%] lg:right-[6%]"
    >
      <div ref={actorRef} className="absolute bottom-0 left-0 will-change-transform">
        <div
          className="absolute left-1/2 grid"
          style={{
            bottom: shadowBottom,
            gridTemplateColumns: `repeat(${SHADOW_PATTERN[0].length}, ${pixel}px)`,
            transform: 'translate(-50%, 0)',
          }}
        >
          {SHADOW_PATTERN.flatMap((row, y) =>
            row.map((on, x) => (
              <span
                key={`${y}-${x}`}
                className={on === 1 ? 'bg-black/40' : undefined}
                style={{ width: pixel, height: pixel }}
              />
            )),
          )}
        </div>

        <div
          ref={spriteRef}
          className="relative"
          style={{
            width: size,
            height: size,
            backgroundImage: 'url(/trainer.png)',
            backgroundSize: `${size * SHEET_COLS}px ${size * SHEET_ROWS}px`,
            backgroundPosition: `0px -${ROW_DOWN * size}px`,
            backgroundRepeat: 'no-repeat',
            filter: 'drop-shadow(0 0 10px rgba(5,7,13,0.55))',
          }}
        />
      </div>
    </div>
  );
}
