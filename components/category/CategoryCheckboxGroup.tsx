"use client";

import type { Subject } from "@/types";

interface CategoryCheckboxGroupProps {
  subjects: Subject[];
  selectedIds: Set<string>;
  onToggle: (categoryId: string) => void;
  /** Compact mode drops the subject group headings — used for the leaderboard's inline filter. */
  compact?: boolean;
}

/**
 * Renders every subject as a labeled group of checkbox cards. New subjects
 * (e.g. a future "Integrals" group from /data/subjects.ts) appear
 * automatically — this component has no hardcoded knowledge of what
 * subjects or categories exist.
 *
 * Kept generic/controlled (ids + callback in, no internal state) so it can
 * be reused verbatim for the leaderboard's "By Topic" filter,
 * per the roadmap's instruction to reuse the same checkbox component.
 */
export default function CategoryCheckboxGroup({
  subjects,
  selectedIds,
  onToggle,
  compact = false,
}: CategoryCheckboxGroupProps) {
  return (
    <div className={compact ? "space-y-4" : "space-y-8"}>
      {subjects.map((subject) => (
        <fieldset key={subject.id}>
          {!compact && (
            <legend className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              {subject.name}
            </legend>
          )}
          <div
            className={`grid gap-3 ${
              compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-3"
            }`}
          >
            {subject.categories.map((category) => {
              const checked = selectedIds.has(category.id);
              const isLastSelected = checked && selectedIds.size === 1;
              return (
                <label
                  key={category.id}
                  className={`flex items-center gap-3 rounded-md border p-4 transition-colors duration-150 ${
                    isLastSelected
                      ? "cursor-not-allowed border-navy bg-blue-faint opacity-50"
                      : checked
                        ? "cursor-pointer border-navy bg-blue-faint"
                        : "cursor-pointer border-border bg-white hover:bg-blue-faint hover:border-blue-medium"
                  } ${compact ? "p-3" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={isLastSelected}
                    onChange={() => onToggle(category.id)}
                    className="h-4 w-4 shrink-0 accent-[var(--color-navy)]"
                  />
                  <span className="font-sans text-sm text-text">{category.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
