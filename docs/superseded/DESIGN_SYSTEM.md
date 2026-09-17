# IEEE Committee – Design System & Stack

## 1. Design Philosophy

**Codename: SIGNAL**
Inspired by circuit traces, oscilloscope waveforms, and the
precision engineering that underpins every IEEE standard.

Not a generic tech site. Not a university portal.
A *field terminal* — like the display screen a technician
trusts in the dark.

---

## 2. Color Palette

```
--color-void        #080C10   Background (near-black, blue-shifted)
--color-surface     #0D1520   Card/panel backgrounds
--color-border      #1A2E44   Subtle borders, dividers
--color-signal      #00D4FF   Primary accent (electric cyan)
--color-pulse       #7B61FF   Secondary accent (ultraviolet purple)
--color-amber       #FFB300   Warning / highlight / CTA warmth
--color-text-hi     #E8F4FD   High-contrast body text
--color-text-mid    #7FA8C9   Mid-weight labels, captions
--color-text-lo     #3A5872   Disabled / placeholder text
--color-success     #00E5A0   Success states
--color-danger      #FF4757   Error states
```

**Rationale:**
The deep navy-black void grounds everything in technical authority.
Electric cyan (`#00D4FF`) reads like an oscilloscope trace —
precise, active, alive. Ultraviolet purple (`#7B61FF`) provides
contrast for secondary actions without clashing.
Amber is used sparingly for the single most important CTA
(the recruitment button) — it pulls the eye like a warning light.

---

## 3. Typography

### Display: "Syne" (Google Fonts)
- Used for hero headlines, section titles, chapter markers
- Weights: 700, 800
- Letter-spacing: −0.02em to −0.04em (tight, authoritative)
- All major headings use `font-variant-numeric: tabular-nums`

### Body: "DM Sans" (Google Fonts)
- Used for paragraphs, descriptions, form labels
- Weights: 300, 400, 500
- Line-height: 1.65 for readability
- No justified alignment — always left-aligned

### Mono: "JetBrains Mono" (Google Fonts)
- Used for domain tags, counters, code references, metadata labels
- Creates the "technical readout" feel without parody
- Weights: 400, 600

### Type Scale (rem-based)
```
--text-xs    : 0.6875rem   / 11px  – metadata tags
--text-sm    : 0.8125rem   / 13px  – captions
--text-base  : 1rem         / 16px  – body
--text-lg    : 1.25rem      / 20px  – lead paragraphs
--text-xl    : 1.625rem     / 26px  – sub-headings
--text-2xl   : 2.25rem      / 36px  – section titles
--text-3xl   : 3.5rem       / 56px  – hero display
--text-4xl   : 5.5rem       / 88px  – full-bleed chapter headers
```

---

## 4. Spacing System

8px base grid. All spacing is a multiple of 8.

```
--space-1  : 8px
--space-2  : 16px
--space-3  : 24px
--space-4  : 32px
--space-5  : 48px
--space-6  : 64px
--space-7  : 96px
--space-8  : 128px
--space-9  : 192px
```

---

## 5. Motion & Animation Principles

Reference: anime.js, resn.global approach

### Core Rule: Motion serves narrative, not decoration.
Every animation must do one of these:
1. **Orient** the user (where they are in the story)
2. **Reveal** new content as earned (scroll-triggered)
3. **React** to user choices (interactive story beats)

### Timing Tokens
```
--ease-snap    : cubic-bezier(0.19, 1, 0.22, 1)     – snappy UI
--ease-drift   : cubic-bezier(0.25, 0.46, 0.45, 0.94) – smooth scrolls
--ease-spring  : cubic-bezier(0.34, 1.56, 0.64, 1)  – playful pops
--duration-xs  : 150ms
--duration-sm  : 280ms
--duration-md  : 480ms
--duration-lg  : 800ms
--duration-xl  : 1400ms
```

### Animation Catalogue
| Trigger         | Element          | Effect                              |
|-----------------|------------------|-------------------------------------|
| Page load       | Hero scene       | Three.js particle field materialises |
| Scroll enter    | Section header   | Clip-path wipe left→right           |
| Scroll enter    | Cards            | Staggered translateY(40px)→0       |
| Hover           | Nav items        | Underline grows from center         |
| Hover           | Domain cards     | Surface lifts, border glows cyan   |
| Click (choice)  | Story branch     | Screen flashes + content morphs     |
| Modal open      | Registration     | Scale(0.92)→1 + blur backdrop fade |
| Reduced motion  | ALL              | Instant with no transforms          |

---

## 6. Component Design Language

### Cards
- Background: `--color-surface`
- Border: 1px solid `--color-border` with hover→`--color-signal` transition
- Border-radius: 4px (not rounded — precise, not bubbly)
- Inner padding: 32px
- Signature: thin left accent bar in `--color-signal`

### Buttons

**Primary (CTA – Recruitment)**
- Background: `--color-amber`
- Text: `--color-void` (black on amber)
- No border-radius (0px) — deliberate, architectural
- Uppercase, JetBrains Mono, 0.12em letter-spacing
- Hover: amber brightens + slight translateY(-2px)

**Secondary**
- Border: 1px solid `--color-signal`
- Text: `--color-signal`
- Background: transparent
- Hover: background fills to 10% signal opacity

**Ghost**
- Text: `--color-text-mid`
- No border
- Hover: text shifts to `--color-text-hi`

### Navigation
- Fixed header, `backdrop-filter: blur(12px)` on scroll
- Background: `rgba(8, 12, 16, 0.85)` on scroll, transparent at top
- Chapter indicator: horizontal tick marks showing story progress
- Mobile: off-canvas drawer with staggered link animation

### Modal / Dialog
- Backdrop: `rgba(8, 12, 16, 0.92)` + backdrop-filter blur(4px)
- Content panel: slides up from bottom on mobile, scales in on desktop
- Two-column choice layout for registration options

### Form Fields
- Background: `--color-void`
- Border: 1px solid `--color-border`
- Focus: border-color → `--color-signal`, box-shadow 0 0 0 3px rgba(0,212,255,0.15)
- Label: JetBrains Mono, `--color-text-mid`, uppercase, xs size
- No floating labels — static labels above fields

---

## 7. Three.js Scene Design

### Hero Scene: "Neural Grid"
- Particle field representing IEEE's connectivity
- ~2,000 particles in a dynamic mesh
- Particles connected by faint lines when within threshold distance
- Camera slowly orbits — subtle ambient motion
- On hover/mouse-move: gentle field distortion follows cursor
- On scroll: particles collapse toward center and fade out

### Chapter Transition: "Signal Pulse"
- When a story chapter activates, a horizontal wave of light sweeps across
- Implemented as a custom Three.js shader on a full-screen plane

### Domain Visualiser (Interactive)
- Each IEEE domain (CS, EE, SP, etc.) mapped to a 3D icon cluster
- Clicking a domain: camera zooms to that cluster
- Connected to the narrative: choosing a domain advances the story

---

## 8. Iconography

Use **Phosphor Icons** (MIT licensed) — clean, technical, consistent.
No emoji in UI. No filled blobs. Prefer outlined/duotone style.

Domain-specific icons are custom SVG paths built on a 24×24 grid.

---

## 9. Imagery & Media

All images: served as WebP with JPEG fallback
Aspect ratios locked to these only: 16:9, 4:3, 1:1, 3:2
Placeholder system: CSS gradient skeletons matching final dimensions

Video: muted, autoplay, loop for background clips; controls for featured
Captions required on all video content.

---

## 10. Accessibility

| Requirement               | Implementation                                |
|---------------------------|-----------------------------------------------|
| Color contrast            | All text ≥ 4.5:1 against background           |
| Focus management          | Custom `:focus-visible` ring in `--color-signal` |
| Keyboard nav              | Full keyboard operability, tab order logical  |
| Screen reader             | ARIA labels on all interactive elements        |
| Reduced motion            | `prefers-reduced-motion` media query kills all |
|                           | Three.js animation; static scene shown        |
| Skip links                | "Skip to main content" as first focusable el  |
| Semantic HTML             | nav, main, section, article, aside, header    |
| Form accessibility        | Every input has explicit `<label for>`        |

---

## 11. Responsive Breakpoints

```
--bp-xs : 375px   – phones (min)
--bp-sm : 640px   – large phones
--bp-md : 768px   – tablets
--bp-lg : 1024px  – small desktops / landscape tablets
--bp-xl : 1280px  – desktop
--bp-2xl: 1536px  – wide desktop
```

Mobile-first: all base styles for mobile, progressive enhancement up.

---

## 12. Grid System

```
Columns    : 12 (desktop), 8 (tablet), 4 (mobile)
Gutter     : 24px (desktop), 16px (tablet/mobile)
Max-width  : 1200px (content), 1440px (full-bleed)
Margin     : auto (centered)
```
