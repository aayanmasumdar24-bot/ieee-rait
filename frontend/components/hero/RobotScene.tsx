'use client';

import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { Canvas } from '@react-three/fiber';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { GridFloor } from './robot/GridFloor';
import { Robot } from './robot/Robot';
import { Nodes } from './robot/Nodes';
import { ParallaxRig } from './robot/ParallaxRig';

export type RobotSceneProps = { className?: string };

// Cheap radial depth that the transparent canvas (gl alpha) sits on top of.
const UNDERLAY = {
  background:
    'radial-gradient(42% 50% at 70% 48%, rgba(125,211,252,0.16), rgba(11,18,32,0.04) 46%, transparent 72%)',
} as const;

export function RobotScene({ className }: RobotSceneProps): JSX.Element {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  // Start 'always' so the first render is already valid; the observer only ever
  // flips this later from its async callback, so it never trips
  // react-hooks/set-state-in-effect (no synchronous setState in the effect body).
  const [frameloop, setFrameloop] = useState<'always' | 'never'>('always');

  // Pause the render loop while the hero is off-screen so scrolling the rest of
  // the page burns no GPU/CPU on an unseen canvas.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setFrameloop(entry.isIntersecting ? 'always' : 'never'),
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={['absolute inset-0', className].filter(Boolean).join(' ')}
      style={{ pointerEvents: 'none' }}
    >
      <div className="absolute inset-0" style={UNDERLAY} />
      {/* Transparent bg (no <color> attach) so the CSS glow underlay shows through. */}
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0.3, 6], fov: 40 }}
      >
        <fog attach="fog" args={['#05070d', 9, 22]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 3, 5]} intensity={40} color="#7dd3fc" />
        <pointLight position={[-4, -1, 2]} intensity={18} color="#fcd34d" />
        <ParallaxRig reduced={reduced}>
          <Robot reduced={reduced} />
          <Nodes reduced={reduced} />
        </ParallaxRig>
        <GridFloor reduced={reduced} />
      </Canvas>
    </div>
  );
}
