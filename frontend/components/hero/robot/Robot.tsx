'use client';

import { useRef } from 'react';
import type { JSX } from 'react';
import type { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';

export type RobotProps = { reduced?: boolean };

type Vec3 = [number, number, number];

const CYL_SEG = 12;

// The emissive-line look with no postprocessing: dark panel surface + crisp
// cyan wireframe edges. Shared by every structural part.
function StructSkin(): JSX.Element {
  return (
    <>
      <meshStandardMaterial
        color="#0b1220"
        emissive="#0e3a4f"
        emissiveIntensity={0.5}
        metalness={0.35}
        roughness={0.55}
      />
      <Edges color="#7dd3fc" />
    </>
  );
}

function Panel({ args, position }: { args: Vec3; position: Vec3 }): JSX.Element {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <StructSkin />
    </mesh>
  );
}

// Glowing accent node — reads as a lit joint via emissive + toneMapped off.
function Node({ position, color, r }: { position: Vec3; color: string; r: number }): JSX.Element {
  return (
    <mesh position={position}>
      <sphereGeometry args={[r, 10, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.4} toneMapped={false} />
    </mesh>
  );
}

// A stylized robot head/bust assembled from primitives. Slow idle bob + sway,
// held static under reduced-motion.
export function Robot({ reduced = false }: RobotProps): JSX.Element {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    if (reduced || !ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = Math.sin(t * 0.6) * 0.08;
    ref.current.rotation.y = Math.sin(t * 0.3) * 0.12;
  });

  return (
    <group ref={ref}>
      <Panel args={[1.7, 0.35, 1]} position={[0, -0.95, 0]} />
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.5, CYL_SEG]} />
        <StructSkin />
      </mesh>
      <Panel args={[1.2, 0.95, 1]} position={[0, 0.05, 0]} />
      <Panel args={[0.9, 0.22, 0.85]} position={[0, -0.5, 0.05]} />

      {/* visor / sensor bar (emerald glow) */}
      <mesh position={[0, 0.12, 0.5]}>
        <boxGeometry args={[0.86, 0.22, 0.08]} />
        <meshStandardMaterial color="#6ee7b7" emissive="#6ee7b7" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>

      {/* ear pods */}
      <mesh position={[0.66, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.14, CYL_SEG]} />
        <StructSkin />
      </mesh>
      <mesh position={[-0.66, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.14, CYL_SEG]} />
        <StructSkin />
      </mesh>

      {/* antenna + amber tip */}
      <mesh position={[0.3, 0.75, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#7dd3fc" emissiveIntensity={1} toneMapped={false} />
      </mesh>
      <Node position={[0.3, 1.05, 0]} color="#fcd34d" r={0.07} />

      {/* joint bolts + forehead sensor */}
      <Node position={[0.66, 0.1, 0.02]} color="#fcd34d" r={0.06} />
      <Node position={[-0.66, 0.1, 0.02]} color="#fcd34d" r={0.06} />
      <Node position={[0, 0.42, 0.52]} color="#6ee7b7" r={0.05} />
    </group>
  );
}
