# IEEE Committee – File & Folder Structure

## Root Structure

```
ieee-committee/
├── src/                    ← All application source code
├── public/                 ← Static assets (served as-is)
├── docs/                   ← Project documentation (PRD, TRD, etc.)
├── tests/                  ← E2E and integration tests
├── .husky/                 ← Pre-commit hooks (lint + type-check)
├── next.config.js          ← Next.js configuration
├── tailwind.config.ts      ← Tailwind + Design System token mapping
├── tsconfig.json           ← TypeScript strict config
├── postcss.config.js       ← PostCSS for Tailwind
├── vitest.config.ts        ← Unit test configuration
├── playwright.config.ts    ← E2E test configuration
├── .eslintrc.json          ← ESLint rules (Next.js + strict)
├── .prettierrc             ← Code formatting rules
└── package.json            ← Dependencies and scripts
```

---

## Detailed Structure

```
src/
│
├── app/                              ← Next.js App Router
│   ├── layout.tsx                    ← Root layout: fonts, nav, footer, metadata
│   ├── page.tsx                      ← Homepage (full narrative scroll)
│   ├── globals.css                   ← CSS Custom Properties + base resets
│   │
│   ├── domains/
│   │   └── page.tsx                  ← Standalone domain explorer route
│   │
│   ├── achievements/
│   │   └── page.tsx                  ← Full timeline route
│   │
│   ├── workshops/
│   │   └── page.tsx                  ← Workshop archive route
│   │
│   └── register/
│       ├── page.tsx                  ← Direct registration route
│       └── [track]/
│           └── page.tsx              ← Pre-selected track: /register/jc or /register/associate
│
├── components/
│   │
│   ├── three/                        ← All Three.js / R3F components (browser-only)
│   │   ├── NeuralGrid.tsx            ← Hero particle field scene
│   │   ├── DomainVisualiser.tsx      ← Interactive 3D domain node cluster
│   │   ├── SignalPulse.tsx           ← Chapter transition shader effect
│   │   ├── SceneCanvas.tsx           ← Shared R3F <Canvas> wrapper + camera
│   │   └── shaders/
│   │       ├── pulse.vert.glsl       ← Vertex shader for signal pulse
│   │       └── pulse.frag.glsl       ← Fragment shader for signal pulse
│   │
│   ├── navigation/
│   │   ├── GlobalNav.tsx             ← Fixed top navigation bar
│   │   ├── ChapterProgress.tsx       ← Story progress dots + fill bar
│   │   ├── MobileMenu.tsx            ← Off-canvas mobile drawer
│   │   └── SkipLink.tsx              ← Accessibility skip-to-main link
│   │
│   ├── sections/                     ← Full-page story chapter sections
│   │   ├── HeroSection.tsx           ← Landing hero with Three.js + tagline
│   │   ├── IEEEIntroSection.tsx      ← Chapter 1: What is IEEE
│   │   ├── DomainSection.tsx         ← Chapter 2: Domain universe
│   │   ├── AchievementsSection.tsx   ← Chapter 3: Legacy timeline
│   │   ├── WorkshopsSection.tsx      ← Chapter 4: Workshops & events
│   │   ├── CurrentSection.tsx        ← Chapter 5: Current activities
│   │   └── RecruitmentSection.tsx    ← Chapter 6: Join us CTA
│   │
│   ├── ui/                           ← Reusable UI primitives
│   │   ├── Button.tsx                ← Primary / Secondary / Ghost variants
│   │   ├── Card.tsx                  ← Base card with accent bar
│   │   ├── Badge.tsx                 ← Domain / category tags
│   │   ├── Divider.tsx               ← Section dividers (animated line)
│   │   ├── MediaPlaceholder.tsx      ← Image/video placeholder with shimmer
│   │   ├── AnimatedCounter.tsx       ← Scroll-triggered number animation
│   │   ├── ChapterLabel.tsx          ← "CHAPTER 01" eyebrow text
│   │   └── ScrollReveal.tsx          ← GSAP scroll-reveal wrapper component
│   │
│   ├── domains/
│   │   ├── DomainCard.tsx            ← Single domain card (collapsible)
│   │   ├── DomainGrid.tsx            ← Grid layout of all domain cards
│   │   └── DomainAccordion.tsx       ← Expanded domain details
│   │
│   ├── workshops/
│   │   ├── WorkshopCard.tsx          ← Single workshop card
│   │   ├── WorkshopGrid.tsx          ← Filterable grid of workshops
│   │   └── WorkshopFilters.tsx       ← Domain/year filter controls
│   │
│   ├── achievements/
│   │   ├── Timeline.tsx              ← Horizontal scroll timeline
│   │   ├── TimelineItem.tsx          ← Single achievement entry
│   │   └── StatCounter.tsx           ← "1200+ Members" animated stat
│   │
│   ├── story/
│   │   ├── StoryChoice.tsx           ← Interactive story branch buttons
│   │   ├── StoryConsequence.tsx      ← Consequence text after a choice
│   │   └── StoryProgress.tsx         ← Zustand-connected progress wrapper
│   │
│   └── registration/
│       ├── RegistrationModal.tsx     ← Full modal with AnimatePresence
│       ├── TrackSelector.tsx         ← Step 1: JC Core vs Associate choice
│       ├── TrackDetail.tsx           ← Step 2: What to expect for chosen track
│       ├── FormEmbed.tsx             ← Step 3: Google Form iframe placeholder
│       └── FocusTrap.tsx             ← Accessibility focus trap utility
│
├── data/                             ← Static content (TypeScript)
│   ├── types.ts                      ← All shared TypeScript interfaces
│   ├── domains.ts                    ← IEEE domain definitions (10+ entries)
│   ├── workshops.ts                  ← Past workshop records
│   ├── achievements.ts               ← Awards, papers, competition wins
│   ├── projects.ts                   ← Current and past projects
│   ├── team.ts                       ← Committee member profiles
│   ├── chapters.ts                   ← Story chapter narrative content
│   └── registrationTracks.ts         ← JC Core / Associate track definitions
│
├── store/                            ← Zustand state management
│   ├── storyStore.ts                 ← Story progress, chapter, choices
│   ├── registrationStore.ts          ← Modal state, selected track, step
│   └── index.ts                      ← Re-exports all stores
│
├── hooks/                            ← Custom React hooks
│   ├── useScrollProgress.ts          ← Returns 0–1 page scroll fraction
│   ├── useChapterDetection.ts        ← IntersectionObserver for chapter tracking
│   ├── useReducedMotion.ts           ← Reads prefers-reduced-motion
│   ├── useGSAP.ts                    ← GSAP context setup + cleanup helper
│   └── useMediaQuery.ts              ← Responsive breakpoint detection
│
├── lib/                              ← Pure utility functions
│   ├── animation.ts                  ← GSAP animation presets (reusable timelines)
│   ├── gsapDefaults.ts               ← Global GSAP config (ease, duration defaults)
│   ├── three-utils.ts                ← Three.js helper functions
│   ├── cn.ts                         ← clsx + tailwind-merge utility
│   └── formatters.ts                 ← Date formatting, number formatting
│
└── types/                            ← Global TypeScript type declarations
    ├── env.d.ts                      ← process.env type augmentation
    └── global.d.ts                   ← Window extensions if needed

public/
├── fonts/                            ← Self-hosted fonts (if not using Google CDN)
│   └── .gitkeep
├── images/
│   ├── placeholder-16x9.webp         ← Generic 16:9 placeholder
│   ├── placeholder-4x3.webp          ← Generic 4:3 placeholder
│   ├── placeholder-1x1.webp          ← Generic square placeholder
│   ├── workshops/                    ← Workshop cover images (add here)
│   ├── achievements/                 ← Achievement imagery
│   ├── team/                         ← Committee member photos
│   └── projects/                     ← Project screenshots
├── videos/
│   └── placeholder-hero.mp4          ← Hero background video (if used)
├── models/                           ← Three.js .glb models (if any)
│   └── .gitkeep
├── og-image.png                      ← Open Graph social card (1200×630)
├── favicon.ico
├── robots.txt
└── sitemap.xml                       ← Auto-generated by next-sitemap

tests/
├── unit/
│   ├── components/
│   │   ├── Button.test.tsx
│   │   ├── DomainCard.test.tsx
│   │   └── RegistrationModal.test.tsx
│   ├── store/
│   │   └── storyStore.test.ts
│   └── lib/
│       └── formatters.test.ts
└── e2e/
    ├── navigation.spec.ts            ← Full nav keyboard + mouse
    ├── story-flow.spec.ts            ← Chapter progression E2E
    └── registration.spec.ts          ← Modal open → form embed

docs/
├── PRD.md                            ← Product Requirements Document
├── TRD.md                            ← Technical Requirements Document
├── DESIGN_SYSTEM.md                  ← (this project's file)
├── TECH_STACK.md                     ← (this project's file)
├── WEBSITE_FLOW.md                   ← (this project's file)
└── MILESTONES.md                     ← MVP roadmap and phases
```

---

## Key Config Files

### `tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void:    'var(--color-void)',
        surface: 'var(--color-surface)',
        border:  'var(--color-border)',
        signal:  'var(--color-signal)',
        pulse:   'var(--color-pulse)',
        amber:   'var(--color-amber)',
        'text-hi':  'var(--color-text-hi)',
        'text-mid': 'var(--color-text-mid)',
        'text-lo':  'var(--color-text-lo)',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        shimmer: 'shimmer 1.8s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [375, 640, 768, 1024, 1280, 1536],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options',     value: 'nosniff' },
        { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' https://www.googletagmanager.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "frame-src https://docs.google.com https://forms.gle",
            "img-src 'self' data: blob:",
          ].join('; ')
        },
      ],
    },
  ],
}

module.exports = nextConfig
```
