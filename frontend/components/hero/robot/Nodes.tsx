'use client';

import { useMemo, useRef } from 'react';
import type { JSX } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

export type NodesProps = { reduced?: boolean };

const COUNT = 320;
const CYAN = new THREE.Color('#7dd3fc');
const EMERALD = new THREE.Color('#6ee7b7');

function buildField(): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i += 1) {
    // A wide, shallow slab so the field reads as depth around the robot,
    // not a dense ball.
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    const c = Math.random() > 0.5 ? CYAN : EMERALD;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  return { positions, colors };
}

// Drifting node field. Additive, depth-write-off points fake a soft glow
// without postprocessing.
export function Nodes({ reduced = false }: NodesProps): JSX.Element {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => buildField(), []);

  useFrame((state) => {
    if (reduced || !ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.04;
    ref.current.position.y = Math.sin(t * 0.3) * 0.15;
  });

  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3}>
      <PointMaterial
        vertexColors
        transparent
        size={0.06}
        sizeAttenuation
        depthWrite={false}
        opacity={0.9}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}
