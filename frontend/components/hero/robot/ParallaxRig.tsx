'use client';

import { useRef, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import type { Group } from 'three';
import { useFrame } from '@react-three/fiber';

export type ParallaxRigProps = { children: ReactNode; reduced?: boolean };

const MAX_TILT = 0.15; // rad — a subtle tilt, not a spin
const LERP = 0.05;

// Lerps its rotation toward the pointer each frame. On a touch device (no fine
// pointer) or under reduced-motion it does a gentle constant auto-orbit instead,
// since there is no meaningful pointer to follow.
export function ParallaxRig({ children, reduced = false }: ParallaxRigProps): JSX.Element {
  const ref = useRef<Group>(null);
  // matchMedia read once via a lazy initializer (canvas is client-only, so
  // window exists) — not an effect, so it never trips set-state-in-effect.
  const [finePointer] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches,
  );
  const autoOrbit = reduced || !finePointer;

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    if (autoOrbit) {
      const t = state.clock.elapsedTime;
      g.rotation.y += (Math.sin(t * 0.25) * MAX_TILT - g.rotation.y) * LERP;
      g.rotation.x += (Math.sin(t * 0.2) * MAX_TILT * 0.5 - g.rotation.x) * LERP;
      return;
    }
    // state.pointer is already normalised to [-1, 1].
    g.rotation.y += (state.pointer.x * MAX_TILT - g.rotation.y) * LERP;
    g.rotation.x += (-state.pointer.y * MAX_TILT - g.rotation.x) * LERP;
  });

  return <group ref={ref}>{children}</group>;
}
