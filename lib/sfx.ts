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

let streakAudio: HTMLAudioElement | null = null;

function getStreak(): HTMLAudioElement {
  if (!streakAudio) streakAudio = new Audio(STREAK_SRC);
  return streakAudio;
}

/**
 * Call on every correct answer. Advances pitch and plays the
 * corresponding correctN.mp3 file.
 */
export function playCorrect(): void {
  if (typeof Audio === "undefined") return;

  if (pitchLevel < MAX_PITCH) {
    pitchLevel += 1;
  }

  if (pitchLevel >= MAX_PITCH) {
    fire(getStreak());
  } else {
    const src = CORRECT_FILES[pitchLevel - 1] ?? CORRECT_FILES[0];
    fire(new Audio(src));
  }
}

/** Reset pitch to 0 — call when streak is lost. */
export function resetPitch(): void {
  pitchLevel = 0;
}

function fire(audio: HTMLAudioElement) {
  audio.play().catch(() => {});
}
