'use client';

import { useSyncExternalStore } from 'react';

// WebGL support cannot change at runtime, so there is nothing to subscribe to.
// The server snapshot reports false; the client corrects it during hydration,
// which keeps this out of an effect (no setState-in-effect cascade).
const neverChanges = () => () => {};

// Cached at module scope so the throwaway canvas is only ever created once,
// no matter how many components read the hook.
let cachedSupport: boolean | null = null;

function probe(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function getSnapshot(): boolean {
  if (cachedSupport === null) cachedSupport = probe();
  return cachedSupport;
}

// SSR and the first (hydration) client render both report false to match the
// server HTML; the real probe result arrives on the render after mount.
function getServerSnapshot(): boolean {
  return false;
}

export function useWebGLSupported(): boolean {
  return useSyncExternalStore(neverChanges, getSnapshot, getServerSnapshot);
}
