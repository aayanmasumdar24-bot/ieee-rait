# IEEE RAIT — TECHNICAL REQUIREMENTS DOCUMENT (TRD)
### v1.0 — Reference implementations: animejs.com, littlehelper.resn.global

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER VIEWPORT                             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              WEBGL LAYER (fixed, full-viewport)              │   │
│  │         Three.js / React Three Fiber render loop            │   │
│  │    Camera position driven by scroll progress (0→1)          │   │
│  │    z-index: 0 / pointer-events: none except nodes           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           DOM OVERLAY LAYER (absolute, full-viewport)        │   │
│  │         React components / Anime.js / Framer Motion         │   │
│  │    Scene content triggered by scroll progress + store       │   │
│  │    z-index: 10                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │               SCROLL DRIVER (invisible, tall div)            │   │
│  │    Height: 600vh (drives camera through all 6 scenes)       │   │
│  │    Scroll progress → [0, 1] → camera Z + scene index       │   │
│  │    z-index: 20 / pointer-events: none                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  MODAL LAYER (portal)                        │   │
│  │    Radix Dialog / z-index: 100                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Key architectural principle (from Resn):** The scroll driver is a separate, invisible, tall element. The viewport never "scrolls" — the user scrolls the driver, and JavaScript translates that scroll position into camera Z, scene index, and DOM overlay states. This gives full creative control over pacing while preserving native scroll inertia.

---

## 2. RENDERING REQUIREMENTS

### 2.1 Frame Budget (Target: 60fps = 16.67ms/frame)

```
WEBGL RENDER (target: ≤ 8ms)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scene graph traversal:         ~0.5ms
Shader execution (6 nodes):    ~1.0ms
Particle system (480 pts):     ~2.0ms
Edge lines (12 connections):   ~0.5ms
Post-processing (optional):    ~1.5ms
Camera lerp calculation:       ~0.1ms
Buffer swaps + compositing:    ~2.4ms
TOTAL:                         ~8.0ms

DOM + JS (target: ≤ 5ms)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scroll progress calculation:   ~0.1ms
Zustand state reads:           ~0.1ms
React reconciliation:          ~1.5ms
Anime.js tick:                 ~0.8ms
Layout + paint (minimal):      ~2.5ms
TOTAL:                         ~5.0ms

HEADROOM:                       3.67ms (22% — acceptable)
```

**Hard limits:**
- Draw calls ≤ 25 per frame (nodes + edges + particles as instanced meshes)
- Triangle count ≤ 15,000 per frame
- Texture memory ≤ 64 MB total
- JavaScript heap ≤ 80 MB steady state

### 2.2 WebGL Implementation Spec

```typescript
// Scene geometry budget
const SCENE_SPEC = {
  particles: {
    count: 480,                    // instanced BufferGeometry
    geometry: 'circle',            // SphereGeometry(0.02, 4, 4)
    material: 'MeshBasicMaterial', // no lighting calc for perf
    updateStrategy: 'per-frame',   // position updated every frame in shader
  },
  nodes: {
    count: 6,
    geometry: 'SphereGeometry(0.35, 32, 32)',
    material: 'MeshStandardMaterial', // with emissive for glow
    lod: { near: 32, mid: 16, far: 8 }, // polygon reduction by camera dist
  },
  edges: {
    count: 12, // max connections between 6 nodes
    geometry: 'TubeGeometry', // smooth tubes, not lines (lines are aliased)
    tubularSegments: 20,
    radius: 0.015,
    drawProgress: 'animated', // draw: [0, 0] → [0, 1] on hover
  },
  postProcessing: {
    enabled: false,   // MVP: disabled for performance
    planned: ['UnrealBloomPass'], // Phase 4
  }
} as const
```

### 2.3 Particle System Specification

The particle system has 3 behavioral states:
- **ASSEMBLING** (Scene 0): Particles move toward target positions (logo shape). Lerp factor: 0.04/frame.
- **DISSOLVING** (Scene 0→1 transition): Particles accelerate radially outward. Force: staggered random vectors, magnitude 0.2–0.8.
- **AMBIENT** (Scenes 1–6): Particles drift slowly with Perlin noise field. Speed: 0.001 units/frame. Each particle has independent phase offset.

```typescript
// Particle shader approach (vertex shader)
// Positions stored in Float32Array, updated on CPU for MVP
// Phase 4: move to GPU compute (if WebGPU available)
interface Particle {
  position: THREE.Vector3
  targetPosition: THREE.Vector3  // for ASSEMBLING state
  velocity: THREE.Vector3        // for AMBIENT state
  phase: number                  // noise phase offset [0, 2π]
  opacity: number                // individual fade control
}
```

### 2.4 WebGL Fallback Detection

```typescript
// src/hooks/useWebGLSupport.ts
export function detectWebGLSupport(): 'webgl2' | 'webgl1' | 'none' {
  const canvas = document.createElement('canvas')
  
  const gl2 = canvas.getContext('webgl2')
  if (gl2) return 'webgl2'
  
  const gl1 = canvas.getContext('webgl') ||
               canvas.getContext('experimental-webgl')
  if (gl1) return 'webgl1'
  
  return 'none'
}

// Rendering tiers based on support + device performance
export type RenderTier = 'full' | 'reduced' | 'static'

export function getRenderTier(): RenderTier {
  const webgl = detectWebGLSupport()
  if (webgl === 'none') return 'static'           // SVG fallback
  
  // Heuristic: < 4 logical cores = reduced particle count
  const cores = navigator.hardwareConcurrency ?? 2
  if (cores < 4) return 'reduced'                  // 160 particles, no post-proc
  
  return 'full'                                    // 480 particles, full scene
}
```

---

## 3. SCROLL ARCHITECTURE

### 3.1 Scroll Driver Implementation

```typescript
// src/hooks/useScrollProgress.ts
// This is the core scroll → everything translation layer

interface SceneBreakpoints {
  scene0End: 0.05      // Preloader done
  scene1End: 0.18      // Hero → Network
  scene2End: 0.35      // Network → Proof
  scene3End: 0.55      // Proof → Legacy
  scene4End: 0.70      // Legacy → Domains
  scene5End: 0.88      // Domains → CTA
  scene6End: 1.00      // CTA
}

// Camera Z-position lookup table
// Scroll progress 0→1 maps to camera Z 12→-2
const CAMERA_KEYFRAMES: Array<[progress: number, z: number]> = [
  [0.00,  12],   // outside, looking in
  [0.05,  10],   // preloader complete
  [0.18,   4],   // inside the network
  [0.35,   1.5], // close to chosen cluster
  [0.55,   4],   // pulled back for legacy
  [0.70,   5],   // slightly higher angle
  [0.88,   3],   // approaching CTA
  [1.00,  -2],   // through the network
]

// Camera Y-position (slight vertical motion adds depth)
const CAMERA_Y_KEYFRAMES: Array<[number, number]> = [
  [0.0, 0], [0.35, 0.5], [0.55, 1.2], [0.88, 0.8], [1.0, 0]
]
```

### 3.2 Scroll Progress → State Dispatch

```typescript
// Scroll listener (runs in useEffect, throttled to rAF)
let lastScene = -1

function onScrollProgress(progress: number) {
  const scene = getSceneFromProgress(progress)

  // Only dispatch when scene changes (not every pixel)
  if (scene !== lastScene) {
    narrativeStore.getState().advanceAct(scene)
    analytics.track('scene_enter', { scene })
    lastScene = scene
  }

  // Camera update runs every frame regardless
  webglStore.getState().setCameraTarget(
    interpolateCameraZ(progress),
    interpolateCameraY(progress)
  )
}
```

---

## 4. STATE MACHINE SPECIFICATION

### 4.1 Narrative State

```
States: LOADING | SCENE_0 | SCENE_1 | SCENE_2 | SCENE_3 | SCENE_4 | SCENE_5 | SCENE_6 | MODAL

Transitions (valid):
  LOADING         → SCENE_0        (on: DOM ready)
  SCENE_0         → SCENE_1        (on: assembly animation complete)
  SCENE_1         → SCENE_2        (on: scroll progress > 0.18)
  SCENE_2         → SCENE_3        (on: choice #1 made OR scroll > 0.35)
  SCENE_3         → SCENE_4        (on: scroll progress > 0.55)
  SCENE_4         → SCENE_5        (on: scroll progress > 0.70)
  SCENE_5         → SCENE_6        (on: scroll progress > 0.88)
  SCENE_6         → MODAL          (on: CTA card click)
  SCENE_6         → SCENE_5        (on: scroll backward)
  ANY             → MODAL          (on: direct /#register route)
  MODAL           → previous       (on: ESC / close)

Irreversible:
  SCENE_0 → cannot return (preloader plays once per session only)
```

### 4.2 Choice State Machine

```
Choice 1: null | 'technical' | 'creative' | 'operations'
Choice 2: null | 'learning'  | 'building'
Choice 3: null | 'core'      | 'associate'

Rules:
- Choices are reversible (user can change their mind)
- A change to Choice 1 re-runs the SCENE_3 content transition
- Choice 3 pre-populates the modal path selector
- All choices persist to sessionStorage (cleared on tab close)
- choices affect DOM content only — WebGL reacts visually but same 3D data
```

### 4.3 Zustand Store Contracts

```typescript
// src/store/narrativeStore.ts (full contract)

export interface NarrativeState {
  // Scene progression
  currentScene: SceneIndex                  // 0–6
  highestSceneReached: SceneIndex           // for unlock gates
  
  // Choices
  choice1: PathType | null                  // 'technical' | 'creative' | 'operations'
  choice2: ContentOrder | null              // 'learning' | 'building'
  choice3: RegistrationPath | null          // 'core' | 'associate'
  
  // UI state
  modalOpen: boolean
  activeDomainId: DomainId | null           // which node is hovered/clicked
  
  // Performance
  renderTier: RenderTier                    // 'full' | 'reduced' | 'static'
  
  // Actions
  advanceScene(to: SceneIndex): void
  setChoice1(c: PathType): void
  setChoice2(c: ContentOrder): void
  setChoice3(c: RegistrationPath): void
  openModal(): void
  closeModal(): void
  setActiveDomain(id: DomainId | null): void
  setRenderTier(tier: RenderTier): void
}

// Persisted to sessionStorage via zustand/middleware persist:
// Persisted: choice1, choice2, choice3, highestSceneReached
// Not persisted: currentScene, modalOpen, activeDomainId
```

---

## 5. ANIMATION SYSTEM REQUIREMENTS

### 5.1 Two-Layer Animation Architecture

```
Layer 1: Three.js rAF loop (WebGL)
  - Particle positions
  - Camera lerp
  - Node pulse animations
  - Edge draw progress

Layer 2: Anime.js (DOM)
  - Text entrance/exits
  - Choice card transitions
  - Modal enter/leave
  - Counter animations
  - SVG line drawings (decorative elements)

Framer Motion: used ONLY for:
  - Layout animations (animatePresence for conditional DOM)
  - Drag interactions (PathSelector cards)
  - Reduced-motion context propagation

GSAP: NOT used (redundant with Anime.js v4; adds ~25KB)
  Exception: If scroll-pinning complexity exceeds Anime.js ScrollObserver capability,
  add GSAP ScrollTrigger for that section only.
```

### 5.2 Anime.js v4 Integration Points

```typescript
// Text entrance — used in every scene transition
import { animate, stagger, onScroll } from 'animejs'

// Scene headline reveal (used in SCENE_1, 2, 3, 6)
animate('.scene-headline .word', {
  translateY: [24, 0],
  opacity: [0, 1],
  delay: stagger(60),
  duration: 600,
  ease: 'outExpo',
  autoplay: onScroll({
    target: '.scene-container',
    enter: 'top 80%',
  })
})

// Achievement counter (SCENE_4)
animate('.counter-value', {
  innerHTML: [0, targetValue],
  duration: 1200,
  ease: 'inOutQuad',
  round: 1,
  autoplay: onScroll({ enter: 'top 70%' })
})

// SVG circuit traces (decorative, Section transitions)
const drawable = createDrawable('.circuit-trace')
animate(drawable, {
  draw: ['0 0', '0 1'],
  duration: 800,
  ease: 'inOutSine',
})
```

### 5.3 Reduced Motion Requirements

```typescript
// src/hooks/useReducedMotion.ts
// Propagated via React context to all animation components

const REDUCED_MOTION_OVERRIDES = {
  // Anime.js: replace duration with 0 for movement; keep opacity
  textEntrance: { translateY: 0, opacity: [0, 1], duration: 160 },
  
  // Three.js: stop particle movement; nodes static; camera instant
  particleVelocity: 0,
  cameraLerpFactor: 1.0, // instant snap instead of lerp
  nodeRotation: 0,
  
  // Preloader: skip assembly animation; show logo as static, then scene
  preloaderDuration: 800, // fade in only
}
```

---

## 6. DATA ARCHITECTURE

### 6.1 Static Content Strategy

All content is static TypeScript — no CMS, no API calls at runtime. This gives:
- Zero latency for content (no waterfall)
- Type safety (every role, domain, achievement is typed)
- Easy content updates via PR

**Post-MVP path to CMS:** When committee members want to add workshops without code knowledge, migrate `workshops.ts` and `events.ts` to Sanity.io. All other content (domains, roles) stays static — it changes rarely and benefits from type checking.

### 6.2 Content Type System

```typescript
// src/types/content.ts

export type DomainId = 'ops' | 'rd' | 'pe' | 'cc' | 'td' | 'so'
export type PathType = 'technical' | 'creative' | 'operations'
export type SceneIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface Domain {
  id: DomainId
  name: string
  shortName: string               // for mobile / node labels
  description: string             // paragraph, used in accordion
  tagline: string                 // one sentence, used in 3D tooltip
  color: string                   // hex, used for node + accent
  nodePosition: [number, number, number] // 3D coordinates
  roles: Role[]
  pathAffinity: PathType[]        // which choice paths highlight this domain
}

export interface Role {
  id: string                      // 'DoP', 'EM', etc.
  title: string
  domain: DomainId
  tier: 'facilitator' | 'associate' | 'head' | 'coordinator'
  duties: string[]                // max 3, each max 100 chars
  pathAffinity: PathType          // primary path alignment
  isAvailable: boolean            // false = role filled, show as greyed
}

export interface Achievement {
  year: number
  title: string
  description: string             // 1–2 sentences
  type: 'award' | 'event' | 'publication' | 'project'
  metric?: string                 // "800+ attendees", "₹50K raised"
}

export interface Workshop {
  id: string
  title: string
  date: string                    // ISO 8601
  domain: DomainId
  description: string
  outcomes: string[]              // 2–3 bullet points
  imagePath: string               // /assets/placeholders/workshop-n.jpg
  attendeeCount?: number
}

export interface Event extends Workshop {
  type: 'technical' | 'cultural' | 'competitive' | 'social'
  sponsors?: string[]
}
```

### 6.3 External URL Configuration

```typescript
// src/data/config.ts — all external links in one place
export const EXTERNAL = {
  forms: {
    core:      import.meta.env.VITE_FORM_CORE_URL      ?? null,
    associate: import.meta.env.VITE_FORM_ASSOCIATE_URL ?? null,
  },
  social: {
    instagram: import.meta.env.VITE_INSTAGRAM_URL ?? '#',
    linkedin:  import.meta.env.VITE_LINKEDIN_URL  ?? '#',
    email:     import.meta.env.VITE_CONTACT_EMAIL ?? 'ieee@rait.ac.in',
  },
  analytics: {
    plausibleDomain: import.meta.env.VITE_PLAUSIBLE_DOMAIN ?? '',
  }
} as const

// .env.example (committed to repo)
// VITE_FORM_CORE_URL=
// VITE_FORM_ASSOCIATE_URL=
// VITE_INSTAGRAM_URL=
// VITE_LINKEDIN_URL=
// VITE_CONTACT_EMAIL=
// VITE_PLAUSIBLE_DOMAIN=
```

---

## 7. PERFORMANCE REQUIREMENTS

### 7.1 Core Web Vitals Targets

| Metric | Target | Measurement tool |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.0s | Lighthouse, field data |
| FID / INP (Interaction to Next Paint) | < 100ms | Chrome UX Report |
| CLS (Cumulative Layout Shift) | < 0.05 | Lighthouse |
| FCP (First Contentful Paint) | < 1.2s | Lighthouse |
| TTI (Time to Interactive) | < 3.5s | Lighthouse |
| Lighthouse Performance Score | ≥ 85 mobile / ≥ 95 desktop | Lighthouse CI |

### 7.2 Bundle Strategy

```
Initial bundle (loads on first paint):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
React + ReactDOM:           ~44KB gzipped
Zustand:                    ~1KB
Anime.js v4 (core only):    ~6KB
DM Sans + Syne (preloaded): ~28KB (2 weights each, subset Latin)
App shell + HTML:            ~8KB
─────────────────────────────────────
INITIAL TOTAL:              ~87KB

Lazy-loaded (after TTI, on demand):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Three.js + R3F + Drei:     ~180KB gzipped (largest chunk)
Geist Mono font:            ~14KB
Radix Dialog + Accordion:   ~8KB
Framer Motion:              ~16KB
Full Anime.js (scroll, SVG):~18KB
─────────────────────────────────────
LAZY TOTAL:                 ~236KB

GRAND TOTAL:                ~323KB (well within 400KB target)
```

### 7.3 Loading Strategy

```
Frame 0: HTML parsed, CSS applied, fonts preloading
Frame 1–5: React app mounts, preloader scene renders (CSS only)
Frame 50–100: Font display swap (system font → Syne/DM Sans)
Frame ~100: Three.js chunk arrives (loaded in background)
Frame ~150: WebGL scene initialized, particle assembly begins
User interaction: Modal components loaded on first hover over CTA
```

---

## 8. SECURITY REQUIREMENTS

| Requirement | Implementation |
|---|---|
| No user data stored | All state in Zustand (memory only) + sessionStorage (choices only) |
| Google Form security | Forms embed via `<iframe sandbox="allow-scripts allow-forms allow-same-origin">` |
| CSP headers | `script-src 'self'; frame-src https://docs.google.com; connect-src api.plausible.io` |
| No inline scripts | All JS in bundled files; no `eval()` anywhere |
| Font privacy | Fonts self-hosted via fontsource packages (no Google Fonts DNS requests) |
| External links | All external `<a>` tags: `rel="noopener noreferrer"` |
| Form fallback link | Opens in new tab (`target="_blank"`), never navigates away from the experience |

---

## 9. BROWSER AND DEVICE SUPPORT MATRIX

| Browser | WebGL 3D | 2D Fallback | Animation | Notes |
|---|---|---|---|---|
| Chrome 120+ | ✅ Full | ✅ | ✅ | Primary target |
| Firefox 120+ | ✅ Full | ✅ | ✅ | |
| Safari 16+ | ✅ Full | ✅ | ✅ | Test GPU compositing |
| Edge 120+ | ✅ Full | ✅ | ✅ | Chromium-based |
| Mobile Chrome | ✅ Reduced | ✅ | ✅ | 160 particles, no post-proc |
| Mobile Safari | ✅ Reduced | ✅ | ✅ | requestAnimationFrame throttled |
| Chrome < 100 | ❌ | ✅ | ✅ | Graceful SVG fallback |
| IE 11 | ❌ | ❌ | ❌ | Out of scope |

**Device tier thresholds:**
- High-end: `hardwareConcurrency >= 8` AND `deviceMemory >= 8` → Full scene
- Mid-range: `hardwareConcurrency >= 4` → Reduced scene (160 particles)
- Low-end: below thresholds → Static SVG

---

## 10. TESTING REQUIREMENTS

### 10.1 Test Coverage Targets

| Layer | Tool | Coverage Target |
|---|---|---|
| State machine (Zustand) | Vitest | 100% of state transitions |
| Component rendering | React Testing Library | ≥ 80% component coverage |
| Accessibility | axe-core integration tests | 0 AA violations |
| Animation timing | Vitest + fake timers | Core sequences verified |
| E2E narrative flow | Playwright | Full journey: load → choice → modal → form |
| Performance | Lighthouse CI in PR pipeline | Score regression alerts |
| WebGL fallback | Playwright (webgl: false flag) | Fallback renders correctly |

### 10.2 Critical Test Cases

```typescript
// Tests that must pass before any release

// 1. Full narrative journey
test('user can complete narrative and reach registration', async () => {
  // scroll to scene 2 → make choice 1 → scroll to scene 6 → open modal → select path
})

// 2. Accessibility: keyboard-only journey
test('keyboard-only user can reach and submit registration', async () => {
  // Tab to choice → Enter to select → Tab to CTA → Enter to open modal → Tab path → Enter
})

// 3. Reduced motion
test('no translate animations run when prefers-reduced-motion: reduce', async () => {
  // mock media query → verify translateY properties never set
})

// 4. WebGL fallback
test('SVG fallback renders all 6 domain nodes when WebGL unavailable', async () => {
  // mock getContext to return null → verify SVG is mounted, 3D canvas not mounted
})

// 5. External URL config
test('modal shows placeholder when form URL not configured', async () => {
  // empty VITE_FORM_CORE_URL → verify FormEmbed renders placeholder, not iframe
})

// 6. State persistence
test('choices persist across simulated page revisit', async () => {
  // set choices → write sessionStorage → reload → read sessionStorage → store hydrated
})
```

---

## 11. DEPLOYMENT REQUIREMENTS

### 11.1 Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-src https://docs.google.com; connect-src https://plausible.io; font-src 'self'; img-src 'self' data:"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 11.2 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    steps:
      - npm ci
      - npm run type-check      # tsc --noEmit
      - npm run lint            # eslint
      - npm run test            # vitest
      - npm run build           # vite build
      - npm run lighthouse      # lighthouse CI against built site
      - npm run a11y            # axe-core audit
```

---

*Document: TRD v1.0 | Approved for Design Stack handoff*
