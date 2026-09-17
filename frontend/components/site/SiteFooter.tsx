import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  EnvelopeSimpleIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
} from '@phosphor-icons/react/ssr';
import type { Icon } from '@phosphor-icons/react';
import { BRANCH, SOCIALS } from '../../data/config';
import { HOUSES } from '../../data/houseContent';

/** Same faint CSS starfield the cosmos hero/gallery use, so the footer reads as
 * the same space the rest of the page flies through. */
const STARFIELD: CSSProperties = {
  backgroundImage:
    'radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,0.9), transparent), radial-gradient(1.5px 1.5px at 70% 60%, rgba(180,210,255,0.8), transparent), radial-gradient(2px 2px at 40% 80%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 85% 20%, rgba(255,240,200,0.8), transparent)',
  backgroundSize: '600px 600px, 700px 700px, 500px 500px, 450px 450px',
};

type SocialKey = keyof typeof SOCIALS;
type SocialLink = { label: string; href: string; Icon: Icon };

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7dd3fc]';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SOCIAL_SOURCES: readonly { key: SocialKey; label: string; Icon: Icon }[] = [
  { key: 'instagram', label: 'Instagram', Icon: InstagramLogoIcon },
  { key: 'linkedin', label: 'LinkedIn', Icon: LinkedinLogoIcon },
  { key: 'email', label: 'Email the branch', Icon: EnvelopeSimpleIcon },
];

/**
 * SOCIALS ships as REPLACE_ME_* on purpose (see data/config.ts): a dead link is
 * worse than no link, so anything still unresolved — or not plainly https: /
 * mailto: — is dropped rather than rendered with a broken href.
 */
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

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#05070d] text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-50" style={STARFIELD} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_0%,rgba(15,52,96,0.45),transparent_70%)]"
      />
      <span
        aria-hidden
        className="relative z-10 block h-px w-full bg-gradient-to-r from-transparent via-sky-300/40 to-transparent"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-14 px-5 py-16 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] md:gap-20 md:px-6 md:py-20">
        <div>
          <p className="font-mono-tech text-[12px] tracking-[0.42em] text-sky-300/80">
            {BRANCH.shortName}
          </p>
          <h2 className="mt-6 max-w-md bg-gradient-to-r from-sky-200 via-white to-emerald-200 bg-clip-text text-2xl leading-tight font-light tracking-tight text-transparent md:text-[2rem]">
            {BRANCH.name}
          </h2>
          <address className="mt-6 space-y-1 text-sm leading-relaxed text-white/45 not-italic">
            <span className="block">{BRANCH.institute}</span>
            <span className="block">{BRANCH.university}</span>
            <span className="block">{BRANCH.location}</span>
          </address>

          <ul className="mt-10 flex flex-col gap-2.5">
            {Object.values(HOUSES).map((house) => (
              <li
                key={house.sign}
                className="flex items-center gap-3 font-retro text-[8px] tracking-[0.22em] text-white/55"
              >
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0"
                  style={{ backgroundColor: house.signColor }}
                />
                {house.sign}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono-tech text-[11px] tracking-[0.42em] text-sky-300/60">ELSEWHERE</p>

          {SOCIAL_LINKS.length > 0 ? (
            <ul className="mt-6 flex flex-col gap-4">
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
                    <span className="relative">
                      {label}
                      <span
                        aria-hidden
                        className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[#7dd3fc] transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
                      />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/45">
              Socials coming soon — the branch accounts go up here the day they are handed over.
            </p>
          )}
        </div>
      </div>

      <span
        aria-hidden
        className="relative z-10 block h-px w-full bg-gradient-to-r from-transparent via-sky-300/30 to-transparent"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <p className="max-w-md text-[13px] leading-relaxed text-white/35">
          Run by students who joined without knowing much. That is still the usual way in.
        </p>
        <Link
          href="/play"
          className={`group inline-flex shrink-0 items-center gap-2 font-retro text-[9px] tracking-[0.2em] text-[#6ee7b7] transition-colors duration-200 hover:text-white motion-reduce:transition-none ${FOCUS_RING}`}
        >
          <span className="relative">
            WALK THE TOWN
            <span
              aria-hidden
              className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[#6ee7b7] transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
            />
          </span>
          <span aria-hidden>&#9656;</span>
        </Link>
      </div>
    </footer>
  );
}
