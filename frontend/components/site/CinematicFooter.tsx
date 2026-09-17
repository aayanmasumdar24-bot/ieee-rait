'use client';

import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowUpIcon,
  EnvelopeSimpleIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
} from '@phosphor-icons/react/ssr';
import type { Icon } from '@phosphor-icons/react';
import clsx from 'clsx';
import { BRANCH, SOCIALS, CONTACT_NUMBERS } from '../../data/config';

// Same guard WorkshopWall uses: register the plugin once, but never on the
// server where `window` is absent.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/** Keyframes Tailwind can't do inline. Static, author-controlled CSS (no
 *  interpolation), so a plain <style> child is safe. Both stop on reduced motion. */
const FOOTER_CSS = `
@keyframes footer-marquee {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
}
@keyframes footer-breathe {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.1); }
}
.footer-marquee-track { animation: footer-marquee 34s linear infinite; }
.footer-aurora { animation: footer-breathe 13s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .footer-marquee-track, .footer-aurora { animation: none; }
}
`;

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7dd3fc] focus-visible:outline-none';

// --- Socials guard (discipline copied from SiteFooter.tsx) -------------------
// SOCIALS ships as REPLACE_ME_* on purpose; drop anything unresolved or unsafe.
type SocialKey = keyof typeof SOCIALS;
type SocialLink = { label: string; href: string; Icon: Icon };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SOCIAL_SOURCES: readonly { key: SocialKey; label: string; Icon: Icon }[] = [
  { key: 'instagram', label: 'Instagram', Icon: InstagramLogoIcon },
  { key: 'linkedin', label: 'LinkedIn', Icon: LinkedinLogoIcon },
  { key: 'email', label: 'Email the branch', Icon: EnvelopeSimpleIcon },
];

function socialHref(key: SocialKey): string | null {
  const value: string = SOCIALS[key];
  if (!value || value.startsWith('REPLACE_ME')) return null;
  if (key === 'email') {
    const address = value.replace(/^mailto:/, '');
    return EMAIL_PATTERN.test(address) ? `mailto:${address}` : null;
  }
  return value.startsWith('https://') ? value : null;
}

const SOCIAL_LINKS: readonly SocialLink[] = SOCIAL_SOURCES.flatMap(({ key, label, Icon }) => {
  const href = socialHref(key);
  return href ? [{ label, href, Icon }] : [];
});

// --- Content -----------------------------------------------------------------
/** Real committee activities, scrolled as an ambient strip. */
const MARQUEE_ITEMS: readonly string[] = [
  'WORKSHOPS',
  'ROBOTICS',
  'WEB DEV',
  'GIT & LINUX',
  'COMPETITIVE PROGRAMMING',
  'APPLIED ML',
  'EVENTS',
  'DESIGN',
  'SPONSORSHIP',
  'IEEE XPLORE',
];

type NavPill = { label: string; href: string };
/** The footer carries every route the dock does; primary CTA is split out. */
const NAV_PILLS: readonly NavPill[] = [
  { label: 'HOME', href: '/' },
  { label: 'GALLERY', href: '/gallery' },
  { label: 'JOIN', href: '#join' },
];

const PILL_BASE =
  'footer-magnetic footer-reveal group relative inline-flex items-center gap-2.5 rounded-full px-6 py-3 font-mono-tech text-[12px] tracking-[0.24em] backdrop-blur-md transition-colors duration-200 motion-reduce:transition-none';
const PILL_NAV = `${PILL_BASE} border border-white/15 bg-white/[0.05] text-white/80 hover:border-white/35 hover:bg-white/[0.09] hover:text-white ${FOCUS_RING}`;
const PILL_PRIMARY = `${PILL_BASE} border border-sky-300/40 bg-sky-300/10 text-sky-200 hover:border-sky-300/70 hover:bg-sky-300/20 hover:text-white ${FOCUS_RING}`;

export function CinematicFooter({ className }: { className?: string } = {}): JSX.Element {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === 'undefined') return;
    // Read once inside the effect (WorkshopWall's pattern) — no React state, so
    // nothing to sync and no set-state-in-effect to trip the lint rule.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // motion skipped entirely; content is already visible.

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      // Giant wordmark drifts against the scroll — subtle, clipped by the root.
      gsap.fromTo(
        '.footer-giant',
        { yPercent: 12 },
        {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );

      // Staggered reveal. gsap.from (not a CSS pre-hide) keeps content visible
      // if the plugin fails.
      gsap.from('.footer-reveal', {
        y: 44,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: { trigger: root, start: 'top 80%', once: true },
      });

      // Magnetic pointer-follow per pill; quickTo stays on transform, elastic spring-back.
      const pills = gsap.utils.toArray<HTMLElement>('.footer-magnetic');
      pills.forEach((el) => {
        const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.45)' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.45)' });
        const rTo = gsap.quickTo(el, 'rotation', { duration: 0.7, ease: 'elastic.out(1, 0.45)' });

        const onMove = (event: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          const dx = event.clientX - (rect.left + rect.width / 2);
          const dy = event.clientY - (rect.top + rect.height / 2);
          xTo(dx * 0.4);
          yTo(dy * 0.4);
          rTo(dx * 0.05);
          gsap.to(el, { scale: 1.06, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
          rTo(0);
          gsap.to(el, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
        };

        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerleave', onLeave);
        cleanups.push(() => {
          el.removeEventListener('pointermove', onMove);
          el.removeEventListener('pointerleave', onLeave);
        });
      });
    }, rootRef);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  const handleBackToTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <footer
      ref={rootRef}
      id="site-footer"
      className={clsx(
        'relative isolate w-full overflow-hidden bg-[#05070d] text-white',
        className,
      )}
    >
      <style>{FOOTER_CSS}</style>

      {/* Aurora glow — three breathing blobs on the house triad. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="footer-aurora absolute -top-24 -left-16 h-80 w-80 rounded-full bg-sky-400/25 blur-[120px]" />
        <div className="footer-aurora absolute -top-10 right-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-[120px]" />
        <div className="footer-aurora absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-300/15 blur-[130px]" />
      </div>
      {/* Blueprint grid + scanline, reusing the shared utilities for texture. */}
      <div aria-hidden className="blueprint-grid pointer-events-none absolute inset-0 z-0 opacity-40" />
      <div aria-hidden className="scanline pointer-events-none absolute inset-0 z-0 opacity-[0.05]" />

      {/* Top hairline, matching the site footer's seam. */}
      <span
        aria-hidden
        className="relative z-10 block h-px w-full bg-gradient-to-r from-transparent via-sky-300/40 to-transparent"
      />

      {/* Giant background wordmark. */}
      <div
        aria-hidden
        className="footer-giant pointer-events-none absolute inset-x-0 bottom-2 z-0 flex justify-center"
      >
        <span className="font-retro leading-none whitespace-nowrap text-white/[0.045] text-[clamp(3rem,15vw,12rem)]">
          {BRANCH.shortName}
        </span>
      </div>

      {/* Marquee strip. Decorative, so hidden from the accessibility tree. */}
      <div
        aria-hidden
        className="relative z-10 overflow-hidden border-y border-white/10 bg-white/[0.02] py-4"
      >
        <div className="footer-marquee-track flex w-max items-center gap-8">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={`${item}-${i}`} className="flex items-center gap-8">
              <span className="font-mono-tech text-sm tracking-[0.3em] whitespace-nowrap text-white/40">
                {item}
              </span>
              <span className="text-sky-300/50">&#10022;</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main content. */}
      <div className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col justify-center gap-12 px-5 py-20 md:px-6 md:py-28">
        <div className="max-w-2xl">
          <p className="footer-reveal font-mono-tech text-[12px] tracking-[0.42em] text-sky-300/80">
            {BRANCH.shortName}
          </p>
          <h2
            className="footer-reveal mt-6 bg-clip-text text-transparent text-[clamp(2.25rem,6vw,4.75rem)] leading-[1.05] font-light tracking-tight"
            style={{ backgroundImage: 'linear-gradient(180deg,#ffffff 0%,#cdd9e8 45%,#6b7a91 100%)' }}
          >
            Come build with us.
          </h2>
          <address className="footer-reveal mt-6 space-y-1 text-sm leading-relaxed text-white/45 not-italic">
            <span className="block">{BRANCH.institute}</span>
            <span className="block">{BRANCH.university}</span>
            <span className="block">{BRANCH.location}</span>
          </address>
        </div>

        {/* Every route the site carries — magnetic glass pills. */}
        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-4">
          <Link href="/play" className={PILL_PRIMARY}>
            ENTER THE WORLD
            <span
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            >
              &#9656;
            </span>
          </Link>
          {NAV_PILLS.map(({ label, href }) => (
            <Link key={href} href={href} className={PILL_NAV}>
              {label}
            </Link>
          ))}
        </nav>

        {/* Socials — same guard as SiteFooter; honest fallback if none resolve. */}
        <div className="footer-reveal">
          <p className="font-mono-tech text-[11px] tracking-[0.42em] text-sky-300/60">ELSEWHERE</p>
          {SOCIAL_LINKS.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group inline-flex items-center gap-3 text-sm text-white/65 transition-colors duration-200 hover:text-white motion-reduce:transition-none ${FOCUS_RING}`}
                  >
                    <Icon
                      aria-hidden
                      size={18}
                      className="text-white/35 transition-colors duration-200 group-hover:text-[#7dd3fc] motion-reduce:transition-none"
                    />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/45">
              Socials coming soon — the branch accounts go up here the day they are handed over.
            </p>
          )}
        </div>

        {/* Contact Numbers */}
        <div className="footer-reveal">
          <p className="font-mono-tech text-[11px] tracking-[0.42em] text-sky-300/60">CONTACT DIRECTLY</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {CONTACT_NUMBERS.map((person) => (
              <a
                key={person.name}
                href={`tel:${person.raw}`}
                className="group flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-left backdrop-blur-sm transition-all duration-200 hover:border-sky-400/50 hover:bg-white/[0.07] active:scale-[0.98]"
              >
                <span className="font-retro text-[9px] font-bold text-white transition-colors group-hover:text-sky-200">
                  {person.name}
                </span>
                <span className="font-mono-tech text-xs tracking-wider text-sky-300 transition-colors group-hover:text-white">
                  {person.phone}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar: credits + back to top. */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5 border-t border-white/10 px-5 py-7 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <p className="text-[13px] text-white/35">&copy; 2026 {BRANCH.name}</p>
        <button
          type="button"
          onClick={handleBackToTop}
          className={`group inline-flex items-center gap-2 font-mono-tech text-[11px] tracking-[0.24em] text-white/60 transition-colors duration-200 hover:text-white motion-reduce:transition-none ${FOCUS_RING}`}
        >
          BACK TO TOP
          <ArrowUpIcon
            aria-hidden
            size={16}
            className="text-sky-300/70 transition-transform duration-200 group-hover:-translate-y-1 motion-reduce:transition-none"
          />
        </button>
      </div>
    </footer>
  );
}
