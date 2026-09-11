"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionLabel, SegmentedControl } from "@/components/ui";
import CategoryCheckboxGroup from "@/components/category/CategoryCheckboxGroup";
import { getAllSubjects } from "@/data";
import {
  subscribeToLeaderboard,
  getFullMixCategoryIds,
  filterByTimeframe,
} from "@/lib/leaderboard";
import type { ScoreEntry } from "@/types";
import LeaderboardTable from "./LeaderboardTable";

type ViewMode = "full-mix" | "by-topic";
type Timeframe = "all-time" | "this-week";

const subjects = getAllSubjects();
const fullMixIds = getFullMixCategoryIds();

export default function LeaderboardSection() {
  const [viewMode, setViewMode] = useState<ViewMode>("full-mix");
  const [timeframe, setTimeframe] = useState<Timeframe>("all-time");
  const [byTopicIds, setByTopicIds] = useState<Set<string>>(new Set());

  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeCategoryIds = useMemo(
    () => (viewMode === "full-mix" ? fullMixIds : Array.from(byTopicIds)),
    [viewMode, byTopicIds]
  );

  useEffect(() => {
    // "By Topic" with nothing checked has no exact category-set to query —
    // show the empty state rather than firing a query that can't match.
    if (viewMode === "by-topic" && activeCategoryIds.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntries([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToLeaderboard(
      activeCategoryIds,
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
    // activeCategoryIds is a derived array (new reference each render), so
    // depend on its stable string form instead of the array itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activeCategoryIds.join(",")]);

  function handleToggleTopic(categoryId: string) {
    setByTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  const displayed = filterByTimeframe(entries, timeframe);

  return (
    <section className="mx-auto max-w-2xl px-6 pb-16">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SectionLabel underline>Leaderboard</SectionLabel>
        <div className="flex flex-wrap gap-2">
          <SegmentedControl
            ariaLabel="Leaderboard view"
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: "full-mix", label: "Full Mix" },
              { value: "by-topic", label: "By Topic" },
            ]}
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

      {viewMode === "by-topic" && (
        <div className="mb-4">
          <CategoryCheckboxGroup
            subjects={subjects}
            selectedIds={byTopicIds}
            onToggle={handleToggleTopic}
            compact
          />
        </div>
      )}

      <LeaderboardTable entries={displayed} loading={loading} error={error} />
    </section>
  );
}
