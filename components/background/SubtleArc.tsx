interface SubtleArcProps {
  className?: string;
}

/**
 * A thin decorative arc, meant to sit behind hero/content sections at very
 * low opacity. Purely ornamental — aria-hidden, absolutely positioned by
 * the caller via `className`.
 */
export default function SubtleArc({ className = "" }: SubtleArcProps) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      width="480"
      height="480"
      viewBox="0 0 480 480"
      fill="none"
    >
      <circle
        cx="240"
        cy="480"
        r="360"
        stroke="var(--color-navy)"
        strokeOpacity="0.08"
        strokeWidth="1"
      />
      <circle
        cx="240"
        cy="480"
        r="300"
        stroke="var(--color-navy)"
        strokeOpacity="0.06"
        strokeWidth="1"
      />
    </svg>
  );
}
