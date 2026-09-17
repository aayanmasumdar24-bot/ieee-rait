/**
 * Every externally-owned value lives here, so swapping assets and links
 * never means touching a component.
 *
 * REPLACE_ME markers are scanned by scripts/check-content.mjs, which fails
 * `npm run build:prod`. That is deliberate: a dead CTA is worse than an
 * honest "applications open soon" card, and the only reliable way to never
 * ship one is to make the build refuse.
 */

export const BRANCH = {
  name: 'IEEE RAIT Student Branch',
  shortName: 'IEEE RAIT',
  institute: 'Ramrao Adik Institute of Technology',
  university: 'D Y Patil Deemed to be University',
  location: 'Nerul, Navi Mumbai',
} as const;

/**
 * Google Form endpoints, one per track. Must be owned by a branch account,
 * never a personal one — the form collects name, roll number, department,
 * year, email and phone, which is personal data under the DPDP Act 2023.
 * The form itself must carry a consent line at the point of collection.
 *
 * null is a valid production state: it renders an informational card
 * instead of a button. See components/register/RegistrationModal.tsx.
 */
export const FORMS: Record<'core' | 'associate', string | null> = {
  core: 'https://docs.google.com/forms/d/e/1FAIpQLSe6SasLjffR8sBgmqkNTQ0x801nvCeA8ShKLtfm8nCrJcJ-9Q/viewform',
  associate: 'https://docs.google.com/forms/d/e/1FAIpQLSe6SasLjffR8sBgmqkNTQ0x801nvCeA8ShKLtfm8nCrJcJ-9Q/viewform',
};

/** Applications close date, ISO 8601 YYYY-MM-DD. null hides the chip. */
export const APPLICATIONS_CLOSE: string | null = null;

export const SOCIALS = {
  instagram: 'REPLACE_ME_INSTAGRAM_URL',
  linkedin: 'REPLACE_ME_LINKEDIN_URL',
  email: 'REPLACE_ME_BRANCH_EMAIL',
} as const;

export const CONTACT_NUMBERS = [
  { name: 'Sriniketh', phone: '+91 90040 82745', raw: '+919004082745' },
  { name: 'Dhruv', phone: '+91 9007357616', raw: '+919007357616' },
  { name: 'Nihar', phone: '+91 9167359969', raw: '+919167359969' },
] as const;

/**
 * Cookieless, IP-anonymising analytics domain. Empty string disables the
 * script entirely — no beacon, so no consent banner is required.
 */
export const ANALYTICS_DOMAIN = '';

/** Funnel targets from the PRD. Read by the events helper only. */
export const FUNNEL_TARGETS = {
  /** Share of visitors reaching the join scene. */
  arriveToJoin: 0.45,
  /** Share of join-scene visitors opening the modal. */
  joinToModal: 0.3,
} as const;
