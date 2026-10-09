/**
 * Firestore document shape for the `scores` collection.
 *
 * Only runs covering a whole subject, or every category ("Full Mix"), are
 * saved. `leaderboardKey` names the board (subject id or "full-mix") and is
 * what the leaderboard queries on; `categoryIds` is the exact sorted set
 * played, kept alongside it.
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
  /** Exact set of category ids played, sorted ascending. Kept for reference; boards are queried by `leaderboardKey`. */
  categoryIds: string[];
  /**
   * Which leaderboard the run belongs to: a subject id (every category of
   * that subject) or "full-mix" (every category). See getLeaderboardKey() in
   * /data/subjects.ts. Rows written before this field existed read back as "".
   */
  leaderboardKey: string;
  /** Firestore server timestamp (ms since epoch once read back client-side). */
  timestamp: number;
}

/** Shape used when writing a new score, before Firestore assigns an id/timestamp. */
export type NewScoreEntry = Omit<ScoreEntry, "id" | "timestamp">;
