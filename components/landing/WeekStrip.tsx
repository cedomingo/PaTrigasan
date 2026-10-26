import { SCHEDULE_DAY_LABELS } from "@/lib/schedule";
import { getLeaderboardLabel } from "@/components/leaderboard/boards";

interface WeekStripProps {
  /** This week's five board keys, Monday first — null until it's been worked out. */
  schedule: string[] | null;
  /** 0 = Monday … 4 = Friday; null on a weekend (no day is highlighted). */
  todayIndex: number | null;
  className?: string;
}

/**
 * The library's Monday–Friday topic strip. Display only: the topic for the day
 * is chosen by the schedule, so there is nothing to click. Today's cell is
 * highlighted the same way as the active mode tab above it.
 *
 * Before the schedule is known (the first frame, since "today" can only be
 * read in the browser) the day names render with blank topics, so the strip
 * already has its final height and nothing moves when the topics fill in.
 */
export default function WeekStrip({
  schedule,
  todayIndex,
  className = "",
}: WeekStripProps) {
  return (
    <ol
      aria-label="This week's topics"
      className={`flex overflow-hidden rounded-md border border-border ${className}`}
    >
      {SCHEDULE_DAY_LABELS.map((day, i) => {
        const isToday = i === todayIndex;
        return (
          <li
            key={day}
            aria-current={isToday ? "date" : undefined}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-1.5 text-center ${
              i > 0 ? "border-l border-border" : ""
            } ${isToday ? "bg-white text-navy" : "bg-blue-faint text-text-muted"}`}
          >
            <span className="font-sans text-[0.625rem] font-semibold uppercase tracking-[0.08em]">
              {day}
            </span>
            <span
              className={`font-sans text-xs leading-tight ${
                isToday ? "font-semibold" : ""
              }`}
            >
              {schedule ? getLeaderboardLabel(schedule[i]) : "\u00a0"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
