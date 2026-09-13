/**
 * Firestore document shape for the `scores` collection.
 *
 * `categoryIds` always stores the *exact* set of categories played for that
 * run (sorted, for stable equality checks), so the leaderboard can support
 * both:
 *   1. An "all categories" combined leaderboard — query where categoryIds
 *      equals the full sorted list of every currently available category id.
 *   2. Per-category filtered leaderboards — query where categoryIds
 *      equals the sorted list the player filtered by (using the same
 *      checkbox UI as category selection).
 *
 * See /lib/leaderboard.ts for the query helpers that use this.
 */
export interface ScoreEntry {
  /** Firestore document id, present once read back from the DB. */
  id?: string;
  /**
   * Stable per-browser id (see /lib/device.ts) — the identity a row actually
   * belongs to. One device holds at most one row per category set, so changing
   * the display name relabels that row instead of adding a new one. Rows
   * written before devices were tracked read back as `""`.
   */
  deviceId: string;
  /** Display name label, from the name cookie at time of play. Mutable. */
  name: string;
  /** Final score for the run. */
  score: number;
  /** Number of questions answered correctly. */
  correctCount: number;
  /** Number of questions missed (wrong or timed out). */
  missedCount: number;
  /** Longest correct-answer streak achieved during the run. */
  bestStreak: number;
  /** Exact set of category ids played, sorted ascending for stable equality queries. */
  categoryIds: string[];
  /** Firestore server timestamp (ms since epoch once read back client-side). */
  timestamp: number;
}

/** Shape used when writing a new score, before Firestore assigns an id/timestamp. */
export type NewScoreEntry = Omit<ScoreEntry, "id" | "timestamp">;
