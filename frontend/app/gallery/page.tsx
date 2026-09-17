import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { WorkshopWall } from '../../components/cosmos/WorkshopWall';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photos and clips from IEEE RAIT workshops, talks and hands-on sessions.',
};

/** Same faint CSS starfield the cosmos fallback uses, so the gallery reads on
 * the site's space theme without pulling in the WebGL scene. */
const STARFIELD: CSSProperties = {
  backgroundImage:
    'radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,0.9), transparent), radial-gradient(1.5px 1.5px at 70% 60%, rgba(180,210,255,0.8), transparent), radial-gradient(2px 2px at 40% 80%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 85% 20%, rgba(255,240,200,0.8), transparent), radial-gradient(1px 1px at 55% 45%, rgba(255,255,255,0.6), transparent)',
  backgroundSize: '600px 600px, 700px 700px, 500px 500px, 450px 450px, 800px 800px',
};

/** Dark halo so the heading stays legible over the starfield. */
const HALO = '0 1px 2px rgba(5,7,13,0.95), 0 0 18px rgba(5,7,13,0.85)';

export default function GalleryPage() {
  return (
    <main id="main" className="relative min-h-[100svh] w-full bg-[#05070d]">
      <div aria-hidden className="pointer-events-none fixed inset-0 opacity-70" style={STARFIELD} />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(15,52,96,0.5),transparent_70%)]"
      />

      <header className="relative z-10 mx-auto flex min-h-[68svh] max-w-4xl flex-col items-center justify-center px-6 pt-28 text-center">
        <p
          className="font-mono-tech text-[12px] tracking-[0.42em] text-sky-300/80 sm:text-[13px]"
          style={{ textShadow: HALO }}
        >
          IEEE RAIT · WORKSHOPS &amp; EVENTS
        </p>
        <h1
          className="mt-6 font-retro text-[clamp(2rem,9vw,5rem)] leading-[1.05] tracking-tight text-white"
          style={{ textShadow: HALO }}
        >
          GALLERY
        </h1>
        <p
          className="mt-7 max-w-xl text-[15px] leading-relaxed text-slate-200/85 sm:text-lg"
          style={{ textShadow: HALO }}
        >
          Photos and clips from our workshops, talks and hands-on sessions — the room where
          the branch actually happens.
        </p>
      </header>

      <WorkshopWall />
    </main>
  );
}
