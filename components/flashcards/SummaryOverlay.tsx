"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useRef } from "react";
import { Button, Divider, MathText, SectionLabel } from "@/components/ui";
import { buildSummary, type SummaryRow } from "@/lib/summary";

interface SummaryOverlayProps {
  /** The same category ids the flashcard session is using. */
  categoryIds: string[];
  /** Closes the overlay and returns to the card that was on screen. */
  onClose: () => void;
}

/**
 * The formula sheet, opened on top of the flashcard session.
 *
 * It is a viewport-level dialog rather than a route: the deck underneath is
 * untouched (nothing is remounted, shuffled or reset), the dark backdrop
 * covers the page, and the only way out is the Back button. The header is a
 * fixed row inside the panel and the body below it owns the scrolling, so the
 * Back button stays put however many rows the sheet has.
 *
 * Grouping comes from the pure buildSummary() — subjects and categories in
 * registry order, every item of every selected category in data-file order.
 */
export default function SummaryOverlay({
  categoryIds,
  onClose,
}: SummaryOverlayProps) {
  const subjects = useMemo(
    () => buildSummary(categoryIds),
    [categoryIds]
  );

  const backRef = useRef<HTMLButtonElement>(null);

  // Lock the page behind the sheet, and put keyboard focus on Back. On close
  // the previously focused control (the icon button) gets focus back, so the
  // dialog doesn't dump the user at the top of the document.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    backRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, []);

  /**
   * The header holds the only focusable control in the dialog, so a Tab from
   * Back would otherwise move into the page behind the backdrop. Keep focus
   * inside rather than trapping it with a heavier dependency-free loop.
   */
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    event.preventDefault();
    backRef.current?.focus();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-title"
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-navy-dark/60" aria-hidden="true" />

      <div className="relative flex h-full w-full flex-col overflow-hidden bg-bg shadow-[0_8px_40px_rgba(22,43,70,0.28)] sm:rounded-md sm:border sm:border-border">
        <header className="flex shrink-0 items-center gap-4 border-b border-border bg-white px-4 py-3 sm:px-6">
          <Button
            ref={backRef}
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Back
          </Button>
          <h2 id="summary-title" className="text-lg">
            Summary
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6 sm:py-6">
          {subjects.length === 0 ? (
            <div className="rounded-md border border-border bg-white p-8 text-center">
              <p className="font-sans text-sm text-text-muted">
                No categories selected. Choose a topic to see its formulas
                here.
              </p>
            </div>
          ) : (
            <div
              className={`grid items-start gap-4 ${
                // A lone subject keeps the width it would have beside a
                // second one, instead of stretching across the whole panel.
                subjects.length === 1
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-[repeat(auto-fit,minmax(340px,1fr))]"
              }`}
            >
              {subjects.map((subject) => (
                <section
                  key={subject.subjectId}
                  aria-labelledby={`summary-subject-${subject.subjectId}`}
                  className="rounded-md border border-border bg-white p-4 shadow-[var(--shadow-card)] sm:p-5"
                >
                  <h3
                    id={`summary-subject-${subject.subjectId}`}
                    className="font-serif text-base"
                  >
                    {subject.name}
                  </h3>

                  <Divider className="my-3" />

                  <div className="flex flex-col gap-5">
                    {subject.categories.map((category) => (
                      <div key={category.categoryId}>
                        <SectionLabel tone="muted" underline>
                          {category.label}
                        </SectionLabel>

                        {/*
                          One grid for the whole section, so every "=" lands in
                          the same column. Both sides are minmax(0,…) tracks:
                          the problem side can shrink for the prefix, and the
                          answer side gets the extra room. MathText shrinks any
                          formula wider than its cell instead of letting it
                          overflow the card.
                        */}
                        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1.35fr)] items-baseline gap-x-2 gap-y-1.5">
                          {category.rows.map((row, rowIndex) => (
                            <Row key={rowIndex} row={row} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ row }: { row: SummaryRow }) {
  return (
    <>
      <div className="min-w-0 text-right">
        <span className="mr-1.5 whitespace-nowrap font-sans text-[11px] text-text-muted">
          {row.prefix}
        </span>
        <MathText latex={row.prompt} className="text-sm" />
      </div>
      <span className="font-serif text-sm text-text-muted" aria-hidden="true">
        =
      </span>
      <div className="min-w-0 text-left">
        <MathText latex={row.answer} className="text-sm" />
      </div>
    </>
  );
}
