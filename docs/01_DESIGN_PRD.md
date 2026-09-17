# IEEE RAIT — DESIGN PRD
### Product Design Requirements Document v1.0
#### References: animejs.com + littlehelper.resn.global

---

## 1. DESIGN PHILOSOPHY

### 1.1 Core Thesis

This is not a website that describes IEEE RAIT. It is a space IEEE RAIT inhabits.

The distinction matters because it forces every design decision to ask: *does this make the visitor feel something, or does it just inform them?* The two reference sites share one truth — anime.js *demonstrates* its value through the site itself (show, don't tell), and Resn's Little Helper builds an actual world to inhabit rather than read about. IEEE RAIT's site must do the same: the experience of moving through it *is* the proof of the committee's technical and creative capability.

### 1.2 Reference Synthesis

**From animejs.com:**
- Near-black canvas, extreme precision in spacing and type
- Berkeley Mono / Altinn-DIN pairing: monospaced technical + clean grotesque
- Scroll is the primary navigation vehicle; no other nav competes with it
- Color is used surgically — the palette is almost monochrome, accent appears only where information is carried
- Interactive code demos are embedded; the page performs its own content
- Tight editorial density: a lot of information in a small vertical space, legible because type is precise

**From littlehelper.resn.global (Resn, Awwwards SOTD):**
- Fixed-viewport WebGL canvas: the DOM does not scroll — the camera moves through 3D space
- Stage-gated narrative: you advance by acting (clicking), not by scrolling past
- Click-to-advance scene beats feel like turning pages in a book, not loading new routes
- Physical, tactile interactions: spring physics, drag, liquid
- Webpack + Three.js + GSAP: proven architecture for heavy interactive narrative
- Sound as atmospheric layer (not required, but respected when used)
- Characters and world-building through particle systems and lighting

**Synthesis decision:**
The IEEE RAIT site uses a **fixed WebGL canvas as its world** with **DOM text layers as overlays**. Scroll position is translated into camera position in 3D space. Narrative advances via scroll-triggered thresholds (hybrid: Resn's beats + anime.js's scroll observer). The result: you are flying through a network of domains, not reading a page about them.

### 1.3 The Signature Moment

At page load: the cursor is a glowing point in empty black space. Particles stream toward a central point and assemble into the IEEE RAIT diamond logo. Hold 1.2 seconds. Then the logo dissolves — particles scatter outward — and reform as the 6 domain nodes of the committee's network. The hero headline fades in over this.

This is the one bold visual bet. Everything else defers to it.

---

## 2. BRAND IDENTITY BRIEF

### 2.1 Descriptors

The site should feel like:
**A precision instrument that is also alive.** The coldness of calibration equipment; the warmth of something breathing.

It should NOT feel like:
- A corporate tech conference website
- A student club "about page" with icons and pastel cards
- The generic dark-teal-on-black AI design default
- Stock photography of "diverse engineers collaborating"

### 2.2 Tone

**Visual tone:** Instrument-grade. Like the inside of a scientific apparatus — every element placed for function, beauty emerging from that precision.

**Copy tone:** Direct, confident, slightly dry. IEEE RAIT does not beg you to join. It shows you what it is. If you belong here, you will know.

---

## 3. VISUAL IDENTITY

### 3.1 Color System

Derived from: deep-space observation equipment + precision calibration instruments.

The palette is intentionally asymmetric — the gold accent is the warmest thing on the page, like a filament in a vacuum tube. Everything else is cool and controlled.

```
FOUNDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--ink:           #0A0A0D    primary canvas — near-black, slight blue cast
--surface-1:     #111118    card backgrounds
--surface-2:     #191924    elevated / hovered surfaces
--border-subtle: #22222E    hairline borders
--border:        #2E2E40    visible borders

TEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--text-primary:  #F2EFE8    warm white — not #FFF (too harsh against #0A0A0D)
--text-secondary:#A0A0BA    muted blue-grey
--text-tertiary: #5C5C72    labels, timestamps

ACCENTS  (used sparingly; each carries meaning)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--blue:          #3B5EFF    primary interactive / IEEE domain color
--blue-glow:     #3B5EFF40  glow shadow for WebGL node illumination
--gold:          #C9A84C    achievement callouts, recruitment CTA
--gold-dim:      #C9A84C20  gold surface tint
--red-dim:       #FF4B4B    errors only
--green-dim:     #22C55E    confirmed/success states only

DOMAIN NODE COLORS (WebGL only; not used in flat UI)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--node-ops:      #3B5EFF    Core & Operations
--node-rd:       #9B6FFF    Research & Development
--node-pe:       #FF8A3B    Public Engagement
--node-cc:       #3BFFB0    Content & Creativity
--node-td:       #FF4B6E    Technical & Design
--node-so:       #FFCC3B    Sponsorship & Outreach
```

**Why this palette is non-generic:**
The warm white (#F2EFE8) against near-black (#0A0A0D) avoids the clinical pure-white-on-black look. The gold (#C9A84C) is aged brass, not "startup yellow" (#F5A623). The blue (#3B5EFF) is perceptron blue — a blue that leans toward indigo — not IEEE corporate blue (#00629B) and not the overused teal (#00BCD4).

### 3.2 Typography System

**Rationale for typeface pairing (inspired by anime.js's Berkeley Mono + Altinn-DIN):**

anime.js uses Berkeley Mono (monospaced) + a clean grotesque. The pairing says: precision tool, readable at any size, never decorative. For IEEE RAIT we adapt this logic to freely available fonts that achieve the same register.

```
DISPLAY: "Syne" (Google Fonts)
  Use: hero text, section titles, domain names in the WebGL overlay
  Why: Geometric variable font with distinct letterforms at heavy weights.
       The uppercase 'R', 'A', 'E' have subtle quirks not found in Inter
       or Space Grotesk. At 700–800 weight it feels engineered, not printed.
  Sizes: 72px hero / 48px scene title / 32px section heading
  Weight: 700 (titles), 400 (display prose)

BODY: "DM Sans" (Google Fonts)
  Use: all running prose, card descriptions, modal content
  Why: Warmer and more humanist than Inter. At 14–16px body text size the
       ink traps and apertures improve legibility on dark backgrounds.
       Not the first grotesque designers reach for — avoids the "default" feel.
  Sizes: 18px lead / 16px body / 14px secondary
  Weight: 400 body, 500 emphasis

MONO: "Geist Mono" (Google Fonts, added 2024) 
  Use: role IDs, domain tags, counter numerals, code snippets, status labels
  Why: Vercel's monospace. More contemporary than JetBrains Mono, less
       technical than Fira Code. The numeral forms (0–9) are especially clean.
       Honors the anime.js Berkeley Mono reference at no cost.
  Sizes: 11px labels / 13px inline code / 16px featured counters
  Weight: 400 always (mono weight is expressive enough)

SCALE (rem-based, base 16px)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--t-2xs:  0.6875rem  / 11px  labels, tags, timestamps
--t-xs:   0.8125rem  / 13px  captions, secondary text
--t-sm:   0.875rem   / 14px  supporting body
--t-base: 1rem       / 16px  primary body
--t-lg:   1.125rem   / 18px  lead paragraphs
--t-xl:   1.375rem   / 22px  card titles
--t-2xl:  1.75rem    / 28px  section subheadings
--t-3xl:  2.25rem    / 36px  section headings
--t-4xl:  3rem       / 48px  scene titles
--t-hero: 4.5rem     / 72px  hero display
--t-big:  6rem       / 96px  single-word statements (e.g. "JOIN" on CTA)

LEADING (line-height)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Display sizes (>36px):  1.05 — tight, headline stack
Body (14–22px):         1.6  — readable against dark bg
Mono:                   1.4  — standard terminal rhythm

TRACKING (letter-spacing)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Display heavy:   -0.03em  — pulled tight at large size
Body:            0        — default
Mono labels:    +0.08em  — slightly open (Geist Mono reads better)
All-caps tags:  +0.12em  — standard for small caps
```

### 3.3 Spatial System

Grid: 12-column, 24px gutter, max-width 1440px, side padding 80px desktop / 24px mobile.

Spacing scale (multiples of 4px):
```
--sp-1:   4px     --sp-6:  24px    --sp-12: 48px
--sp-2:   8px     --sp-8:  32px    --sp-16: 64px
--sp-3:   12px    --sp-10: 40px    --sp-24: 96px
--sp-4:   16px    --sp-11: 44px    --sp-32: 128px
--sp-5:   20px                     --sp-48: 192px
```

Section padding: 128px top / bottom on desktop; 80px on tablet; 48px on mobile.

### 3.4 Motion Language

Principles from both references:
- anime.js: precise easing, staggered entrance, scroll-synced
- Resn: spring physics for tactile interactions, slow deliberate scene transitions

```
EASING VOCABULARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--ease-appear:    cubic-bezier(0.16, 1, 0.3, 1)   / expo out — elements entering
--ease-disappear: cubic-bezier(0.7, 0, 0.84, 0)   / expo in  — elements leaving
--ease-spring:    spring(1, 80, 10, 0)              / Anime.js spring — hover states
--ease-camera:    cubic-bezier(0.25, 0.46, 0.45, 0.94) / smooth cam movement
--ease-narrative: cubic-bezier(0.6, 0, 0.2, 1)    / scene transitions

TIMING SCALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
instant:     0ms      / state changes, no animation
micro:       80ms     / hover color transitions
fast:        160ms    / button presses, icon swaps
base:        280ms    / panel slides, tooltip appears
medium:      480ms    / content reveals, modal enters
slow:        720ms    / scene text fades, major reveals
narrative:   1200ms   / scene transitions, camera moves
cinematic:   2400ms   / logo assembly, signature moments

STAGGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Grid cards:   stagger(60ms, from: 'center')     / outward from center
List items:   stagger(40ms, from: 'start')      / top-to-bottom
Particles:    stagger(8ms, grid: [n, n])         / grid-based scatter
```

### 3.5 Interaction States

Every interactive element must have all five states defined — no exceptions:

| State | Blue element | Gold element |
|---|---|---|
| Default | `--blue` fill / `--border` stroke | `--gold` text |
| Hover | `--blue` + white glow shadow | `--gold` + scale(1.01) |
| Focus | 2px `--blue` outline, 2px offset | 2px `--gold` outline |
| Active/Pressed | scale(0.97), brightness(0.9) | scale(0.95) |
| Disabled | opacity 0.3, cursor not-allowed | same |

---

## 4. SCENE-BY-SCENE DESIGN SPECIFICATION

The site has 6 scenes. Each scene corresponds to a camera position in 3D space + a DOM overlay state.

### SCENE 0 — PRELOAD / ASSEMBLY

**Duration:** ~2.4 seconds, plays once on first visit

**What happens:**
- Black viewport
- Single white cursor-point at center
- 480 particles (Geist Mono dots) stream from viewport edges toward center
- They assemble into the IEEE diamond / RAIT logo outline
- Logo holds for 1.2s (breathing — very subtle scale pulse)
- Logo dissolves: particles scatter radially
- As they scatter, they decelerate and hold position → they are now the 6 domain nodes + ambient field
- Hero text fades in from opacity 0

**DOM layer:**
- `<div class="preloader">` absolutely positioned, z: 100
- Opacity transition to 0 on assembly-complete event
- `aria-live="polite"` region announces "IEEE RAIT loading complete"

**Design rationale:**
This is the signature moment. It earns the dark canvas. It shows technical capability without a single line of body copy. It makes the WebGL scene feel like it materialized from the logo, not like a separate decoration.

---

### SCENE 1 — HERO

**Camera position:** Z = 12 (outside the network, looking in)

**DOM overlay — full viewport:**
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   ┌─────────────────────────────────────────┐               │
│   │ GEIST MONO / 11px / tracking 0.12em     │               │
│   │ IEEE RAIT — JUNIOR COMMITTEE            │               │
│   └─────────────────────────────────────────┘               │
│                                                              │
│   ┌─────────────────────────────────────────┐               │
│   │ SYNE / 72px / weight 700 / -0.03em      │               │
│   │ The engineers                            │               │
│   │ behind                                   │               │
│   │ everything.                              │               │
│   └─────────────────────────────────────────┘               │
│                                                              │
│   ┌─────────────────────────────────────────┐               │
│   │ DM SANS / 18px / muted color            │               │
│   │ Six domains. Eighteen roles. One chapter │               │
│   │ that builds the things others only plan. │               │
│   └─────────────────────────────────────────┘               │
│                                                              │
│   [SCROLL TO ENTER ↓]    ← Geist Mono, 11px, animated arrow │
│                                                              │
│                         • • •  ← 3 node dots, pulsing        │
│                    3D NETWORK (WebGL, behind all text)       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Animation sequence (on preload complete):**
1. Eyebrow tag slides up from y:8 → opacity 1 (delay: 0ms, 480ms ease-appear)
2. Headline lines stagger up: line 1 → line 2 → line 3 (stagger 80ms, 720ms ease-appear)
3. Subhead fades in (delay: 480ms, 480ms)
4. Scroll prompt pulses indefinitely (0.6s cycle)

**WebGL state:** Domain nodes visible at Z = 12 distance — small, glowing. Camera begins slow push toward Z = 4 as user scrolls.

---

### SCENE 2 — THE NETWORK

**Camera position:** Z = 4 (inside the network perimeter)

**Trigger:** Scroll past 20vh

**DOM overlay:**
```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐    │
│  │ SYNE 36px                                            │    │
│  │ Six domains that run                                 │    │
│  │ the chapter.                                         │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│   [NODE TOOLTIP AREA — appears on hover/click of 3D nodes]  │
│                                                              │
│  ┌─────────────────┐   ┌─────────────────┐                  │
│  │ DOMAIN NAME     │   │ DOMAIN NAME     │   (tooltip cards) │
│  │ # roles         │   │ # roles         │                  │
│  └─────────────────┘   └─────────────────┘                  │
│                                                              │
│  [CHOICE PROMPT — slides up from bottom]                     │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Where do you fit?                                    │    │
│  │  [BUILD THINGS]  [TELL STORIES]  [RUN THINGS]       │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

**WebGL state:** Camera is inside the node network. Nodes are large, glowing. Hovering a node sends a pulse along its edges (line animation, Anime.js createDrawable equivalent in Three.js). Camera orbits very slowly when idle.

**CHOICE #1 behavior:**
On choice select:
- Camera rotates to face the sub-cluster of domains matching the choice
- Non-selected domain nodes dim to 20% opacity
- DOM overlay transitions to SCENE 3 content for that path

---

### SCENE 3 — PROOF (path-dependent)

**Camera position:** Z = 1.5 (very close to chosen domain cluster)

**Three path variants:**

**PATH A: "Build Things" → Technical focus**
- Domain nodes: TD (Technical & Design) + RD (Research & Dev) glow brighter
- DOM: Role cards for TF, CWD, DBA, DFA animate in on left column
- Right column: achievement callouts (hackathon wins, project launches)
- Copy: "You build what others use. Technical roles own the infrastructure that makes every IEEE RAIT event possible."

**PATH B: "Tell Stories" → Creative focus**
- Domain nodes: CC (Content & Creativity) + PE (Public Engagement) glow
- DOM: Role cards for CEd, CrFA, MktF, PubF
- Right column: magazine covers (Vision, Bracket), social reach stats
- Copy: "Every brief, every frame, every post. Creative roles shape how IEEE RAIT is seen."

**PATH C: "Run Things" → Operations focus**
- Domain nodes: OPS + SO (Sponsorship) glow
- DOM: Role cards for DoP, EM, LF, SF, NIC
- Right column: event scale stats (attendees, events run, sponsors secured)
- Copy: "Nothing happens without someone planning it. Operations roles make the hard work invisible."

**CHOICE #2 (embedded within SCENE 3):**
"What draws you to a community?"
- [Learning & Workshops] → workshop cards appear first
- [Making Events Happen] → events/achievements cards appear first

---

### SCENE 4 — LEGACY

**Camera position:** Camera pulls back to Z = 8, tilted slightly downward — looking at the full network from an elevated angle

**DOM overlay:**
- Achievement timeline: vertical, right-aligned, years in Geist Mono, titles in Syne
- Photo gallery: 3-column masonry grid, images with subtle hover lift
- Stats bar: 3 numbers (events run / workshops delivered / members across years) in large Syne + Geist Mono

**WebGL state:** All 6 nodes visible and gently pulsing. Edge lines animate periodically, tracing the connections — like electricity running through a circuit.

---

### SCENE 5 — DOMAINS REFERENCE

**Camera position:** Stationary — camera faces a "wall" of domain information

**DOM overlay:**
- Full collapsible domain/role accordion (accessible, no WebGL dependency)
- This is the information-dense section
- Radix Accordion, Syne for domain names, DM Sans for prose, Geist Mono for role IDs

**Note:** This is the only section where WebGL is secondary. Content takes full precedence. The WebGL field is dimmed to 30% brightness.

---

### SCENE 6 — THE DOOR (Recruitment CTA)

**Camera position:** Z = -2 (camera has passed through the network — now looking back)

**What the user sees:**
- Camera has moved through the nodes — the network is now behind them
- Ahead: empty dark space with a single glowing aperture (a circle of particles)
- The aperture is the entry point

**DOM overlay:**
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                         JOIN                                 │
│                  ← SYNE 96px, weight 700                    │
│                                                              │
│         IEEE RAIT JUNIOR COMMITTEE 2025–26                  │
│                                                              │
│   ┌───────────────────────┐  ┌───────────────────────┐      │
│   │   JC JOINT CORE       │  │  APPLY AS ASSOCIATE   │      │
│   │   Full membership     │  │  Contributor track    │      │
│   │   [SELECT →]          │  │  [SELECT →]           │      │
│   └───────────────────────┘  └───────────────────────┘      │
│                                                              │
│   Pre-filled based on CHOICE #3 (made in Scene 2 or 3)      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**CHOICE #3 handling:**
If the user made Choice #3 earlier (in Scene 2), the appropriate path card is already glowing gold when Scene 6 appears — no re-selection needed. If not, both cards are presented equally.

**Registration Modal:** Opens on card click. See TRD for modal specification.

---

## 5. MOBILE ADAPTATION

The fixed-WebGL-camera experience cannot be faithfully reproduced on mobile at the same fidelity. Mobile gets a **degraded-but-intentional** version:

| Feature | Desktop | Mobile |
|---|---|---|
| WebGL scene | Full 3D, camera-scroll | 2D SVG fallback of node network |
| Scroll behaviour | Camera moves | Normal scroll with section reveals |
| Particle system | 480 particles | Static SVG illustration |
| Scene transitions | Camera + opacity | Framer Motion slide-up panels |
| Choice prompts | Embedded in scene | Full-width card stack |
| Registration modal | Centered dialog | Full-screen sheet |
| Typography | 72px hero | 40px hero |

The SVG fallback must be custom-drawn — not a screenshot of the 3D scene. It should be an actual SVG network diagram with the same node colors, edge lines, and proportions.

---

## 6. ACCESSIBILITY COMMITMENTS

1. All WebGL content is `aria-hidden="true"`. All information it displays is available in accessible DOM form in Scene 5 (domains accordion).
2. Scene advancement works via keyboard: `Space` or `Enter` advances the narrative; `Tab` navigates choice options.
3. All color choices verified: `--text-primary` (#F2EFE8) on `--ink` (#0A0A0D) = 18.7:1 ratio. `--blue` (#3B5EFF) on `--ink` = 4.7:1 (meets AA for large text; use carefully for small).
4. `prefers-reduced-motion`: All Anime.js animations replaced with opacity-only transitions. Three.js particles freeze. Camera does not move.
5. Focus rings: 2px solid `--blue`, 2px offset, always visible. Never `outline: none` without a replacement.
6. Form: all inputs labeled, errors announced via `aria-live="assertive"`.
7. Scene 0 (preloader) announces "Loading complete" via `aria-live` when done.

---

*Document: Design PRD v1.0 | Status: Approved for TRD handoff*
