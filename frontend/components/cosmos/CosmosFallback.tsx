import Link from 'next/link';
import { COSMOS_SECTIONS, PLAY_CTA } from './content';

/**
 * The still version of the cosmos hero: SSR/first-paint, the dynamic-import
 * loading state, and the no-WebGL branch all land here. Pure CSS starfield, no
 * three, no canvas, no JS — a Server Component, so it ships nothing and can
 * never render blank. It carries the real <h1> so no-JS visitors still get the
 * headline and a way into the game.
 */
export function CosmosFallback() {
  const hero = COSMOS_SECTIONS[0];

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden bg-[#05070d]">
      {/* Two layered radial fields read as distant stars without a single node. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,0.9), transparent), radial-gradient(1.5px 1.5px at 70% 60%, rgba(180,210,255,0.8), transparent), radial-gradient(2px 2px at 40% 80%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 85% 20%, rgba(255,240,200,0.8), transparent), radial-gradient(1px 1px at 55% 45%, rgba(255,255,255,0.6), transparent)',
          backgroundSize: '600px 600px, 700px 700px, 500px 500px, 450px 450px, 800px 800px',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_120%,rgba(15,52,96,0.55),transparent_70%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,13,0.5)_0%,transparent_35%,transparent_65%,#05070d_100%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1100px] flex-col items-center justify-center px-6 text-center">
        <p className="font-mono-tech text-[11px] tracking-[0.4em] text-sky-300/70 sm:text-[13px]">
          {hero.kicker}
        </p>
        <h1 className="mt-6 font-retro text-[clamp(1.75rem,7vw,5.5rem)] leading-[1.1] tracking-tight text-white">
          {hero.title}
        </h1>
        <p className="mt-8 max-w-[42rem] text-[15px] leading-relaxed text-slate-200/85 sm:text-lg">
          {hero.lines[0]} {hero.lines[1]}
        </p>
        <Link
          href={PLAY_CTA.href}
          className="mt-12 inline-flex items-center gap-3 rounded-[3px] border-b-4 border-sky-700 bg-sky-300 px-7 py-4 font-retro text-[10px] tracking-[0.18em] text-[#05070d] transition-colors hover:bg-sky-200 active:translate-y-1 active:border-b-0"
        >
          {PLAY_CTA.label} &rsaquo;
        </Link>
      </div>
    </div>
  );
}
