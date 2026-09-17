'use client';

import { useRef } from 'react';
import type { JSX } from 'react';
import type { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { Grid } from '@react-three/drei';

export type GridFloorProps = { reduced?: boolean };

const SECTION = 3; // grid section period (world units)
const DRIFT = 0.35; // floor scroll speed (units/sec)

// Wireframe floor receding to the fogged horizon. Under motion the whole grid
// scrolls toward the camera; wrapping on the section period keeps it seamless.
export function GridFloor({ reduced = false }: GridFloorProps): JSX.Element {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    if (reduced || !ref.current) return;
    ref.current.position.z = (state.clock.elapsedTime * DRIFT) % SECTION;
  });

  return (
    <group ref={ref} position={[0, -1.6, 0]}>
      <Grid
        args={[40, 40]}
        cellSize={0.6}
        cellThickness={0.6}
        cellColor="#164e63"
        sectionSize={SECTION}
        sectionThickness={1.1}
        sectionColor="#7dd3fc"
        fadeDistance={24}
        fadeStrength={1.4}
        infiniteGrid
      />
    </group>
  );
}
