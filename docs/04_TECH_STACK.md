# IEEE RAIT — Tech Stack

Document set: [00 Understanding](00_UNDERSTANDING_AND_DECISIONS.md) ·
[01 Design PRD](01_DESIGN_PRD.md) · [02 TRD](02_TRD.md) ·
[03 Design Stack](03_DESIGN_STACK.md) · **04 Tech Stack** (this file) ·
[05 Website Flow Stack](05_WEBSITE_FLOW_STACK.md)

Every dependency here earns its bytes. Where something plausible was rejected,
the rejection is recorded with its reason — that is the part that survives
handover.

---

## 1. Stack at a glance

```
Build            Vite 5 + TypeScript 5 (strict)
UI               React 18
3D               Three.js + @react-three/fiber + @react-three/drei   (lazy chunk)
DOM motion       anime.js v4
Layout motion    Framer Motion   (presence and drag only)
Primitives       Radix UI   (Dialog, Accordion)
State            Zustand + persist → sessionStorage
Fonts            Fontsource, self-hosted
Analytics        Plausible   (cookieless)
Host             Netlify   (static, headers via netlify.toml)
Test             Vitest + Testing Library + Playwright + axe-core + Lighthouse CI
Quality          ESLint + Prettier + tsc --noEmit
```

No CSS framework. The tokens in [03 Design Stack](03_DESIGN_STACK.md) live in one
`tokens.css` and are consumed as custom properties. A utility framework would add
a build dependency and a class vocabulary to learn, for a site with roughly a
dozen components and a fixed token set.

---

## 2. Why each piece

### Vite over Next.js

This is one route with no server. Server Components, ISR, route handlers, and
image optimisation solve problems this site does not have, and the App Router
brings a hydration model that fights a `useRef`-heavy WebGL canvas. Vite gives a
fast dev server, real code splitting via dynamic `import()`, and a static `dist/`
any CDN serves. A future `/events` archive is a second HTML entry, not a reason
to adopt a framework now.

Rejected: **Next.js** (framework weight for zero framework benefit; its CSP
usually ends up carrying `'unsafe-eval'`), **Astro** (its island model buys
little when the one heavy island is most of the page), **no bundler at all**
(loses type checking, the main defence against a malformed role or domain entry).

### React 18

The overlay is stateful in a way that maps cleanly to components: seven scenes,
three reversible choices, a modal, an accordion. React also unlocks R3F, which is
the real reason. `StrictMode` on in development.

### Three.js via R3F and Drei

R3F keeps the scene graph declarative and colocated with the state driving it, so
a camera keyframe change is a prop change rather than an imperative patch. Drei
supplies `Instances`, `PerspectiveCamera`, and loader helpers — a few hundred
lines skipped.

The entire 3D layer is a lazy chunk, loaded after first paint:

```ts
const Scene = lazy(() => import('./three/Scene'))
```

Rejected: **Babylon.js** (larger, editor-oriented, no React story of this
quality), **bare Three.js** (imperative camera and particle updates driven by
React state is exactly the bug factory R3F removes).

### anime.js v4 for DOM motion

The cited reference, and independently the right tool. v4 is modular, so the
core plus timer is ~6 KB rather than a monolith, and its API maps directly onto
the motion grammar in [03](03_DESIGN_STACK.md):

| Need | v4 API |
|---|---|
| Scene reveal sequences | `createTimeline()`, `'<'` relative positioning |
| Scroll-linked motion | `onScroll({ sync: true })` |
| Centre-out card grids | `stagger(60, { from: 'center' })` |
| Choice-card response | `createSpring({ stiffness: 80, damping: 10 })` |
| SVG edge draw (static tier) | `createDrawable()`, `draw: ['0 0', '0 1']` |
| Stat counters | `createTimer()` with `onUpdate` |
| Scoped cleanup in React | `createScope()` inside `useEffect` |

**GSAP is rejected.** It is excellent, and it is also ~25 KB doing what anime.js
v4 already does here, under a licence that needs reading before club use. Running
both would pay twice for one vocabulary. The one condition that reopens this:
scroll *pinning* beyond what `onScroll({ sync: true })` handles — then
ScrollTrigger enters alone and this paragraph gets rewritten rather than quietly
ignored.

### Framer Motion, narrowly

`AnimatePresence` for mount/unmount of the modal and choice panels, plus drag if
the mobile timeline needs it. It is **not** the general animation layer — two
animation systems on one element is how motion bugs happen. If `AnimatePresence`
is the only feature used at launch, replace it with anime.js completion callbacks
and drop the dependency.

### Radix UI

Dialog and Accordion only. Focus trap, `Esc` handling, focus return, and
`aria-expanded` wiring are precisely what hand-rolled versions get subtly wrong,
and both are release gates under D9. Unstyled, so 03's tokens apply directly.

### Zustand

One store: scene index, highest scene reached, three choices, modal state, active
domain, render tier. `persist` writes only `choices` and `highestSceneReached` to
`sessionStorage` — session scope per D11, so a later visit starts clean and
nothing outlives the tab.

Rejected: **Redux Toolkit** (ceremony for six fields), **Context alone** (every
consumer re-renders on camera-adjacent updates), **localStorage** (stale state
weeks later, for no benefit).

### Fontsource

Self-hosted Syne, DM Sans, Geist Mono. Removes a third-party DNS and TLS round
trip from the critical path, keeps `font-src 'self'` in the CSP, and stops
visitor IPs reaching a third party. Latin subset, `font-display: swap`.

### Plausible

Cookieless and IP-anonymising, so no consent banner interrupts the first frame.
Fixed five-event schema — `scene_enter`, `choice_made`, `modal_open`,
`form_click`, `fallback_tier` — so instrumentation cannot sprawl.

Rejected: **GA4** (cookies, therefore a consent gate in front of the site's own
opening; and more data about students than a club needs to hold).

### Netlify

Static publish of `dist/`, deploy previews per pull request, instant rollback,
and `netlify.toml` headers — which is the only hosting feature this site
actually requires. Cloudflare Pages is an equivalent substitute; the header
syntax is the only thing that changes.

---

## 3. Dependency manifest

Versions are a **known-good baseline**, pinned exactly (no `^`), with the
lockfile committed. Verify the current patch releases at scaffold time and lock
whatever installs — the constraint that matters is *exact and locked*, not these
specific digits.

```json
{
  "name": "ieee-rait",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint . --max-warnings 0",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:a11y": "playwright test --grep @a11y",
    "media": "node scripts/media.mjs",
    "verify": "npm run lint && npm run build && npm run test && npm run test:e2e"
  },
  "dependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "three": "0.169.0",
    "@react-three/fiber": "8.17.10",
    "@react-three/drei": "9.114.3",
    "animejs": "4.0.2",
    "framer-motion": "11.11.17",
    "@radix-ui/react-dialog": "1.1.2",
    "@radix-ui/react-accordion": "1.2.1",
    "zustand": "5.0.1",
    "@phosphor-icons/react": "2.1.7",
    "@fontsource-variable/syne": "5.1.0",
    "@fontsource/dm-sans": "5.1.0",
    "@fontsource/geist-mono": "5.1.0"
  },
  "devDependencies": {
    "typescript": "5.6.3",
    "vite": "5.4.11",
    "@vitejs/plugin-react": "4.3.3",
    "@types/react": "18.3.12",
    "@types/react-dom": "18.3.1",
    "@types/three": "0.169.0",
    "vitest": "2.1.5",
    "@vitest/coverage-v8": "2.1.5",
    "jsdom": "25.0.1",
    "@testing-library/react": "16.0.1",
    "@testing-library/user-event": "14.5.2",
    "@playwright/test": "1.49.0",
    "@axe-core/playwright": "4.10.1",
    "@lhci/cli": "0.14.0",
    "eslint": "9.15.0",
    "prettier": "3.3.3",
    "rollup-plugin-visualizer": "5.12.0",
    "sharp": "0.33.5"
  },
  "engines": { "node": ">=20.11" }
}
```

**Runtime dependency count: 13.** Any pull request adding a fourteenth states
which ladder rung it clears — not in stdlib, not in the platform, not already
installed, not a few lines of local code.

`sharp` is a dev dependency: it powers the media script (D8), never runtime.

---

## 4. Project structure

```
ieee-rait/
├── public/
│   ├── induct/index.html        # the frozen rocket microsite (D1)
│   ├── media/                   # transcoded output only, never sources
│   └── og.jpg
├── media-src/                   # 596 MB of originals — gitignored
├── scripts/media.mjs            # transcode + EXIF strip + budget gate
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── data/                    # domains.ts roles.ts achievements.ts
│   │                            # workshops.ts events.ts scenes.ts links.ts
│   ├── types/index.ts           # the 02 TRD interfaces, one source
│   ├── store/useStore.ts
│   ├── hooks/                   # useScrollProgress useRenderTier
│   │                            # useReducedMotion useSceneObserver
│   ├── three/                   # Scene NetworkNodes Particles CameraRig
│   ├── components/
│   │   ├── scenes/              # Scene0Intro … Scene6Join
│   │   ├── ui/                  # Button Card RoleCard SceneLabel
│   │   │                        # Modal Accordion StatBar Media
│   │   └── fallback/StaticNetwork.tsx
│   ├── lib/                     # motion.ts analytics.ts env.ts format.ts
│   └── styles/                  # tokens.css typography.css global.css
├── tests/                       # unit/  e2e/
├── netlify.toml
├── vite.config.ts
└── package.json
```

Rule from the coding standards, applied: many small files. 200–400 lines is
typical, 800 is the hard ceiling. `src/three/` is the file most likely to breach
it — split by responsibility (nodes, particles, camera) before it does.

---

## 5. Build configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [react(), visualizer({ filename: 'dist/stats.html', gzipSize: true })],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
})
```

`three` is a named chunk so the budget in §7 is measurable per build rather than
inferred. Sourcemaps ship because this is a student project that a successor will
have to debug in production.

TypeScript runs `strict`, plus `noUncheckedIndexedAccess` and
`noImplicitOverride`. `tsc --noEmit` runs *before* `vite build` in the `build`
script — a type error must fail the build, not warn during it.

---

## 6. Environment contract

```bash
# .env.example — committed. .env.local — gitignored.
VITE_FORM_CORE_URL=
VITE_FORM_ASSOCIATE_URL=
VITE_INSTAGRAM_URL=
VITE_LINKEDIN_URL=
VITE_CONTACT_EMAIL=
VITE_PLAUSIBLE_DOMAIN=
```

**Every `VITE_` variable is public.** Vite inlines them into the client bundle at
build time; they are visible to anyone who opens the bundle. They are
configuration, never secrets. No API key, token, password, or service credential
may ever carry a `VITE_` prefix — this site has no server and therefore has no
place to keep a secret.

All six are read once through `src/lib/env.ts`, which validates shape at module
load:

```ts
const isHttps = (v: string) => /^https:\/\/\S+$/.test(v)
```

A missing or malformed form URL does **not** throw and does **not** render a
dead button. The gold CTA becomes an informational card reading "Applications
open soon — follow @ieeerait for the announcement", per the never-disabled rule
in [03 §6](03_DESIGN_STACK.md). A broken link is worse than an honest absence.

External links carry `rel="noopener noreferrer"` and `target="_blank"` without
exception.

---

## 7. Performance budgets

Numbers are enforced, not aspirational. A pull request that breaks one fails CI.

| Chunk | Gzipped | Notes |
|---|---|---|
| Initial (HTML + CSS + React + shell) | **≤ 87 KB** | Everything before first paint |
| Lazy `three` chunk | **≤ 236 KB** | Loads after paint, only on `full`/`reduced` tiers |
| Total JavaScript | **≤ 323 KB** | Against a 400 KB ceiling |
| CSS | **≤ 24 KB** | One token file plus component styles |
| Fonts | **≤ 180 KB** | 5 woff2 files, latin subset |

The `static` tier never downloads the `three` chunk at all — which is what makes
a mid-range phone viable, not merely tolerable.

| Runtime | Budget |
|---|---|
| WebGL frame | ≤ **8.0 ms** |
| DOM + JS frame | ≤ **5.0 ms** |
| Draw calls | ≤ **25** |
| Triangles | ≤ **15 000** |
| Texture memory | ≤ **64 MB** |
| JS heap | ≤ **80 MB** |

Lighthouse gates: **≥ 85 mobile, ≥ 95 desktop**, LCP < 2.5 s, INP < 200 ms,
CLS < 0.1. Media placeholders reserve final aspect ratio precisely so CLS stays
where it belongs.

---

## 8. Security posture

Static site, no backend, no database, no authentication, no PII in transit
through anything this code owns. That removes most of the usual surface, and the
remainder gets handled explicitly.

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = """
      default-src 'self';
      script-src 'self' https://plausible.io;
      style-src 'self';
      img-src 'self' data:;
      font-src 'self';
      connect-src 'self' https://plausible.io;
      frame-src 'none';
      frame-ancestors 'none';
      object-src 'none';
      base-uri 'self';
      form-action 'none'
    """
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    X-Content-Type-Options    = "nosniff"
    X-Frame-Options           = "DENY"
    Referrer-Policy           = "strict-origin-when-cross-origin"
    Permissions-Policy        = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**No `'unsafe-inline'`, no `'unsafe-eval'`, and no nonce.** The nonce is
unnecessary because there are zero inline scripts: Vite emits external modules,
and Three.js compiles shaders through WebGL rather than `eval`. `style-src
'self'` holds because all styling is in stylesheets — inline `style` attributes
set by anime.js are attribute-level and unaffected by `style-src`. If an inline
script ever becomes genuinely necessary, a Netlify Edge Function injects a
per-request nonce; until then, not needing one is the stronger position.

`form-action 'none'` is honest: this site posts nothing. Registration is a
**link out** to the Google Form with `rel="noopener noreferrer"`, not an iframe,
which keeps `frame-src 'none'` intact and keeps student PII entirely inside
Google's form rather than passing through anything here.

Also in force:

- **D12 — no `innerHTML`, no `dangerouslySetInnerHTML`, anywhere.** All rendering
  is structural JSX. The `arrive()` function in the existing `index.html` shows
  how fast trusted-literal markup turns into a committee-edited injection surface
  once a data file becomes editable.
- Embeds, if ever added, are allowlisted by exact origin — never by
  interpolating a URL from a data file into a `src`.
- The media script strips EXIF (D8). Uncropped GPS coordinates in a workshop
  photo are a real privacy leak, not a hypothetical one.
- No identifiable student face ships without recorded consent (A9, OQ3).
- The Google Form must be owned by a **branch account**, not a personal one, so
  registration data survives handover and has an accountable custodian. Names,
  roll numbers, departments, years, emails, and phone numbers collected there
  fall under the **DPDP Act 2023** and need a consent line at the point of
  collection. This is the Database Administrator role's remit as written in the
  committee PDF: accuracy, backup, privacy compliance.
- `npm audit --omit=dev` runs in CI. A high or critical advisory blocks release.

---

## 9. Media pipeline

`npm run media` is a release gate, not an optimisation pass (D8). Input:
`media-src/` (596 MB, 58 files, gitignored). Output: `public/media/`.

| Step | Rule |
|---|---|
| Images | `sharp` → AVIF + WebP, widths 640/1280/1920, **EXIF stripped** |
| Image ceiling | ≤ 200 KB per delivered image |
| Video | Not self-hosted. Three files at 60/100/137 MB go to YouTube or Vimeo; the site links out or embeds an allowlisted origin |
| Poster frames | Extracted at build, ≤ 120 KB |
| Gate | The script exits non-zero if any output breaches its ceiling |

Shipping 596 MB as-is is roughly 4 000× the image budget. Nothing launches until
this has run.

---

## 10. Testing

| Layer | Tool | Covers |
|---|---|---|
| Unit | Vitest + Testing Library | Store transitions, scroll → scene mapping, camera keyframe interpolation, env validation, formatters |
| Component | Testing Library | Modal focus trap and return, accordion keyboard operation, choice reversibility, role card `isAvailable` announcement |
| E2E | Playwright | Full scroll journey, choice → content swap, modal → form hand-off, `static` tier with WebGL disabled |
| A11y | axe-core in Playwright, `@a11y` tag | Zero AA violations on every scene |
| Perf | Lighthouse CI | The §7 gates |

Coverage floor **80 %**, measured on `src/store`, `src/lib`, and `src/hooks` —
the logic that can actually be wrong. Three.js scene code is verified visually
and by frame budget; asserting on a WebGL render tree produces brittle tests that
pass while looking broken.

Three E2E tests are non-negotiable, because each maps to a stated success
criterion in [00 §1](00_UNDERSTANDING_AND_DECISIONS.md):

1. Keyboard-only user reaches Scene 6 and opens the registration modal.
2. `prefers-reduced-motion` user completes the same journey with the camera
   jumping rather than lerping.
3. WebGL-disabled browser gets the SVG network and every fact still present.

---

## 11. CI and quality gates

`npm run verify` runs locally and in CI on every pull request:

```
tsc --noEmit  →  eslint --max-warnings 0  →  vite build
              →  vitest run  →  playwright test  →  lhci autorun
```

Merge blockers: type error, lint warning, failing test, axe violation, bundle
over budget, Lighthouse under threshold, `npm audit` high or critical.

Deploy previews per pull request. `main` publishes to production. Rollback is a
Netlify redeploy of the prior build — one click, which matters when the person
on call is a student in exam week.

---

## 12. Rejected alternatives

| Rejected | In favour of | Reason |
|---|---|---|
| Next.js | Vite | No server, no routes, no ISR. Framework weight for no framework benefit |
| Tailwind | `tokens.css` | ~12 components against a fixed token set; the build dependency is not repaid |
| GSAP + ScrollTrigger | anime.js v4 | Duplicates a vocabulary already present, ~25 KB, licence needs review. Reopens only if scroll pinning is required |
| Framer Motion as the motion layer | anime.js v4 | Two systems on one element is a bug source; Framer stays confined to presence and drag |
| Redux Toolkit | Zustand | Ceremony for six fields |
| `localStorage` | `sessionStorage` | Stale narrative state on a later visit; nothing here should outlive the tab |
| Google Fonts CDN | Fontsource | Third-party round trip, weaker CSP, visitor IPs to a third party |
| GA4 | Plausible | Cookies force a consent gate ahead of the site's opening frame |
| Sanity / Contentful | Typed TS in `src/data/` | Build-time type checking beats editor convenience at this content volume. Migrate when a non-technical editor actually needs to publish (D6) |
| Self-hosted registration form | External Google Form | Would add a backend, PII custody, CSRF, rate limiting, and spam handling to a site that otherwise has no server |
| Iframed Google Form | Link out | Keeps `frame-src 'none'` and keeps student PII out of this origin entirely |
| Babylon.js | Three.js + R3F | Larger, editor-oriented, no comparable React integration |

---

## 13. Ownership

Mapped to the roles named in the committee PDF, so maintenance has an address
after handover.

| Area | Role |
|---|---|
| Repository, deploys, dependency updates, uptime | Chief Web Developer |
| Registration data, backups, privacy compliance | Database Administrator |
| Content in `src/data/`, photo consent records | Content & Creativity group |
| Media transcode runs before each release | Technical & Design group |

Annual handover checklist: transfer the Netlify and Plausible accounts to the
incoming committee, rotate nothing (there are no secrets by design), confirm the
Google Form still belongs to the branch account, and run `npm run verify` to
establish a known-good baseline on day one.

---

*Document: Tech Stack v1.0 | Derived from 02 TRD and 03 Design Stack | Consumed by 05 Website Flow Stack*
