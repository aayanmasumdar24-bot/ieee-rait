import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { InstagramLogoIcon, LinkedinLogoIcon, EnvelopeSimpleIcon } from '@phosphor-icons/react/ssr';
import { BRANCH, SOCIALS, CONTACT_NUMBERS } from '../../data/config';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Reach IEEE RAIT at ${BRANCH.institute}, ${BRANCH.location}.`,
};

const STARFIELD: CSSProperties = {
  backgroundImage:
    'radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,0.9), transparent), radial-gradient(1.5px 1.5px at 70% 60%, rgba(180,210,255,0.8), transparent), radial-gradient(2px 2px at 40% 80%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 85% 20%, rgba(255,240,200,0.8), transparent)',
  backgroundSize: '600px 600px, 700px 700px, 500px 500px, 450px 450px',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A social value only becomes a link if it is real: placeholders and malformed
 * values are dropped so we never ship a dead href (same discipline as the
 * footer). Everything in SOCIALS is a REPLACE_ME_* placeholder today, so this
 * page currently shows the honest "coming soon" note.
 */
function socialHref(kind: 'instagram' | 'linkedin' | 'email', value: string): string | null {
  if (!value || value.startsWith('REPLACE_ME')) return null;
  if (kind === 'email') {
    const email = value.replace(/^mailto:/, '');
    return EMAIL_PATTERN.test(email) ? `mailto:${email}` : null;
  }
  return value.startsWith('https://') ? value : null;
}

const LINKS = [
  { kind: 'instagram' as const, label: 'Instagram', Icon: InstagramLogoIcon, href: socialHref('instagram', SOCIALS.instagram) },
  { kind: 'linkedin' as const, label: 'LinkedIn', Icon: LinkedinLogoIcon, href: socialHref('linkedin', SOCIALS.linkedin) },
  { kind: 'email' as const, label: 'Email', Icon: EnvelopeSimpleIcon, href: socialHref('email', SOCIALS.email) },
].filter((l): l is typeof l & { href: string } => l.href !== null);

export default function ContactPage() {
  return (
    <main
      id="main"
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center bg-[#05070d] px-6 py-24 text-center"
    >
      <div aria-hidden className="pointer-events-none fixed inset-0 opacity-70" style={STARFIELD} />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(15,52,96,0.5),transparent_70%)]"
      />

      <div className="relative z-10 max-w-2xl w-full">
        <p className="font-mono-tech text-[11px] tracking-[0.42em] text-sky-300/70 sm:text-[13px]">
          {BRANCH.shortName} · CONTACT
        </p>
        <h1 className="mt-6 font-retro text-[clamp(1.8rem,6vw,4rem)] leading-[1.1] tracking-tight text-white">
          GET IN TOUCH
        </h1>

        <address className="mt-8 space-y-1 text-[15px] leading-relaxed text-slate-200/85 not-italic sm:text-lg">
          <span className="block font-semibold text-white">{BRANCH.name}</span>
          <span className="block">{BRANCH.institute}</span>
          <span className="block">{BRANCH.university}</span>
          <span className="block">{BRANCH.location}</span>
        </address>

        {/* Direct Contact Numbers */}
        <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {CONTACT_NUMBERS.map((person) => (
            <a
              key={person.name}
              href={`tel:${person.raw}`}
              className="group flex flex-col items-start justify-center rounded-2xl border border-white/15 bg-white/[0.03] p-5 text-left backdrop-blur-sm transition-all duration-200 hover:border-sky-400/50 hover:bg-white/[0.07] hover:shadow-[0_4px_20px_rgba(125,211,252,0.15)] active:scale-[0.98]"
            >
              <span className="font-retro text-xs sm:text-sm font-bold text-white transition-colors group-hover:text-sky-200">
                {person.name}
              </span>
              <span className="font-mono-tech mt-2 text-xs tracking-wider text-sky-300 transition-colors group-hover:text-white">
                {person.phone}
              </span>
            </a>
          ))}
        </div>

        {LINKS.length > 0 ? (
          <ul className="mt-10 flex items-center justify-center gap-4">
            {LINKS.map(({ label, Icon, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] text-white/75 transition-colors hover:border-sky-300/60 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none"
                >
                  <Icon size={22} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 font-mono-tech text-[10px] leading-relaxed tracking-[0.24em] text-white/45 uppercase">
            Socials coming soon — the branch accounts go up here the day they are handed over.
          </p>
        )}

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <Link
            href="/play"
            className="group inline-flex items-center gap-3 rounded-[3px] border-b-4 border-sky-700 bg-sky-300 px-7 py-4 font-retro text-[10px] tracking-[0.18em] text-[#05070d] transition-colors hover:bg-sky-200 focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:outline-none active:translate-y-1 active:border-b-0"
          >
            ENTER THE WORLD
            <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-1">
              &rsaquo;
            </span>
          </Link>
          <Link
            href="/"
            className="font-mono-tech border-b-2 border-white/25 pb-1 text-[10px] tracking-[0.18em] text-white/70 transition-colors hover:border-sky-300 hover:text-white focus-visible:outline-none"
          >
            BACK HOME
          </Link>
        </div>
      </div>
    </main>
  );
}
