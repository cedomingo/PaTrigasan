interface TranslucentCircleProps {
  className?: string;
  size?: number;
  tone?: "navy" | "blue";
}

/**
 * A large, very low-opacity filled circle — used behind hero sections and
 * panel corners (see the reference mock's bottom-right corner accent).
 * Purely ornamental, absolutely positioned by the caller.
 */
export default function TranslucentCircle({
  className = "",
  size = 320,
  tone = "blue",
}: TranslucentCircleProps) {
  const color = tone === "navy" ? "var(--color-navy)" : "var(--color-blue-medium)";
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
        opacity: 0.06,
      }}
    />
  );
}
