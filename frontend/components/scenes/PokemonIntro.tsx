'use client';

import { useEffect, useRef, useState } from 'react';

// ============================================
// CONSTANTS
// ============================================
const BASE_FRAME_WIDTH = 96;
const BASE_FRAME_HEIGHT = 96;
const BASE_TREE_WIDTH = 120;
const BASE_TREE_HEIGHT = 200;

const FRAME_SEQUENCE = [0, 1, 2, 3];
const ANIMATION_SPEED = 100;
const DIRECTIONS = { down: 0, right: 1, left: 2, up: 3 };

// Trainer Path
const PATH_PERCENT = [
  { x: 24.5, y: 82 },
  { x: 24.5, y: 75 },
  { x: 24.5, y: 65 },
  { x: 24.5, y: 55 },
  { x: 24.5, y: 47 },
  { x: 35, y: 47 },
  { x: 50, y: 47 },
  { x: 50, y: 35 },
  { x: 50, y: 22 }, // Trigger Fade
  { x: 50, y: 15 },
];

const BORDER_TREES = [
  { x: -15, y: -30 }, { x: -8, y: -28 }, { x: -1, y: -30 },
  { x: 6, y: -28 }, { x: 13, y: -30 }, { x: 20, y: -28 },
  { x: -12, y: -20 }, { x: -5, y: -18 }, { x: 2, y: -20 },
  { x: 9, y: -18 }, { x: 16, y: -20 },
  { x: 68, y: -30 }, { x: 75, y: -28 }, { x: 82, y: -30 },
  { x: 89, y: -28 }, { x: 96, y: -30 }, { x: 103, y: -28 },
  { x: 71, y: -20 }, { x: 78, y: -18 }, { x: 85, y: -20 },
  { x: 92, y: -18 }, { x: 99, y: -20 },
  { x: -20, y: -25 }, { x: -20, y: -15 }, { x: -20, y: -5 },
  { x: -20, y: 5 }, { x: -20, y: 15 }, { x: -20, y: 25 },
  { x: 96, y: -25 }, { x: 96, y: -15 }, { x: 96, y: -5 },
  { x: 96, y: 5 }, { x: 96, y: 15 }, { x: 96, y: 25 }
];

const PROMINENT_TREES = [
  { x: 35, y: 34 }, { x: 43, y: 32 }, { x: 51, y: 34 },
  { x: 59, y: 32 }, { x: 67, y: 34 }, { x: 75, y: 32 },
  { x: -2, y: 5 }, { x: 97, y: 5 }, { x: 95, y: 18 }, { x: 5, y: 25 }
];

const SHADOW_PATTERN = [
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
];

interface Dialog {
  text: string;
  triggerWaypoint: number;
}

const DIALOGS: Dialog[] = [
  { text: "Welcome to IEEE RAIT! Let's take a tour...", triggerWaypoint: 1 },
  { text: "We are the tech innovators of the campus.", triggerWaypoint: 3 },
  { text: "From hackathons to massive workshops.", triggerWaypoint: 5 },
  { text: "Here is the Gym. Enter to see your path.", triggerWaypoint: 7 },
];

export function PokemonIntro({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trainerRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const treesRef = useRef<(HTMLDivElement | null)[]>([]);

  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [fadeTriggered, setFadeTriggered] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialWidth = window.innerWidth;
    const initialHeight = window.innerHeight;
    const initialScale = Math.min(initialWidth / 800, initialHeight / 533);
    
    let containerWidth = initialWidth;
    let containerHeight = initialHeight;
    let scale = initialScale;

    function calculateDimensions() {
      containerWidth = window.innerWidth;
      containerHeight = window.innerHeight;
      scale = Math.min(containerWidth / 800, containerHeight / 533);
    }

    function percentToPixel(xPercent: number, yPercent: number) {
      return {
        x: (xPercent / 100) * containerWidth,
        y: (yPercent / 100) * containerHeight
      };
    }

    function getScaledTreeDimensions() {
      const width = BASE_TREE_WIDTH * initialScale * (containerWidth / initialWidth);
      const height = BASE_TREE_HEIGHT * initialScale * (containerHeight / initialHeight);
      return { width, height };
    }

    function getScaledSpriteDimensions() {
      return {
        width: BASE_FRAME_WIDTH * scale,
        height: BASE_FRAME_HEIGHT * scale
      };
    }

    let pathIndex = 1;
    let currentX = PATH_PERCENT[0].x;
    let currentY = PATH_PERCENT[0].y;
    let direction: keyof typeof DIRECTIONS = 'down';
    let isMoving = false;
    let startDelay = 60;
    let localFadeTriggered = false;

    function updateTrainerVisuals() {
      if (!trainerRef.current || !shadowRef.current) return;
      
      const pixelPos = percentToPixel(currentX, currentY);
      const dims = getScaledSpriteDimensions();
      
      trainerRef.current.style.width = dims.width + 'px';
      trainerRef.current.style.height = dims.height + 'px';
      trainerRef.current.style.backgroundSize = `${dims.width * 4}px ${dims.height * 4}px`;
      trainerRef.current.style.transform = `translate(${pixelPos.x - dims.width / 2}px, ${pixelPos.y - dims.height}px)`;

      const walkCol = isMoving ? FRAME_SEQUENCE[Math.floor(Date.now() / ANIMATION_SPEED) % 4] : 0;
      const dirRow = DIRECTIONS[direction];
      trainerRef.current.style.backgroundPosition = `-${walkCol * dims.width}px -${dirRow * dims.height}px`;

      const pixelSize = Math.max(2, Math.floor(dims.width / 16));
      const shadowWidth = pixelSize * 8;
      const shadowHeight = pixelSize * 3;
      shadowRef.current.style.transform = `translate(${pixelPos.x - shadowWidth / 2}px, ${pixelPos.y - shadowHeight / 2}px)`;
      
      shadowRef.current.querySelectorAll('.shadow-pixel').forEach(p => {
        (p as HTMLElement).style.width = pixelSize + 'px';
        (p as HTMLElement).style.height = pixelSize + 'px';
      });
    }

    function updateTreePositions() {
      const treeDims = getScaledTreeDimensions();
      treesRef.current.forEach(tree => {
        if (!tree) return;
        const x = parseFloat(tree.dataset.x!);
        const y = parseFloat(tree.dataset.y!);
        const pos = percentToPixel(x, y);
        tree.style.width = treeDims.width + 'px';
        tree.style.height = treeDims.height + 'px';
        tree.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        tree.style.backgroundSize = `${treeDims.width * 4}px ${treeDims.height}px`;
      });
    }

    function triggerGymEntrance() {
      localFadeTriggered = true;
      setFadeTriggered(true);
      setActiveDialog(null);

      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.classList.add('iris-close');
        }
      }, 400);

      setTimeout(() => {
        onComplete();
      }, 2400);
    }

    function move() {
      if (startDelay > 0) {
        startDelay--;
        if (startDelay === 0) isMoving = true;
        return;
      }

      if (pathIndex >= PATH_PERCENT.length) {
        isMoving = false;
        updateTrainerVisuals();
        return;
      }

      // Check dialog triggers
      const dialog = DIALOGS.find(d => d.triggerWaypoint === pathIndex);
      if (dialog && !localFadeTriggered) {
        setActiveDialog(dialog.text);
      }

      if (pathIndex === 8 && !localFadeTriggered) {
        triggerGymEntrance();
      }

      const target = PATH_PERCENT[pathIndex];
      const dx = target.x - currentX;
      const dy = target.y - currentY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = 0.22;

      if (dist < speed) {
        currentX = target.x;
        currentY = target.y;
        pathIndex++;
        if (pathIndex < PATH_PERCENT.length) {
          const next = PATH_PERCENT[pathIndex];
          const adx = Math.abs(next.x - currentX);
          const ady = Math.abs(next.y - currentY);
          if (ady > adx) direction = next.y > currentY ? 'down' : 'up';
          else direction = next.x > currentX ? 'right' : 'left';
        }
      } else {
        currentX += (dx / dist) * speed;
        currentY += (dy / dist) * speed;
        if (Math.abs(dy) > Math.abs(dx)) direction = dy > 0 ? 'down' : 'up';
        else direction = dx > 0 ? 'right' : 'left';
      }

      updateTrainerVisuals();
    }

    // Init loops
    const moveInterval = setInterval(move, 16);

    const treeInterval = setInterval(() => {
      const treeDims = getScaledTreeDimensions();
      const globalFrame = Math.floor(Date.now() / 350) % 4;
      treesRef.current.forEach(tree => {
        if (!tree) return;
        const f = tree.dataset.anim === 'true' ? globalFrame : parseInt(tree.dataset.frame!);
        tree.style.backgroundPosition = `-${f * treeDims.width}px 0`;
      });
    }, 16);

    const handleResize = () => {
      calculateDimensions();
      updateTreePositions();
      updateTrainerVisuals();
    };

    window.addEventListener('resize', handleResize);
    
    // Initial call
    calculateDimensions();
    updateTreePositions();
    updateTrainerVisuals();

    return () => {
      clearInterval(moveInterval);
      clearInterval(treeInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [onComplete]);

  const allTrees = [...BORDER_TREES, ...PROMINENT_TREES];

  return (
    <div 
      ref={containerRef}
      className="absolute top-0 left-0 w-[100vw] h-[100vh] overflow-hidden z-[1000]"
      style={{ clipPath: 'circle(150% at 50% 50%)' }}
    >
      <img 
        src="https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/b407ce49-97cf-4bbf-a64d-2cad5b1d2669/1769050051744-27156646/background.png" 
        className="absolute top-0 left-0 w-full h-full object-fill pixelated" 
        alt="Pokemon Town Background" 
      />
      
      {allTrees.map((pos, idx) => (
        <div 
          key={idx}
          ref={el => {
            if (el) treesRef.current[idx] = el;
          }}
          className={`absolute left-0 top-0 z-50 pixelated transition-opacity duration-600 ${fadeTriggered ? 'opacity-0' : 'opacity-100'}`}
          style={{ backgroundImage: `url('https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/b407ce49-97cf-4bbf-a64d-2cad5b1d2669/1769050059337-fb863397/trees.png')` }}
          data-x={pos.x}
          data-y={pos.y}
          data-anim={idx >= BORDER_TREES.length ? 'true' : 'false'}
          data-frame={(idx * 3 + 1) % 4}
        />
      ))}

      <div 
        ref={shadowRef} 
        className={`absolute z-[99] left-0 top-0 flex flex-col items-center justify-center gap-0 pointer-events-none transition-opacity duration-600 ${fadeTriggered ? 'opacity-0' : 'opacity-100'}`}
      >
        {SHADOW_PATTERN.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-0">
            {row.map((pixel, pIdx) => (
              <div key={pIdx} className={`shadow-pixel ${pixel ? 'bg-black/40' : 'bg-transparent'}`} />
            ))}
          </div>
        ))}
      </div>

      <div 
        ref={trainerRef}
        className={`absolute z-[100] left-0 top-0 pixelated transition-opacity duration-600 ${fadeTriggered ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: `url('https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/b407ce49-97cf-4bbf-a64d-2cad5b1d2669/1769050057516-e98ba078/trainer.png')` }}
      />

      {/* Retro Dialog Box */}
      {activeDialog && !fadeTriggered && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-11/12 max-w-2xl bg-white border-4 border-black rounded-lg p-6 z-[200] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
          <p className="font-retro text-black text-sm md:text-base leading-relaxed typing-effect">
            {activeDialog}
          </p>
        </div>
      )}
    </div>
  );
}
