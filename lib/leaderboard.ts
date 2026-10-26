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
  Timestamp,
  getDocs,
  deleteDoc,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db, SCORES_COLLECTION } from "./firebase";
import type { NewScoreEntry, ScoreEntry } from "@/types";
import { DEFAULT_PLAYER_NAME } from "./cookies";
import { isNameAllowed } from "./name-filter";

/** Category ids are stored sorted ascending, so the stored array is stable. */
export function sortCategoryIds(categoryIds: string[]): string[] {
  return [...categoryIds].sort();
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
 * where(leaderboardKey)`, no `orderBy`. Adding a sort on `score` would make
 * this a compound query that Firestore refuses to run without a dedicated
 * (deviceId, leaderboardKey, score) composite index, and since the caller
 * swallows write errors a missing index meant "every finished run silently
 * fails to save". Equality-only filters are served by Firestore's merged
 * single-field indexes, so saving works on a stock project; the best row is
 * picked here instead.
 */
export async function writeScore(entry: NewScoreEntry): Promise<void> {
  const sorted = sortCategoryIds(entry.categoryIds);
  const rows = await fetchDeviceRows(entry.deviceId, entry.leaderboardKey);
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
    leaderboardKey: entry.leaderboardKey,
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
 * The library site (/mathlib) keeps its own boards in the same collection by
 * prefixing the leaderboard key, so its scores never mix with the public
 * site's and no new collection or Firestore index is needed. Set this to ""
 * to make the two sites share their boards.
 */
const LIBRARY_BOARD_PREFIX = "lib:";

/** The stored leaderboard key for a board on the library site. */
export function libraryBoardKey(key: string): string {
  return `${LIBRARY_BOARD_PREFIX}${key}`;
}

/** Longest name the library board accepts. */
export const LIBRARY_NAME_MAX_LENGTH = 12;

/** A typed name as it is stored: trimmed, inner whitespace collapsed, capped. */
export function cleanLibraryName(name: string): string {
  return name.trim().replace(/\s+/g, " ").slice(0, LIBRARY_NAME_MAX_LENGTH);
}

/**
 * Saves one finished library run as its own leaderboard row.
 *
 * Nothing is merged or replaced: the public site's writeScore() keeps one best
 * row per *device*, which can't work on a shared library computer, and merging
 * by *name* would wrongly fold two different students with the same name into
 * one row. So every saved run is simply added. `entry.leaderboardKey` is the
 * plain key (subject id or "full-mix"); the library prefix is applied here.
 */
export async function writeLibraryScore(entry: NewScoreEntry): Promise<void> {
  await addDoc(collection(db, SCORES_COLLECTION), {
    deviceId: entry.deviceId,
    // Last line of defence: the results screen already blocks these, but the
    // write path must not trust it.
    name: isNameAllowed(entry.name)
      ? cleanLibraryName(entry.name)
      : DEFAULT_PLAYER_NAME,
    score: entry.score,
    correctCount: entry.correctCount,
    missedCount: entry.missedCount,
    bestStreak: entry.bestStreak,
    categoryIds: sortCategoryIds(entry.categoryIds),
    leaderboardKey: libraryBoardKey(entry.leaderboardKey),
    timestamp: serverTimestamp(),
  });
}

/**
 * The device's saved rows for one leaderboard, best score first. Same
 * equality-only shape as the write path below, so both are served by
 * Firestore's merged single-field indexes.
 */
async function fetchDeviceRows(deviceId: string, leaderboardKey: string) {
  const snapshot = await getDocs(
    query(
      collection(db, SCORES_COLLECTION),
      where("deviceId", "==", deviceId),
      where("leaderboardKey", "==", leaderboardKey)
    )
  );

  return [...snapshot.docs].sort(
    (a, b) => (b.data().score ?? 0) - (a.data().score ?? 0)
  );
}

/**
 * This device's best saved score for one leaderboard, or 0 when it has
 * none yet. SprintView reads this *before* a run starts so the results screen
 * can label a record run without racing the autosave write of that same run
 * (which would otherwise overwrite the previous best and make every score look
 * unremarkable).
 */
export async function getDeviceBestScore(
  deviceId: string,
  leaderboardKey: string
): Promise<number> {
  const rows = await fetchDeviceRows(deviceId, leaderboardKey);
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
      leaderboardKey: data.leaderboardKey ?? "",
      // serverTimestamp() resolves to null in the instant before the server
      // acks the write (local optimistic snapshot); fall back to "now" so
      // the row still sorts/displays sensibly until the real value arrives.
      timestamp: data.timestamp?.toMillis?.() ?? Date.now(),
    } satisfies ScoreEntry;
  });
}

/** Most rows read for one week's board. A week of library runs is far below this. */
const WEEK_WINDOW = 500;

/**
 * Live-subscribes to one leaderboard (a subject id, or "full-mix" — see
 * getLeaderboardKey() in /data/subjects.ts).
 *
 * All-time: the top `windowSize` scores, ordered by score on the server.
 *
 * This week: pass `sinceMs` (see getScheduleWeekStart in /lib/schedule.ts).
 * The week is cut on the server by `timestamp`, so a good run this week can
 * never be crowded out by older, higher scores. Firestore can't also order by
 * score once there is a range filter on `timestamp`, so the week's rows
 * (capped at WEEK_WINDOW) are sorted here instead.
 *
 * Composite indexes (see firestore.indexes.json):
 *   leaderboardKey ASC + score DESC       (all-time)
 *   leaderboardKey ASC + timestamp ASC    (this week)
 *
 * Returns an unsubscribe function — call it on cleanup / when the board changes.
 */
export function subscribeToLeaderboard(
  leaderboardKey: string,
  onData: (entries: ScoreEntry[]) => void,
  onError: (error: Error) => void,
  options: { sinceMs?: number; windowSize?: number } = {}
): () => void {
  const { sinceMs, windowSize = 100 } = options;
  const scores = collection(db, SCORES_COLLECTION);

  const q =
    sinceMs === undefined
      ? query(
          scores,
          where("leaderboardKey", "==", leaderboardKey),
          orderBy("score", "desc"),
          limit(windowSize)
        )
      : query(
          scores,
          where("leaderboardKey", "==", leaderboardKey),
          where("timestamp", ">=", Timestamp.fromMillis(sinceMs)),
          limit(WEEK_WINDOW)
        );

  return onSnapshot(
    q,
    (snapshot) => {
      const entries = snapshotToEntries(snapshot);
      if (sinceMs !== undefined) {
        entries.sort((a, b) => b.score - a.score);
      }
      onData(entries.slice(0, windowSize));
    },
    (error) => onError(error)
  );
}
