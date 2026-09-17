'use client';

import { useState } from 'react';
import { Reveal, StickyScene } from '../scroll';
import { HouseSpotlight, ParallaxTown } from '../cinema';
import { HOUSE_BEATS } from '../../data/story';

/** Slate, for the gap before a step reports in. */
const NEUTRAL_ACCENT = '#94a3b8';

/**
 * The three houses as one pinned scene: the town holds still behind, the accent
 * wash crossfades as each house scrolls past.
 *
 * This is a client island rather than part of app/page.tsx so the page itself
 * stays a server component — only the active-step number needs React state.
 */
export function HousesScene() {
  const [step, setStep] = useState(0);
  const accent = HOUSE_BEATS[step]?.accent ?? NEUTRAL_ACCENT;

  const panels = HOUSE_BEATS.map((beat) => {
    const accent = beat.accent ?? NEUTRAL_ACCENT;

    return (
      <div key={beat.id} className="mx-auto w-full max-w-xl px-6">
        <Reveal from="up">
          <div
            className="rounded-2xl border p-8 backdrop-blur-md md:p-10"
            style={{ borderColor: `${accent}40`, backgroundColor: '#0b1220e6' }}
          >
            <p
              className="font-retro text-[9px] tracking-[0.2em] uppercase"
              style={{ color: accent }}
            >
              {beat.kicker}
            </p>
            <h2 className="mt-5 text-balance font-retro text-base leading-[1.6] text-white md:text-xl">
              {beat.title}
            </h2>
            <div className="mt-7 flex flex-col gap-4">
              {beat.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className="text-[15px] leading-relaxed text-slate-300/90"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    );
  });

  return (
    <StickyScene
      className="relative bg-[#05070d]"
      onStepChange={setStep}
      visual={
        <div className="relative h-full w-full">
          <ParallaxTown intensity={0.75} />
          <HouseSpotlight accent={accent} />
        </div>
      }
      panels={panels}
    />
  );
}
