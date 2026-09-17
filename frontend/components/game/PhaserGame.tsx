'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { PreloaderScene } from './PreloaderScene';
import { MainScene } from './MainScene';
import { InteriorScene } from './InteriorScene';
import { EventBus } from './EventBus';

interface PhaserGameProps {
  currentStage: number;
}

export default function PhaserGame({ currentStage }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const latestStageRef = useRef(currentStage);

  // Sync React state to Phaser
  useEffect(() => {
    latestStageRef.current = currentStage;
    EventBus.emit('set-stage', currentStage);
  }, [currentStage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const resendStage = () => EventBus.emit('set-stage', latestStageRef.current);

    if (!gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: 'phaser-container',
        width: window.innerWidth,
        height: window.innerHeight,
        pixelArt: true,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false // Set to true to see collision boxes
          }
        },
        scene: [PreloaderScene, MainScene, InteriorScene],
        scale: {
          mode: Phaser.Scale.ENVELOP,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      gameRef.current = new Phaser.Game(config);
      EventBus.on('current-scene-ready', resendStage);
    }

    // width/height are fixed at creation, so without this the canvas keeps the
    // window size it was born with and letterboxes after any resize.
    const onResize = () =>
      gameRef.current?.scale.resize(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      // Named handler, not a blanket clear: other subscribers share this channel.
      EventBus.removeListener('current-scene-ready', resendStage);
    };
  }, []); // Only run once on mount

  return <div id="phaser-container" className="absolute top-0 left-0 w-full h-full z-10" />;
}
