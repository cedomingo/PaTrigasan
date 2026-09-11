# Math Sprint

A single-page academic math practice platform: a timed "Sprint" quiz and an
untimed "Flashcard" study mode, built with Next.js (App Router) + TypeScript
and Firestore for anonymous score storage.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your Firebase project's config
npm run dev
```

Open http://localhost:3000 for the landing page, and
http://localhost:3000/design-preview for the style guide.

### Confirming Firestore is wired up

```bash
npm run seed:check
```

This writes a dummy document to a `_healthcheck` collection, reads it back,
and deletes it — confirms your `.env.local` values and Firestore security
rules allow client read/write.

### Seeing the leaderboard populated

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

## Architecture

- `app/page.tsx` — single-page app with view-state swaps (`landing` |
  `sprint` | `flashcards`), no route changes.
- `app/globals.css` — design tokens from `look-and-feel.md` (colors, type,
  spacing, radii, shadows) as CSS variables mapped into Tailwind v4's
  `@theme`.
- `app/layout.tsx` — root layout with Google Fonts (Source Serif 4, Inter).

### Components

- `components/ui/` — `Card`, `Button`, `Tag`, `SectionLabel`, `Divider`,
  `MathText` (KaTeX-rendered math), `SegmentedControl`.
- `components/background/` — `SubtleArc`, `FaintGrid`, `TranslucentCircle`
  decorative geometry.
- `components/landing/` — `IntroOverlay` (splash screen with loading bar),
  `Hero`, `CategorySelector`, `ModeButtons`, `NameInput`, `BrandMark`.
- `components/sprint/` — `SprintView` (60s timer, 5s/question, scoring),
  `SprintHUD`, `AnswerOption`, `SprintResults`.
- `components/flashcards/` — `FlashcardView` (shuffled deck, flip/slide
  animations), `FlashcardCard`.
- `components/leaderboard/` — `LeaderboardSection` (Full Mix / By Topic +
  All-Time / This Week filters), `LeaderboardTable`.
- `components/category/` — `CategoryCheckboxGroup` (reused by landing page
  and leaderboard filter).

### Data & Lib

- `data/subjects.ts` — single registration point for subjects. To add a
  new subject: create `data/questions/<subject>.ts` in the same shape as
  `derivatives.ts`, then add it to `subjects.ts`. No component changes
  needed.
- `data/questions/` — question banks (`derivatives.ts`, `integrals.ts`).
- `lib/firebase.ts` — Firestore client (no Firebase Auth).
- `lib/cookies.ts` — display-name cookie, no accounts.
- `lib/quiz-engine.ts` — question-queue builder, reused by Sprint and
  Flashcards.
- `lib/leaderboard.ts` — `writeScore()`, `subscribeToLeaderboard()`,
  `filterByTimeframe()`.

### Scripts

- `scripts/check-firestore.ts` — Firestore read/write healthcheck.
- `scripts/seed-sample-scores.ts` — populates sample leaderboard data.

## Features

- **Sprint mode** — 60-second timed quiz, 5 seconds per question, scoring
  with streak bonuses, keyboard shortcuts (A/B/C/D).
- **Flashcard mode** — untimed study with 3D flip animations, slide
  transitions between cards, Previous/Next/Shuffle navigation.
- **Leaderboard** — live Firestore-backed with Full Mix / By Topic views
  and All-Time / This Week filters.
- **Intro overlay** — splash screen with title card and loading bar on
  initial load.
- **Accessibility** — visible focus indicators, `aria-live` status
  announcements, color+glyph answer reveals.
- **Responsive** — mobile-first with `sm:` breakpoints.
