/**
 * Stable per-browser identity for leaderboard rows.
 *
 * Scores belong to the *device*, not to whatever name happens to be typed in
 * the field: a player who changes their name keeps a single row and simply
 * relabels it, instead of banking a second entry under the new name. See
 * `writeScore` in /lib/leaderboard.ts for how the id is used. The typed name
 * stays a mutable display label (see `getPlayerNameOrDefault` in cookies.ts).
 *
 * Stored in localStorage rather than a cookie: it's an opaque id, never sent
 * to the server, and it sits alongside the other client preferences. It's
 * generated lazily on first use with `crypto.randomUUID`, so no server round
 * trip and nothing to configure.
 */

import { useSyncExternalStore } from "react";

const DEVICE_ID_KEY = "mathsprint_device_id";

/** Cached for the tab's lifetime so the id is stable even if storage is later unavailable. */
let cachedDeviceId: string | null = null;

function createDeviceId(): string {
  // randomUUID needs a secure context; fall back to a random string elsewhere.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * This browser's leaderboard identity, creating and persisting one on first
 * call. If storage is blocked (private mode), it degrades to an id that lasts
 * for the session — saving still works, it just won't be recognised as the
 * same device after a reload.
 */
export function getDeviceId(): string {
  if (cachedDeviceId) return cachedDeviceId;

  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(DEVICE_ID_KEY);
      if (stored) {
        cachedDeviceId = stored;
        return stored;
      }
      const created = createDeviceId();
      window.localStorage.setItem(DEVICE_ID_KEY, created);
      cachedDeviceId = created;
      return created;
    } catch {
      // Storage unavailable — fall through to a session-only id.
    }
  }

  cachedDeviceId = createDeviceId();
  return cachedDeviceId;
}

/** The id never changes for a session, so there's nothing to subscribe to. */
function subscribeDeviceId(): () => void {
  return () => {};
}

/**
 * The device id for rendering decisions (marking your own leaderboard row,
 * finding it on the board). Empty during SSR and the hydration pass, so the
 * server and the first client render agree, then the real id once hydrated.
 * Use `getDeviceId()` directly in event handlers and write paths instead.
 */
export function useDeviceId(): string {
  return useSyncExternalStore(subscribeDeviceId, getDeviceId, () => "");
}
