'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useWebGLSupported } from '@/hooks/useWebGLSupported';
import { HeroFallback } from './HeroFallback';
import { HudFrame } from './HudFrame';

// three is heavy and WebGL touches the DOM, so the scene never renders on the
// server and stays out of the route's initial JS. Until the chunk resolves (or
// on reduced-motion / no-WebGL), the static HeroFallback holds the space.
const RobotScene = dynamic(() => import('./RobotScene').then((m) => m.RobotScene), {
  ssr: false,
  loading: () => <HeroFallback />,
});

const HOUSES = [
  { label: 'TECHNICAL', dot: 'bg-sky-300', text: 'text-sky-200/75' },
  { label: 'NON-TECHNICAL', dot: 'bg-amber-300', text: 'text-amber-200/75' },
  { label: 'JOIN IEEE', dot: 'bg-emerald-300', text: 'text-emerald-200/75' },
] as const;

const READOUTS = ['LAT 19.0330', 'LON 73.0297', 'SYS ONLINE', 'RENDER OK'] as const;

/* Scoped here so the hero ships as one unit. */
const CUE_CSS = `
@keyframes heroCueDrop {
  0%, 100% { transform: translateY(0); opacity: 0.35; }
  50% { transform: translateY(9px); opacity: 1; }
}
.hero-cue-dot { animation: heroCueDrop 2.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .hero-cue-dot { animation: none; opacity: 0.7; }
}
`;

const PRIMARY_CTA =
  'group inline-flex items-center gap-3 rounded-[3px] border-b-4 border-sky-700 bg-sky-300 px-6 py-4 font-retro text-[10px] tracking-[0.18em] text-[#05070d] transition-colors duration-150 hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070d] active:translate-y-1 active:border-b-0';

const SECONDARY_CTA =
  'group inline-flex items-center gap-3 border-b-2 border-white/25 px-1 pb-2 font-retro text-[10px] tracking-[0.18em] text-white/70 transition-colors duration-150 hover:border-sky-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#05070d] active:translate-y-[2px]';

export function HeroStage() {
  const prefersReducedMotion = useReducedMotion();
  const webglSupported = useWebGLSupported();
  // WebGL is progressive enhancement: the fallback is the SSR/first-paint state,
  // and the canvas only mounts once we've confirmed it's safe and wanted.
  const show3D = webglSupported && !prefersReducedMotion;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate min-h-[100svh] w-full overflow-hidden bg-[#05070d]"
    >
      <style>{CUE_CSS}</style>

      <div aria-hidden className="absolute inset-0">
        {/* Soft radial glow where the robot sits, so depth reads even before
            (or without) the canvas. */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_72%_45%,rgba(125,211,252,0.14),transparent_70%)]" />
        {show3D ? <RobotScene className="absolute inset-0" /> : <HeroFallback />}
        <div className="scanline absolute inset-0 opacity-30" />
        {/* Ink scrims keep the copy legible over whatever the scene is doing. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,13,0.86)_0%,rgba(5,7,13,0.45)_38%,rgba(5,7,13,0.3)_60%,rgba(5,7,13,0.9)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(96deg,rgba(5,7,13,0.95)_0%,rgba(5,7,13,0.7)_36%,rgba(5,7,13,0.12)_66%,rgba(5,7,13,0.4)_100%)]" />
      </div>

      <HudFrame tag="IEEE RAIT // SYS" readouts={READOUTS} />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1280px] flex-col px-6 pt-[clamp(5.5rem,13vh,9rem)] pb-12 sm:px-10">
        <div className="flex flex-1 flex-col justify-center">
          <div className="border-l border-sky-300/30 pl-5 sm:pl-8">
            <p className="font-mono-tech text-[11px] tracking-[0.42em] text-sky-300/70 sm:text-[13px]">
              IEEE RAIT · STUDENT BRANCH
            </p>

            <h1 id="hero-heading" className="mt-7 font-retro">
              <span className="block text-[10px] leading-[2] tracking-[0.3em] text-white/50 sm:text-[12px]">
                RAMRAO ADIK · NERUL
              </span>
              <span className="mt-4 block text-[21px] leading-[1.5] tracking-[0.02em] text-white sm:text-[30px] lg:text-[38px]">
                A COMMITTEE
              </span>
              <span className="mt-2 block bg-gradient-to-r from-sky-300 via-amber-200 to-emerald-300 bg-clip-text text-[21px] leading-[1.5] tracking-[0.02em] text-transparent sm:text-[30px] lg:text-[38px]">
                THAT BUILDS
              </span>
            </h1>

            <p className="mt-8 max-w-[30rem] text-[15px] leading-relaxed text-slate-200/85 sm:text-base">
              Robotics, code, and the events that carry them. Three houses — technical,
              non-technical, and how to join — laid out as a town you can actually walk through.
            </p>

            <ul className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3">
              {HOUSES.map(({ label, dot, text }) => (
                <li key={label} className="flex items-center gap-2.5">
                  <span aria-hidden className={`h-2 w-2 ${dot}`} />
                  <span className={`font-retro text-[8px] tracking-[0.24em] ${text}`}>{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-11 flex flex-wrap items-center gap-x-10 gap-y-6">
              <Link href="/play" className={PRIMARY_CTA}>
                ENTER THE WORLD
                <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-1">
                  &rsaquo;
                </span>
              </Link>
              <a href="#story" className={SECONDARY_CTA}>
                READ THE STORY
                <span aria-hidden className="transition-transform duration-150 group-hover:translate-y-0.5">
                  &darr;
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex items-end justify-between gap-8">
          <a
            href="#story"
            className="group flex items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#05070d]"
          >
            <span aria-hidden className="relative block h-14 w-px bg-gradient-to-b from-white/5 to-white/40">
              <span className="hero-cue-dot absolute -left-[2px] bottom-2 block h-[5px] w-[5px] bg-sky-300" />
            </span>
            <span className="font-retro text-[8px] tracking-[0.34em] text-white/45 transition-colors group-hover:text-white/80">
              KEEP SCROLLING
            </span>
          </a>

          <ul aria-hidden className="hidden gap-6 font-mono-tech text-[11px] tracking-[0.2em] text-sky-300/30 sm:flex">
            <li>ARM: IDLE</li>
            <li>GRID: LIVE</li>
            <li>NODES: 320</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
