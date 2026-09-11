/**
 * A "subject" is the top-level grouping shown in the UI (e.g. "Derivatives",
 * later "Integrals"). A "category" is one selectable checkbox within a
 * subject (e.g. "Trigonometric"). Categories are the unit that:
 *   - gets checked/unchecked on the landing page
 *   - filters the question queue for Sprint/Flashcards
 *   - is stored (as an id) on every ScoreEntry for leaderboard filtering
 *
 * Adding a new subject later should never require touching this type —
 * only adding new data files under /data that conform to it.
 */
export interface Category {
  /** Stable, URL/Firestore-safe id, e.g. "derivatives-trig". Never rename once used, or historical scores become unfilterable. */
  id: string;
  /** Display label, e.g. "Trigonometric". */
  label: string;
  /** The subject group this category belongs to, e.g. "Derivatives". */
  subject: string;
  /** Stable id for the subject group, e.g. "derivatives". Used for grouping in the UI. */
  subjectId: string;
}

/** A subject is derived from categories at load time — never hand-maintained separately. */
export interface Subject {
  id: string;
  name: string;
  categories: Category[];
}
