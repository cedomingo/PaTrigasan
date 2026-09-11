interface BrandMarkProps {
  size?: number;
  className?: string;
}

/**
 * A small abstract geometric mark for the hero/header — two overlapping
 * arcs, nothing crest- or seal-shaped, and no institution name or emblem.
 * Generic on purpose: swap this out if/when a real institution's own
 * branding should be used instead.
 */
export default function BrandMark({ size = 40, className = "" }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
    >
      <circle cx="20" cy="20" r="19" stroke="var(--color-navy)" strokeWidth="1.25" />
      <path
        d="M20 1a19 19 0 0 1 0 38"
        stroke="var(--color-blue-medium)"
        strokeWidth="1.25"
      />
      <circle cx="20" cy="20" r="3" fill="var(--color-navy)" />
    </svg>
  );
}
