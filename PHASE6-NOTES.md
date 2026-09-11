# Phase 6 — Extensibility Pass & Polish

Notes on what changed and what was checked, for the record.

## 1. Extensibility test

Added `/data/questions/integrals.ts`: two categories ("Power & Exponential",
"Trigonometric") under a new "Integrals" subject, five items each. Registered
with one two-line addition to `/data/subjects.ts` (import + push into the
existing `categoryModules` / `questionBankModules` arrays).

Verified with no other file touched:
- `getAllSubjects()` returns Integrals as a second group.
- `getAllCategoryIdsSorted()` (the "Full Mix" leaderboard set) includes both
  new category ids.
- `buildQuestionQueue()` produces full 4-option (A–D) questions for both new
  categories.
- `getFlashcardItems()` returns the new items for Flashcard mode.
- Category selector, Sprint, Flashcards, and leaderboard "By Topic" filter
  all pick it up automatically (they iterate `getAllSubjects()` /
  `getAllCategories()`, never a hardcoded list).

This is a stub, not a real content pass — five basic rules per category.
Keep it as a working example, or delete this file and its one registration
line in `subjects.ts` to remove it; nothing else depends on it.

## 2. Accessibility pass

- **Color contrast:** `--color-correct` was 4.54:1 against white (a hair over
  the 4.5:1 AA minimum for normal text). Deepened to `#23744a` → 5.72:1 for a
  safer margin. All other text/background pairs in the palette were checked
  and pass AA comfortably (navy on white 11.5:1, text-muted on bg 4.55–4.76:1,
  wrong-red on white 5.47:1).
- **Never color-only:** Sprint's correct/wrong reveal now also shows a ✓/✗
  glyph and, for screen readers, replaces the option's accessible name with
  "Option A, correct answer" / "…, your answer, incorrect" — but only once
  revealed, so an unanswered question still exposes its real math content
  (via KaTeX's own MathML) rather than a generic label.
- **Live regions, used sparingly:** the per-question countdown bar is now a
  `role="progressbar"` with `aria-valuenow` (queryable on demand, not
  spammy); the per-question outcome message ("Correct.", "Streak × 3",
  "Time's up — keep going.") is `role="status" aria-live="polite"` so a
  screen-reader user gets that feedback without the 40ms/100ms tick timers
  ever being announced.
- **Keyboard:** `SegmentedControl` now follows the ARIA tabs keyboard model
  (roving tabindex, Left/Right or Up/Down to move between options) instead
  of leaving every option separately tab-stoppable, and both instances have
  a distinguishing `aria-label` ("Leaderboard view" / "Leaderboard
  timeframe"). Flashcards gained Left/Right arrow-key navigation matching
  the on-screen Previous/Next buttons (guarded against text inputs, though
  this view has none). All buttons/checkboxes were already native elements,
  so Tab/Space/Enter worked correctly before this pass — this just closes
  the two custom-widget gaps.
- **Disabled-state context:** the disabled "Start Sprint"/"Start Flashcards"
  buttons now `aria-describedby` the "Pick at least one category…" hint, so
  the reason isn't only conveyed visually.
- **Tap targets:** the small "‹ Exit sprint/flashcards" links get extra
  padding via negative margin (no visible layout change, larger hit area) —
  the previous version was comfortably clickable with a mouse but tight for
  a thumb.
- **Table semantics:** the leaderboard `<table>` got a `sr-only` caption
  describing sort order.
- Focus-visible outline (global, all interactive elements), `lang="en"`,
  landmark structure (`<main>`, `<section>`, `<fieldset>`/`<legend>` for
  category groups), and decorative-SVG `aria-hidden` were all already in
  place from earlier phases and didn't need changes.

## 3. Responsive check

Reviewed landing, Sprint, and Flashcards at mobile/tablet/desktop widths.
Most of this was already solid from Phases 1–5 (answer grid collapses to one
column below `sm`, leaderboard hides the Streak/Date columns on small
screens, category grid goes to one column, button rows wrap). No structural
changes were needed; the only responsive-adjacent fix was the tap-target
padding noted above.

## 4. Micro-interaction polish

- Added a small, reduced-motion-safe fade/rise (`.animate-view-enter`, 220ms)
  applied to the landing/Sprint/Flashcards `<main>` on each view-state swap.
  It's neutralized by the existing global `prefers-reduced-motion` rule.
- Interactive cards (the flashcard) and default-state answer options now
  lift with `--shadow-card-hover` on hover, in addition to the existing
  border/background color shift — still a plain, subtle transition, no
  transform/scale theatrics.

## 5. Final QA pass

- Typography: serif reserved for headings/math (via `h1`–`h3` and
  `MathText`), sans for all UI chrome — confirmed consistent everywhere,
  no regressions introduced.
- Spacing/borders/shadows: all touched components reused the existing design
  tokens (`--shadow-card`, `--shadow-card-hover`, existing color variables);
  nothing new was hand-rolled.
- No confetti, neon, or other leftover ed-tech artifacts anywhere in the
  codebase (this was already true going into Phase 6 — see the comment in
  `SprintView.tsx`).
- `npx tsc --noEmit`, `npx eslint .`, and `npx next build` all pass clean
  with these changes.

## Open item (unchanged from the roadmap)

Full Mix vs. By Topic as the leaderboard default is still an open decision —
Phase 6 didn't touch that, per the roadmap.
