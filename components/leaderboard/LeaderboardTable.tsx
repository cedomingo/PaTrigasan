import { useEffect, useRef } from "react";
import { Card } from "@/components/ui";
import { useDeviceId } from "@/lib/device";
import type { ScoreEntry } from "@/types";
import type { LeaderboardFocus } from "./LeaderboardFocusToggle";

interface LeaderboardTableProps {
  entries: ScoreEntry[];
  loading: boolean;
  error: string | null;
  /** Where to park the window — the top of the board, or the player's row. */
  focus: LeaderboardFocus;
}

/**
 * The table is a fixed five-row window that scrolls beyond that, so the
 * leaderboard occupies exactly one height no matter how many runs are stored,
 * how long a name is, or whether it's still loading — nothing below it ever
 * moves. The header stays pinned while the rows scroll under it.
 *
 * The sizing contract is these constants: every row is exactly
 * ROW_HEIGHT_REM tall (cells keep their content on one line), the header is
 * HEADER_HEIGHT_REM, and the scroll viewport is the two added together for
 * VISIBLE_ROWS — so exactly five rows fit, never four and a sliver.
 */
const VISIBLE_ROWS = 5;
const ROW_HEIGHT_REM = 3; // the h-12 on every body cell
const HEADER_HEIGHT_REM = 2.5; // the h-10 on every header cell
// Cells use py-2 so their text always fits inside those heights (cells centre
// their content vertically, so the padding only ever supplies breathing room —
// the padding must stay small enough that it can't push a row past its h-12).
const VIEWPORT_HEIGHT_REM = VISIBLE_ROWS * ROW_HEIGHT_REM + HEADER_HEIGHT_REM;
/**
 * The table card is the viewport (17.5rem) plus the Card's own padding (1.5rem
 * top and bottom) and 1px borders — the loading/empty/error states are pinned
 * to the same total so switching between states never resizes the panel.
 */
const PANEL_HEIGHT_CLASS = "h-[20.625rem]";

/** The sticky header the rows scroll under, in px — matches HEADER_HEIGHT_REM. */
const HEADER_HEIGHT_PX = HEADER_HEIGHT_REM * 16;

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function LeaderboardTable({
  entries,
  loading,
  error,
  focus,
}: LeaderboardTableProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const myRowRef = useRef<HTMLTableRowElement>(null);
  // Empty until hydrated, so the server and first client render agree (see
  // useDeviceId). Rows only exist once the client has fetched them anyway.
  const myDeviceId = useDeviceId();

  // Follow the toggle: park the window on the top row, or bring the player's
  // own row up under the sticky header. Re-runs when the entry count changes
  // too, so switching to "me" before the first snapshot lands still finds you.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const smooth =
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      "scrollBehavior" in viewport;

    if (focus === "top") {
      viewport.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
      return;
    }

    const row = myRowRef.current;
    if (!row) return;

    // Land the row directly below the header rather than at the very top of
    // the window, where the sticky header would cover it.
    const delta =
      row.getBoundingClientRect().top -
      viewport.getBoundingClientRect().top -
      HEADER_HEIGHT_PX;
    viewport.scrollTo({
      top: viewport.scrollTop + delta,
      behavior: smooth ? "smooth" : "auto",
    });
  }, [focus, entries.length]);
  if (error) {
    return (
      <Card
        variant="default"
        className={`flex ${PANEL_HEIGHT_CLASS} flex-col items-center justify-center text-center`}
      >
        <p className="font-sans text-sm text-wrong">
          Couldn&apos;t load the leaderboard right now.
        </p>
        <p className="mt-1 font-sans text-xs text-text-muted">{error}</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card
        variant="default"
        className={`flex ${PANEL_HEIGHT_CLASS} items-center justify-center text-center`}
      >
        <p className="font-sans text-sm text-text-muted">Loading leaderboard…</p>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card
        variant="default"
        className={`flex ${PANEL_HEIGHT_CLASS} flex-col items-center justify-center gap-1 text-center`}
      >
        <p className="font-serif text-lg text-navy">No runs yet — be the first!</p>
      </Card>
    );
  }

  return (
    <Card variant="default" className="overflow-hidden p-0">
      {/* The scroll viewport is exactly VISIBLE_ROWS rows tall, header
          included; the sticky header sits at the top of it and never scrolls
          away, so the five rows below it stay in view. */}
      <div
        ref={viewportRef}
        className="overflow-y-auto overscroll-contain"
        style={{ height: `${VIEWPORT_HEIGHT_REM}rem` }}
      >
        {/* table-fixed + nowrap keeps column widths and row heights identical
            from row to row — the name column absorbs the slack and truncates
            its own overflow instead of widening the table past the card.
            Rows are separated with cell borders rather than a collapsed table
            border: in the collapsed model a row's 1px rule is drawn *outside*
            its height, so five rows could never total a round number and the
            window always clipped or leaked a sliver of the next row. */}
        <table className="w-full table-fixed border-separate border-spacing-0 whitespace-nowrap">
          <caption className="sr-only">
            Leaderboard, ranked by score, highest first
          </caption>
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              <th className="h-10 w-12 border-b border-border px-4 py-2 text-left font-sans text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">
                #
              </th>
              <th className="h-10 border-b border-border px-2 py-2 text-left font-sans text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">
                Name
              </th>
              <th className="h-10 w-20 border-b border-border px-2 py-2 text-right font-sans text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">
                Score
              </th>
              <th className="hidden h-10 w-20 border-b border-border px-2 py-2 text-right font-sans text-xs font-semibold uppercase tracking-[0.06em] text-text-muted sm:table-cell">
                Streak
              </th>
              <th className="hidden h-10 w-24 border-b border-border px-4 py-2 text-right font-sans text-xs font-semibold uppercase tracking-[0.06em] text-text-muted sm:table-cell">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              // Your own row, keyed by device (see /lib/device.ts) — not by
              // name, which you can change at any time.
              const isMe = myDeviceId !== "" && entry.deviceId === myDeviceId;
              return (
                <tr
                  key={entry.id ?? i}
                  ref={isMe ? myRowRef : undefined}
                  className={isMe ? "bg-blue-faint" : undefined}
                >
                  <td className="h-12 border-b border-border px-4 py-2 font-sans text-sm text-text-muted">
                    {i + 1}
                  </td>
                  <td
                    className="h-12 truncate border-b border-border px-2 py-2 font-sans text-sm font-medium text-text"
                    title={entry.name || "Anonymous"}
                  >
                    {entry.name || "Anonymous"}
                    {isMe && <span className="sr-only"> (you)</span>}
                  </td>
                  <td className="h-12 border-b border-border px-2 py-2 text-right font-serif text-base text-navy">
                    {entry.score}
                  </td>
                  <td className="hidden h-12 border-b border-border px-2 py-2 text-right font-sans text-sm text-text-muted sm:table-cell">
                    {entry.bestStreak}
                  </td>
                  <td className="hidden h-12 border-b border-border px-4 py-2 text-right font-sans text-sm text-text-muted sm:table-cell">
                    {formatDate(entry.timestamp)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
