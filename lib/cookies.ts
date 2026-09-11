/**
 * Client-side cookie helpers for the player's display name.
 * No accounts, no server-side session — identity is just this cookie,
 * reused across visits on the same browser.
 */

const NAME_COOKIE_KEY = "mathsprint_player_name";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

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

export function setPlayerName(name: string): void {
  if (!isBrowser()) return;
  const trimmed = name.trim();
  document.cookie = `${NAME_COOKIE_KEY}=${encodeURIComponent(
    trimmed
  )}; max-age=${ONE_YEAR_SECONDS}; path=/; SameSite=Lax`;
}
