import { useEffect, useLayoutEffect, useRef } from "react";

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
 * useLayoutEffect, minus React's "does nothing on the server" warning.
 *
 * The highlight has to land in its final position *before* the first paint:
 * it's the only thing painting the active segment's navy, so a frame spent
 * unplaced would flash the active label as white on white.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * A simple, obvious way to switch between two (or more) views — used for the
 * leaderboard's "All-Time" / "This Week" timeframe toggle. Deliberately plain:
 * the segments hug their own labels and a single navy pill marks the active
 * one.
 *
 * The pill is one element that *moves* between segments instead of each
 * segment painting a background that fades in and out, so switching reads as
 * one continuous slide. Because the segments size themselves to their labels
 * (they aren't equal-width columns), the pill is positioned by measuring the
 * active segment's box — width plus its offset inside the track — and is
 * re-measured on resize (font loading, window resizing) via ResizeObserver.
 *
 * Two details that matter:
 *   - The segments are `relative` so their labels paint *above* the pill. The
 *     pill is a positioned layer and the segments are plain grid/flex children;
 *     without this the navy highlight covers the text it belongs to.
 *   - The track is exactly the segments' box (the container's content box), so
 *     the maths is a plain rect subtraction with no hard-coded insets.
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
  const trackRef = useRef<HTMLSpanElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const placedRef = useRef(false);
  /** Last target we applied, so re-observing can't re-apply and kill a slide. */
  const targetRef = useRef("");

  const activeIndex = Math.max(
    0,
    options.findIndex((opt) => opt.value === value)
  );

  useIsomorphicLayoutEffect(() => {
    const track = trackRef.current;
    const pill = pillRef.current;
    const active = buttonRefs.current[activeIndex];
    if (!track || !pill || !active) return;

    /** Move the pill onto the active segment. `animate` off = this move is a correction (first placement, or a resize), not a switch. */
    function place(animate: boolean) {
      if (!track || !pill || !active) return;
      const trackRect = track.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();

      const width = `${activeRect.width}px`;
      const offset = `translateX(${activeRect.left - trackRect.left}px)`;

      // Bail out when the target hasn't actually moved. ResizeObserver fires an
      // initial callback the moment it starts observing, and re-applying the
      // same values with the transition off would cancel the slide that was
      // just started — leaving the highlight to jump instead of travel.
      const target = `${width}/${offset}`;
      if (target === targetRef.current) return;
      targetRef.current = target;

      if (animate) {
        pill.style.width = width;
        pill.style.transform = offset;
        return;
      }

      const transition = pill.style.transition;
      pill.style.transition = "none";
      pill.style.width = width;
      pill.style.transform = offset;
      // Flush the styles so the *next* move transitions from this position.
      void pill.offsetWidth;
      pill.style.transition = transition;
    }

    // First placement must not animate in from an empty pill.
    place(placedRef.current);
    placedRef.current = true;

    const observer = new ResizeObserver(() => place(false));
    observer.observe(active);
    observer.observe(track);
    return () => observer.disconnect();
  }, [activeIndex, options.length]);

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
      className={`relative inline-flex rounded-sm border border-border bg-white p-0.5 ${className}`}
    >
      {/* Track = the segments' box (container content box), so the pill can be
          placed with a plain rect subtraction. pointer-events-none keeps it
          out of the way of clicks on the segments above it. */}
      <span
        ref={trackRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0.5"
      >
        <span
          ref={pillRef}
          className="absolute inset-y-0 left-0 rounded-[6px] bg-navy transition-[transform,width] duration-200 ease-out"
        />
      </span>

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
            // `relative` is load-bearing: it lifts the label above the pill.
            className={`relative rounded-[6px] px-3 py-1.5 font-sans text-xs font-medium transition-colors duration-150 ${
              active ? "text-white" : "text-text-muted hover:text-navy"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
