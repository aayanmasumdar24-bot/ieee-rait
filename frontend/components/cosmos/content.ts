/**
 * Committee narrative for the cosmos hero. The scroll flies the camera through
 * space while these four "poster" sections crossfade in — the branch, then each
 * of the three houses. Copy is condensed from data/story.ts's beats so the
 * landing page and the game stay one voice; the branch identity is pulled from
 * config so nothing is retyped.
 */
import { BRANCH } from '../../data/config';

export type CosmosSection = {
  id: string;
  /** Zero-padded index shown in the corner counter. */
  index: string;
  /** Small label above the big title. */
  kicker: string;
  /** The large, character-split headline. */
  title: string;
  /** Exactly two lines of sub-copy. */
  lines: readonly [string, string];
};

export const COSMOS_SECTIONS: readonly CosmosSection[] = [
  {
    id: 'branch',
    index: '01',
    kicker: '',
    title: 'IEEE RAIT',
    lines: [
      `The IEEE student branch at ${BRANCH.institute}, ${BRANCH.location}.`,
      'Run by students who joined without knowing much. That is the usual way in.',
    ],
  },
  {
    id: 'technical',
    index: '02',
    kicker: 'THE FIRST HOUSE',
    title: 'TECHNICAL',
    lines: [
      'Solder, sensors and motors, and the moment a breadboard proves you wrong.',
      'Web, Git and Linux, competitive programming, applied ML — shipped in the open.',
    ],
  },
  {
    id: 'nontechnical',
    index: '03',
    kicker: 'THE SECOND HOUSE',
    title: 'NON-TECHNICAL',
    lines: [
      'The half that makes events actually happen — operations, design, sponsorship.',
      'The deadline here is a room full of people who arrive whether you are ready or not.',
    ],
  },
  {
    id: 'join',
    index: '04',
    kicker: 'THE THIRD HOUSE',
    title: 'JOIN IEEE',
    lines: [
      'IEEE Xplore, technical societies, a record of work beyond your transcript.',
      'Core team or associate member — most people start as associates.',
    ],
  },
] as const;

/** The one action that leaves this page: into the playable town. */
export const PLAY_CTA = { href: '/play', label: 'ENTER THE WORLD' } as const;

/**
 * Two ways to join. Honest while the forms are still placeholders — the shell
 * renders "opening soon" instead of a dead button (see FORMS in config).
 */
export const JOIN_TRACKS = [
  { id: 'core', name: 'JOINT CORE TEAM', note: 'An execution role in one domain. More responsibility, more time.' },
  { id: 'associate', name: 'ASSOCIATE', note: 'Events, workshops and project teams. No portfolio required.' },
] as const;

export type GalleryItem = {
  /** Public path under /gallery. */
  src: string;
  /** Describes only what the frame shows — no invented titles or dates. */
  caption: string;
  type: 'image' | 'video';
};

/**
 * Real committee media (copied into public/gallery from the event shoot): a
 * workshop run in the campus lab. Videos are interleaved so the scatter layout
 * mixes them among the stills. Captions stay literal to what is visible.
 */
export const GALLERY_ITEMS: readonly GalleryItem[] = [
  { src: '/gallery/event-01.jpeg', caption: 'Opening the session in the lab', type: 'image' },
  { src: '/gallery/event-02.jpeg', caption: 'A student takes the podium', type: 'image' },
  { src: '/gallery/clip-01.mp4', caption: 'Inside the workshop', type: 'video' },
  { src: '/gallery/event-03.jpeg', caption: 'Following along at the workstations', type: 'image' },
  { src: '/gallery/event-04.jpeg', caption: 'Walking the room through it', type: 'image' },
  { src: '/gallery/event-05.jpeg', caption: 'A talk from the front', type: 'image' },
  { src: '/gallery/clip-02.mp4', caption: 'Inside the workshop', type: 'video' },
  { src: '/gallery/event-06.jpeg', caption: 'A full room, listening', type: 'image' },
  { src: '/gallery/event-07.jpeg', caption: 'The cohort, together', type: 'image' },
  { src: '/gallery/event-08.jpeg', caption: 'Hands up during the session', type: 'image' },
  { src: '/gallery/clip-03.mp4', caption: 'Inside the workshop', type: 'video' },
  { src: '/gallery/event-09.jpeg', caption: 'Hands-on at the laptops', type: 'image' },
  { src: '/gallery/event-10.jpeg', caption: 'Working the whole room', type: 'image' },
] as const;
