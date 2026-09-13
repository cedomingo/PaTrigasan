/**
 * Client-side UI preferences — kept in localStorage alongside the device id
 * (device.ts), while the player's display name lives in a cookie (cookies.ts).
 *
 * Exposed as a tiny external store for `useSyncExternalStore`, so components
 * can read the stored value during render: a mount effect that calls
 * setState would cascade an extra render, and a lazy useState initializer
 * would read localStorage during SSR / the first hydration pass and
 * mismatch. `getAutosaveScoreServerSnapshot` is what SSR uses.
 */

import { useSyncExternalStore } from "react";

const AUTOSAVE_SCORE_KEY = "mathsprint_autosave_score";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readStoredAutosaveScore(): boolean {
  try {
    return window.localStorage.getItem(AUTOSAVE_SCORE_KEY) === "true";
  } catch {
    return false;
  }
}

/** Undefined until the first client read, so storage is never touched during SSR. */
let autosaveScore: boolean | undefined;
const listeners = new Set<() => void>();

/** Autosave is opt-in: false when nothing has been stored yet. */
export function getAutosaveScoreSnapshot(): boolean {
  if (autosaveScore === undefined) {
    autosaveScore = isBrowser() ? readStoredAutosaveScore() : false;
  }
  return autosaveScore;
}

/** SSR and the hydration pass both start from the unchecked default. */
export function getAutosaveScoreServerSnapshot(): boolean {
  return false;
}

export function subscribeAutosaveScore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setAutosaveScorePreference(enabled: boolean): void {
  autosaveScore = enabled;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(AUTOSAVE_SCORE_KEY, enabled ? "true" : "false");
    } catch {
      // Storage can throw when disabled or in private mode — the choice just
      // won't survive a reload, which is an acceptable degradation.
    }
  }
  for (const listener of listeners) listener();
}

/**
 * Reactive read of the autosave setting. Every subscribed component re-renders
 * when it's toggled, which is what lets SprintResults save a just-finished run
 * the moment the player turns autosave on from the results screen.
 */
export function useAutosaveScore(): boolean {
  return useSyncExternalStore(
    subscribeAutosaveScore,
    getAutosaveScoreSnapshot,
    getAutosaveScoreServerSnapshot
  );
}
