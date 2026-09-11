import { useRef } from "react";

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /** Accessible name for the tablist, e.g. "Leaderboard view" — required since two of these can sit side by side (view mode + timeframe) with nothing else to tell them apart for a screen reader. */
  ariaLabel: string;
}

/**
 * A simple, obvious way to switch between two (or more) views — used for
 * the leaderboard's "Full Mix" / "By Topic" model switch and its
 * "All-Time" / "This Week" timeframe toggle. Deliberately plain: a single
 * navy pill slides via background color, no motion beyond a color
 * transition.
 *
 * Follows the ARIA tabs pattern's keyboard model: only the active tab is in
 * the page's tab order (roving tabindex), and Left/Right (or Up/Down) move
 * and activate the adjacent tab, matching what a screen-reader user
 * expects from `role="tab"` rather than leaving every option separately
 * tab-stoppable.
 */
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = "",
  ariaLabel,
}: SegmentedControlProps<T>) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    const isNext = e.key === "ArrowRight" || e.key === "ArrowDown";
    const isPrev = e.key === "ArrowLeft" || e.key === "ArrowUp";
    if (!isNext && !isPrev) return;

    e.preventDefault();
    const nextIndex = isNext
      ? (index + 1) % options.length
      : (index - 1 + options.length) % options.length;

    onChange(options[nextIndex].value);
    buttonRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`inline-flex rounded-sm border border-border bg-white p-0.5 ${className}`}
    >
      {options.map((opt, index) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`rounded-[6px] px-3 py-1.5 font-sans text-xs font-medium transition-colors duration-150 ${
              active
                ? "bg-navy text-white"
                : "text-text-muted hover:text-navy"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
