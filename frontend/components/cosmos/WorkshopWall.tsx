'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GALLERY_ITEMS, type GalleryItem } from './content';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const TITLE = 'WHAT WE DO';
const SUBTITLE = 'Workshops, talks and hands-on sessions — run by the committee, open to everyone.';
const HINT = 'scroll to see the wall';

/* Dark halo keeps the small captions/hint legible now that the section is
 * transparent and can sit over the bright nebula core. The sticky title needs
 * none — mix-blend-exclusion inverts it against whatever is behind. */
const TEXT_HALO = '0 1px 2px rgba(5,7,13,0.95), 0 0 14px rgba(5,7,13,0.85)';

/* Deterministic placement so SSR and client agree (no Math.random): one tile
 * per row, every third row holding a second, columns walked in a scattered
 * pattern. Returns a grid of item indices (or -1 for an empty cell). */
function buildLayout(count: number, cols: number): number[][] {
  const rows: number[][] = [];
  let i = 0;
  let r = 0;
  while (i < count) {
    const row = new Array<number>(cols).fill(-1);
    const a = (r * 2 + (r % 2)) % cols;
    row[a] = i++;
    if (r % 3 === 0 && i < count) {
      let b = (a + 2) % cols;
      if (b === a) b = (a + 1) % cols;
      row[b] = i++;
    }
    rows.push(row);
    r++;
  }
  return rows;
}

/* Cap columns on smaller viewports so tiles stay a usable size. Starts from
 * `desired` so SSR matches the first client render, then narrows after mount. */
function useResponsiveColumns(desired: number): number {
  const [cols, setCols] = React.useState(desired);

  React.useEffect(() => {
    const sm = window.matchMedia('(min-width: 640px)');
    const lg = window.matchMedia('(min-width: 1024px)');
    const update = () => {
      if (lg.matches) setCols(desired);
      else if (sm.matches) setCols(Math.min(desired, 3));
      else setCols(Math.min(desired, 2));
    };
    update();
    sm.addEventListener('change', update);
    lg.addEventListener('change', update);
    return () => {
      sm.removeEventListener('change', update);
      lg.removeEventListener('change', update);
    };
  }, [desired]);

  return cols;
}

/** One tile: grayscale still or muted looping clip, colour on hover. */
function Tile({ item }: { item: GalleryItem }) {
  const media =
    'h-full w-full object-cover grayscale contrast-[1.15] filter transition-[transform,filter] duration-500 ease-in-out hover:scale-95 hover:grayscale-0';

  if (item.type === 'video') {
    return (
      <video
        src={item.src}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-label={item.caption}
        className={media}
      />
    );
  }
  return (
    // Plain <img>: many lazy, below-fold tiles that scale-scrub — next/image's
    // fill/sizes would fight the transform, and these are local assets.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.src}
      alt={item.caption}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={media}
    />
  );
}

/**
 * Scroll-scrubbed portrait wall (ported from the shadcn/@gsap/react demo to this
 * project's tokens + gsap.context). Each tile scrubs scale 0 → 1 → 0 across its
 * pass through the viewport; a sticky mix-blend title inverts over whatever is
 * behind it. Reduced motion pins every tile at full scale.
 */
export function WorkshopWall() {
  const root = React.useRef<HTMLElement | null>(null);
  const hintRef = React.useRef<HTMLDivElement | null>(null);
  const cols = useResponsiveColumns(4);
  const layout = React.useMemo(() => buildLayout(GALLERY_ITEMS.length, cols), [cols]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('.spw-item');

      if (reduce) {
        gsap.set(items, { scale: 1 });
        return;
      }

      gsap.to(hintRef.current, {
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=40%', scrub: true },
      });

      items.forEach((el) => {
        gsap
          .timeline({
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          })
          .fromTo(el, { scale: 0 }, { scale: 1, ease: 'power2.out', duration: 0.5 })
          .to(el, { scale: 0, ease: 'power2.in', duration: 0.5 });
      });
    }, root);

    return () => ctx.revert();
  }, [cols]);

  return (
    <section
      ref={root}
      aria-label={TITLE}
      className="relative z-10 w-full overflow-hidden text-white"
    >
      {/* Scroll hint, lower-centre of the first screen, fading on scroll. */}
      <div
        ref={hintRef}
        className="pointer-events-none absolute top-[60vh] left-1/2 grid -translate-x-1/2 content-start justify-items-center gap-6 text-center"
      >
        <span
          className="font-mono-tech relative max-w-[16ch] text-xs leading-tight tracking-[0.2em] text-white/50 uppercase after:absolute after:top-full after:left-1/2 after:h-16 after:w-px after:bg-gradient-to-b after:from-transparent after:to-white/40 after:content-['']"
          style={{ textShadow: TEXT_HALO }}
        >
          {HINT}
        </span>
      </div>

      {/* Sticky centred title — inverts against whatever tile is behind it. */}
      <div className="pointer-events-none sticky top-1/2 z-20 -translate-y-1/2 text-center text-white mix-blend-exclusion">
        <p className="font-mono-tech text-[11px] tracking-[0.4em] text-white/70 sm:text-sm">
          {SUBTITLE.split(' — ')[0].toUpperCase()}
        </p>
        <h2 className="mt-2 font-retro text-[clamp(1.8rem,7vw,5.5rem)] leading-[1.05] tracking-tight">
          {TITLE}
        </h2>
      </div>

      {/* The scattered media grid. */}
      <div className="relative z-0 mt-[50vh] mb-[50vh]">
        {layout.map((row, ri) => (
          <div key={ri} className="flex w-full">
            {row.map((idx, ci) => {
              if (idx === -1) return <div key={ci} className="aspect-square flex-1" />;

              const item = GALLERY_ITEMS[idx];
              const origin = ci < cols / 2 ? 'right bottom' : 'left bottom';

              return (
                <div key={ci} className="aspect-square flex-1">
                  <div
                    className="spw-item relative h-full w-full"
                    style={{ transformOrigin: origin, transform: 'scale(0)' }}
                  >
                    <Tile item={item} />
                    <div
                      className="font-mono-tech absolute -bottom-2 left-0 flex w-full translate-y-full justify-between gap-2 text-[10px] leading-tight tracking-wide text-white/45 uppercase"
                      style={{ textShadow: TEXT_HALO }}
                    >
                      <span className="truncate">{item.caption}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
