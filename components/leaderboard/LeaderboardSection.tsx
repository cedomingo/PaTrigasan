"use client";

import { useEffect, useState } from "react";
import { SectionLabel, SegmentedControl } from "@/components/ui";
import { subscribeToLeaderboard, filterByTimeframe } from "@/lib/leaderboard";
import { setAutosaveScorePreference, useAutosaveScore } from "@/lib/preferences";
import type { ScoreEntry } from "@/types";
import LeaderboardTable from "./LeaderboardTable";
import LeaderboardFocusToggle, { type LeaderboardFocus } from "./LeaderboardFocusToggle";

type Timeframe = "all-time" | "this-week";

interface LeaderboardSectionProps {
  categoryIds: string[];
}

export default function LeaderboardSection({ categoryIds }: LeaderboardSectionProps) {
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
    if (categoryIds.length === 0) {
      setEntries([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToLeaderboard(
      categoryIds,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryIds.join(",")]);

  const displayed = filterByTimeframe(entries, timeframe);

  return (
    <section className="mx-auto max-w-2xl px-6 pb-16">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* items-start, not items-center: SectionLabel is a text line plus an
            underline rule, so centering against the whole block would sit the
            checkbox below the wordmark. Top-aligning puts both text lines on
            the same baseline, which the row's own items-center then centers
            the box against. */}
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
