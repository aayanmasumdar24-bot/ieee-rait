# IEEE RAIT — Design Stack

Document set: [00 Understanding](00_UNDERSTANDING_AND_DECISIONS.md) ·
[01 Design PRD](01_DESIGN_PRD.md) · [02 TRD](02_TRD.md) ·
**03 Design Stack** (this file) · [04 Tech Stack](04_TECH_STACK.md) ·
[05 Website Flow Stack](05_WEBSITE_FLOW_STACK.md)

The PRD decides *what the site feels like*. This document is the implementable
half: every token, its exact value, and the rule for when it applies. If a value
is not here, it does not belong in a component.

---

## 1. Direction in one line

A fixed dark instrument panel that a camera moves through. Precision over
decoration; the 3D layer supplies atmosphere, the DOM layer supplies every fact.

Two references, two distinct contributions:

| Reference | What is taken | What is not taken |
|---|---|---|
| [animejs.com](https://animejs.com/) | Editorial restraint, mono-labelled sections, motion as a demonstration of craft, the v4 API vocabulary itself | Its light palette, its documentation layout |
| Resn *Little Helper* | The posture — the page is a fixed stage, scroll drives a camera, typography reacts to depth | Character art, sound design, the three-colour scheme, WebGL-or-nothing delivery |

Resn scored **creativity 8.41 / usability 7.26** on Awwwards. That gap is the
thing to avoid: this site takes the ambition and keeps the usability, which is
why §7 and §8 are release gates rather than polish.

---

## 2. Colour

```css
:root {
  /* Ground */
  --ink:            #0A0A0D;   /* page base */
  --surface-1:      #111118;   /* raised panel */
  --surface-2:      #191924;   /* panel on panel, modal body */
  --border-subtle:  #22222E;   /* hairline, non-interactive */
  --border:         #2E2E40;   /* interactive resting edge */

  /* Text */
  --text-primary:   #F2EFE8;   /* headings, body */
  --text-secondary: #A0A0BA;   /* supporting copy, captions */
  --text-tertiary:  #5C5C72;   /* metadata, disabled */

  /* Accent */
  --blue:           #3B5EFF;   /* structure, links, active state */
  --blue-glow:      #3B5EFF40; /* focus ring, node halo */
  --gold:           #C9A84C;   /* the single CTA colour */
  --gold-dim:       #C9A84C20; /* gold surface wash */

  /* Status */
  --red-dim:        #FF4B4B;
  --green-dim:      #22C55E;
}
```

**Accent discipline.** Blue is structural and may appear many times per screen.
Gold is reserved for the recruitment action and appears **at most once per
viewport**. A second gold element on screen is a bug, not a style choice.

### Domain node accents

One colour per functional group from the committee roles PDF, used for the 3D
node, its edge glow, and the matching accordion row. Never used for body text on
`--ink`.

| `DomainId` | Group | Hex |
|---|---|---|
| `ops` | Core & Operations | `#3B5EFF` |
| `rd` | Research & Development | `#9B6FFF` |
| `pe` | Public Engagement | `#FF8A3B` |
| `cc` | Content & Creativity | `#3BFFB0` |
| `td` | Technical & Design | `#FF4B6E` |
| `so` | Sponsorship & Outreach | `#FFCC3B` |

### Measured contrast

Computed, not asserted. Ratios against `--ink` `#0A0A0D`.

| Pair | Ratio | Verdict |
|---|---|---|
| `--text-primary` on `--ink` | **18.7 : 1** | AAA, all sizes |
| `--text-secondary` on `--ink` | **8.9 : 1** | AAA, all sizes |
| `--text-tertiary` on `--ink` | **3.6 : 1** | Fails AA body. Permitted **only** at ≥ 24 px, or ≥ 19 px bold, and never as the sole carrier of a fact |
| `--blue` on `--ink` | **4.7 : 1** | AA large text and UI boundaries only. Body links use `--text-primary` with a `--blue` underline |
| `--gold` on `--ink` | **8.2 : 1** | AAA large, AA body |
| `--ink` on `--gold` | **8.2 : 1** | The CTA: dark text on gold fill |

Any new pairing is measured before it ships. `--text-tertiary` is the one token
carrying a usage restriction; honour it.

---

## 3. Typography

Three faces, each with one job. Self-hosted via Fontsource — no Google Fonts
request, per decision D7.

| Role | Face | Weights shipped | Job |
|---|---|---|---|
| Display | **Syne** | 700, 400 | Scene titles, the `JOIN` word, numerals in the stats bar |
| Body | **DM Sans** | 400, 500 | Every paragraph, card body, accordion copy |
| Mono | **Geist Mono** | 400 | Scene labels, role tiers, counters, metadata |

Syne is the deliberate choice: its widened, slightly technical letterforms read
as engineered rather than corporate, and it holds up at 96 px where a neutral
grotesque would go flat. DM Sans carries the reading load because Syne does not.
Geist Mono handles labels only — it is never a reading face here.

Four font files total (Syne 700, Syne 400, DM Sans 400, DM Sans 500) plus Geist
Mono 400 loaded on the same pass. Latin subset only, `font-display: swap`.

```css
:root {
  --font-display: 'Syne', system-ui, sans-serif;
  --font-body:    'DM Sans', system-ui, sans-serif;
  --font-mono:    'Geist Mono', ui-monospace, monospace;
}
```

### Scale

Fixed px steps rather than fluid clamps at the small end, because mono labels
that shift width mid-scroll read as a rendering fault. The two display steps are
fluid.

```css
:root {
  --t-2xs:  11px;   /* mono labels, tier badges */
  --t-xs:   13px;   /* metadata, captions */
  --t-sm:   15px;   /* dense card body */
  --t-base: 17px;   /* body default */
  --t-lg:   21px;   /* lead paragraph */
  --t-xl:   28px;   /* card title */
  --t-2xl:  40px;   /* scene subtitle */
  --t-3xl:  clamp(48px, 5vw, 64px);   /* scene title */
  --t-big:  clamp(56px, 9vw, 96px);   /* JOIN, hero word */
}
```

### Leading and tracking

| Context | `line-height` | `letter-spacing` |
|---|---|---|
| Display (`--t-2xl` and up) | **1.05** | **−0.03em** |
| Body | **1.6** | 0 |
| Mono label | **1.4** | **+0.08em** |
| Mono all-caps | **1.4** | **+0.12em** |

Tight display leading is what makes a two-line scene title read as one object.
Positive mono tracking is what stops an all-caps label from reading as a word.

---

## 4. Space and grid

8 px rhythm, exposed as an explicit ladder so nothing lands off-grid.

```css
:root {
  --sp-1: 4px;    --sp-2: 8px;    --sp-3: 12px;   --sp-4: 16px;
  --sp-6: 24px;   --sp-8: 32px;   --sp-12: 48px;  --sp-16: 64px;
  --sp-20: 80px;  --sp-24: 96px;  --sp-32: 128px; --sp-48: 192px;
}
```

| Property | Desktop | Mobile |
|---|---|---|
| Columns | 12 | 4 |
| Gutter | 24px | 16px |
| Max content width | 1440px | — |
| Side padding | 80px | 24px |
| Scene vertical rhythm | `--sp-24` between blocks | `--sp-16` |

The grid is a **composition aid, not a straitjacket**: overlay text blocks are
expected to break it, sitting at columns 2–7 or 6–11 so the 3D layer stays
visible on the other side. Full-width 12-column blocks are for the Scene 5
accordion only.

---

## 5. Motion

Motion is the part the references actually contribute, so it gets the most
specific rules. Every animation must **orient** (say where you are), **reveal**
(pay off scroll), or **react** (confirm an action). Motion that does none of
those three is deleted.

### Easing

```css
:root {
  --ease-appear:    cubic-bezier(0.16, 1, 0.30, 1);    /* things arriving */
  --ease-disappear: cubic-bezier(0.70, 0, 0.84, 0);    /* things leaving */
  --ease-camera:    cubic-bezier(0.25, 0.46, 0.45, 0.94); /* depth moves */
  --ease-narrative: cubic-bezier(0.60, 0, 0.20, 1);    /* scene handover */
}
```

Springs are not CSS — they come from anime.js `createSpring({ stiffness: 80,
damping: 10 })` and are used for **choice cards and the modal panel only**, where
a small overshoot reads as physical response. Nothing that carries text overshoots.

Asymmetry is deliberate: `--ease-appear` decelerates hard so arriving content
settles; `--ease-disappear` accelerates away so leaving content does not compete
for attention.

### Duration

```css
:root {
  --dur-instant:   0ms;
  --dur-micro:    80ms;   /* hover colour, focus ring */
  --dur-fast:    160ms;   /* button press, tab switch */
  --dur-base:    280ms;   /* card entrance, accordion row */
  --dur-medium:  480ms;   /* modal, panel swap */
  --dur-slow:    720ms;   /* scene title reveal */
  --dur-narrative: 1200ms; /* scene handover */
  --dur-cinematic: 2400ms; /* preloader logo assembly, once per session */
}
```

Anything above `--dur-medium` must be scroll-driven or one-shot. A user waiting
720 ms for a hover response is a defect; a 720 ms reveal they scrolled into is
the point.

### Stagger

| Target | Value | Rationale |
|---|---|---|
| Card grid | `stagger(60, { from: 'center' })` | Reads as the grid resolving outward, not a list loading |
| Vertical list, accordion | `stagger(40, { from: 'start' })` | Matches reading order |
| Particles | `stagger(8, { grid: [n, n] })` | Fast enough to read as one mass, slow enough to see structure |

### Catalogue

| Trigger | Element | Effect | Token |
|---|---|---|---|
| Session start | Logo particles | 480 particles assemble the diamond, hold 1.2 s, dissolve | `--dur-cinematic` |
| Scroll into scene | Scene title | Per-line `clip-path` wipe + `translateY(16px)` | `--dur-slow`, `--ease-appear` |
| Scroll into scene | Card grid | `opacity` + `translateY(24px)`, centre-out stagger | `--dur-base`, `--ease-appear` |
| Scroll, continuous | Camera Z | Lerped toward keyframe target | `--ease-camera` |
| Hover | Card | Border `--border` → node accent, `translateY(-2px)` | `--dur-micro` |
| Focus | Any control | 2 px `--blue` ring + 4 px `--blue-glow` halo | `--dur-micro` |
| Choice click | Choice card | Spring scale to 1.02, sibling cards drop to 40 % opacity | spring |
| Choice commit | Overlay copy | Old copy `--ease-disappear` out, new copy staggers in | `--dur-medium` |
| Modal open | Panel | `scale(0.94) → 1`, backdrop blur 0 → 8 px | `--dur-medium`, spring |
| Counter in view | Stat numeral | Count to target, tabular numerals | `--dur-slow` |
| Reduced motion | Everything | Opacity only, no transform, camera jumps, particles freeze | `--dur-fast` |

### Compositor rule

Animate `transform`, `opacity`, `clip-path`, and `filter` only. Never `width`,
`height`, `top`, `left`, `margin`, `padding`, or `font-size`. `will-change` is
applied at animation start and removed on completion — never left in a
stylesheet.

---

## 6. Interaction states

Every interactive element defines all five. A component missing `focus-visible`
does not pass review.

| State | Blue / structural element | Gold / CTA element |
|---|---|---|
| Default | `--border`, text `--text-secondary` | `--gold` fill, `--ink` text |
| Hover | Border → `--blue`, text → `--text-primary`, `translateY(-2px)` | Fill lightens 6 %, `translateY(-2px)` |
| Focus-visible | 2 px `--blue` outline, 2 px offset, 4 px `--blue-glow` | 2 px `--text-primary` outline, 2 px offset |
| Active | `translateY(0)`, background `--surface-2` | `scale(0.98)` |
| Disabled | `--border-subtle`, text `--text-tertiary`, `cursor: not-allowed`, `aria-disabled="true"` | Never disabled — if a form URL is missing, the button becomes an informational card instead |

Focus is never removed, only restyled. Hover styles are additionally gated behind
`@media (hover: hover)` so touch devices do not get stuck in a hover state.

---

## 7. Components

Inventory with the token decisions already made, so a component author is
choosing nothing arbitrary.

**Card** — `--surface-1` background, 1 px `--border-subtle`, radius **4 px**,
padding `--sp-8`. A 2 px left accent bar in the domain colour. Radius stays small
on purpose: this is instrumentation, not a consumer app.

**Role card** — a Card plus a mono tier badge (`facilitator` / `associate` /
`head` / `coordinator`) at `--t-2xs`, uppercase, `+0.12em`. Maximum **three
duties**, each capped at 100 characters, rendered as a list, not prose.
`isAvailable: false` renders the disabled state and is announced as
"position filled" to assistive tech, not just greyed.

**Button** — three variants only. *Primary*: `--gold` fill, `--ink` text, radius
0, Geist Mono uppercase `+0.12em`. *Secondary*: transparent, 1 px `--blue`, text
`--blue`. *Ghost*: text `--text-secondary`, no border. One primary per viewport.

**Scene label** — Geist Mono `--t-2xs`, `--text-tertiary`, uppercase `+0.12em`,
formatted `SCENE 03 / PROOF`. Because it is `--text-tertiary` below 24 px it is
decorative by the §2 rule, so the scene name is also in the `<h2>`.

**Accordion (Scene 5)** — the accessible twin of the 3D network. One row per
domain, `aria-expanded`, keyboard operable, containing every fact the nodes
encode. This component is the reason the WebGL layer may be `aria-hidden`.

**Modal** — `--surface-2` panel, `rgba(10,10,13,0.92)` backdrop with 8 px blur,
focus trap, `Esc` to close, body scroll locked, focus returned to the trigger.
Three steps: track select → what to expect → form hand-off.

**Media placeholder** — a gradient skeleton at the final aspect ratio so nothing
shifts. Aspect ratios restricted to 16:9, 4:3, 3:2, 1:1. Shimmer animation is
disabled under `prefers-reduced-motion`.

**Stats bar** — Syne numerals with `font-variant-numeric: tabular-nums`, so a
counter animating 0 → 22 does not change width per frame.

### Iconography

Phosphor Icons (MIT), outlined weight, 24 × 24 grid, imported per-icon so no
icon font ships. No emoji in UI.

---

## 8. Responsive and fallback

```
375  large-phone floor      768  tablet
640  small-phone ceiling   1024  desktop entry
                          1440  content max
```

Mobile is not a shrunken desktop. Below 768 px the WebGL scene is replaced by a
**hand-drawn SVG network** — same six nodes, same twelve edges, drawn as an
intentional diagram — and the page scrolls normally with scene sections stacked.
Hero display drops from `--t-big` to 40 px. This is the `static` render tier from
D5 and it must look designed, never like a failure.

| Tier | Trigger | Scene |
|---|---|---|
| `full` | WebGL 2, `hardwareConcurrency` ≥ 8 | 480 particles, all effects |
| `reduced` | WebGL 1/2, `hardwareConcurrency` < 4 | 160 particles, no edge animation |
| `static` | No WebGL, or width < 768 | SVG network, no canvas at all |

---

## 9. Accessibility gates

Release blockers, not aspirations.

- WebGL canvas is `aria-hidden="true"`; every fact it conveys also exists in DOM.
- Skip link is the first focusable element.
- Scene advance works from the keyboard; scroll is never hijacked.
- `prefers-reduced-motion`: opacity-only transitions, camera jumps to keyframes,
  particles hold position, preloader shortens to 800 ms.
- Zero axe-core AA violations.
- Every contrast pair measured, with `--text-tertiary` obeying its size floor.
- Landmarks: `header`, `main`, `section` per scene with `aria-labelledby`, `footer`.

---

## 10. Anti-template check

Before any surface ships, it demonstrates at least four:

- [ ] Hierarchy from scale contrast, not weight alone
- [ ] Deliberate spacing rhythm, not uniform padding
- [ ] Depth through the fixed 3D layer behind offset DOM text
- [ ] Typography pairing with a stated reason (§3)
- [ ] Colour used semantically — gold means one thing only
- [ ] Hover, focus, and active states that were designed (§6)
- [ ] Grid deliberately broken where composition calls for it (§4)
- [ ] Motion that orients, reveals, or reacts (§5)

---

*Document: Design Stack v1.0 | Derived from 01 Design PRD | Consumed by 04 Tech Stack*



