# Math Sprint

A single-page academic math practice platform: a timed "Sprint" quiz and an
untimed "Flashcard" study mode, built with Next.js (App Router) + TypeScript
and Firestore for anonymous score storage. See `phase-roadmap.md` and
`look-and-feel.md` (in the project root you gave Claude) for the full spec.

**Status: Phases 0–3 are complete** (scaffold & data architecture, design
system, landing page shell, leaderboard). Phases 4–6 are not yet built.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your Firebase project's config
npm run dev
```

Open http://localhost:3000 for the (placeholder) landing page, and
http://localhost:3000/design-preview for the Phase 1 style guide.

### Confirming Firestore is wired up

```bash
npm run seed:check
```

This writes a dummy document to a `_healthcheck` collection, reads it back,
and deletes it — confirms your `.env.local` values and Firestore security
rules allow client read/write. **You'll need your own Firebase project**
(Firestore enabled, in test mode or with rules that permit this) — I don't
have credentials to run this against a live project from here, so this is
the one Phase 0 deliverable you'll need to verify on your end.

### Seeing the leaderboard populated

Phase 4 (the actual Sprint) is what will normally write scores. Until
then:

```bash
npm run seed:scores
```

Writes a batch of realistic sample runs — some "Full Mix" (every category),
some single-category "By Topic" — so you can see both leaderboard views
actually populated. Safe to re-run; every run just adds more rows. The
**first time** you load the leaderboard or run this script, Firestore will
likely throw an error in the console with a direct link to create the
composite index it needs for `where(categoryIds ==) + orderBy(score)` —
click it, wait ~a minute for the index to build, and reload.

## What's here (Phase 0)

- `types/` — `Category`, `QuestionItem`, `ScoreEntry` and friends.
- `data/questions/derivatives.ts` — the three Derivatives categories
  (Trigonometric, Logarithmic & Exponential, Inverse Trigonometric), ported
  from the original `derivative_sprint.html`'s `FAMILIES` array.
- `data/subjects.ts` — the single registration point for subjects. **To add
  a new subject later (e.g. Integrals): create
  `data/questions/integrals.ts` in the same shape as `derivatives.ts`, then
  add it to the two arrays at the top of `subjects.ts`.** No component or
  page needs to change — this is exercised for real in Phase 6's
  extensibility test.
- `lib/firebase.ts` — Firestore client (no Firebase Auth).
- `lib/cookies.ts` — display-name cookie, no accounts.
- `lib/quiz-engine.ts` — pure, category-filterable question-queue builder
  (ported from the original `buildQueue()`), reused by both Sprint and
  Flashcards. Timer/scoring UI is Phase 4.
- `scripts/check-firestore.ts` — the read/write healthcheck above.

## What's here (Phase 1)

- `app/globals.css` — every design token from `look-and-feel.md` (colors,
  type, spacing, radii, shadows), implemented as CSS variables and mapped
  into Tailwind v4's `@theme`, so both work: `var(--color-navy)` and
  `bg-navy` / `text-navy` / `border-navy` utilities.
- `components/ui/` — `Card`, `Button`, `Tag`, `SectionLabel`, `Divider`,
  `MathText` (KaTeX-rendered math, server-rendered so it never flashes
  unstyled).
- `components/background/` — `SubtleArc`, `FaintGrid`, `TranslucentCircle`,
  the decorative low-opacity geometry.
- `app/design-preview/page.tsx` — the visual QA style guide showing every
  token and component together, including a live example of the answer-card
  grid from the reference mock.

### One judgment call worth flagging

The reference screenshot's mock uses a real institution's name and crest
("University of the Philippines Diliman"). I didn't reproduce that seal —
the design system ships with a generic placeholder in its place. If you
want your own institution's real branding, drop a logo file in `/public`
and wire it into the header component when we build Phase 2's hero, or
tell me the name/mark to use and I'll fold it in then.

## What's here (Phase 2)

- `app/page.tsx` — the real landing page, replacing the Phase 1 placeholder.
  Holds the only two pieces of state this phase needs: selected category
  ids (`Set<string>`) and the player's name — both local, no backend calls
  yet.
- `components/landing/Hero.tsx` — title, description, background geometry.
  Uses a generic `BrandMark` (two abstract arcs) instead of any real
  institution's name or crest, per your instruction — swap it out yourself
  if/when you want real branding.
- `components/category/CategoryCheckboxGroup.tsx` — the category checkbox
  UI, deliberately factored out as a controlled, subject-agnostic
  component. `components/landing/CategorySelector.tsx` wraps it for this
  page; **Phase 3 reuses this exact component** for the leaderboard's
  "By Topic" filter, per the roadmap.
- `components/landing/NameInput.tsx` — prefilled from the cookie on mount,
  writes back to the cookie on every keystroke.
- `components/landing/ModeButtons.tsx` — "Start Sprint" / "Start
  Flashcards", disabled until at least one category is checked. Currently
  `console.log`s the selected category ids instead of navigating anywhere —
  Phase 4/5 wire up the actual view-state swaps.
- `components/landing/LeaderboardPlaceholder.tsx` — static empty state;
  Phase 3 replaces its body with the live Firestore-backed list.

Section order on the page: Hero → Leaderboard placeholder → Category
selector + mode buttons + name input, all on one scrollable page (no
routing).

## What's here (Phase 3)

- `lib/leaderboard.ts` — `writeScore()` (the hook Phase 4's results screen
  will call — nothing in the app calls it yet since Sprint doesn't exist),
  and `subscribeToLeaderboard()`, a live Firestore query supporting both
  leaderboard models by exact `categoryIds` array match:
  - **Full Mix**: `categoryIds == getFullMixCategoryIds()` (every category
    currently available, sorted).
  - **By Topic**: `categoryIds ==` whatever exact set the checkboxes have
    selected.
  `filterByTimeframe()` applies the "This Week" cut client-side on top of
  a fetched window, sidestepping the need for a 3-field composite index
  on `(categoryIds, timestamp, score)`.
- `components/leaderboard/LeaderboardSection.tsx` — the live section:
  a `SegmentedControl` for Full Mix / By Topic, another for All-Time /
  This Week, and — when "By Topic" is active — the **same**
  `CategoryCheckboxGroup` from Phase 2's category selector, reused
  verbatim as the filter, per the roadmap.
- `components/leaderboard/LeaderboardTable.tsx` — ranked table (rank,
  name, score, streak, date), empty state, loading state, and an error
  state for when Firestore rejects the query (e.g. missing index).
- `scripts/seed-sample-scores.ts` — writes sample runs so the UI above is
  actually testable before Phase 4 exists (see "Seeing the leaderboard
  populated" above).
- No default has been picked between Full Mix and By Topic — both are
  implemented and switchable, per the roadmap's open decision.

## Fonts

Loaded via a Google Fonts `<link>` in `app/layout.tsx` (Source Serif 4 for
math/headings, Inter for UI) rather than `next/font/google`, so the app
doesn't depend on fetching fonts at build time in sandboxed environments —
functionally identical once running.

## Next steps

- **Phase 4** — the Sprint quiz engine's UI (attach the original
  `derivative_sprint.html` again as reference — already used for Phase 0's
  data porting), which will call `writeScore()` from `lib/leaderboard.ts`
  on run completion.
- **Phase 5** — Flashcard mode.
- **Phase 6** — extensibility test, accessibility pass, responsive QA,
  polish.
