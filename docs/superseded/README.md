# Superseded — do not build from these

These ten files are an earlier, **abandoned** direction for the IEEE RAIT site.
They are kept because parts are salvageable and because a decision reversal is
worth being able to audit. Nothing here is authoritative.

The live document set is one level up: [00 Understanding](../00_UNDERSTANDING_AND_DECISIONS.md),
[01 Design PRD](../01_DESIGN_PRD.md), [02 TRD](../02_TRD.md),
[03 Design Stack](../03_DESIGN_STACK.md), [04 Tech Stack](../04_TECH_STACK.md),
[05 Website Flow Stack](../05_WEBSITE_FLOW_STACK.md).

## What this direction proposed

Next.js 14 App Router + Tailwind, GSAP + ScrollTrigger as the primary animation
layer, Vercel hosting, GA4 analytics, Google Fonts over CDN, seven chapters, and
the ten IEEE **global technical societies** (CS, PES, RAS, SP, ComSoc, EMC, EMBS,
AESS, IES, WIE) as the domain taxonomy.

## Why it was dropped

Four specific grounds, not preference:

1. **Fabricated content.** `domains.ts` asserts member counts for real IEEE
   societies — "100,000+ members", "12,000+ members", eight more. Unverifiable
   claims about a real organisation, on a recruitment site, is the one defect that
   cannot be styled around.
2. **Wrong taxonomy for the goal.** The brief recruits for an 18-role **junior
   committee**, not for global society membership. The live model uses six
   functional domains from the committee roles PDF: `ops`, `rd`, `pe`, `cc`,
   `td`, `so`.
3. **Contradicted the cited reference.** This set makes GSAP primary and
   name-drops anime.js as "inspiration". The brief names animejs.com; anime.js v4
   is what the motion grammar is written in.
4. **Weaker security, and an accessibility claim that is false.** The CSP here
   carries `'unsafe-eval'` and `'unsafe-inline'`, uses
   `X-Frame-Options: SAMEORIGIN`, loads fonts cross-origin, and ships
   cookie-bearing GA4. `DESIGN_SYSTEM.md` also asserts "all text ≥ 4.5:1" while
   `--color-text-lo #3A5872` on `#080C10` is nowhere near it. The live set
   measures every pair and names the one token that fails, with its usage
   restriction.

## Worth porting

| File | Salvage |
|---|---|
| `FILE_STRUCTURE.md` | The directory decomposition is sound. Already adapted to the Vite layout in [04 §4](../04_TECH_STACK.md) |
| `MILESTONES.md` | The 6-phase / 10-week shape is reusable. Its task lists still reference Next.js, Vercel, GA4, Google Fonts, and GSAP — rewrite before use |
| `WEBSITE_FLOW.md` | The error-state table and the 3-step registration mockups informed [05 §8 and §11](../05_WEBSITE_FLOW_STACK.md) |
| `types.ts` | Interface *style* only. `ChapterId` (7 chapters) and `RegistrationTrack` (`'jc-joint-core'`) are not the live contract — [02 TRD](../02_TRD.md) is |
| `globals.css`, `storyStore.ts`, `FILES.zip` | Nothing. Tokens and store shape both changed |

Delete this folder once `MILESTONES.md` has been rewritten against the live stack.
That is the only remaining reason to keep it.
