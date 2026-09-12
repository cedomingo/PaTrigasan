/**
 * SFX helper for the sprint game.
 *
 * Each pitch level has its own pre-baked audio file (correct1–5.mp3).
 * Streak >= 5 → streak.mp3. Wrong answer → silence.
 */

const CORRECT_FILES = [
  "/correct1.mp3",
  "/correct2.mp3",
  "/correct3.mp3",
  "/correct4.mp3",
  "/correct5.mp3",
];
const STREAK_SRC = "/streak.mp3";

const MAX_PITCH = 5;

let pitchLevel = 0;

// Every clip is created and told to start loading once, up front, instead
// of via `new Audio()` at play time. A freshly-constructed <audio> element
// played for the very first time on a page is a known WebKit/iOS Safari
// footgun: it needs a beat to warm up its decode pipeline and can silently
// no-op on that first attempt even though every later play works fine —
// which is exactly the "no sound on the first correct answer" symptom.
// Pre-creating (and reusing) the elements avoids that cold start entirely.
let correctAudios: HTMLAudioElement[] | null = null;
let streakAudioEl: HTMLAudioElement | null = null;

function getPool(): { correct: HTMLAudioElement[]; streak: HTMLAudioElement } {
  if (!correctAudios) {
    correctAudios = CORRECT_FILES.map((src) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.load();
      return audio;
    });
  }
  if (!streakAudioEl) {
    streakAudioEl = new Audio(STREAK_SRC);
    streakAudioEl.preload = "auto";
    streakAudioEl.load();
  }
  return { correct: correctAudios, streak: streakAudioEl };
}

// Kick off preloading as soon as this module runs in the browser, well
// before the first correct answer can happen.
if (typeof Audio !== "undefined") {
  getPool();
}

/**
 * Call on every correct answer.
 *
 * @param answeredQuickly - true when the answer landed inside the "fast"
 *   window (< 2.5s). Fast answers advance the pitch by one level; slower
 *   correct answers hold at whatever pitch level was already reached and
 *   just replay that same sound.
 */
export function playCorrect(answeredQuickly: boolean): void {
  if (typeof Audio === "undefined") return;
  const { correct, streak } = getPool();

  if (answeredQuickly && pitchLevel < MAX_PITCH) {
    pitchLevel += 1;
  }

  if (pitchLevel >= MAX_PITCH) {
    fire(streak);
  } else {
    fire(correct[pitchLevel - 1] ?? correct[0]);
  }
}

/**
 * Reset pitch to 0 for the next streak. Call when a streak is lost, the run
 * is exited, or the game ends. Deliberately does NOT touch any sound that's
 * currently playing — a clip that already started always plays out to its
 * own natural end, never cut off by a later action (a wrong answer right
 * after a correct one, exiting, etc.).
 */
export function resetPitch(): void {
  pitchLevel = 0;
}

function fire(audio: HTMLAudioElement) {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}