interface FaintGridProps {
  className?: string;
}

/**
 * A faint, evenly-spaced coordinate grid — evokes graph paper without
 * competing with content. Purely ornamental, absolutely positioned by the
 * caller.
 */
export default function FaintGrid({ className = "" }: FaintGridProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(30,58,95,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,58,95,0.05) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 75%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 75%)",
      }}
    />
  );
}
