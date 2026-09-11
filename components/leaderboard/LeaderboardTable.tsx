import { Card } from "@/components/ui";
import type { ScoreEntry } from "@/types";

interface LeaderboardTableProps {
  entries: ScoreEntry[];
  loading: boolean;
  error: string | null;
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function LeaderboardTable({ entries, loading, error }: LeaderboardTableProps) {
  if (error) {
    return (
      <Card variant="default" className="py-10 text-center">
        <p className="font-sans text-sm text-wrong">
          Couldn&apos;t load the leaderboard right now.
        </p>
        <p className="mt-1 font-sans text-xs text-text-muted">{error}</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card variant="default" className="py-10 text-center">
        <p className="font-sans text-sm text-text-muted">Loading leaderboard…</p>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card variant="default" className="flex flex-col items-center gap-1 py-12 text-center">
        <p className="font-serif text-lg text-navy">No runs yet — be the first!</p>
      </Card>
    );
  }

  const top20 = entries.slice(0, 20);

  return (
    <Card variant="default" className="overflow-hidden p-0">
      <table className="w-full border-collapse">
        <caption className="sr-only">
          Leaderboard, ranked by score, highest first
        </caption>
        <thead>
          <tr className="border-b border-border">
            <th className="w-12 px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">
              #
            </th>
            <th className="px-2 py-3 text-left font-sans text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">
              Name
            </th>
            <th className="px-2 py-3 text-right font-sans text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">
              Score
            </th>
            <th className="hidden px-2 py-3 text-right font-sans text-xs font-semibold uppercase tracking-[0.06em] text-text-muted sm:table-cell">
              Streak
            </th>
            <th className="hidden px-4 py-3 text-right font-sans text-xs font-semibold uppercase tracking-[0.06em] text-text-muted sm:table-cell">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {top20.map((entry, i) => (
            <tr
              key={entry.id ?? i}
              className={i !== top20.length - 1 ? "border-b border-border" : ""}
            >
              <td className="px-4 py-3 font-sans text-sm text-text-muted">{i + 1}</td>
              <td className="px-2 py-3 font-sans text-sm font-medium text-text">
                {entry.name || "Anonymous"}
              </td>
              <td className="px-2 py-3 text-right font-serif text-base text-navy">
                {entry.score}
              </td>
              <td className="hidden px-2 py-3 text-right font-sans text-sm text-text-muted sm:table-cell">
                {entry.bestStreak}
              </td>
              <td className="hidden px-4 py-3 text-right font-sans text-sm text-text-muted sm:table-cell">
                {formatDate(entry.timestamp)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
