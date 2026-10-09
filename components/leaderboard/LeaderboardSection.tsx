"use client";

import { useEffect, useState } from "react";
import { SectionLabel, SegmentedControl } from "@/components/ui";
import { subscribeToLeaderboard, filterByTimeframe } from "@/lib/leaderboard";
import { setAutosaveScorePreference, useAutosaveScore } from "@/lib/preferences";
import type { ScoreEntry } from "@/types";
import LeaderboardTable from "./LeaderboardTable";
import { LEADERBOARD_ORDER, getLeaderboardLabel } from "./boards";
import LeaderboardFocusToggle, { type LeaderboardFocus } from "./LeaderboardFocusToggle";

type Timeframe = "all-time" | "this-week";

export default function LeaderboardSection() {
  // Index into LEADERBOARD_ORDER; clicking the sub-label advances it and loops.
  const [boardIndex, setBoardIndex] = useState(0);
  const boardKey = LEADERBOARD_ORDER[boardIndex];
  const boardLabel = getLeaderboardLabel(boardKey);
  const nextLabel = getLeaderboardLabel(
    LEADERBOARD_ORDER[(boardIndex + 1) % LEADERBOARD_ORDER.length]
  );
  const [timeframe, setTimeframe] = useState<Timeframe>("all-time");
  // Where the fixed five-row window is parked: the top of the board (default)
  // or the player's own row. Lives here because the toggle sits in the header
  // while the scrolling happens inside the table.
  const [focus, setFocus] = useState<LeaderboardFocus>("top");
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Persisted, opt-in setting. SprintResults reads the same store, so
  // ticking this on the results screen saves the run that just finished.
  const autosaveScore = useAutosaveScore();

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToLeaderboard(
      boardKey,
      (data) => {
        setEntries(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [boardKey]);

  const displayed = filterByTimeframe(entries, timeframe);

  return (
    <section className="mx-auto max-w-2xl px-6 pb-16">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col items-start gap-1">
          {/* The checkbox shares the wordmark's line instead of sitting beside
              the whole label block. The board name below changes width as you
              cycle tabs, so as a sibling of that block it would get pushed
              around ("Domain & Range" is wider than "Leaderboard").
              items-start keeps the box level with the text, not the underline. */}
          <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
            <SectionLabel underline>Leaderboard</SectionLabel>
            <label className="flex cursor-pointer items-center gap-2 font-sans text-xs text-text-muted">
              <input
                type="checkbox"
                checked={autosaveScore}
                onChange={(e) => setAutosaveScorePreference(e.target.checked)}
                className="h-4 w-4 shrink-0 accent-[var(--color-navy)]"
              />
              Autosave score
            </label>
          </div>
          <button
            type="button"
            onClick={() => setBoardIndex((i) => (i + 1) % LEADERBOARD_ORDER.length)}
            aria-label={`Leaderboard: ${boardLabel}. Switch to ${nextLabel}.`}
            className="-ml-1 inline-flex items-center gap-1 rounded-sm px-1 py-0.5 font-sans text-xs text-text-muted transition-colors duration-150 hover:text-navy focus-visible:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-medium"
          >
            {boardLabel}
            <ChevronsIcon />
          </button>
        </div>
        {/* Grouped so the square button always stays beside the All-Time /
            This Week control, even when the header wraps on narrow screens. */}
        <div className="flex items-center gap-2">
          <LeaderboardFocusToggle
            focus={focus}
            onToggle={() => setFocus((f) => (f === "top" ? "me" : "top"))}
          />
          <SegmentedControl
            ariaLabel="Leaderboard timeframe"
            value={timeframe}
            onChange={setTimeframe}
            options={[
              { value: "all-time", label: "All-Time" },
              { value: "this-week", label: "This Week" },
            ]}
          />
        </div>
      </div>

      <LeaderboardTable
        entries={displayed}
        loading={loading}
        error={error}
        focus={focus}
      />
    </section>
  );
}

/** Small up/down chevrons — hints that the label cycles through boards. */
function ChevronsIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3 w-3 shrink-0">
      <path
        d="M4.5 6.5 8 3l3.5 3.5M4.5 9.5 8 13l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
