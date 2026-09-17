'use client';

import { useState, useCallback, useRef } from 'react';
import { VirtualInput } from './VirtualInput';

function triggerHaptic() {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(12);
    } catch {
      // Ignore if unsupported or blocked by permissions
    }
  }
}

export function MobileController() {
  const [activeDirections, setActiveDirections] = useState<{
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  }>({ up: false, down: false, left: false, right: false });

  const [activeActions, setActiveActions] = useState<{
    a: boolean;
    b: boolean;
  }>({ a: false, b: false });

  // Handle D-pad directional presses
  const handleDirStart = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    VirtualInput.setKey(dir, true);
    setActiveDirections((prev) => ({ ...prev, [dir]: true }));
    triggerHaptic();
  }, []);

  const handleDirEnd = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    VirtualInput.setKey(dir, false);
    setActiveDirections((prev) => ({ ...prev, [dir]: false }));
  }, []);

  // Handle Action Button A (Interact / Read / Enter)
  const handleActionAStart = useCallback(() => {
    VirtualInput.pressAction();
    setActiveActions((prev) => ({ ...prev, a: true }));
    triggerHaptic();
  }, []);

  const handleActionAEnd = useCallback(() => {
    VirtualInput.releaseAction();
    setActiveActions((prev) => ({ ...prev, a: false }));
  }, []);

  // Handle Action Button B (Hop / Jump)
  const handleActionBStart = useCallback(() => {
    VirtualInput.pressHop();
    setActiveActions((prev) => ({ ...prev, b: true }));
    triggerHaptic();
  }, []);

  const handleActionBEnd = useCallback(() => {
    VirtualInput.releaseHop();
    setActiveActions((prev) => ({ ...prev, b: false }));
  }, []);

  return (
    <div
      aria-label="Game touch controls"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex select-none justify-between p-4 pb-6 sm:p-8"
      style={{ touchAction: 'none' }}
    >
      {/* Left: D-Pad */}
      <div className="pointer-events-auto relative flex h-36 w-36 items-center justify-center rounded-full border border-white/15 bg-black/50 p-2 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        {/* Center decorative hub */}
        <div className="absolute h-10 w-10 rounded-full border border-white/10 bg-[#0b1220]/80 shadow-inner" />

        {/* UP */}
        <button
          type="button"
          aria-label="Move Up"
          onPointerDown={(e) => {
            e.preventDefault();
            handleDirStart('up');
          }}
          onPointerUp={() => handleDirEnd('up')}
          onPointerCancel={() => handleDirEnd('up')}
          onPointerLeave={() => handleDirEnd('up')}
          className={`absolute top-1 left-1/2 h-11 w-11 -translate-x-1/2 rounded-t-lg border-t-2 border-x border-white/20 bg-slate-900/90 text-sm font-bold text-white transition-all active:scale-95 ${
            activeDirections.up
              ? 'border-emerald-400 bg-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(110,231,183,0.5)]'
              : 'hover:bg-slate-800'
          }`}
        >
          ▲
        </button>

        {/* DOWN */}
        <button
          type="button"
          aria-label="Move Down"
          onPointerDown={(e) => {
            e.preventDefault();
            handleDirStart('down');
          }}
          onPointerUp={() => handleDirEnd('down')}
          onPointerCancel={() => handleDirEnd('down')}
          onPointerLeave={() => handleDirEnd('down')}
          className={`absolute bottom-1 left-1/2 h-11 w-11 -translate-x-1/2 rounded-b-lg border-b-2 border-x border-white/20 bg-slate-900/90 text-sm font-bold text-white transition-all active:scale-95 ${
            activeDirections.down
              ? 'border-emerald-400 bg-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(110,231,183,0.5)]'
              : 'hover:bg-slate-800'
          }`}
        >
          ▼
        </button>

        {/* LEFT */}
        <button
          type="button"
          aria-label="Move Left"
          onPointerDown={(e) => {
            e.preventDefault();
            handleDirStart('left');
          }}
          onPointerUp={() => handleDirEnd('left')}
          onPointerCancel={() => handleDirEnd('left')}
          onPointerLeave={() => handleDirEnd('left')}
          className={`absolute top-1/2 left-1 h-11 w-11 -translate-y-1/2 rounded-l-lg border-l-2 border-y border-white/20 bg-slate-900/90 text-sm font-bold text-white transition-all active:scale-95 ${
            activeDirections.left
              ? 'border-emerald-400 bg-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(110,231,183,0.5)]'
              : 'hover:bg-slate-800'
          }`}
        >
          ◀
        </button>

        {/* RIGHT */}
        <button
          type="button"
          aria-label="Move Right"
          onPointerDown={(e) => {
            e.preventDefault();
            handleDirStart('right');
          }}
          onPointerUp={() => handleDirEnd('right')}
          onPointerCancel={() => handleDirEnd('right')}
          onPointerLeave={() => handleDirEnd('right')}
          className={`absolute top-1/2 right-1 h-11 w-11 -translate-y-1/2 rounded-r-lg border-r-2 border-y border-white/20 bg-slate-900/90 text-sm font-bold text-white transition-all active:scale-95 ${
            activeDirections.right
              ? 'border-emerald-400 bg-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(110,231,183,0.5)]'
              : 'hover:bg-slate-800'
          }`}
        >
          ▶
        </button>
      </div>

      {/* Right: Action Buttons A & B */}
      <div className="pointer-events-auto flex items-end gap-3 pb-1">
        {/* Button B: Hop / Jump */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            aria-label="Hop / Jump"
            onPointerDown={(e) => {
              e.preventDefault();
              handleActionBStart();
            }}
            onPointerUp={handleActionBEnd}
            onPointerCancel={handleActionBEnd}
            onPointerLeave={handleActionBEnd}
            className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-sky-400/60 bg-sky-950/80 font-retro text-xs font-bold text-sky-200 backdrop-blur-md transition-all active:scale-90 active:border-sky-300 active:bg-sky-500 active:text-black shadow-[0_4px_20px_rgba(125,211,252,0.3)] ${
              activeActions.b
                ? 'scale-90 border-sky-300 bg-sky-500 text-black shadow-[0_0_20px_rgba(125,211,252,0.8)]'
                : ''
            }`}
          >
            B
          </button>
          <span className="font-retro text-[7px] tracking-wider text-sky-300/80">HOP</span>
        </div>

        {/* Button A: Enter / Read / Action */}
        <div className="flex flex-col items-center gap-1 mb-4">
          <button
            type="button"
            aria-label="Interact / Read / Enter"
            onPointerDown={(e) => {
              e.preventDefault();
              handleActionAStart();
            }}
            onPointerUp={handleActionAEnd}
            onPointerCancel={handleActionAEnd}
            onPointerLeave={handleActionAEnd}
            className={`flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-400/70 bg-emerald-950/80 font-retro text-sm font-bold text-emerald-200 backdrop-blur-md transition-all active:scale-90 active:border-emerald-300 active:bg-emerald-400 active:text-black shadow-[0_4px_24px_rgba(110,231,183,0.4)] ${
              activeActions.a
                ? 'scale-90 border-emerald-300 bg-emerald-400 text-black shadow-[0_0_24px_rgba(110,231,183,0.9)]'
                : ''
            }`}
          >
            A
          </button>
          <span className="font-retro text-[7px] tracking-wider text-emerald-300/90">INTERACT</span>
        </div>
      </div>
    </div>
  );
}
