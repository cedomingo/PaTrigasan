/**
 * Client-side cookie helpers for the player's display name.
 * No accounts, no server-side session — the name is just a display label,
 * reused across visits on the same browser. Leaderboard rows are keyed by the
 * device id in /lib/device.ts, not by this label.
 */

const NAME_COOKIE_KEY = "mathsprint_player_name";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Fallback identity for runs finished without a name typed in. */
export const DEFAULT_PLAYER_NAME = "Isko";

function isBrowser(): boolean {
  return typeof document !== "undefined";
}

export function getPlayerName(): string {
  if (!isBrowser()) return "";
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${NAME_COOKIE_KEY}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : "";
}

/**
 * The name a finished run is saved under: whatever was entered, or the
 * default when the field was left blank. Deliberately doesn't write the
 * default back to the cookie, so a real name entered later still wins.
 */
export function getPlayerNameOrDefault(): string {
  return getPlayerName().trim() || DEFAULT_PLAYER_NAME;
}

export function setPlayerName(name: string): void {
  if (!isBrowser()) return;
  const trimmed = name.trim();
  document.cookie = `${NAME_COOKIE_KEY}=${encodeURIComponent(
    trimmed
  )}; max-age=${ONE_YEAR_SECONDS}; path=/; SameSite=Lax`;
}
