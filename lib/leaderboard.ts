import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
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
 * Writes one completed run to Firestore. If a score already exists for
 * the same player name + category set, only the higher score is kept.
 * Called automatically when a sprint run ends.
 */
export async function writeScore(entry: NewScoreEntry): Promise<void> {
  const sorted = sortCategoryIds(entry.categoryIds);

  // Check for an existing score from the same player in the same category set.
  const existing = query(
    collection(db, SCORES_COLLECTION),
    where("name", "==", entry.name),
    where("categoryIds", "==", sorted),
    orderBy("score", "desc"),
    limit(1)
  );
  const snapshot = await getDocs(existing);

  if (!snapshot.empty) {
    const best = snapshot.docs[0];
    const bestScore = best.data().score ?? 0;
    if (entry.score > bestScore) {
      // New high score — delete the old one and write the new.
      await deleteDoc(doc(db, SCORES_COLLECTION, best.id));
    } else {
      // Existing score is already higher or equal — do nothing.
      return;
    }
  }

  await addDoc(collection(db, SCORES_COLLECTION), {
    name: entry.name,
    score: entry.score,
    correctCount: entry.correctCount,
    missedCount: entry.missedCount,
    bestStreak: entry.bestStreak,
    categoryIds: sorted,
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
