import type { ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
  /** Adds a short underline rule beneath the label, as in the category label on the question screen. */
  underline?: boolean;
  tone?: "navy" | "muted";
  className?: string;
}

/**
 * Small uppercase, letter-spaced label used for category tags and section
 * eyebrows (e.g. "INVERSE TRIGONOMETRIC" above an equation). This is the
 * one place in the system all-caps labeling is used deliberately, matching
 * the reference mock's category tag.
 */
export default function SectionLabel({
  children,
  underline = false,
  tone = "navy",
  className = "",
}: SectionLabelProps) {
  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span
        className={`font-sans text-xs font-semibold uppercase tracking-[0.08em] ${
          tone === "navy" ? "text-navy" : "text-text-muted"
        }`}
      >
        {children}
      </span>
      {underline && <span className="mt-1.5 h-px w-8 bg-border" />}
    </div>
  );
}
