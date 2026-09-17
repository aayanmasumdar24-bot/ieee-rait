# IEEE Committee – Technical Stack & Architecture

## 1. Stack Overview

```
Frontend Framework  : Next.js 14 (App Router) + TypeScript
Styling             : Tailwind CSS v3 + CSS Custom Properties
3D / WebGL          : Three.js r165 + @react-three/fiber + @react-three/drei
Animation           : GSAP (GreenSock) + ScrollTrigger + Framer Motion
State Management    : Zustand (lightweight, no boilerplate)
Forms               : React Hook Form + Zod validation
Deployment          : Vercel (zero-config, edge-optimised)
Analytics           : Vercel Analytics + Google Analytics 4
Testing             : Vitest + React Testing Library + Playwright (E2E)
Linting             : ESLint + Prettier + Husky pre-commit
```

---

## 2. Rationale for Each Choice

### Next.js 14 (App Router)
- Server Components reduce JS bundle for content-heavy sections
- Built-in image optimisation (`next/image`) handles WebP conversion
- Route-based code splitting: Three.js loads only on needed pages
- App Router layouts let the nav and progress bar persist across "chapters"

### TypeScript
- Strict mode enforced: catches story-state bugs at compile time
- Domain types (IEEEDomain, StoryChapter, RegistrationType) are self-documenting
- No `any` — required for maintainability without a dedicated dev team

### Tailwind CSS + CSS Custom Properties
- Tailwind handles utility spacing, responsive modifiers, and dark variants
- CSS Custom Properties carry the Design System tokens (color, motion timing)
- Tailwind config references the CSS vars — single source of truth
- No CSS Modules — reduces file count; all co-located in components

### Three.js via @react-three/fiber
- @react-three/fiber (R3F) wraps Three.js in React's component model
- Declarative: the neural grid, chapter transitions, and domain visualiser are each one React component
- @react-three/drei provides helpers: OrbitControls, useGLTF, Stars, etc.
- Canvas is dynamically imported with `{ ssr: false }` — Three.js is browser-only

### GSAP + ScrollTrigger
- Industry standard for timeline-based animation (anime.js inspiration)
- ScrollTrigger drives chapter reveals as user scrolls through the story
- GSAP's `gsap.context()` cleans up on component unmount (no memory leaks)
- Used for: clip-path text reveals, staggered card entrances, progress bar scrubbing

### Framer Motion
- Handles React-specific animation (layout animations, AnimatePresence for modal)
- Complements GSAP: GSAP = scroll narrative, Framer = UI state transitions

### Zustand
- Stores: storyProgress, currentChapter, userChoices, registrationOpen
- No Redux overhead for what is essentially a linear narrative with branch flags
- Persists to sessionStorage so refreshing mid-story doesn't lose progress

### React Hook Form + Zod
- RHF: zero re-renders on input — important for smooth modal UX
- Zod: schemas validate name/email server-side too (when API routes added)

---

## 3. Project Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "three": "^0.165.0",
    "@react-three/fiber": "^8.16.0",
    "@react-three/drei": "^9.105.0",
    "gsap": "^3.12.5",
    "framer-motion": "^11.1.7",
    "zustand": "^4.5.2",
    "react-hook-form": "^7.51.3",
    "zod": "^3.23.0",
    "@phosphor-icons/react": "^2.1.4",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/three": "^0.165.0",
    "tailwindcss": "^3.4.3",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "prettier": "^3.2.5",
    "husky": "^9.0.11",
    "vitest": "^1.5.0",
    "@testing-library/react": "^15.0.7",
    "playwright": "^1.44.0"
  }
}
```

---

## 4. Architecture Patterns

### Story State Machine
```
States: INTRO → IEEE_OVERVIEW → PAST_ACHIEVEMENTS →
        WORKSHOPS → CURRENT_ACTIVITIES → RECRUITMENT

Each state has:
  - chapterId: string
  - title: string
  - unlockedAt: number (scroll %)
  - choices?: StoryChoice[]      // branches user can take
  - completed: boolean
```

### Data Flow
```
Content (JSON files)
       ↓
Server Components (fetch at build time)
       ↓
Client Components (hydrate with interactivity)
       ↓
Zustand store (story progress, user choices)
       ↓
Three.js Canvas (visualises current story state)
       ↓
GSAP ScrollTrigger (drives chapter progression)
```

### Content Architecture
All content lives in `/src/data/*.ts` TypeScript files.
No CMS dependency for MVP. Schema designed for future headless CMS migration.

```typescript
// src/data/types.ts
export interface IEEEDomain {
  id: string
  name: string
  acronym: string
  description: string
  activities: string[]
  color: string          // accent override for domain card
  icon: string           // Phosphor icon name
}

export interface Workshop {
  id: string
  title: string
  date: string
  description: string
  speaker?: string
  coverImage: string     // path relative to /public/images/
  videoUrl?: string
  tags: string[]
}

export interface Achievement {
  id: string
  title: string
  year: number
  description: string
  category: 'award' | 'publication' | 'competition' | 'milestone'
}

export interface StoryChapter {
  id: string
  order: number
  title: string
  subtitle: string
  content: string
  choices?: {
    id: string
    label: string
    consequence: string
    nextChapterId: string
  }[]
}
```

---

## 5. Performance Targets

| Metric                       | Target      | Strategy                              |
|------------------------------|-------------|---------------------------------------|
| LCP (Largest Contentful Paint) | < 2.5s    | Static generation, optimised images   |
| FID / INP                    | < 100ms     | React 18 transitions, deferred hydration |
| CLS                          | < 0.1       | Reserved image dimensions             |
| Three.js initial render      | < 1s        | Dynamic import, GPU instancing        |
| Lighthouse Performance       | ≥ 90        | Code splitting, tree-shaking          |
| Lighthouse Accessibility     | 100         | Semantic HTML, ARIA, contrast         |
| Bundle (JS, gzipped)         | < 250 KB initial | Three.js lazy-loaded separately |

---

## 6. SEO Strategy

- Next.js `<Metadata>` API in every route layout
- Open Graph tags for social sharing (recruitment posts)
- Structured data (JSON-LD) for the organisation
- Sitemap auto-generated via `next-sitemap`
- All content in server components = fully crawlable

---

## 7. Security

- No user credentials stored — Google Form handles data collection
- Content Security Policy headers via `next.config.js`
- `X-Frame-Options: SAMEORIGIN`
- Input sanitisation via Zod even for client-only forms
- No API keys exposed client-side

---

## 8. Deployment (Vercel)

```
Branch: main       → production (ieee-committee.vercel.app)
Branch: staging    → preview URL for review
Branch: feature/*  → ephemeral preview per PR
```

Environment variables (Vercel dashboard):
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX
NEXT_PUBLIC_GOOGLE_FORM_URL=https://forms.gle/...  (added later)
```

Build command: `next build`
Output: Static + Edge functions (zero cold starts for main paths)
