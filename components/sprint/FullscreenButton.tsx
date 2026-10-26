"use client";

import { useSyncExternalStore } from "react";

/**
 * Small, quiet fullscreen toggle pinned to the viewport's lower-right corner
 * on the school-library sprint (`/mathlib`). A kiosk is often opened in a
 * normal browser tab, and going fullscreen is what makes the sprint fill the
 * machine instead of a window; the control stays out of the card's way and
 * only asserts itself on hover/focus.
 *
 * Fullscreen state lives on `document`, so it is read through
 * `useSyncExternalStore` rather than mirrored into state from an effect: Esc
 * (or the browser's own control) exits fullscreen behind our back, and the
 * icon has to follow.
 */

function subscribeToFullscreen(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

export default function FullscreenButton() {
  const supported = useSyncExternalStore(
    subscribeToFullscreen,
    () => document.fullscreenEnabled,
    () => false
  );
  const active = useSyncExternalStore(
    subscribeToFullscreen,
    () => document.fullscreenElement !== null,
    () => false
  );

  // iPhone Safari and some embedded views have no Fullscreen API at all; a
  // button that can only fail is worse than no button.
  if (!supported) return null;

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // The browser can refuse (no user gesture, embedded frame, permission
      // policy). Nothing useful to report — leave the state as it is.
    }
  }

  const label = active ? "Exit full screen" : "Enter full screen";

  return (
    <button
      type="button"
      onClick={() => void toggleFullscreen()}
      aria-label={label}
      title={label}
      className="fixed right-4 bottom-4 z-40 rounded-sm border border-border bg-white/75 p-2 text-text-muted opacity-60 shadow-[var(--shadow-card)] backdrop-blur-[2px] transition-[color,opacity,border-color] duration-150 hover:border-blue-medium hover:text-navy hover:opacity-100 focus-visible:opacity-100 sm:right-6 sm:bottom-6"
    >
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {active ? (
          // Inward arrows — "shrink back".
          <path d="M3 8h3a2 2 0 0 0 2-2V3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M21 16h-3a2 2 0 0 0-2 2v3" />
        ) : (
          // Outward arrows — "fill the screen".
          <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
        )}
      </svg>
    </button>
  );
}
