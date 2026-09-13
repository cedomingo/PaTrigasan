import {
  collection,
  addDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  getDocs,
  deleteDoc,
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
 * Writes one completed run to Firestore, keeping only the higher score for
 * the *device* (see /lib/device.ts) + category set. Called when a sprint run
 * ends and autosave is on (see SprintResults).
 *
 * Identity is the device, not the name: a player who changes the name field
 * and then beats their high score simply relabels their existing row, rather
 * than banking a second entry under the new name. A run that doesn't beat the
 * saved score is a no-op — nothing is written, so the stored name stays put.
 *
 * The lookup is deliberately equality-only — `where(deviceId) +
 * where(categoryIds)`, no `orderBy`. Adding a sort on `score` would make
 * this a compound query that Firestore refuses to run without a dedicated
 * (deviceId, categoryIds, score) composite index, and since the caller
 * swallows write errors a missing index meant "every finished run silently
 * fails to save". Equality-only filters are served by Firestore's merged
 * single-field indexes, so saving works on a stock project; the best row is
 * picked here instead.
 */
export async function writeScore(entry: NewScoreEntry): Promise<void> {
  const sorted = sortCategoryIds(entry.categoryIds);
  const rows = await fetchDeviceRows(entry.deviceId, sorted);
  const best = rows[0];

  // Already-saved score is higher (or equal) — keep it, write nothing. The
  // stored name is deliberately left alone in this case: a lower run under a
  // new name shouldn't relabel a high score it didn't beat.
  if (best && (best.data().score ?? 0) >= entry.score) return;

  const payload = {
    deviceId: entry.deviceId,
    name: entry.name,
    score: entry.score,
    correctCount: entry.correctCount,
    missedCount: entry.missedCount,
    bestStreak: entry.bestStreak,
    categoryIds: sorted,
    timestamp: serverTimestamp(),
  };

  if (!best) {
    await addDoc(collection(db, SCORES_COLLECTION), payload);
    return;
  }

  // New high score — rewrite the kept row in place (taking the new name with
  // it) rather than delete + add, so the player's entry never briefly
  // vanishes and a failed add can't lose the old score. Any extra rows for
  // the same device + set are the old/lower saves, so they go.
  await setDoc(best.ref, payload);
  await Promise.all(rows.slice(1).map((row) => deleteDoc(row.ref)));
}

/**
 * The device's saved rows for an exact category set, best score first. Same
 * equality-only shape as the write path below, so both are served by
 * Firestore's merged single-field indexes.
 */
async function fetchDeviceRows(deviceId: string, sortedCategoryIds: string[]) {
  const snapshot = await getDocs(
    query(
      collection(db, SCORES_COLLECTION),
      where("deviceId", "==", deviceId),
      where("categoryIds", "==", sortedCategoryIds)
    )
  );

  return [...snapshot.docs].sort(
    (a, b) => (b.data().score ?? 0) - (a.data().score ?? 0)
  );
}

/**
 * This device's best saved score for an exact category set, or 0 when it has
 * none yet. SprintView reads this *before* a run starts so the results screen
 * can label a record run without racing the autosave write of that same run
 * (which would otherwise overwrite the previous best and make every score look
 * unremarkable).
 */
export async function getDeviceBestScore(
  deviceId: string,
  categoryIds: string[]
): Promise<number> {
  const rows = await fetchDeviceRows(deviceId, sortCategoryIds(categoryIds));
  return rows[0]?.data().score ?? 0;
}

function snapshotToEntries(snapshot: QuerySnapshot<DocumentData>): ScoreEntry[] {
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name ?? "Anonymous",
      deviceId: data.deviceId ?? "",
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
