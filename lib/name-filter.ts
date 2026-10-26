/**
 * Name screening for the leaderboard (shown on a screen in the library).
 *
 * No word list is perfect, so this is a first line, not a guarantee: it folds
 * common disguises (spacing, punctuation, number/symbol swaps, repeated
 * letters) before matching, and keeps the rules deliberately narrow to avoid
 * rejecting innocent names. Anything that still gets through is a job for
 * whoever moderates the board (delete the row in the Firebase console).
 *
 * Add words in lowercase, plain letters only.
 */

/**
 * Matched anywhere inside the letters of the name. Only list words that don't
 * occur inside ordinary names or words — test any addition against real names
 * (e.g. "puta" would flag "computation", "titi" would flag "Letitia").
 */
const BLOCKED_SUBSTRINGS: readonly string[] = [
  "fuck", "shit", "bitch", "bastard", "asshole", "nigga", "nigger", "faggot",
  "putang", "tangina", "tarantado", "pakyu", "pakshet", "kantot", "jakol",
];

/** Matched only as a whole word of the name: short words that also live inside innocent ones. */
const BLOCKED_WHOLE_WORDS: readonly string[] = [
  "ass", "dick", "cock", "cum", "sex", "porn", "puta", "gago", "ulol", "bobo", "tanga", "puki", "pwet", "burat", "titi",
];

const LOOKALIKES: Record<string, string> = {
  "0": "o", "1": "i", "!": "i", "|": "i", "3": "e", "4": "a", "@": "a",
  "5": "s", "$": "s", "7": "t", "+": "t", "8": "b",
};

function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[0-9!|@$+]/g, (c) => LOOKALIKES[c] ?? c);
}

export function isNameAllowed(name: string): boolean {
  const folded = fold(name);

  // Whole words: the folded text split at anything that isn't a letter.
  const words = folded.split(/[^a-z]+/).filter(Boolean);
  if (words.some((w) => BLOCKED_WHOLE_WORDS.includes(w))) return false;

  // Substrings, on the letters only — catches "f u c k" and "s.h.i.t".
  const letters = folded.replace(/[^a-z]/g, "");
  return !BLOCKED_SUBSTRINGS.some((bad) => letters.includes(bad));
}
