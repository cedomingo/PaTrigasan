"use client";

import { Fragment } from "react";
import { getSubjectKinds } from "@/data";
import type { QuestionKind, Subject } from "@/types";

interface CategoryCheckboxGroupProps {
  subjects: Subject[];
  selectedIds: Set<string>;
  onToggle: (categoryId: string) => void;
  /** Compact mode drops the subject group headings — used for the leaderboard's inline filter. */
  compact?: boolean;
  /** Checked question kinds; without these the headings stay plain text. */
  kinds?: Set<QuestionKind>;
  onToggleKind?: (kind: QuestionKind) => void;
}

const KIND_LABELS: Record<QuestionKind, string> = {
  domain: "Domain",
  range: "Range",
};

/**
 * Subject-heading typography. Stated on the kind buttons too, not just the
 * legend: buttons don't reliably inherit it, and the words have to read as
 * part of the heading rather than as form controls.
 */
const headingClass =
  "font-sans text-xs font-semibold uppercase tracking-[0.08em] text-text-muted";

/**
 * Renders every subject as a labeled group of checkbox cards. New subjects
 * (e.g. a future "Integrals" group from /data/subjects.ts) appear
 * automatically — this component has no hardcoded knowledge of what
 * subjects or categories exist.
 *
 * A subject that splits its questions into kinds (Domain & Range) gets its
 * heading rendered as those kinds instead of plain text: "Domain & Range"
 * becomes two text-only checkboxes around an inert "&", the checked word
 * underlined and the bare word not — see `getSubjectKinds`. Headings of
 * everything else are untouched.
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
  kinds,
  onToggleKind,
}: CategoryCheckboxGroupProps) {
  return (
    <div className={compact ? "space-y-4" : "space-y-8"}>
      {subjects.map((subject) => {
        const subjectKinds = compact ? [] : getSubjectKinds(subject.id);
        const splitHeading = kinds && onToggleKind && subjectKinds.length > 0;

        return (
          <fieldset key={subject.id}>
            {!compact && (
              <legend className={`mb-3 ${headingClass}`}>
                {splitHeading
                  ? subjectKinds.map((kind, i) => {
                      const checked = kinds.has(kind);
                      // The last kind still on can't be switched off — one of
                      // them is always live — so it reads as plain text.
                      const locked = checked && kinds.size === 1;
                      return (
                        <Fragment key={kind}>
                          {i > 0 ? " & " : null}
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={checked}
                            aria-disabled={locked}
                            onClick={() => {
                              if (!locked) onToggleKind(kind);
                            }}
                            className={`border-0 bg-transparent p-0 ${headingClass} underline-offset-4 ${
                              checked ? "underline" : ""
                            } ${locked ? "cursor-default" : "cursor-pointer"}`}
                          >
                            {KIND_LABELS[kind]}
                          </button>
                        </Fragment>
                      );
                    })
                  : subject.name}
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
        );
      })}
    </div>
  );
}
