# IEEE RAIT — Understanding Lock & Decision Log

Document set: **00 Understanding** (this file) ·
[01 Design PRD](01_DESIGN_PRD.md) · [02 TRD](02_TRD.md) ·
[03 Design Stack](03_DESIGN_STACK.md) · [04 Tech Stack](04_TECH_STACK.md) ·
[05 Website Flow Stack](05_WEBSITE_FLOW_STACK.md)

Status: **draft pending confirmation.** Every item marked `ASSUMPTION` was decided
without input so the work could proceed. Correct any one of them and the
downstream documents change.

---

## 1. Understanding Summary

- **What is being built.** A single-page, fixed-viewport WebGL narrative site for
  the **IEEE RAIT Student Branch** (D Y Patil University / Ramrao Adik Institute of
  Technology, Navi Mumbai), recruiting for the **junior committee**. Scroll drives
  a camera through a 3D network of six domain nodes carrying eighteen roles. Six
  scenes, three branching choices, one registration CTA.
- **Why it exists.** Recruitment, where the site itself is the proof of capability.
  A conventional club page cannot demonstrate that the Technical & Design group can
  build anything; a site that performs its own claim can. Secondary purpose: a
  durable public record of branch activity that survives annual handover.
- **Who it is for.** Primary: RAIT students deciding whether to apply for a
  committee role. Secondary: the outgoing committee handing over, faculty and IEEE
  section reviewers assessing branch activity, sponsors assessing reach.
- **Key constraints.** No backend and no budget assumed — static hosting, external
  forms for registration. WebGL cannot be assumed, so a three-tier render fallback
  is mandatory. Media on disk is 596 MB across 58 files and is unusable as shipped.
  The committee roles PDF is the only authoritative content that exists.
- **Non-goals.** No CMS in v1. No member accounts, login, or payments. No
  multi-language. No sound layer in v1 despite the Resn reference. Not a general
  membership drive — this recruits for committee roles specifically.
- **Success criteria.** Scene 1 → Scene 6 completion ≥ 45 %. Scene 6 → registration
  modal open ≥ 30 %. Lighthouse ≥ 85 mobile / ≥ 95 desktop. Zero axe AA violations.
  A keyboard-only user and a reduced-motion user can each complete the journey and
  register.

---

## 2. Assumptions

| # | Assumption | Impact if wrong |
|---|---|---|
| A1 | Scope is a **new build**, not an extension of the existing `index.html` rocket microsite. The two are different products for different audiences. | If the rocket ride is meant to *be* the site, the whole 01/02 direction is discarded. See D1 and OQ7. |
| A2 | Recruitment target is committee roles, not general IEEE membership. | Changes every CTA, the choice taxonomy, and the funnel definition. |
| A3 | Static hosting; registration is an external Google Form, one per path (core / associate). | A self-hosted form adds a backend, PII custody, input validation, and rate limiting. |
| A4 | Traffic is small — low hundreds of sessions per recruitment cycle, peak well under 300 concurrent. | Affects hosting tier only; a static CDN absorbs 100× this. |
| A5 | Content is authored as typed TypeScript in `src/data/`, edited by pull request. | Direct publishing by non-technical editors forces a CMS into the stack sooner. See D6. |
| A6 | The reference sites are grammar, not templates. anime.js contributes editorial precision and motion vocabulary; Resn's *Little Helper* contributes the fixed-canvas, camera-moves-not-page posture. Neither is cloned. | A literal Resn clone means a sound layer, character art, and roughly triple the asset budget. |
| A7 | Desktop is the design target; mobile gets a deliberately different SVG treatment rather than a downscaled 3D scene. | Mobile-first reverses the layout order and makes the fallback the primary artefact. |
| A8 | English only. | i18n changes the content model shape and the type scale. |
| A9 | Photo consent for identifiable students is obtainable, or wide/anonymous shots suffice. | Gallery surfaces ship without faces and Scene 4 loses most of its evidence. |

---

## 3. Verified Asset Audit

Facts established by reading the folder, not assumed:

| Asset | Finding | Consequence |
|---|---|---|
| `index.html` | 788 lines, zero dependencies. Complete canvas microsite: six-waypoint "ride home from Neptune", hold-to-thrust physics, procedural planets, orbiting photo ring, reduced-motion tap-to-advance. Frozen constants `F=700`, `PARK=1500`, `SPACING=9000`, `ACC=26`, `VMAX=620`, `DRAG=0.982`. | Finished, on-brand work. Retiring it silently wastes it. See D1. |
| `index.html` content slots | 5 × `REPLACE_ME` URLs, 8 × `EDIT ME` entries, every `photos[].src` empty. One real event recorded anywhere: *Prompting Odyssey*, 01 Aug 26 — six hours, 22 people, five departments. | The new build inherits the same content vacuum. Content is the critical path, not code. |
| `index.html` `arrive()` | Builds panel markup with `innerHTML` / `insertAdjacentHTML` from `STOPS` data, and interpolates `s.video` straight into a `src` attribute. | Safe today because every value is a trusted literal. Becomes an injection surface the moment content moves to a committee-edited data file. The new build uses no `innerHTML` and allowlists embed origins. |
| Committee roles PDF | 3 pages, 18 roles in 5 groups, `#DONTWAITINNOVATE`. Names the Chief Web Developer (portal, uptime, security) and the Database Administrator (registrations, backup, privacy compliance). | Authoritative source for the domain/role model and the ownership map. |
| `IMG/` | 307 MB, 54 files. Content is a cybersecurity/networking session in the RAIT lab — slides show hashing and credential storage, trojans, targeted vs untargeted attacks; title slide reads subject CCNT, faculty Mr Somnath Tandale. Two videos duplicated from `VIDS/`. | Real event photography exists, but it is one event and its identity needs confirming. See OQ3. |
| `VIDS/` | 289 MB, 4 files. Videos at 60 MB, 100 MB, 137 MB. One stray JPEG. | Roughly 4 000× the image budget. Transcoding is a release blocker, not an optimisation. |
| Repo state | No `package.json`, no git repository, no build tooling, no tests, no `.md` files before this set. | Everything in 04 Tech Stack is greenfield. Nothing is being migrated. |

---

## 4. Open Questions

1. **External URLs.** Real values needed for the core form, associate form,
   Instagram, LinkedIn, and contact email. The site cannot ship without the forms.
2. **Real content.** Beyond *Prompting Odyssey*, the achievement timeline, workshop
   list, and stats bar have no real entries. Which events, with which numbers?
3. **Photo provenance and consent.** Which event is the `IMG/` set, and is there
   consent to publish identifiable faces?
4. **Role availability.** `Role.isAvailable` drives greyed-out cards. Which of the
   eighteen roles are actually open this cycle?
5. **Reference site access.** `littlehelper.resn.global` cannot be fetched — its TLS
   certificate resolves to `*.cloudfront.net` and does not cover the hostname.
   Analysis is therefore from the Awwwards record: Site of the Day 22 Dec 2017;
   palette `#000` / `#ffffff` / `#FF9398`; WebGL; scroll-driven typography; sound
   design; creativity 8.41 against usability 7.26. If a live mirror exists, point me
   at it.
6. **Domain and hosting account.** Existing `ieeerait.*` domain, a university
   subdomain, or a fresh Netlify subdomain?
7. **Fate of the rocket microsite.** Retire it, keep it at a separate route, or fold
   its content into the new build? Recommendation in D1.
8. **Deadline.** Recruitment cycle dates set the schedule and the change freeze.

---

## 5. Decision Log

| # | Decision | Alternatives considered | Why |
|---|---|---|---|
| D1 | Build the WebGL narrative site as the primary surface. Keep the existing rocket microsite alive, frozen, at a separate route (`/induct`). | Extend the rocket site instead; delete it. | The two serve different audiences — the ride recruits general first-year members, the new site recruits committee applicants. The ride is finished, dependency-free, and already handles reduced motion. Deleting working work to avoid a second route is a poor trade. It stays unmaintained by default. |
| D2 | Fixed-viewport canvas with an invisible tall scroll driver translating scroll position into camera position. | Native document scroll with pinned sections; click-to-advance beats. | This is the Resn posture, and it is what makes the site read as a world rather than a page. Keeping a real scrollbar preserves native inertia, trackpad feel, and screen-reader behaviour, unlike hijacked scroll. |
| D3 | Three.js via React Three Fiber, lazy-loaded after first paint. | Bare Three.js; Babylon.js; 2D canvas only. | R3F keeps the scene graph declarative and colocated with the React tree that already owns overlay state. Lazy loading keeps the ~180 KB chunk off the critical path. |
| D4 | anime.js v4 for all DOM motion; the Three.js loop for all WebGL motion; Framer Motion confined to layout presence and drag. GSAP excluded. | GSAP + ScrollTrigger for everything; CSS-only. | anime.js v4 is modular and small (~6 KB core), and its vocabulary — `createTimeline`, `onScroll({sync:true})`, `stagger({from:'center'})`, `createSpring`, `createDrawable` — maps directly onto the motion grammar wanted. It is also the reference site, so the grammar is legible to a reviewer. GSAP would duplicate it for ~25 KB. |
| D5 | Three render tiers — full (480 particles), reduced (160), static (hand-drawn SVG) — selected by WebGL support and `hardwareConcurrency`. | Single WebGL path with an upgrade message. | Induction-age devices span a decade of hardware. A site recruiting engineers must not fail on a mid-range phone. The SVG tier is custom-drawn, not a screenshot, so the fallback is intentional design rather than degradation. |
| D6 | Content is typed TypeScript in `src/data/`. No CMS in v1. Migrate `workshops` and `events` to a CMS only when a non-technical editor actually needs to publish. | Sanity or Contentful from day one; Markdown; Google Sheets. | Type checking catches a malformed role or domain at build time, which matters more than editor convenience at this content volume. The CMS trigger is named rather than left to drift. |
| D7 | Self-host fonts via Fontsource. No Google Fonts requests. | `<link>` to Google Fonts, as the current `index.html` does. | Removes a third-party DNS and TLS round trip from the critical path, keeps `font-src 'self'` in the CSP, and stops sending visitor IPs to a third party. |
| D8 | The media pipeline is a scripted, mandatory release gate. | Ship files as-is and rely on CDN compression. | 596 MB across 58 files, three videos at 60/100/137 MB. Nothing ships until this is transcoded, EXIF-stripped, and budgeted. |
| D9 | Accessibility is a release gate: WebGL is `aria-hidden`, every fact it conveys is also in the Scene 5 accordion, keyboard advances the narrative, reduced motion freezes camera and particles. | Ship, retrofit later. | The information architecture only holds if the 3D layer is decorative. Deciding that after the build means rebuilding the content layer. |
| D10 | Analytics is cookieless and IP-anonymising (Plausible), with a fixed five-event schema. | Google Analytics; no analytics at all. | Cookieless means no consent banner, so the first interaction stays the site's own. A fixed schema stops instrumentation sprawl. |
| D11 | The three narrative choices persist to `sessionStorage`, are reversible, and affect DOM content only — never the 3D scene data. | `localStorage`; irreversible gates. | Session scope avoids stale state on a later visit and stores nothing that outlives the tab. Keeping the 3D data constant means one scene graph to maintain, not three. |
| D12 | No `innerHTML`, no `dangerouslySetInnerHTML`, anywhere. Embeds are allowlisted by origin. | Sanitise on write; trust the data file. | The existing `arrive()` shows how quickly trusted-literal markup becomes a committee-edited injection surface. Structural rendering removes the class of bug rather than policing it. |

---

*Document: Understanding Lock v1.1 | Supersedes the hyphenated v1.0 | Aligned with 01 Design PRD and 02 TRD*
