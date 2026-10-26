# Math Sprint (PaTrigasan)

A single-page math practice app. Students answer timed quiz questions (Sprint)
or study untimed flashcards (Practice), and their scores appear on a live
leaderboard. Built with Next.js (App Router), TypeScript, Tailwind CSS v4 and
Firestore. Scores are stored anonymously: there are no accounts and no
Firebase Auth.

The app runs in two places:

- **Public app** at `/`: the full experience for anyone with the link.
- **Library kiosk** at `/mathlib`: a version for the school library's
  computers. It is not linked from the public site and is excluded from search
  results. It shows a Monday–Friday topic schedule, screens player names, and
  resets to the start screen after 30 seconds of inactivity on the results
  screen.

## Getting started

Requirements: Node.js 20 or newer, and a Firebase project with Firestore
enabled.

```bash
npm install
```

Create `.env.local` in the project root (this repository does not include a
`.env.local.example` file) with your Firebase web app's config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Then start the dev server:

```bash
npm run dev
```

Open http://localhost:3000 for the public app, http://localhost:3000/mathlib
for the library kiosk, and http://localhost:3000/design-preview for the style
guide.

Other scripts:

- `npm run build` and `npm run start`: production build and server.
- `npm run lint`: ESLint.
- `npm test`: runs the unit tests in `lib/` (see the note under Known issues).

### Checking the Firestore connection

```bash
npm run seed:check
```

Writes a dummy document to a `_healthcheck` collection, reads it back, and
deletes it. This confirms your `.env.local` values and Firestore security rules
allow client reads and writes.

### Filling the leaderboard with sample data

```bash
npm run seed:scores
```

Adds sample runs, some on Full Mix and some on single topics, so both
leaderboard views have data. Safe to re-run. The first time you load the
leaderboard, Firestore may log an error with a link to create a composite index.
Click the link, wait about a minute for the index to build, and reload. The
index definitions are in `firestore.indexes.json`.

## How the app works

### Modes

- **Start Sprint** (landing page). Choose one or more topics. A live preview
  shows the first question. A correct answer scores it and starts the timed run
  from the next question. A wrong answer shows feedback and can be retried with
  no penalty.
- **Sprint**: 60 seconds in total, with 5 seconds per question. Scoring is 10
  points per correct answer, plus 2 points for each streak step up to 5 steps
  (so a streak adds at most 10). Keys A–D select answers. A wrong answer or a
  timeout breaks the streak.
- **Practice** (flashcards): untimed study with 3D flip animations, slide
  transitions, and Previous, Next and Shuffle controls. A summary overlay shows
  the formulas for the selected topics.

### Topics

Topics are grouped into subjects. Each subject has categories:

| Subject | Categories |
| --- | --- |
| Unit Circle | Trigonometric; Inverse Trigonometric |
| Domain & Range | Trigonometric; Logarithmic & Exponential; Inverse Trigonometric; Hyperbolic; Inverse Hyperbolic |
| Derivatives | Trigonometric; Logarithmic & Exponential; Inverse Trigonometric; Hyperbolic; Inverse Hyperbolic |
| Integrals | Power & Exponential; Trigonometric; Inverse Trigonometric; Hyperbolic |

Each subject is registered in `data/subjects.ts`. Question banks live in
`data/questions/`.

### Leaderboard

- **Views:** Full Mix ranks runs across every category. By Topic ranks runs on
  one exact set of selected topics.
- **Timeframes:** All-Time or This Week.
- **Identity:** scores belong to the browser, not the name. Each browser has a
  stable id (`lib/device.ts`), so changing your name relabels your row instead
  of adding a second one.
- **Names:** a display name is saved in a cookie. There are no accounts.

### Library kiosk (`/mathlib`)

- **Weekly schedule:** the five boards (Unit Circle, Domain & Range, Derivatives,
  Integrals, Full Mix) are assigned one per weekday, Monday to Friday. The
  assignment is calculated from the week's date in Asia/Manila time, so every
  computer shows the same schedule, and nothing is stored on a server.
  Configured in `lib/schedule.ts`.
- **Player names:** no name field on the page. Players enter a name of up to 12
  characters when they save a run.
- **Name screening:** `lib/name-filter.ts` blocks a list of offensive words,
  including common disguises such as spacing and number swaps. It is a first
  filter, not a guarantee. Moderators can delete rows in the Firebase console.
- **No autosave:** a finished run is saved only when the player chooses to save
  it.
- **Idle reset:** the results screen returns to the start screen after 30
  seconds with no input.

### Other features

- Intro splash screen with a loading bar on first load.
- Sound effects for correct answers, with a special sound for streaks of five or
  more. Wrong answers are silent.
- Fullscreen button for the Sprint.
- Accessibility: visible focus outlines, `aria-live` status announcements, and
  answers marked with both color and a symbol.
- Responsive layout, mobile first.

## Project layout

```
app/                  Routes: / (public app), /mathlib (library kiosk),
                      /design-preview (style guide). globals.css holds the
                      design tokens, mapped into Tailwind v4's @theme.
components/
  MathSprintApp.tsx   Top-level app; "default" and "library" variants
  ui/                 Card, Button, Tag, SectionLabel, Divider, MathText
                      (KaTeX), SegmentedControl
  background/         Decorative geometry
  landing/            IntroOverlay, Hero, NameInput, ModeTabBar, WeekStrip
  sprint/             SprintView, SprintPreview, QuestionTimerBar, SprintHUD,
                      AnswerOption, SprintResults, LibrarySprintResults
  flashcards/         FlashcardStack, FlashcardCard, SummaryOverlay
  leaderboard/        LeaderboardSection, LeaderboardTable
  category/           CategoryCheckboxGroup (used by the landing page and the
                      leaderboard filter)
data/
  subjects.ts         Subject registry
  questions/          One question bank per subject
lib/
  quiz-engine.ts      Builds question queues for Sprint and Practice
  leaderboard.ts      writeScore, writeLibraryScore, subscribeToLeaderboard,
                      getDeviceBestScore
  device.ts           Stable per-browser id
  cookies.ts          Display-name cookie
  preferences.ts      Client UI preferences (localStorage)
  schedule.ts         Library weekly topic schedule (Asia/Manila)
  name-filter.ts      Name screening for the library kiosk
  summary.ts          Formula-sheet data for the Practice summary
  sfx.ts              Sound effects
  firebase.ts         Firestore client
scripts/
  check-firestore.ts  Connection healthcheck
  seed-sample-scores.ts  Sample leaderboard data
public/               Logo, sound effects
```

## Adding a subject

1. Create `data/questions/<subject>.ts` with the same shape as
   `derivatives.ts`: a subject id and name, a list of categories, and a question
   bank per category.
2. Register it in `data/subjects.ts`. No component changes are needed.

The library schedule uses exactly five boards. Adding a subject means choosing
which board it replaces in `SCHEDULE_TOPICS` in `lib/schedule.ts`.