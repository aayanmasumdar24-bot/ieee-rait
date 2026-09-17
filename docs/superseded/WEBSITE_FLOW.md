# IEEE Committee – Website Flow Stack

## 1. User Journey Map

```
ENTRY
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│  LANDING: Hero Scene (Three.js Neural Grid)             │
│  Headline: "Where Engineers Become Pioneers."           │
│  CTA: "Begin" (scrolls to Chapter 1)                    │
└─────────────────────────────────────────────────────────┘
  │
  ▼ (scroll or click)
┌─────────────────────────────────────────────────────────┐
│  CHAPTER 1: What Is IEEE?                               │
│  Story intro — the mission, the global reach, the why.  │
│  Interactive: "Choose your path" — domain interests     │
│  Choice A → CS/AI path    Choice B → EE/Power path      │
│  Choice C → SP/Bio path   Choice D → Explore all        │
└─────────────────────────────────────────────────────────┘
  │
  ▼ (choice made or scroll through)
┌─────────────────────────────────────────────────────────┐
│  CHAPTER 2: Our Domain Universe                         │
│  3D domain visualiser — each IEEE domain as a node      │
│  Click any domain → accordion expands with details      │
│  Domains: CS, EE, SP, PES, RAS, EMC, COM, BIO, AES...  │
└─────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│  CHAPTER 3: Our Legacy — Past Achievements              │
│  Horizontal scroll timeline: year markers               │
│  Achievement cards with category badges                 │
│  Animated counters: members, papers, awards, events     │
└─────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│  CHAPTER 4: Workshops & Events                          │
│  Grid of past workshop cards (photo, title, date)       │
│  Featured video section (placeholder embed)             │
│  Filter by domain/year                                  │
└─────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│  CHAPTER 5: What We're Building Now                     │
│  Current projects & activities                          │
│  Team showcase (photos + roles)                         │
│  Upcoming events calendar                               │
└─────────────────────────────────────────────────────────┘
  │
  ▼ (story culmination)
┌─────────────────────────────────────────────────────────┐
│  CHAPTER 6: Your Signal Starts Here — Recruitment       │
│  Full-bleed dramatic section                            │
│  Two CTA buttons:                                       │
│    [JOIN AS JC JOINT CORE]   [APPLY AS ASSOCIATE]       │
│  Both open Registration Modal                           │
└─────────────────────────────────────────────────────────┘
  │
  ▼ (modal opens)
┌─────────────────────────────────────────────────────────┐
│  MODAL: Registration Gateway                            │
│  Step 1: Choose track (JC Joint Core / Associate)       │
│  Step 2: Basic info display + what to expect            │
│  Step 3: Link to Google Form (placeholder)              │
└─────────────────────────────────────────────────────────┘
```

---

## 2. URL Structure

```
/                     → Full narrative (single-page scroll experience)
/domains              → Standalone IEEE domain explorer
/achievements         → Full achievements timeline
/workshops            → Workshop & events archive
/register             → Direct link to registration (skips story)
/register/jc          → Pre-selects JC Joint Core track
/register/associate   → Pre-selects Associate track
```

*All "chapters" exist on `/` as scroll sections, not separate routes.
Deep links to chapters via URL hash: `/#chapter-2`*

---

## 3. Navigation Architecture

### Global Navigation (fixed)
```
[IEEE LOGO]          [ABOUT] [DOMAINS] [EVENTS] [PROJECTS]    [JOIN →]
```
- "JOIN" button: amber color, always visible, opens modal immediately
- On mobile: hamburger → full-screen overlay with staggered links
- Chapter progress indicator: 6 small dots below nav on desktop

### Chapter Progress Bar
- Thin line at top of viewport (below nav)
- Fills left to right as user scrolls through the story
- Each chapter dot lights up cyan when that chapter is active

### In-Page Navigation (Story Choices)
- Rendered inline within narrative sections
- Selecting a choice: GSAP animates content swap
- Previous choice stored in Zustand (shows as "selected" state if revisited)

---

## 4. Page State Transitions

### Scroll-Based Chapter Activation
```typescript
// GSAP ScrollTrigger pattern
ScrollTrigger.create({
  trigger: '#chapter-2',
  start: 'top 60%',
  onEnter: () => {
    useStoryStore.getState().setChapter('ieee-domains')
    // Three.js: transition neural grid → domain nodes
    // GSAP: wipe-reveal chapter title
  },
  onLeaveBack: () => {
    useStoryStore.getState().setChapter('intro')
  }
})
```

### Story Choice Interaction
```
User clicks choice
  → Zustand: record choice in userChoices[]
  → GSAP: flash overlay (20ms, color depends on choice)
  → GSAP: stagger out old consequence text
  → Framer Motion: new consequence text fades in
  → Three.js: particle field reacts (color shift)
  → Scroll continues to next chapter
```

### Modal Lifecycle
```
Open:
  Framer Motion AnimatePresence
  backdrop: opacity 0→1 (300ms)
  panel: scale(0.94)→1 + translateY(20px)→0 (350ms, spring)
  Focus trap activates
  Body scroll locked

Close:
  Reverse animation (200ms faster on exit)
  Focus returns to trigger element
  Body scroll restored
```

---

## 5. Interactive Story State Machine

```typescript
type ChapterId =
  | 'hero'
  | 'ieee-intro'
  | 'domain-universe'
  | 'past-achievements'
  | 'workshops'
  | 'current-activities'
  | 'recruitment'

interface StoryState {
  currentChapter: ChapterId
  completedChapters: ChapterId[]
  userChoices: Record<string, string>  // choiceId → selectedOptionId
  registrationOpen: boolean
  registrationTrack: 'jc-joint-core' | 'associate' | null
  progressPercent: number
}
```

### Branching Logic
Even though the story is linear (all users see all chapters), user choices
affect the *narrative voice* of subsequent sections:
- Choice: "CS/AI path" → CS domain gets expanded by default, language in
  recruitment section says "...your interest in AI makes you a fit for..."
- This personalisation is cosmetic but makes users feel seen

---

## 6. Content Loading Strategy

```
Route: /
  ├── Layout (static)              → immediate
  ├── Hero Three.js scene          → deferred (dynamic import)
  ├── Chapter 1–3 content          → server component (build time)
  ├── Chapter 4 workshops grid     → server component (build time)
  ├── Chapter 5–6 content          → server component (build time)
  └── Registration Modal           → lazy client component

Route: /domains
  └── Domain explorer              → server component + client interactivity
```

---

## 7. Media Loading & Placeholders

### Image Placeholder System
```css
/* Each image container has data-aspect attribute */
.media-placeholder {
  background: linear-gradient(
    135deg,
    var(--color-surface) 0%,
    var(--color-border) 50%,
    var(--color-surface) 100%
  );
  background-size: 200% 200%;
  animation: shimmer 1.8s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .media-placeholder { animation: none; }
}
```

### Swapping Placeholders with Real Assets
Each media element uses a `data-src` attribute system:
```tsx
// Replace placeholder path with real image:
// src/data/workshops.ts
{
  coverImage: '/images/workshops/placeholder-16x9.webp',
  // → becomes: '/images/workshops/gsoc-2024-cover.webp'
}
```

---

## 8. Registration Flow Detail

### Step 1: Track Selection
```
┌────────────────────────────────────────────────────────┐
│               CHOOSE YOUR PATH                         │
│                                                        │
│  ┌─────────────────┐    ┌─────────────────┐           │
│  │  JC JOINT CORE  │    │   AS ASSOCIATE  │           │
│  │                 │    │                 │           │
│  │ Full membership │    │ Exploratory     │           │
│  │ Leadership roles│    │ Project-based   │           │
│  │ Domain chapters │    │ Flexible commit │           │
│  │                 │    │                 │           │
│  │   [SELECT →]   │    │   [SELECT →]   │           │
│  └─────────────────┘    └─────────────────┘           │
└────────────────────────────────────────────────────────┘
```

### Step 2: What to Expect
```
┌────────────────────────────────────────────────────────┐
│   JC JOINT CORE — What You're Signing Up For          │
│                                                        │
│   • Direct chapter leadership pipeline                 │
│   • Access to IEEE global network                     │
│   • Workshop facilitation opportunities               │
│   • Technical paper co-authorship                     │
│                                                        │
│   [← BACK]              [PROCEED TO FORM →]           │
└────────────────────────────────────────────────────────┘
```

### Step 3: Google Form Embed
```
┌────────────────────────────────────────────────────────┐
│   Complete Your Application                            │
│                                                        │
│   [GOOGLE FORM IFRAME - placeholder]                  │
│   (link to be provided)                               │
│                                                        │
│                        [DONE ✓]                        │
└────────────────────────────────────────────────────────┘
```

---

## 9. Error States

| Scenario                    | Handling                                      |
|-----------------------------|-----------------------------------------------|
| Three.js not supported      | Static SVG background shown instead           |
| Image fails to load         | Placeholder gradient persists                 |
| Form URL not configured     | "Coming soon — check back after [date]"       |
| JavaScript disabled         | Core story content readable via `<noscript>`  |
| Network slow                | Progressive enhancement; text loads first     |
