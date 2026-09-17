'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

export type StickySceneProps = {
  /** Pinned layer, held at the top of the viewport for the whole scene. */
  visual: ReactNode;
  /** Scrolling steps; each gets `data-step={index}` and `data-active` when centred. */
  panels: ReactNode[];
  className?: string;
  onStepChange?: (index: number) => void;
};

const STICKY_LAYER: CSSProperties = {
  position: 'sticky',
  top: 0,
  height: '100svh',
};

// Panels are pulled back over the pinned layer so they scroll across it.
const PANEL_LIST: CSSProperties = {
  position: 'relative',
  marginTop: '-100svh',
};

const PANEL: CSSProperties = {
  minHeight: '100svh',
  display: 'flex',
  alignItems: 'center',
};

export function StickyScene({ visual, panels, className, onStepChange }: StickySceneProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const onStepChangeRef = useRef(onStepChange);

  useEffect(() => {
    onStepChangeRef.current = onStepChange;
  }, [onStepChange]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    // ponytail: no observer support means step 0 stays active; the stacked
    // layout and all panel content are still fully readable.
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number(entry.target.getAttribute('data-step'));
          setActiveIndex(index);
          onStepChangeRef.current?.(index);
        }
      },
      // Collapses the root to the viewport's centre line: a panel is active
      // once its own centre crosses it.
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );

    for (const step of list.querySelectorAll<HTMLElement>('[data-step]')) {
      observer.observe(step);
    }
    return () => observer.disconnect();
  }, [panels.length]);

  return (
    <section className={className}>
      <div style={{ position: 'relative' }}>
        <div style={STICKY_LAYER}>{visual}</div>
        <div ref={listRef} style={PANEL_LIST}>
          {panels.map((panel, index) => (
            <div
              key={index}
              data-step={index}
              data-active={index === activeIndex || undefined}
              style={PANEL}
            >
              {panel}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
