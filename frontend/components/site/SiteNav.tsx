'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { BRANCH } from '../../data/config';

import { IEEELogo } from './IEEELogo';

export type NavLink = { href: string; label: string };

export type SiteNavProps = {
  links?: readonly NavLink[];
};

/** Anchor ids the landing page is expected to expose. Override via `links`. */
export const DEFAULT_NAV_LINKS: readonly NavLink[] = [
  { href: '#story', label: 'STORY' },
  { href: '#houses', label: 'HOUSES' },
  { href: '#join', label: 'JOIN' },
];

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7dd3fc]';

const UNDERLINE =
  'absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[#7dd3fc] transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none';

const [WORDMARK_HEAD, ...WORDMARK_REST] = BRANCH.shortName.split(' ');
const WORDMARK_TAIL = WORDMARK_REST.join(' ');

export function SiteNav({ links = DEFAULT_NAV_LINKS }: SiteNavProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    // The sentinel spans the hero, so "stopped intersecting the viewport" is
    // exactly "scrolled past ~80vh" — without a scroll handler on the main thread.
    const observer = new IntersectionObserver(
      ([entry]) => setIsPinned(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen, closeMenu]);

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 h-[80vh] w-px"
      />

      <nav
        aria-label="Main navigation"
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-300 ease-out motion-reduce:transition-none ${
          isPinned ? 'bg-[#05070d]/85 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <a
          href="#main"
          className={`sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[60] focus-visible:bg-[#6ee7b7] focus-visible:px-3 focus-visible:py-2 focus-visible:font-retro focus-visible:text-[9px] focus-visible:tracking-[0.2em] focus-visible:text-[#05070d] ${FOCUS_RING}`}
        >
          SKIP TO CONTENT
        </a>

        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 md:px-6">
          <Link
            href="/"
            className={`group flex items-center gap-2.5 ${FOCUS_RING}`}
            aria-label={`${BRANCH.name} — home`}
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 bg-[#7dd3fc] transition-colors duration-300 group-hover:bg-[#6ee7b7] motion-reduce:transition-none"
            />
            <span className="font-retro text-[10px] tracking-[0.28em] text-white">
              {WORDMARK_HEAD}
            </span>
            {WORDMARK_TAIL && (
              <span className="font-retro text-[10px] tracking-[0.28em] text-white/45 transition-colors duration-300 group-hover:text-white/80 motion-reduce:transition-none">
                {WORDMARK_TAIL}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-7">
            <ul className="hidden items-center gap-7 md:flex">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className={`group relative block font-retro text-[9px] tracking-[0.2em] text-white/55 transition-colors duration-200 hover:text-white motion-reduce:transition-none ${FOCUS_RING}`}
                  >
                    {label}
                    <span aria-hidden className={UNDERLINE} />
                  </a>
                </li>
              ))}
            </ul>

            <Link
              href="/play"
              className={`hidden items-center gap-2 border border-[#6ee7b7]/35 bg-[#6ee7b7]/10 px-4 py-2 font-retro text-[9px] tracking-[0.2em] text-[#6ee7b7] transition-colors duration-200 hover:bg-[#6ee7b7]/20 hover:text-white motion-reduce:transition-none md:inline-flex ${FOCUS_RING}`}
            >
              ENTER TOWN
              <span aria-hidden>&#9656;</span>
            </Link>

            <button
              ref={triggerRef}
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls={menuId}
              onClick={() => setIsMenuOpen((open) => !open)}
              className={`border border-white/15 px-3 py-2 font-retro text-[9px] tracking-[0.2em] text-white/70 transition-colors duration-200 hover:border-white/40 hover:text-white motion-reduce:transition-none md:hidden ${FOCUS_RING}`}
            >
              {isMenuOpen ? 'CLOSE' : 'MENU'}
            </button>
          </div>
        </div>

        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/12 transition-opacity duration-300 motion-reduce:transition-none ${
            isPinned ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div
          id={menuId}
          hidden={!isMenuOpen}
          className="bg-[#05070d]/95 backdrop-blur-md md:hidden"
        >
          <ul className="flex flex-col px-5 pt-2 pb-5">
            {links.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block border-b border-white/10 py-4 font-retro text-[10px] tracking-[0.2em] text-white/70 transition-colors duration-200 hover:text-white motion-reduce:transition-none ${FOCUS_RING}`}
                >
                  {label}
                </a>
              </li>
            ))}
            <li className="pt-5">
              <Link
                href="/play"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between border border-[#6ee7b7]/35 bg-[#6ee7b7]/10 px-4 py-3.5 font-retro text-[10px] tracking-[0.2em] text-[#6ee7b7] transition-colors duration-200 hover:bg-[#6ee7b7]/20 hover:text-white motion-reduce:transition-none ${FOCUS_RING}`}
              >
                ENTER TOWN
                <span aria-hidden>&#9656;</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
