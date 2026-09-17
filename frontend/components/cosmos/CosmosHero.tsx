'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useWebGLSupported } from '@/hooks/useWebGLSupported';
import { createCosmosScene, type CosmosScene, type Vec3 } from './scene';
import { COSMOS_SECTIONS, PLAY_CTA, JOIN_TRACKS, type CosmosSection } from './content';
import { StatTicker } from '../motion';
import { STATS } from '../../data/story';
import { FORMS } from '../../data/config';
import { IEEELogo } from '../site/IEEELogo';

/**
 * Camera stops, one per scrollable panel (4 narrative sections + the final join
 * panel = 5 stops, 4 segments). The scroll handler lerps between neighbours, the
 * scene eases the real camera toward the result. A forward flight: start out
 * past the mountains, then dive through them toward the nebula at z -1050.
 */
const CAMERA_KEYFRAMES: readonly Vec3[] = [
  { x: 0, y: 30, z: 300 },
  { x: 0, y: 36, z: 40 },
  { x: 0, y: 42, z: -260 },
  { x: 0, y: 50, z: -560 },
  { x: 0, y: 62, z: -820 },
];
const SEG_COUNT = CAMERA_KEYFRAMES.length - 1;

/** Faint CSS starfield behind the content when WebGL is unavailable. */
const STATIC_STARS: CSSProperties = {
  backgroundImage:
    'radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,0.9), transparent), radial-gradient(1.5px 1.5px at 70% 60%, rgba(180,210,255,0.8), transparent), radial-gradient(2px 2px at 40% 80%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 85% 20%, rgba(255,240,200,0.8), transparent)',
  backgroundSize: '600px 600px, 700px 700px, 500px 500px, 450px 450px',
};

/**
 * Dark halo so white text stays legible where it crosses the bright nebula
 * bloom — the scrim behind the block does most of the work; this catches the
 * edges the scrim's falloff misses.
 */
const TEXT_HALO =
  '0 0 3px rgba(5,7,13,0.95), 0 2px 10px rgba(5,7,13,0.95), 0 0 42px rgba(5,7,13,0.8)';

function readProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(window.scrollY / max, 1) : 0;
}

function formUrl(track: 'core' | 'associate'): string | null {
  const url = FORMS[track];
  if (!url || url.startsWith('REPLACE_ME')) return null;
  return url;
}

/** One big headline split into per-character spans for the intro stagger. */
function splitChars(text: string) {
  return text.split('').map((ch, i) => (
    <span key={`${i}-${ch}`} className="cosmos-char inline-block whitespace-pre">
      {ch}
    </span>
  ));
}

export function CosmosHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<CosmosScene | null>(null);

  const prefersReducedMotion = useReducedMotion();
  const webglSupported = useWebGLSupported();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);

  // Scene-only sync (no React state) so it is safe to call from an effect body.
  const syncScene = useCallback((progress: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const seg = Math.min(Math.floor(progress * SEG_COUNT), SEG_COUNT - 1);
    const t = progress * SEG_COUNT - seg;
    const a = CAMERA_KEYFRAMES[seg];
    const b = CAMERA_KEYFRAMES[seg + 1] ?? a;
    scene.setCameraTarget({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t,
    });
    scene.setScrollProgress(progress);
  }, []);

  // Build / tear down the three.js scene. Recreated if WebGL or motion pref flips.
  useEffect(() => {
    if (!webglSupported) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = createCosmosScene(canvas, { reducedMotion: prefersReducedMotion });
    sceneRef.current = scene;
    scene.resize(window.innerWidth, window.innerHeight);
    syncScene(readProgress()); // no setState here — safe in the effect body

    const onResize = () => scene.resize(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      scene.dispose();
      sceneRef.current = null;
    };
  }, [webglSupported, prefersReducedMotion, syncScene]);

  // Scroll → progress state + scene. rAF-throttled; the initial call is deferred
  // into rAF so the setState never runs synchronously in the effect body.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      const p = readProgress();
      setScrollProgress(p);
      setCurrentSection(Math.min(Math.round(p * SEG_COUNT), SEG_COUNT));
      syncScene(p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [syncScene]);

  // Intro timeline, scoped to the container. Skipped entirely under reduced motion.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from('.cosmos-menu', { x: -80, opacity: 0, duration: 1, ease: 'power3.out' })
        .from(
          '.cosmos-hero .cosmos-char',
          { y: 160, opacity: 0, duration: 1.2, stagger: 0.05, ease: 'power4.out' },
          '-=0.5',
        )
        .from(
          '.cosmos-hero .cosmos-line',
          { y: 40, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out' },
          '-=0.7',
        )
        .from('.cosmos-progress', { y: 40, opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.4');
    }, containerRef);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  if (!webglSupported) {
    // No canvas, but the info still needs to render. Static stars behind, real
    // content in front — then the grounded join panel below.
    return (
      <div ref={containerRef} className="relative w-full bg-[#05070d]">
        <div aria-hidden className="pointer-events-none fixed inset-0 opacity-70" style={STATIC_STARS} />
        <NarrativeSections sections={COSMOS_SECTIONS} />
        <JoinPanel />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full bg-[#05070d]">
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 block h-[100svh] w-screen"
      />

      {/* Vertical brand rail, top-left. */}
      <div className="cosmos-menu fixed top-0 left-0 z-30 flex h-screen w-16 flex-col items-center justify-between py-8">
        <div className="flex flex-col gap-1.5" aria-hidden>
          <span className="h-px w-6 bg-white/60" />
          <span className="h-px w-6 bg-white/60" />
          <span className="h-px w-6 bg-white/60" />
        </div>
        <span
          aria-hidden
          className="font-mono-tech text-[11px] tracking-[0.5em] text-sky-300/60 [writing-mode:vertical-rl]"
        >
          IEEE RAIT
        </span>
      </div>

      {/* Prominent IEEE Official Brand Logo, top-right */}
      <div className="fixed top-5 right-5 sm:top-6 sm:right-8 md:top-6 md:right-10 z-30 pointer-events-auto">
        <a
          href="https://www.ieee.org"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center rounded-2xl border border-white/20 bg-white/95 px-4 py-2 sm:px-5 sm:py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-sky-400 hover:shadow-[0_0_28px_rgba(0,114,206,0.6)] active:scale-95"
          aria-label="IEEE Official Website"
        >
          <IEEELogo height={36} variant="brand" />
        </a>
      </div>

      <NarrativeSections sections={COSMOS_SECTIONS} />
      <JoinPanel />

      {/* Scroll progress, fixed bottom. */}
      <div className="cosmos-progress fixed bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4">
        <span className="font-mono-tech text-[10px] tracking-[0.3em] text-white/50">SCROLL</span>
        <span aria-hidden className="relative block h-px w-24 bg-white/15">
          <span
            className="absolute inset-y-0 left-0 bg-sky-300"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </span>
        <span className="font-mono-tech text-[10px] tracking-[0.2em] text-white/50">
          {String(Math.min(currentSection + 1, SEG_COUNT + 1)).padStart(2, '0')} /{' '}
          {String(SEG_COUNT + 1).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

/** The cosmic poster sections, scrolling over the fixed scene. */
function NarrativeSections({ sections }: { sections: readonly CosmosSection[] }) {
  return (
    <>
      {sections.map((section, index) => (
        <section
          key={section.id}
          aria-labelledby={`cosmos-${section.id}`}
          className={`cosmos-hero relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 text-center ${
            index === 0 ? '' : 'cosmos-later'
          }`}
        >
          {/* Soft dark wash so the white title reads over the bloom without a
              hard-edged disc — smooth falloff, no mid stop. */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 h-[80%] w-[min(96vw,74rem)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(5,7,13,0.6),transparent)] blur-3xl"
          />
          <div className="relative z-10 flex flex-col items-center">
            {section.kicker && (
              <p
                className="cosmos-line font-mono-tech text-[11px] tracking-[0.42em] text-sky-300/80 sm:text-[13px]"
                style={{ textShadow: TEXT_HALO }}
              >
                {section.kicker}
              </p>
            )}
            <h1
              id={`cosmos-${section.id}`}
              className={`${section.kicker ? 'mt-6' : 'mt-0'} font-retro text-[clamp(1.6rem,7vw,5.5rem)] leading-[1.12] tracking-tight text-white`}
              style={{ textShadow: TEXT_HALO }}
            >
              {splitChars(section.title)}
            </h1>
            <div className="mt-8 max-w-[46rem] space-y-2">
              <p
                className="cosmos-line text-[15px] leading-relaxed text-slate-100 sm:text-lg"
                style={{ textShadow: TEXT_HALO }}
              >
                {section.lines[0]}
              </p>
              <p
                className="cosmos-line text-[15px] leading-relaxed text-slate-100 sm:text-lg"
                style={{ textShadow: TEXT_HALO }}
              >
                {section.lines[1]}
              </p>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

/** The grounded closing panel: IEEE numbers, the two join tracks, the door in. */
function JoinPanel() {
  return (
    <section
      id="join"
      aria-label="Join and play"
      className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center gap-14 bg-gradient-to-b from-transparent to-[#05070d] px-6 py-24 text-center"
    >
      <div className="grid w-full max-w-4xl gap-6 sm:grid-cols-3">
        {STATS.map((stat, i) => {
          const accent = ['#7dd3fc', '#fcd34d', '#6ee7b7'][i % 3];
          return (
            <div
              key={stat.value}
              className="relative border border-white/10 bg-[#05070d]/60 p-6 backdrop-blur-sm"
            >
              <span
                aria-hidden
                className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2"
                style={{ borderColor: accent }}
              />
              <StatTicker value={stat.value} label={stat.label} />
            </div>
          );
        })}
      </div>

      <div className="max-w-2xl">
        <p className="font-mono-tech text-[11px] tracking-[0.4em] text-emerald-300/80">JOIN IEEE RAIT</p>
        <h2 className="mt-5 font-retro text-[clamp(1.4rem,5vw,3rem)] leading-[1.2] text-white">
          BUILD WITH US
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {JOIN_TRACKS.map((track) => {
            const url = formUrl(track.id);
            return (
              <div
                key={track.id}
                className="flex flex-col gap-3 border border-white/10 bg-white/[0.03] p-5 text-left"
              >
                <h3 className="font-retro text-[10px] tracking-[0.18em] text-emerald-300">{track.name}</h3>
                <p className="flex-1 text-sm leading-relaxed text-slate-400">{track.note}</p>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border-b-4 border-emerald-800 bg-emerald-500 py-3 text-center font-retro text-[10px] text-[#05070d] transition-colors hover:bg-emerald-400 active:translate-y-1 active:border-b-0"
                  >
                    APPLY
                  </a>
                ) : (
                  <p className="rounded-lg border border-dashed border-white/15 py-3 text-center font-retro text-[8px] leading-relaxed text-white/50">
                    OPENING SOON
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Link
        href={PLAY_CTA.href}
        className="group inline-flex items-center gap-3 rounded-[3px] border-b-4 border-sky-700 bg-sky-300 px-8 py-5 font-retro text-[11px] tracking-[0.18em] text-[#05070d] transition-all hover:bg-sky-200 hover:shadow-[0_0_34px_-6px_rgba(125,211,252,0.85)] focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070d] focus-visible:outline-none active:translate-y-1 active:border-b-0"
      >
        {PLAY_CTA.label}
        <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-1">
          &rsaquo;
        </span>
      </Link>
    </section>
  );
}
