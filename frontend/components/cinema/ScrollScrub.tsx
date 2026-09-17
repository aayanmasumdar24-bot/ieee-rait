'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { onScroll } from 'animejs';
import type { ScrollObserverParams, Tickable } from 'animejs';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Declares what animates. Called once, on mount, with ScrollScrub's own wrapper
 * element — query targets off `root`, never by global selector, so two of these
 * on one page can't fight over the same nodes.
 *
 * Build it with `autoplay: false`; ScrollScrub pauses whatever it is handed
 * either way, but an unpaused animation gets one uncontrolled frame first.
 */
export type ScrollScrubBuild = (root: HTMLElement) => Tickable;

export type ScrollScrubProps = {
  children: ReactNode;
  build: ScrollScrubBuild;
  className?: string;
  /**
   * `'<container-edge> <target-edge>'` where progress 0 sits.
   * anime.js default is `'end start'` — target top meets viewport bottom.
   */
  enter?: ScrollObserverParams['enter'];
  /** …and where progress 1 sits. anime.js default is `'start end'`. */
  leave?: ScrollObserverParams['leave'];
  /**
   * `true` (default) pins progress to scroll position 1:1. A number below 1
   * lags behind it, an ease name curves it. A method list (`'play pause'`,
   * anime's own default) would turn this back into a one-shot trigger, which is
   * the thing this component exists to avoid — don't pass one.
   */
  sync?: ScrollObserverParams['sync'];
};

/**
 * Scroll position drives an anime.js timeline's progress, rather than scroll
 * merely starting it. The whole scene is therefore scrubbable in both
 * directions and has no state of its own to get out of sync.
 *
 * Pass stable values for `enter`/`leave`/`sync` (module constants, not fresh
 * object literals) — a new identity tears down the observer and rebuilds the
 * timeline from zero.
 */
export function ScrollScrub({
  children,
  build,
  className,
  enter,
  leave,
  sync = true,
}: ScrollScrubProps) {
  const prefersReducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buildRef = useRef(build);

  useEffect(() => {
    buildRef.current = build;
  }, [build]);

  useEffect(() => {
    // Reduced motion creates nothing at all: no observer, no timeline. Children
    // keep exactly the state their own markup put them in.
    if (prefersReducedMotion) return;

    const root = rootRef.current;
    if (!root) return;

    const linked = buildRef.current(root);
    const observer = onScroll({ target: root, enter, leave, sync });
    observer.link(linked);

    return () => {
      observer.revert();
      // Also seeks back to 0, so anime's inline styles come off the targets.
      linked.revert();
    };
  }, [prefersReducedMotion, enter, leave, sync]);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
