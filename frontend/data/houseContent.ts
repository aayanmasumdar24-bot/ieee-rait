/**
 * Everything the player can read inside the three houses.
 *
 * Scenes own geometry, this file owns words. Adding a display case means
 * adding an entry here — InteriorScene builds its interact zones from
 * `exhibits`, and the React overlay renders whatever it is handed.
 */

import { BRANCH } from './config';

export type HouseId = 'technical' | 'nontechnical' | 'join';

export type Exhibit = {
  id: string;
  /** Short caption drawn on the floor next to the zone. */
  label: string;
  title: string;
  body: string[];
  /** Interior-scene centre of the interact zone (1024x1024 room). */
  x: number;
  y: number;
  w: number;
  h: number;
  /**
   * Where the caption sits. The zone is the floor you stand on, so the label
   * goes on the furniture above it instead — otherwise it lands in the walking
   * lane and the player sprite covers it.
   */
  labelY: number;
  /** Renders the membership form under the copy instead of plain text. */
  form?: boolean;
};

export type House = {
  /** Sign painted above the door in the overworld. */
  sign: string;
  /** Tailwind text colour for the overlay heading. */
  accent: string;
  /** Hex used for the Phaser sign text. */
  signColor: string;
  exhibits: Exhibit[];
};

/**
 * Measured off gym_interior.png: the wood floor runs x 205-815, y 345-830.
 * Bookshelf occupies y 255-460, the desk y 350-465, the side table y 600-740
 * with the barrel below it at x 735-812. Each zone is the patch of floor you
 * stand on to read, so it sits clear of the furniture it belongs to.
 */
const BOOKSHELF = { x: 746, y: 505, w: 140, h: 70, labelY: 240 };
const DESK = { x: 512, y: 508, w: 220, h: 70, labelY: 332 };
const SIDE_TABLE = { x: 670, y: 782, w: 170, h: 64, labelY: 585 };

export const HOUSES: Record<HouseId, House> = {
  technical: {
    sign: 'TECHNICAL',
    accent: 'text-sky-300',
    signColor: '#7dd3fc',
    exhibits: [
      {
        id: 'origins',
        label: 'OVERVIEW',
        title: 'Technical Division',
        body: [
          'The Technical division is the engineering engine of IEEE RAIT — responsible for building, deploying, and maintaining the digital infrastructure, web portals, and systems behind everything we do.',
          'Key domains: Chief Web Developer & Full-Stack Development (designing live websites and interactive platforms), Database Administration (managing secure registration databases and analytics), and Technical Infrastructure (AV, systems, and network connectivity for live sessions).',
          'From your first year, you get to work on real codebases, build production-ready projects, troubleshoot live systems, and ship work that students and faculty actually interact with.',
          'No prior expertise required — just the curiosity to build, learn, and innovate. Don\'t Wait · Innovate.',
        ],
        ...BOOKSHELF,
      },
      {
        id: 'hardware',
        label: 'HARDWARE',
        title: 'Hardware & Robotics',
        body: [
          'You don\'t need experience. You just need curiosity. Never built a robot before? Perfect. Neither had most of us.',
          'The Hardware & Robotics team at IEEE RAIT is where first-years get their hands dirty — soldering, coding, and watching something they built actually move. No prerequisites. No gatekeeping. Just a crew of people excited to figure things out together.',
          'Here\'s what we\'ve built: line-follower robots using Arduino, Bluetooth-controlled RC bots, drones — programmed, tuned, and flown, and Raspberry Pi projects you can actually use.',
          'Your first year: you show up, you learn, you build. Seniors walk you through everything — from setting up your first board to debugging your first circuit. Every session is hands-on. Every project ships.',
          'What you leave with: real hardware experience (not just theory), an IEEE-backed certificate, skills that actually show up on your resume, and friends who\'ll be your team for the next four years.',
          'You don\'t need to know what a resistor does on Day 1. You just need to show up. Don\'t Wait · Innovate.',
        ],
        ...DESK,
      },
      {
        id: 'software',
        label: 'SOFTWARE',
        title: 'Software & AI',
        body: [
          'The future is being written in code — come write it with us.',
          'At IEEE RAIT, the Software & AI vertical is where you stop consuming technology and start building it. From web platforms to intelligent automation agents, this is the team that ships the digital side of everything the branch does.',
          'Software Development: Java & Spring Boot — real backend projects, not toy examples. Web Development — live websites and platforms the whole branch actually uses. Swift & SwiftUI — functional iOS apps built from scratch. Full-stack development across real, deployed projects.',
          'Artificial Intelligence & Automation: AI isn\'t just a buzzword here — we build with it. Agentic AI Workshop — automation workflows and AI agents built using n8n. Hands-on exposure to how modern AI pipelines actually work. Building tools that automate real tasks, not just theory.',
          'Open to all departments — CS, IT, ECE, AIDS, AIML, Electrical. Code doesn\'t care about your branch. Whether you know a little Python, some HTML, or just want to learn — you fit here.',
          'What you walk away with: real project experience on your resume, IEEE-backed certification, a GitHub worth showing, and a team that actually builds things together. The best time to start was yesterday. The next best time is now. Don\'t Wait · Innovate.',
        ],
        ...SIDE_TABLE,
      },
    ],
  },

  nontechnical: {
    sign: 'NON-TECHNICAL',
    accent: 'text-amber-300',
    signColor: '#fcd34d',
    exhibits: [
      {
        id: 'branch',
        label: 'NOTICEBOARD',
        title: 'IEEE RAIT Student Branch',
        body: [
          'IEEE RAIT is the student branch at Ramrao Adik Institute of Technology, D Y Patil Deemed to be University, in Nerul, Navi Mumbai.',
          'A student branch is the local unit of IEEE: it runs events on campus, connects members to the wider society and its technical communities, and gives students something to build besides coursework.',
          'Everything on this island — the workshops, the events, the projects — is run by students who joined without knowing much, which is the usual way in.',
        ],
        ...BOOKSHELF,
      },
      {
        id: 'core',
        label: 'OPERATIONS',
        title: 'Operations & Management',
        body: [
          'No code. No circuits. Just pure leadership. Behind every event, every workshop, every launch — there\'s an Ops team making it happen. That team could be you.',
          'Event Management: Plan it. Run it. Own it. From concept to closing — you\'re in charge. Sponsorships: pitch brands, build partnerships, and fund the branch\'s big ideas.',
          'Logistics: venues, resources, on-ground execution — the unsung heroes of every event. Director of Operations: keep 14 teams aligned and lead from Day 1.',
          'Public Relations: be the face of IEEE RAIT. Every conversation opens a door.',
          'What you get: real leadership experience, business & communication skills, an IEEE-backed certificate, and a network that actually matters.',
          'No experience needed. Just show up ready. Don\'t Wait · Innovate.',
        ],
        ...DESK,
      },
      {
        id: 'creatives',
        label: 'STUDIO',
        title: 'Creatives & Sponsorship',
        body: [
          'If you can imagine it — we\'ll help you build it. Design posters. Create reels. Build the brand. The Creative team is where art meets engineering.',
          'Technical Designer: posters, graphics, UI assets — your designs are the first thing people see. Social Media: reels, posts, digital campaigns — you make IEEE RAIT go viral.',
          'Creative Team: branding, visuals, content — the aesthetic of the entire branch is on you. Editorial Team: blogs, newsletters, publications — if you love writing, this is your stage. Publicity Team: spread the word for every event so nobody misses out.',
          'Tools we use: Canva · Figma · Premiere · Photoshop. What you get: a real design & content portfolio, social media management experience, and your work seen by thousands. No degree in design needed — just a creative eye.',
          'Sponsorships — turn conversations into opportunities. You don\'t sell — you build partnerships. Pitch IEEE RAIT to brands & companies, write proposals that actually get replies, negotiate deals and close partnerships that fund workshops, events & competitions.',
          'What you get from Sponsorships: real business communication skills, negotiation & pitching experience, industry connections from Year 1, and an IEEE-backed certificate. One email you send today could fund an event for 500 people tomorrow. Don\'t Wait · Innovate.',
        ],
        ...SIDE_TABLE,
      },
    ],
  },

  join: {
    sign: 'JOIN IEEE',
    accent: 'text-emerald-300',
    signColor: '#6ee7b7',
    exhibits: [
      {
        id: 'why',
        label: 'DISPLAY CASE',
        title: 'Why You Should Join IEEE',
        body: [
          'The room where restless students become the makers, writers and organisers behind everything this branch ships — consider this your invitation.',
          'Real work, real stakes: ship live projects and events — no busywork, no hypotheticals. Sharper skillset: build technical muscle and the people skills that carry it.',
          'A room worth knowing: peers, seniors and industry folks you\'ll be glad to have met. Room to lead: put your hand up, take the role, and grow into it fast.',
          'Proof you showed up: IEEE-backed certificates and real credit for what you build. And honestly — real work that somehow still feels like the best part of the week.',
        ],
        ...BOOKSHELF,
      },
      {
        id: 'tracks',
        label: 'MAP',
        title: 'Campus Map',
        body: [
          'Technical (Left House): Discover our engineering domains, including Hardware & Robotics and Software & AI.',
          'Non-Technical (Right House): Explore the management and creative side of the branch, featuring Operations, Creatives, and Sponsorships.',
          'IEEE RAIT (Center Building): Learn what membership gets you, read up on our history, and find the application form to officially join the branch.',
        ],
        ...SIDE_TABLE,
      },
      {
        id: 'apply',
        label: 'REGISTRATION',
        title: 'Sign Up',
        body: [
          'Pick the track that fits how much time you want to give this semester, then register below.',
        ],
        form: true,
        ...DESK,
      },
    ],
  },
};

/** Overworld door name → house content. */
export const DOOR_TO_HOUSE: Record<string, HouseId> = {
  left_house: 'technical',
  right_house: 'nontechnical',
  gym: 'join',
};
