'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HouseIcon,
  GameControllerIcon,
  ImagesIcon,
  EnvelopeSimpleIcon,
  type Icon,
} from '@phosphor-icons/react';

type DockItem = { href: string; label: string; Icon: Icon };

const ITEMS: readonly DockItem[] = [
  { href: '/', label: 'HOME', Icon: HouseIcon },
  { href: '/play', label: 'GAME', Icon: GameControllerIcon },
  { href: '/gallery', label: 'GALLERY', Icon: ImagesIcon },
  { href: '/contact', label: 'CONTACT', Icon: EnvelopeSimpleIcon },
];

/**
 * Apple "liquid glass" distortion. Turbulence → blur → displacement map, driven
 * off the backdrop layer so the space behind the dock refracts at the edges.
 * scale is dialled well below the full-screen demo's 200 — a dock is small, so
 * a big displacement would tear rather than ripple.
 */
function GlassFilter() {
  return (
    <svg aria-hidden className="absolute h-0 w-0">
      <filter id="dock-glass" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.009" numOctaves="2" seed="17" result="turb" />
        <feGaussianBlur in="turb" stdDeviation="2" result="softMap" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale="56"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}

/**
 * iOS-style dock, fixed bottom-centre, global on every content route. Hidden on
 * /play — the game owns its own chrome. The bar is a liquid-glass panel: a
 * frosted, refracting backdrop under a white tint and an inset bevel, with the
 * links riding on top. Client component only for the active-route highlight.
 */
export function Dock() {
  const pathname = usePathname();
  if (pathname === '/play') return null;

  return (
    <nav aria-label="Site sections" className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2">
      <GlassFilter />
      {/* No overflow-hidden here, or the hover tooltips get clipped; each glass
          layer rounds itself instead (backdrop-filter respects border-radius). */}
      <div
        className="relative rounded-2xl"
        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 22px rgba(0,0,0,0.28)' }}
      >
        {/* Frost + refraction — clipped to the rounded box so the filter can't bleed. */}
        <div
          aria-hidden
          className="absolute inset-0 z-0 overflow-hidden rounded-2xl"
          style={{ backdropFilter: 'blur(6px)', filter: 'url(#dock-glass)', isolation: 'isolate' }}
        />
        {/* Glass tint. */}
        <div
          aria-hidden
          className="absolute inset-0 z-10 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.12)' }}
        />
        {/* Inset bevel — the lit top-left / shadowed bottom-right edge. */}
        <div
          aria-hidden
          className="absolute inset-0 z-20 rounded-2xl"
          style={{
            boxShadow:
              'inset 2px 2px 1px 0 rgba(255,255,255,0.4), inset -1px -1px 1px 1px rgba(255,255,255,0.22)',
          }}
        />

        <ul className="relative z-30 flex items-end gap-1.5 px-3 py-2 sm:gap-2">
          {ITEMS.map(({ href, label, Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <li key={href} className="group relative">
                {/* Tooltip label, above the icon on hover/focus (escapes the bar). */}
                <span className="font-mono-tech pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md border border-white/10 bg-[#05070d] px-2 py-1 text-[9px] tracking-[0.2em] whitespace-nowrap text-white/80 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                  {label}
                </span>
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white/85 transition-transform duration-200 ease-out hover:-translate-y-2 hover:scale-110 hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
                >
                  <Icon
                    size={26}
                    weight={active ? 'fill' : 'regular'}
                    className={active ? 'text-sky-300' : undefined}
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(5,7,13,0.7))' }}
                  />
                </Link>
                {active && (
                  <span
                    aria-hidden
                    className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-sky-300"
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
