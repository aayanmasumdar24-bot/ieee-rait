# IEEE RAIT — Website Flow Stack

Document set: [00 Understanding](00_UNDERSTANDING_AND_DECISIONS.md) ·
[01 Design PRD](01_DESIGN_PRD.md) · [02 TRD](02_TRD.md) ·
[03 Design Stack](03_DESIGN_STACK.md) · [04 Tech Stack](04_TECH_STACK.md) ·
**05 Website Flow Stack** (this file)

The last document in the chain. 01 decided the feel, 02 the architecture, 03 the
tokens, 04 the dependencies. This one is the wiring diagram: which scroll position
produces which camera, which state, which copy — and what happens when any of it
fails.

---

## 1. Sitemap

```
/                    The narrative. One route, seven scenes, fixed viewport
/induct/             The frozen rocket microsite (D1) — unmaintained by default
/register            Deep link: opens at Scene 6 with the modal already open
404                  Styled, links back to /
```

Three URLs. `/register` is not a separate page — it loads the same document,
jumps the scroll driver to Scene 6, and opens the modal, so a poster QR code can
point straight at the action without anyone maintaining a second surface.

---

## 2. The scroll driver

The page does not scroll. A tall invisible element gives the browser something
real to scroll, and its progress drives the camera (D2).

```
┌─ document ─────────────────────────────┐
│  <div class="scroll-driver">           │  height: 700vh
│      (empty, aria-hidden, no content)  │  the scrollbar's reason to exist
│  </div>                                │
│                                        │
│  <canvas>         position: fixed      │  the 3D layer, aria-hidden
│  <main>           position: fixed      │  every fact, in DOM
└────────────────────────────────────────┘
```

```ts
const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight)
// 0 … 1, clamped, read in rAF — never in a scroll handler
```

Native scroll is deliberately preserved. Trackpad inertia, `PageDown`,
`Home`/`End`, the screen-reader virtual cursor, and the physical scrollbar all
keep working, because hijacking scroll is the most common way an ambitious site
earns the usability score *Little Helper* did — 7.26 against 8.41 for creativity.
The ambition is worth copying; that gap is not.

Progress is read once per frame in `requestAnimationFrame`. Camera position
updates every frame. The store is written **only** when the derived scene index
changes, so React re-renders on transitions rather than on motion.

---

## 3. Scene breakpoints

```ts
export const SCENE_BREAKPOINTS = [0.05, 0.18, 0.35, 0.55, 0.70, 0.88, 1.00] as const
```

| Scene | Progress | Name | Carries |
|---|---|---|---|
| 0 | 0.00 – 0.05 | `ARRIVE` | Hero, the `JOIN` word, one line of intent |
| 1 | 0.05 – 0.18 | `ORIENT` | What IEEE RAIT is. **Choice 1** |
| 2 | 0.18 – 0.35 | `NETWORK` | Six domain nodes resolve out of the particle field |
| 3 | 0.35 – 0.55 | `PROOF` | Achievements, stats bar, *Prompting Odyssey* |
| 4 | 0.55 – 0.70 | `WORK` | Workshops and events. **Choice 2** |
| 5 | 0.70 – 0.88 | `ROLES` | The accordion: six domains, eighteen roles |
| 6 | 0.88 – 1.00 | `JOIN` | **Choice 3**, then the registration CTA |

Scene 0 gets 5 % because a hero should not be a scroll tax. Scenes 3 and 5 get
the most room because they carry the most facts — proof and roles are what an
applicant actually came to read.

Transitions are **hysteretic**: entering scene *n* requires crossing its
breakpoint by 0.01, leaving requires falling back by 0.01. Without that, a
trackpad resting on a boundary flickers the label and re-fires the reveal.

---

## 4. Camera mapping

```ts
export const CAMERA_KEYFRAMES = [
  [0.00,  12.0], [0.05,  10.0], [0.18,   4.0], [0.35,  1.5],
  [0.55,   4.0], [0.70,   5.0], [0.88,   3.0], [1.00, -2.0],
] as const   // [progress, z]

export const CAMERA_Y_KEYFRAMES = [
  [0.00, 0.0], [0.35, 0.5], [0.55, 1.2], [0.88, 0.8], [1.00, 0.0],
] as const   // [progress, y]
```

Z is linearly interpolated between keyframes, then **lerped** toward the target at
`0.08` per frame — the lerp is what makes the camera feel like it has mass rather
than tracking the scrollbar rigidly.

```ts
camera.position.z += (targetZ - camera.position.z) * 0.08
```

The arc reads as a single move: a wide approach (z 12 → 4) as the network
resolves, a close pass through the proof scene (z 1.5, the tightest point), a pull
back to survey the roles, then a final push **through** the node plane to z −2 on
the join scene — the camera ends up inside the network rather than looking at it.
That last move is the whole argument of the site expressed geometrically.

Y rises to 1.2 at the workshops scene so the network sits low in frame, leaving
the upper two-thirds for overlay text. The grid-breaking in
[03 §4](03_DESIGN_STACK.md) exists to keep the other side of the frame clear.

Under `prefers-reduced-motion`, keyframes are **jumped, not lerped**: the camera
snaps to the target on scene change and holds. No lerp, no continuous motion,
same seven vantage points.

---

## 5. Narrative state machine

```
LOADING ──▶ SCENE_0 ⇄ SCENE_1 ⇄ SCENE_2 ⇄ SCENE_3 ⇄ SCENE_4 ⇄ SCENE_5 ⇄ SCENE_6
                                                                          │
                                                                          ▼
                                                                        MODAL
                                                                    (returns to
                                                                     SCENE_6)
```

Every scene transition is bidirectional. `MODAL` is the only state that is not
scroll-derived — it is opened by intent and closed by `Esc`, the close button, or
a backdrop click, always returning focus to the trigger.

```ts
interface Store {
  tier: 'full' | 'reduced' | 'static'
  scene: SceneIndex              // 0 … 6, derived from scroll
  highestScene: SceneIndex       // persisted — the funnel metric
  activeDomain: DomainId | null  // accordion ⇄ node highlight, two-way
  choices: {
    focus: 'technical' | 'creative' | 'operations' | null
    mode:  'learning' | 'building' | null
    track: 'core' | 'associate' | null
  }
  modal: { open: boolean; step: 1 | 2 | 3 }
}
```

`choices` and `highestScene` persist to `sessionStorage`. Nothing else does, and
nothing outlives the tab (D11).

`LOADING` runs the preloader once per session: 480 particles assemble the diamond
over `--dur-cinematic` 2400 ms, hold 1.2 s, dissolve. Under reduced motion it
shortens to 800 ms with opacity only. It is gated by a session flag — a returning
visitor within the same tab does not sit through it twice.

---

## 6. The three choices

All three are **reversible**, affect **DOM content only**, and never alter the 3D
scene data (D11). One scene graph to maintain, not eight permutations.

### Choice 1 — Scene 1, `focus`

> *What pulls you in?*

| Option | Reframes | Highlights |
|---|---|---|
| `technical` | Scenes 3 and 5 lead with build and research evidence | `td`, `rd` |
| `creative` | Lead with design, content, and media work | `cc`, `pe` |
| `operations` | Lead with events, logistics, and sponsorship | `ops`, `so` |

Effect: reorders the domain accordion, swaps three lead sentences, tints the
matching nodes' edge glow one step brighter. Every domain stays visible and
reachable — a choice narrows emphasis, never access.

### Choice 2 — Scene 4, `mode`

> *How do you want to spend a Saturday?*

`learning` surfaces workshops, sessions, and study circles first.
`building` surfaces projects, competitions, and hackathons first.

Effect: reorders the Scene 4 card grid and changes one paragraph.

### Choice 3 — Scene 6, `track`

> *Which way in?*

`core` → the core committee form. `associate` → the associate form. This is the
only choice that changes the destination URL, and it is the last thing asked, once
the visitor has seen the roles.

### Interaction

Selecting a card springs it to `scale(1.02)` and drops siblings to 40 % opacity —
never to `display: none`, so reversing is one click on something still visible.
Old copy leaves on `--ease-disappear`, new copy staggers in at 40 ms from start
over `--dur-medium`.

A "start over" control in Scene 6 clears all three and resets the copy. Choices
are also announced through an `aria-live="polite"` region, because a visual copy
swap is invisible to a screen-reader user who has already passed that text.

---

## 7. Scene-by-scene wiring

| Scene | DOM enters | 3D behaviour | Analytics |
|---|---|---|---|
| 0 `ARRIVE` | `JOIN` at `--t-big`, one-line intent, scroll hint | Particles drift, nodes unformed | `scene_enter{0}` |
| 1 `ORIENT` | Branch identity, `#DONTWAITINNOVATE`, three choice cards | Particles begin converging | `scene_enter{1}`, `choice_made{focus}` |
| 2 `NETWORK` | Six domain labels offset to columns 2–7 | Nodes snap to position, 12 edges draw | `scene_enter{2}` |
| 3 `PROOF` | Stats bar counts up, achievement list, *Prompting Odyssey* | Closest pass, z 1.5. Nodes pulse on the beat | `scene_enter{3}` |
| 4 `WORK` | Workshop cards, centre-out stagger, two choice cards | Camera lifts, network sits low | `scene_enter{4}`, `choice_made{mode}` |
| 5 `ROLES` | Full-width accordion, 6 rows, 18 roles, tier badges | Active row highlights its node, two-way | `scene_enter{5}` |
| 6 `JOIN` | Track choice, then the single gold CTA | Camera passes through the node plane | `scene_enter{6}`, `choice_made{track}`, `modal_open`, `form_click` |

Scene 5 is the accessibility keystone. The accordion carries every fact the nodes
encode — that is precisely what licenses `aria-hidden="true"` on the canvas (D9).
If a fact exists only in WebGL, the build is wrong.

---

## 8. Registration flow

```
Scene 6 CTA ──▶ MODAL step 1  Track select: core │ associate
                     │
                     ▼
                MODAL step 2  What to expect: commitment, timeline, what
                     │        the role actually involves
                     ▼
                MODAL step 3  Hand-off: "Opens in a new tab" + the gold button
                     │
                     ▼
              Google Form (new tab, rel="noopener noreferrer")
```

Three steps, because sending someone straight from a scroll narrative into a bare
Google Form loses them at the seam. Step 2 exists to set expectations honestly —
hours per week, cycle length, what the tier badge means.

Modal contract: focus trapped, `Esc` closes, body scroll locked, focus returns to
the trigger, `aria-labelledby` on the panel, first focusable is the close button.
Back and forward between steps preserve the selection.

If the relevant form URL is missing or malformed, step 3 renders an informational
card — "Applications open soon, follow @ieeerait" — instead of a dead button. The
gold CTA is never disabled ([03 §6](03_DESIGN_STACK.md)); a broken link is worse
than an honest absence.

---

## 9. Funnel

Five events, no more, matching the fixed schema in
[04 §2](04_TECH_STACK.md).

| Event | Payload | Answers |
|---|---|---|
| `scene_enter` | `{ scene: 0–6 }` | Where do people stop? |
| `choice_made` | `{ which, value }` | What are they actually here for? |
| `modal_open` | `{ from: 'cta' \| 'deeplink' }` | Does the narrative or the QR code convert? |
| `form_click` | `{ track }` | Core versus associate split |
| `fallback_tier` | `{ tier }` | How many devices never see WebGL? |

Targets from [00 §1](00_UNDERSTANDING_AND_DECISIONS.md): Scene 0 → Scene 6
completion **≥ 45 %**, Scene 6 → modal open **≥ 30 %**.

`scene_enter` fires once per scene per session, keyed on `highestScene`, so
scrolling back and forth does not inflate the numerator. `fallback_tier` is the
one event that decides next year's budget: if a third of visitors land on
`static`, the SVG tier stops being a fallback and becomes the primary design
target.

---

## 10. Keyboard and reduced motion

Both are release gates, not settings.

**Keyboard.** Skip link first in tab order. `Tab` moves through overlay controls
in reading order. `PageDown`/`PageUp`, `Home`/`End`, and arrow keys all work
because native scroll was never taken away. Two explicit affordances:
`Ctrl + →` / `Ctrl + ←` jump to the next and previous scene by scrolling the
driver to that breakpoint — real scrolling, so the scrollbar stays truthful. The
accordion follows the standard pattern: `Enter`/`Space` toggles, arrows move
between headers.

A keyboard-only user must be able to reach Scene 6 and open the modal without
touching a pointer. That is E2E test 1 in [04 §10](04_TECH_STACK.md).

**Reduced motion.** Camera jumps between keyframes. Particles hold position. All
reveals become opacity-only over `--dur-fast`. The preloader shortens to 800 ms.
Counters render their final value immediately. Shimmer on media placeholders is
off. Nothing is removed — every fact, every control, every scene remains.

---

## 11. Fallback and error states

| Condition | Behaviour |
|---|---|
| No WebGL, or width < 768 | `static` tier. Hand-drawn SVG network — same six nodes, twelve edges, drawn as an intentional diagram. Sections stack and scroll normally. Hero drops `--t-big` → 40 px |
| `hardwareConcurrency` < 4 | `reduced` tier. 160 particles, no edge animation, camera still lerps |
| WebGL context lost mid-session | Catch `webglcontextlost`, unmount the canvas, swap to the SVG network in place. No reload, no error text |
| `three` chunk fails to load | Same as above. The overlay never depended on it |
| JavaScript disabled | `<noscript>` renders the full role list, the branch description, and a direct link to the form. Ugly, complete, honest |
| Image fails | Gradient skeleton holds the aspect ratio. No layout shift, no broken-image icon |
| Form URL missing | Informational card (§8) |
| Analytics blocked | Silent. Never a console error, never a retry loop, never a visible gap |
| Unknown route | Styled 404 on `--ink`, one link back to `/` |

The `static` tier must look **designed**, never like a failure. It ships with
custom SVG geometry, not a canvas screenshot, precisely so a mid-range phone gets
an intentional artefact (D5). A site recruiting engineers cannot fail on the
hardware its applicants own.

---

## 12. Flow verification checklist

Before launch, each of these is walked end to end by a person, not only by CI:

- [ ] Mouse wheel: 0 → 1 → 0, no flicker at any breakpoint
- [ ] Keyboard only: reach Scene 6, open the modal, reach the form
- [ ] Reduced motion: complete the journey, confirm the camera jumps
- [ ] WebGL disabled: every fact still present, layout intact
- [ ] All three choices selected, reversed, and re-selected
- [ ] `/register` deep link opens Scene 6 with the modal focused
- [ ] `Esc` from the modal returns focus to the exact trigger
- [ ] Resize 375 → 1920 mid-scroll without breaking the scene mapping
- [ ] Both form URLs land on the correct branch-owned form
- [ ] Five analytics events fire once each, with correct payloads

---

*Document: Website Flow Stack v1.0 | Derived from 02 TRD and 04 Tech Stack | Closes the document set*
