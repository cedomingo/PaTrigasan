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
 * Applies the ● heading button: select every category in the subject, or
 * clear them all.
 *
 * Select comes first — if even one of the subject's categories is
 * unselected, the click selects the rest rather than clearing. Clearing is
 * allowed to empty the whole selection except when this subject is the only
 * one holding any, since the app requires at least one topic to stay
 * checked; in that case the subject's first category is left on.
 *
 * Written as a series of `onToggle` calls rather than a setter of its own:
 * the group is a controlled component whose owner toggles a single id per
 * call through a functional state update, so a batch of calls accumulates
 * correctly without widening the component's interface.
 */
function applySubjectToggle(
  subjectIds: string[],
  selectedIds: Set<string>,
  onToggle: (categoryId: string) => void
) {
  const allSelected = subjectIds.every((id) => selectedIds.has(id));

  if (!allSelected) {
    for (const id of subjectIds) {
      if (!selectedIds.has(id)) onToggle(id);
    }
    return;
  }

  const selectedElsewhere = [...selectedIds].some(
    (id) => !subjectIds.includes(id)
  );
  const keptId = selectedElsewhere ? null : subjectIds[0];

  for (const id of subjectIds) {
    if (id !== keptId) onToggle(id);
  }
}

/**
 * Renders every subject as a labeled group of checkbox cards. New subjects
 * (e.g. a future "Integrals" group from /data/subjects.ts) appear
 * automatically — this component has no hardcoded knowledge of what
 * subjects or categories exist.
 *
 * Each heading carries a solid ● that selects or clears every category in
 * that subject — see `applySubjectToggle`. It sits after the heading text,
 * which for a kind-split subject means after its DOMAIN / RANGE toggles; it
 * acts on the subject's categories either way, never on the kind toggles.
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
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {subjects.map((subject) => {
        const subjectKinds = compact ? [] : getSubjectKinds(subject.id);
        const splitHeading = kinds && onToggleKind && subjectKinds.length > 0;
        const subjectIds = subject.categories.map((category) => category.id);
        const subjectAllSelected = subjectIds.every((id) =>
          selectedIds.has(id)
        );

        return (
          <fieldset key={subject.id}>
            {!compact && (
              <legend className={`mb-2 ${headingClass}`}>
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
                {/*
                 * Select-all / clear-all for this subject. The circle is a
                 * styled span rather than the ● character so it can scale on
                 * hover without reflowing the heading — a transform paints
                 * outside the line box instead of growing it — and so it
                 * takes the heading's own muted token. The button is sized to
                 * the text line (h-4 = text-xs's line-height) so it adds no
                 * height of its own. The label says what the click will do,
                 * since "select all" and "clear all" share one control.
                 */}
                <button
                  type="button"
                  onClick={() =>
                    applySubjectToggle(subjectIds, selectedIds, onToggle)
                  }
                  aria-label={`${
                    subjectAllSelected ? "Clear" : "Select"
                  } all ${subject.name} topics`}
                  title={`${
                    subjectAllSelected ? "Clear" : "Select"
                  } all ${subject.name} topics`}
                  className="group ml-1 inline-flex h-4 w-4 cursor-pointer items-center justify-center border-0 bg-transparent p-0 align-middle"
                >
                  <span
                    aria-hidden="true"
                    className="block h-[0.4rem] w-[0.4rem] rounded-full bg-text-muted transition-transform duration-150 ease-out group-hover:scale-[1.8]"
                  />
                </button>
              </legend>
            )}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {subject.categories.map((category) => {
                const checked = selectedIds.has(category.id);
                const isLastSelected = checked && selectedIds.size === 1;
                return (
                  <label
                    key={category.id}
                    className={`flex items-center gap-2 rounded-md border px-2.5 py-2 transition-colors duration-150 ${
                      isLastSelected
                        ? "cursor-not-allowed border-navy bg-blue-faint opacity-50"
                        : checked
                          ? "cursor-pointer border-navy bg-blue-faint"
                          : "cursor-pointer border-border bg-white hover:bg-blue-faint hover:border-blue-medium"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={isLastSelected}
                      onChange={() => onToggle(category.id)}
                      className="h-3.5 w-3.5 shrink-0 accent-[var(--color-navy)]"
                    />
                    <span className="font-sans text-xs text-text">{category.label}</span>
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
