'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { RefObject } from 'react';

export type UseInViewOnceOptions = {
  threshold?: number;
  rootMargin?: string;
  disabled?: boolean;
};

export type UseInViewOnceResult<T extends Element> = {
  ref: RefObject<T | null>;
  isInView: boolean;
};

// Support never changes at runtime, so there is nothing to subscribe to. The
// server snapshot assumes support; the client corrects it during hydration,
// which keeps this out of an effect (no setState-in-effect cascade).
const neverChanges = () => () => {};
const isObserverMissing = () => typeof IntersectionObserver === 'undefined';
const isObserverMissingOnServer = () => false;

/**
 * Fires once and then stops observing, so revealed content never re-hides.
 * `disabled` — or a missing IntersectionObserver — short-circuits to visible.
 */
export function useInViewOnce<T extends Element = HTMLElement>({
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
  disabled = false,
}: UseInViewOnceOptions = {}): UseInViewOnceResult<T> {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);
  const observerMissing = useSyncExternalStore(
    neverChanges,
    isObserverMissing,
    isObserverMissingOnServer,
  );

  useEffect(() => {
    if (disabled || observerMissing) return;
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setIsInView(true);
          observer.disconnect();
          return;
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, disabled, observerMissing]);

  return { ref, isInView: disabled || observerMissing || isInView };
}
