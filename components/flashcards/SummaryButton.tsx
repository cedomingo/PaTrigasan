"use client";

interface SummaryButtonProps {
  onClick: () => void;
}

/**
 * The page icon that opens the formula-sheet overlay from the flashcard
 * header. Icon-only, so the accessible name is the only label — no `title`,
 * which would show a tooltip on hover. Square and shrink-proof: it sits in a
 * row next to the card counter and never grows into it.
 */
export default function SummaryButton({ onClick }: SummaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Show summary"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-border bg-white text-text-muted transition-colors duration-150 hover:border-blue-medium hover:bg-blue-faint hover:text-navy active:bg-blue-soft"
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 1.8h5l3 3v9.4H4V1.8Z" />
        <path d="M9 1.8v3h3" />
        <path d="M6 8h4M6 10.5h4" />
      </svg>
    </button>
  );
}
