"use client";

/**
 * Which part of the leaderboard the fixed five-row window is parked on.
 * "top" is the default — rank #1 — and "me" jumps to the player's own row.
 */
export type LeaderboardFocus = "top" | "me";

interface LeaderboardFocusToggleProps {
  focus: LeaderboardFocus;
  onToggle: () => void;
}

/**
 * Square icon button that switches the leaderboard between the top of the
 * board (triangle) and the player's own row (circle, drawn as a locate marker
 * so "you are here" reads at a glance). It's a two-state toggle, so every
 * click both moves the window and flips the icon.
 *
 * Both icons are stacked in the same square and cross-fade between states —
 * the outgoing one shrinks and rotates slightly out, the incoming one grows
 * in — so the swap is visible without the button ever resizing. Hover is the
 * same quiet colour shift the rest of the system uses; the global
 * prefers-reduced-motion rule in globals.css neutralises the transitions.
 */
export default function LeaderboardFocusToggle({
  focus,
  onToggle,
}: LeaderboardFocusToggleProps) {
  const showingTop = focus === "top";
  const iconBase =
    "absolute h-3.5 w-3.5 transition-[opacity,transform] duration-200 ease-out";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={showingTop ? "Show my score on the leaderboard" : "Show the top score"}
      title={showingTop ? "Find my score" : "Back to the top"}
      className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-border bg-white text-text-muted transition-colors duration-150 hover:border-blue-medium hover:bg-blue-faint hover:text-navy active:bg-blue-soft"
    >
      <TriangleIcon
        className={`${iconBase} ${
          showingTop
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-50 opacity-0"
        }`}
      />
      <LocateIcon
        className={`${iconBase} ${
          showingTop
            ? "rotate-90 scale-50 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
      />
    </button>
  );
}

function TriangleIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className}>
      <path
        d="M8 3.2 13.2 12.6H2.8L8 3.2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A ring with a centre dot — the standard "locate me" mark. */
function LocateIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className}>
      <circle
        cx="8"
        cy="8"
        r="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="8" cy="8" r="1.7" fill="currentColor" />
    </svg>
  );
}
