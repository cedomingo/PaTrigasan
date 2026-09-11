import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db, SCORES_COLLECTION } from "./firebase";
import { getAllCategoryIdsSorted } from "@/data";
import type { NewScoreEntry, ScoreEntry } from "@/types";

/**
 * Category ids are always stored sorted ascending, so `where("categoryIds",
 * "==", sortedIds)` is a reliable exact-set match — both for "this exact
 * per-topic combination" and for "every category currently available"
 * (the "full mix" view).
 */
export function sortCategoryIds(categoryIds: string[]): string[] {
  return [...categoryIds].sort();
}

/** The category-id set that counts as a "Full Mix" run — every category currently available. */
export function getFullMixCategoryIds(): string[] {
  return getAllCategoryIdsSorted();
}

/**
 * Writes one completed run to Firestore. This is the hook point Phase 4's
 * Sprint results screen calls after a run ends — Sprint itself doesn't
 * exist yet, so nothing calls this in the app today (see
 * `scripts/seed-sample-scores.ts` for a way to populate test data and QA
 * this UI in the meantime).
 */
export async function writeScore(entry: NewScoreEntry): Promise<void> {
  await addDoc(collection(db, SCORES_COLLECTION), {
    name: entry.name,
    score: entry.score,
    correctCount: entry.correctCount,
    missedCount: entry.missedCount,
    bestStreak: entry.bestStreak,
    categoryIds: sortCategoryIds(entry.categoryIds),
    timestamp: serverTimestamp(),
  });
}

function snapshotToEntries(snapshot: QuerySnapshot<DocumentData>): ScoreEntry[] {
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name ?? "Anonymous",
      score: data.score ?? 0,
      correctCount: data.correctCount ?? 0,
      missedCount: data.missedCount ?? 0,
      bestStreak: data.bestStreak ?? 0,
      categoryIds: data.categoryIds ?? [],
      // serverTimestamp() resolves to null in the instant before the server
      // acks the write (local optimistic snapshot); fall back to "now" so
      // the row still sorts/displays sensibly until the real value arrives.
      timestamp: data.timestamp?.toMillis?.() ?? Date.now(),
    } satisfies ScoreEntry;
  });
}

/**
 * Live-subscribes to the leaderboard for an exact category-id set (pass
 * `getFullMixCategoryIds()` for the "Full Mix" view, or whatever the
 * "By Topic" checkboxes currently have selected). Fetches a generous
 * window (default 100) ordered by score descending so the "This Week"
 * toggle can filter client-side without needing a composite Firestore
 * index on (categoryIds, timestamp, score) — see README for the index
 * Firestore *will* ask you to create for (categoryIds, score).
 *
 * Returns an unsubscribe function — call it on cleanup / when the filter
 * changes.
 */
export function subscribeToLeaderboard(
  categoryIds: string[],
  onData: (entries: ScoreEntry[]) => void,
  onError: (error: Error) => void,
  windowSize = 100
): () => void {
  const q = query(
    collection(db, SCORES_COLLECTION),
    where("categoryIds", "==", sortCategoryIds(categoryIds)),
    orderBy("score", "desc"),
    limit(windowSize)
  );

  return onSnapshot(
    q,
    (snapshot) => onData(snapshotToEntries(snapshot)),
    (error) => onError(error)
  );
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Client-side filter for the "This Week" toggle, applied after the live query above. */
export function filterByTimeframe(
  entries: ScoreEntry[],
  timeframe: "all-time" | "this-week"
): ScoreEntry[] {
  if (timeframe === "all-time") return entries;
  const cutoff = Date.now() - ONE_WEEK_MS;
  return entries.filter((e) => e.timestamp >= cutoff);
}
