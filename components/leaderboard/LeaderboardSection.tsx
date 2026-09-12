"use client";

import { useEffect, useState } from "react";
import { SectionLabel, SegmentedControl } from "@/components/ui";
import { subscribeToLeaderboard, filterByTimeframe } from "@/lib/leaderboard";
import type { ScoreEntry } from "@/types";
import LeaderboardTable from "./LeaderboardTable";

type Timeframe = "all-time" | "this-week";

interface LeaderboardSectionProps {
  categoryIds: string[];
}

export default function LeaderboardSection({ categoryIds }: LeaderboardSectionProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("all-time");

  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <SectionLabel underline>Leaderboard</SectionLabel>
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

      <LeaderboardTable entries={displayed} loading={loading} error={error} />
    </section>
  );
}
