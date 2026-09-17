/**
 * The single source of truth for every shape the narrative reads.
 * Nothing in components/ may widen these unions inline.
 */

/** Six functional domains of the junior committee. */
export type DomainId = 'ops' | 'td' | 'rd' | 'cc' | 'pe' | 'so';

/** The two ways into the committee. Drives the registration modal. */
export type Track = 'core' | 'associate';

/** Scene 0..6. Derived from scroll progress, never set directly. */
export type SceneIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Render capability, resolved once on mount. */
export type Tier = 'full' | 'reduced' | 'static';

/** Choice 1 — narrows which domains get emphasis. Never restricts access. */
export type FocusChoice = 'technical' | 'creative' | 'operations';

/** Choice 2 — flavours the copy in Act 3 and the role list. */
export type ModeChoice = 'learning' | 'building';

/**
 * Provenance is load-bearing, not decorative. `verified` means a human
 * confirmed the claim against a primary source. `placeholder` means the
 * entry is scaffolding and must not ship.
 * scripts/check-content.mjs fails the production build on any `placeholder`
 * still present, because unsourced claims about a real organisation are the
 * one defect that cannot be styled around.
 */
export type Provenance = 'verified' | 'placeholder';

export type MediaKind = 'image' | 'video';

export interface MediaAsset {
  kind: MediaKind;
  /** Path under /public, or null while awaiting the real asset. */
  src: string | null;
  /** Required. Describes content, not the fact that it is an image. */
  alt: string;
  /** Poster frame for video. Ignored for images. */
  poster?: string | null;
  /** Consent status for anything showing an identifiable person. */
  consent?: 'cleared' | 'pending' | 'no-faces';
}

export interface Role {
  id: string;
  title: string;
  domain: DomainId;
  /** One sentence. What the person actually does week to week. */
  summary: string;
  /** Three to five concrete duties. Rendered as a list. */
  duties: readonly string[];
  /** Which tracks this role opens for. */
  tracks: readonly Track[];
  /** False keeps the role visible but hides the apply affordance. */
  isOpen: boolean;
  provenance: Provenance;
}

export interface Domain {
  id: DomainId;
  /** Full formal name. Used in headings. */
  name: string;
  /** Two or three words. Used on 3D node labels and chips. */
  shortName: string;
  /** A single declarative line. No marketing adjectives. */
  tagline: string;
  /** Two to four sentences on what the domain is responsible for. */
  description: string;
  /** Hex accent. Must clear 4.5:1 on --surface-1 at body size. */
  accent: string;
  /** Node position in the 3D network, in world units. */
  node: readonly [number, number, number];
  /** Which Choice-1 answers emphasise this domain. */
  affinity: readonly FocusChoice[];
}

export interface Achievement {
  id: string;
  /** ISO 8601 YYYY-MM-DD, or bare YYYY when only the year is sourced. */
  date: string;
  title: string;
  detail: string;
  /** Numbers only when they can be sourced. Omit otherwise. */
  metric?: string;
  media?: MediaAsset;
  provenance: Provenance;
}

export interface Workshop {
  id: string;
  /** ISO 8601 YYYY-MM-DD. */
  date: string;
  title: string;
  /** What attendees left knowing how to do. */
  outcome: string;
  /** Verified headcount, or null. Never estimate. */
  attendance: number | null;
  facilitator?: string;
  domains: readonly DomainId[];
  media?: MediaAsset;
  provenance: Provenance;
}

export interface Activity {
  id: string;
  title: string;
  detail: string;
  /** 'live' shows a pulse dot, 'upcoming' shows a date chip. */
  status: 'live' | 'upcoming';
  /** ISO 8601 YYYY-MM-DD. */
  date?: string;
  domains: readonly DomainId[];
  provenance: Provenance;
}

/** The three reversible choices, persisted to sessionStorage. */
export interface Choices {
  focus: FocusChoice | null;
  mode: ModeChoice | null;
  track: Track | null;
}
