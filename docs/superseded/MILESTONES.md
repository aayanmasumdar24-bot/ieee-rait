# IEEE Committee – MVP Roadmap & Milestones

## Phase Overview

```
Phase 0: Foundation       Week 1      Setup, tooling, design tokens
Phase 1: Core Shell       Week 2–3    Navigation, layout, story structure
Phase 2: Content Engine   Week 4–5    All 6 chapters with real content
Phase 3: 3D & Animation   Week 6–7    Three.js, GSAP, interactive story
Phase 4: Registration     Week 8      Modal, tracks, form embed
Phase 5: Polish & Launch  Week 9–10   QA, accessibility, performance, go-live
```

---

## Phase 0: Foundation (Week 1)

**Goal:** Project scaffolded, zero config debt, team can code.

### Tasks
- [ ] `npx create-next-app@latest --typescript` scaffold
- [ ] Install all dependencies (see TECH_STACK.md)
- [ ] Configure Tailwind + import Design System CSS vars into `globals.css`
- [ ] Configure ESLint, Prettier, Husky pre-commit hook
- [ ] Create folder structure (see FILE_STRUCTURE.md)
- [ ] Commit skeleton with passing lint and build
- [ ] Set up Vercel project + staging branch
- [ ] Placeholder content: all `src/data/*.ts` files with 2–3 real entries each
- [ ] Google Fonts import: Syne, DM Sans, JetBrains Mono

**Deliverable:** `main` pushes to live URL with "Coming soon" page.

---

## Phase 1: Core Shell (Week 2–3)

**Goal:** Navigation, layout, and story chapter scaffolding working.

### Tasks
- [ ] `GlobalNav.tsx`: logo, links, amber JOIN button
- [ ] `ChapterProgress.tsx`: dots + fill bar (wired to scroll %)
- [ ] `MobileMenu.tsx`: off-canvas drawer with GSAP stagger
- [ ] `SkipLink.tsx`: accessibility skip to main
- [ ] `app/layout.tsx`: fonts, metadata, nav, footer
- [ ] `app/page.tsx`: 6 chapter section stubs (id, heading, placeholder)
- [ ] `ScrollReveal.tsx`: GSAP IntersectionObserver wrapper
- [ ] `ChapterLabel.tsx`, `Button.tsx`, `Card.tsx`, `Badge.tsx` UI primitives
- [ ] `useScrollProgress.ts` + `useChapterDetection.ts` hooks
- [ ] Story store: `storyStore.ts` with chapter + choices state
- [ ] Basic routing: `/domains`, `/workshops`, `/achievements` stubs

**Deliverable:** Scrollable page with 6 chapter landmarks, progress bar functional.

---

## Phase 2: Content Engine (Week 4–5)

**Goal:** All story content visible and readable without animations.

### Tasks
- [ ] Fill all `src/data/*.ts` with complete content:
  - `domains.ts`: all 10+ IEEE domains with descriptions
  - `workshops.ts`: 6+ past workshops with placeholder images
  - `achievements.ts`: 10+ achievements across years
  - `chapters.ts`: full narrative text for all 6 chapters
  - `registrationTracks.ts`: JC Core + Associate full descriptions
- [ ] `HeroSection.tsx`: headline, subhead, CTA (static, no Three.js yet)
- [ ] `IEEEIntroSection.tsx`: mission text + choice buttons (static)
- [ ] `DomainSection.tsx` + `DomainCard.tsx` + `DomainAccordion.tsx`
- [ ] `AchievementsSection.tsx` + `Timeline.tsx` + `StatCounter.tsx`
- [ ] `WorkshopsSection.tsx` + `WorkshopCard.tsx` + `WorkshopFilters.tsx`
- [ ] `CurrentSection.tsx`: projects + team grid
- [ ] `RecruitmentSection.tsx`: CTA buttons, track descriptions
- [ ] `MediaPlaceholder.tsx`: shimmer placeholders for all images
- [ ] SEO: metadata in each route layout
- [ ] `/domains` standalone page: DomainGrid with full interactivity

**Deliverable:** Full story readable end-to-end. All content sections render correctly on mobile + desktop.

---

## Phase 3: 3D & Animation (Week 6–7)

**Goal:** The site feels alive. Story is cinematic.

### Tasks
- [ ] `SceneCanvas.tsx`: R3F Canvas wrapper with camera + lighting
- [ ] `NeuralGrid.tsx`: particle field with mouse interaction
  - 2000 particles, connecting lines, cursor distortion
  - Scroll-triggered: particles collapse on chapter exit
- [ ] Dynamic import of Canvas in `HeroSection.tsx`:
  ```tsx
  const SceneCanvas = dynamic(() => import('@/components/three/SceneCanvas'), { ssr: false })
  ```
- [ ] `DomainVisualiser.tsx`: 3D domain nodes in chapter 2
  - Click domain → animate camera to that node
  - Node selection syncs with DomainAccordion
- [ ] `SignalPulse.tsx`: chapter transition shader sweep
- [ ] GSAP `lib/animation.ts`: shared animation presets
  - `clipPathReveal(el)`: wipe left→right on section headers
  - `staggerCards(els)`: translateY stagger for card grids
  - `counterUp(el, end)`: animated number counter
- [ ] Wire ScrollTrigger to chapter detection (replaces IntersectionObserver)
- [ ] `StoryChoice.tsx`: flash + content swap animation on choice
- [ ] `AnimatedCounter.tsx`: stats in achievements section
- [ ] Horizontal scroll timeline in achievements (GSAP horizontal pin)
- [ ] `useReducedMotion.ts`: kill all animations, show static scenes

**Deliverable:** Full animated experience works on desktop. Graceful degradation on mobile/reduced motion.

---

## Phase 4: Registration (Week 8)

**Goal:** Complete recruitment flow from CTA to form embed.

### Tasks
- [ ] `FocusTrap.tsx`: keyboard trap utility
- [ ] `RegistrationModal.tsx`: AnimatePresence multi-step shell
  - Backdrop blur + panel scale animation
  - Body scroll lock on open
  - Focus trap + ESC to close
  - Focus return on close
- [ ] `TrackSelector.tsx`: two-column JC Core vs Associate
- [ ] `TrackDetail.tsx`: what to expect per track
- [ ] `FormEmbed.tsx`: `<iframe>` placeholder + "Coming Soon" state
  - Reads `NEXT_PUBLIC_GOOGLE_FORM_URL` env var
  - Shows placeholder card if env var not set
- [ ] Wire modal open to: nav JOIN button, recruitment section CTAs,
      `/register` route, `/register/jc`, `/register/associate`
- [ ] `registrationStore.ts`: step, track, open/close state
- [ ] Test full keyboard flow: open → select track → proceed → close

**Deliverable:** Registration modal fully functional, accessible, animates correctly.

---

## Phase 5: Polish & Launch (Week 9–10)

**Goal:** Production-ready. Handoff-ready.

### Tasks

**Performance**
- [ ] Run Lighthouse audit; hit ≥ 90 on all metrics
- [ ] Analyse bundle with `@next/bundle-analyzer`
- [ ] Add `loading="lazy"` to all below-fold images
- [ ] Verify Three.js lazy-loaded (not in initial bundle)

**Accessibility**
- [ ] Axe DevTools full audit — zero errors
- [ ] Manual keyboard test: tab through entire page
- [ ] Screen reader test: VoiceOver (Mac) + NVDA (Win)
- [ ] Verify all colour contrast ratios with DevTools

**QA**
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge
- [ ] Mobile: iOS Safari, Android Chrome
- [ ] Test with slow network (Chrome DevTools 3G throttle)
- [ ] Test with JavaScript disabled (noscript content visible)

**Testing**
- [ ] Write unit tests for: Button, DomainCard, storyStore, formatters
- [ ] Write E2E tests: navigation, story flow, registration modal

**Launch**
- [ ] Configure custom domain in Vercel
- [ ] Add GA4 measurement ID to env vars
- [ ] Add Google Form URL to env vars (when provided)
- [ ] Remove all placeholder content; replace with real assets
- [ ] Final stakeholder review
- [ ] Go live ✓

---

## Milestone Summary

| Milestone        | Week  | Key Sign-off Criterion                          |
|------------------|-------|-------------------------------------------------|
| 0: Foundation    | 1     | Build passes, deploys to Vercel                 |
| 1: Core Shell    | 2–3   | Nav + 6 chapters scroll with progress bar       |
| 2: Content       | 4–5   | All content readable, mobile-responsive         |
| 3: Animation     | 6–7   | Three.js hero + GSAP chapter reveals working    |
| 4: Registration  | 8     | Modal accessible, both tracks, form embed ready |
| 5: Launch        | 9–10  | Lighthouse ≥ 90, zero a11y errors, live URL     |
