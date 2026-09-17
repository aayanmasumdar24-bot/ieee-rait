/**
 * The narrative spine for the scroll-driven landing page at `/`.
 *
 * The game at `/play` is the real tour. This file is the same tour for someone
 * who is not going to press a key: a visitor arrives at the island, learns who
 * runs it, meets the three houses, and is pointed at the door.
 *
 * Words only. Scenes own geometry, houseContent.ts owns what is inside the
 * houses, and this file owns the walk-past version. Anything factual here is
 * adapted from data/config.ts or data/houseContent.ts rather than restated,
 * so there is one copy of each claim to correct.
 */

import { BRANCH } from './config';
import { HOUSES, type HouseId } from './houseContent';

export type StoryBeat = {
  id: string;
  /** Small label above the title. Two or three words. */
  kicker: string;
  title: string;
  /** One string per paragraph, in order. */
  body: readonly string[];
  /** Hex accent for inline styles. Mirrors `House.signColor`. */
  accent?: string;
  /** Tailwind text-colour class. Mirrors `House.accent`. */
  accentClass?: string;
  /** Internal route. Only on beats that offer a way onward. */
  href?: string;
  /** Link text. Meaningless without `href`. */
  cta?: string;
};

/**
 * Per-house copy. Accents are not in here on purpose — they are read off
 * HOUSES below, so the page and the Phaser sign can never disagree about
 * what colour a house is.
 */
const HOUSE_BEAT_COPY: Record<HouseId, { title: string; body: readonly string[] }> = {
  technical: {
    title: 'Solder, Code, and a Blinking LED',
    body: [
      'The technical house is the side of the branch that smells of solder. Microcontrollers, sensors and motors, and the moment a breadboard disproves an assumption you were fond of.',
      'The other half is code: web development bootcamps, Git and Linux fundamentals, competitive programming, applied machine learning. Work is done in small teams and shipped publicly.',
      'No prior experience is assumed. The first project is usually a blinking LED, and that is a perfectly respectable place to start.',
    ],
  },
  nontechnical: {
    title: 'The Half That Makes Events Happen',
    body: [
      'Core turns plans into events that actually happen. Venue bookings, schedules, registration desks, budgets, faculty approvals, and the unglamorous hour before a session when nothing is set up yet.',
      'Creatives give the branch a face: posters, reels, event branding, photography, and the feed that decides whether anyone shows up. Sponsorship writes the proposals that pay for it.',
      'The deadline in this house is a room full of people who arrive whether or not you are ready. It teaches coordination faster than a syllabus does.',
    ],
  },
  join: {
    title: 'What Membership Actually Gets You',
    body: [
      'Access to IEEE Xplore, the digital library behind most of the papers your professors cite. Membership in technical societies and their conferences. A record of work that exists outside your transcript.',
      'Two ways in. Core team means an execution role in a domain, with more responsibility and more time. Associate member means events, workshops and project teams without a formal portfolio. Most people start as associates.',
      'The honest pitch is not the certificate. It is that you get to build things with people who care, before anybody is paying you to.',
    ],
  },
};

/**
 * Not the in-game unlock order. The game opens the centre house first and the
 * two side houses after; the page saves JOIN IEEE for last so the sequence
 * ends on the invitation instead of starting with the ask.
 */
const HOUSE_ORDER: readonly HouseId[] = ['technical', 'nontechnical', 'join'];

/** The three house beats, for rendering as one group. Also spread into STORY. */
export const HOUSE_BEATS: readonly StoryBeat[] = HOUSE_ORDER.map((id) => ({
  id,
  kicker: HOUSES[id].sign,
  accent: HOUSES[id].signColor,
  accentClass: HOUSES[id].accent,
  ...HOUSE_BEAT_COPY[id],
}));

export const STORY: readonly StoryBeat[] = [
  {
    id: 'arrival',
    kicker: 'Arrive',
    title: 'A Small Island With Three Houses',
    body: [
      `${BRANCH.shortName} put its website inside a game. You land on a patch of grass, walk up to a house, and read what is in it.`,
      'This page is the same tour standing still. If you would rather do the walking, the door is at the bottom.',
    ],
  },
  {
    id: 'committee',
    kicker: 'Who runs it',
    title: BRANCH.name,
    body: [
      `${BRANCH.shortName} is the student branch at ${BRANCH.institute}, ${BRANCH.university}, in ${BRANCH.location}.`,
      'A student branch is the local unit of IEEE. It runs events on campus, connects members to the wider society and its technical communities, and gives students something to build besides coursework.',
      'The workshops, the events and the projects are run by students who joined without knowing much. That is the usual way in.',
    ],
  },
  ...HOUSE_BEATS,
  {
    id: 'invitation',
    kicker: 'Play it',
    title: 'The Rest Is Inside the Game',
    // Borrowed from the join house: this beat is the door into it.
    accent: HOUSES.join.signColor,
    accentClass: HOUSES.join.accent,
    body: [
      'Arrow keys or WASD to walk. UP to go through a door. UP or SPACE to read a display case. You start with one house open, and walking into it unlocks the other two.',
      `Registration lives in the ${HOUSES.join.sign} house. If applications are not open for this semester yet, it says so there rather than handing you a button that goes nowhere.`,
    ],
    href: '/play',
    cta: 'Walk in',
  },
];

/**
 * Three numbers, all of them about IEEE rather than this branch, all lifted
 * from HOUSES.technical.exhibits[0] ('origins'), which stays the record of
 * truth — correct them there first. No branch-level figures are included
 * because none are sourced anywhere in this repo yet.
 */
export const STATS: readonly { label: string; value: string }[] = [
  { value: '1963', label: 'AIEE and IRE merged into IEEE' },
  { value: '460,000', label: 'IEEE members worldwide, roughly' },
  { value: '190+', label: 'Countries with IEEE members' },
];
