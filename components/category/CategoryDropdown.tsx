"use client";

import { useEffect, useRef, useState } from "react";
import type { Subject } from "@/types";
import CategoryCheckboxGroup from "./CategoryCheckboxGroup";

interface CategoryDropdownProps {
  subjects: Subject[];
  selectedIds: Set<string>;
  onToggle: (categoryId: string) => void;
  className?: string;
}

/** Short trigger text summarizing what's currently selected, e.g. "3 topics selected". */
function getSummaryLabel(subjects: Subject[], selectedIds: Set<string>): string {
  const allCategories = subjects.flatMap((subject) => subject.categories);

  if (selectedIds.size === 0) return "Choose topics";
  if (selectedIds.size === allCategories.length) return "All topics";
  if (selectedIds.size === 1) {
    const match = allCategories.find((category) => selectedIds.has(category.id));
    return match?.label ?? "1 topic selected";
  }
  return `${selectedIds.size} topics selected`;
}

/**
 * Trigger button + popover that replaces the always-visible checkbox list.
 * The checkboxes themselves are unchanged (still `CategoryCheckboxGroup`,
 * shared with the leaderboard's "By Topic" filter) — this component just
 * relocates them behind a dropdown next to the Start Sprint / Practice
 * buttons, per the redesign.
 */
export default function CategoryDropdown({
  subjects,
  selectedIds,
  onToggle,
  className = "",
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const summary = getSummaryLabel(subjects, selectedIds);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-3 rounded-sm border px-5 py-3.5 font-sans text-sm font-medium text-navy transition-colors duration-150 ${
          open
            ? "border-navy bg-blue-faint"
            : "border-border bg-white hover:border-blue-medium hover:bg-blue-faint"
        }`}
      >
        <span className="truncate">{summary}</span>
        <svg
          viewBox="0 0 12 8"
          aria-hidden="true"
          className={`h-2.5 w-3 shrink-0 stroke-current stroke-[1.5] transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
        >
          <path d="M1 1.5 6 6.5 11 1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose your topics"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-[min(90vw,26rem)] rounded-md border border-border bg-white p-5 shadow-[var(--shadow-card-hover)]"
        >
          <div className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.08em] text-navy">
            Choose your topics
          </div>
          <div className="max-h-[55vh] overflow-y-auto pr-1">
            <CategoryCheckboxGroup
              subjects={subjects}
              selectedIds={selectedIds}
              onToggle={onToggle}
            />
          </div>
        </div>
      )}
    </div>
  );
}
