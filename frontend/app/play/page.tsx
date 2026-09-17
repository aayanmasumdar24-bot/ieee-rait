'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Scene } from 'phaser';
import { EventBus } from '../../components/game/EventBus';
import { HOUSES, type HouseId } from '../../data/houseContent';
import { FORMS } from '../../data/config';
import { MobileController } from '../../components/game/MobileController';

// Phaser touches window, so it can never render on the server.
const PhaserGame = dynamic(() => import('../../components/game/PhaserGame'), { ssr: false });

/** Matches the CSS animation length in globals.css. */
const IRIS_MS = 1200;

type Iris = 'shut' | 'open' | null;
type Reading = { house: HouseId; exhibit: string };

/**
 * REPLACE_ME placeholders are a valid pre-launch state — scripts/check-content
 * fails the production build on them, so here they render an honest
 * "opening soon" card rather than a link that goes nowhere.
 */
function formUrl(track: 'core' | 'associate'): string | null {
  const url = FORMS[track];
  if (!url || url.startsWith('REPLACE_ME')) return null;
  return url;
}

export default function Play() {
  const [stage, setStage] = useState(1);
  const [iris, setIris] = useState<Iris>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const [indoors, setIndoors] = useState(false);
  const [started, setStarted] = useState(false);

  // `close` is what the bus calls; `dismiss` is what the UI calls. Keeping them
  // apart stops the reply on 'exhibit-closed' from looping back into itself.
  const close = useCallback(() => setReading(null), []);
  const dismiss = useCallback(() => {
    setReading(null);
    EventBus.emit('exhibit-closed');
  }, []);

  useEffect(() => {
    // Entering the centre house in stage 1 unlocks the town: the iris shuts,
    // stage flips to 2, then the iris reopens on the interior.
    const onEnterGym = () => {
      setIris('shut');
      setTimeout(() => {
        setStage(2);
        setIris('open');
        setTimeout(() => setIris(null), IRIS_MS);
      }, IRIS_MS);
    };

    const onOpenExhibit = (next: Reading) => setReading(next);

    // InteriorScene fires on entry; MainScene's ready signal means we're back out.
    const onEnterHouse = () => {
      setReading(null);
      setIndoors(true);
    };
    const onSceneReady = (scene: Scene) => {
      // Only fires once the preloader has handed over, so it doubles as the
      // signal that the loading screen is gone and the HUD may show.
      setStarted(true);
      if (scene.scene.key === 'MainScene') setIndoors(false);
    };

    EventBus.on('enter-gym', onEnterGym);
    EventBus.on('open-exhibit', onOpenExhibit);
    EventBus.on('close-menu', close);
    EventBus.on('enter-house', onEnterHouse);
    EventBus.on('current-scene-ready', onSceneReady);

    return () => {
      EventBus.removeListener('enter-gym', onEnterGym);
      EventBus.removeListener('open-exhibit', onOpenExhibit);
      EventBus.removeListener('close-menu', close);
      EventBus.removeListener('enter-house', onEnterHouse);
      EventBus.removeListener('current-scene-ready', onSceneReady);
    };
  }, [close]);

  // Escape closes the reader, the same as walking away from the zone.
  useEffect(() => {
    if (!reading) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reading, dismiss]);

  const house = reading ? HOUSES[reading.house] : null;
  const exhibit = house?.exhibits.find((e) => e.id === reading?.exhibit) ?? null;

  return (
    // fixed, not h-screen: the landing page at / scrolls now, so the body no
    // longer clips overflow. Taking the game out of flow is what keeps it
    // scrollless without a global overflow lock.
    <main className="fixed inset-0 overflow-hidden bg-black">
      <PhaserGame currentStage={stage} />

      {/* Iris transition. Black, clipped to a circle that grows or shrinks. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-50 bg-black ${
          iris === 'shut' ? 'iris-shut' : iris === 'open' ? 'iris-close' : 'opacity-0'
        }`}
      />

      {/* The way back to the story. Hidden until the preloader hands over, and
          while a reader is open, so it never competes with the dialog. */}
      {started && !reading && (
        <Link
          href="/"
          className="absolute top-4 left-4 z-40 rounded-lg border border-white/20 bg-black/60 px-4 py-2 font-retro text-[9px] text-white/70 backdrop-blur-md transition-colors hover:border-white/50 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
        >
          &larr; LEAVE TOWN
        </Link>
      )}

      {/* Bottom helper pill, responsive for desktop and touch */}
      {stage === 1 && !iris && started && !reading && (
        <div className="pointer-events-none absolute top-16 sm:top-auto sm:bottom-8 z-30 flex w-full justify-center px-4">
          <div className="rounded-full border border-white/20 bg-black/75 px-5 py-2.5 backdrop-blur-md text-center shadow-lg">
            <p className="font-retro text-[9px] text-white sm:text-[10px] md:text-xs">
              <span className="hidden sm:inline">[W A S D] OR ARROWS TO MOVE &middot; SPACE TO HOP &middot; UP AT THE DOOR TO ENTER</span>
              <span className="sm:hidden">D-PAD TO MOVE &middot; [A] TO ENTER &middot; [B] TO HOP</span>
            </p>
          </div>
        </div>
      )}

      {stage >= 2 && !iris && !reading && (
        <div className="pointer-events-none absolute top-16 sm:top-auto sm:bottom-8 z-30 flex w-full justify-center px-4">
          <p className="rounded-full border border-white/20 bg-black/75 px-5 py-2.5 font-retro text-[8px] text-white/90 backdrop-blur-md text-center shadow-lg sm:text-[9px]">
            {indoors ? (
              <>
                <span className="hidden sm:inline">UP AT A DISPLAY TO READ &middot; LEFT AT THE DOOR TO LEAVE</span>
                <span className="sm:hidden">TAP [A] AT DISPLAY TO READ &middot; LEFT / [A] AT DOOR TO LEAVE</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">THREE HOUSES OPEN &middot; SPACE TO HOP &middot; UP AT A DOOR TO ENTER</span>
                <span className="sm:hidden">THREE HOUSES OPEN &middot; [A] TO ENTER &middot; [B] TO HOP</span>
              </>
            )}
          </p>
        </div>
      )}

      {/* On-screen mobile/touch controller */}
      {started && !reading && <MobileController />}

      {exhibit && house && (
        <ExhibitReader
          accent={house.accent}
          sign={house.sign}
          title={exhibit.title}
          body={exhibit.body}
          form={exhibit.form ?? false}
          onClose={dismiss}
        />
      )}
    </main>
  );
}

type ReaderProps = {
  accent: string;
  sign: string;
  title: string;
  body: string[];
  form: boolean;
  onClose: () => void;
};

function ExhibitReader({ accent, sign, title, body, form, onClose }: ReaderProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="absolute inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 sm:p-4 overflow-y-auto"
    >
      <div className="my-auto max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[#0b1220] p-5 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        <div className="mb-6 flex items-start justify-between gap-4 sm:gap-6">
          <div>
            <p className="font-retro text-[8px] tracking-widest text-white/40">{sign}</p>
            <h2 className={`mt-2 font-retro text-sm sm:text-base leading-relaxed ${accent}`}>{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 font-retro text-xs text-white transition-colors hover:border-white/50 hover:bg-white/20 active:scale-95"
          >
            ESC ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {body.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="text-[15px] leading-relaxed text-slate-300">
              {paragraph}
            </p>
          ))}
        </div>

        {form && (
          <div className="mt-8 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2">
            <TrackCard
              track="core"
              name="JOINT CORE TEAM"
              note="An execution role in one domain. More responsibility, more time."
            />
            <TrackCard
              track="associate"
              name="ASSOCIATE"
              note="Events, workshops and project teams. No portfolio required."
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TrackCard({
  track,
  name,
  note,
}: {
  track: 'core' | 'associate';
  name: string;
  note: string;
}) {
  const url = formUrl(track);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="font-retro text-[10px] text-emerald-300">{name}</h3>
      <p className="flex-1 text-sm leading-relaxed text-slate-400">{note}</p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border-b-4 border-emerald-800 bg-emerald-600 py-3 text-center font-retro text-[10px] text-white transition-all hover:bg-emerald-500 active:translate-y-1 active:border-b-0"
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
}
