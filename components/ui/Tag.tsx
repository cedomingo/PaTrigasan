import type { ReactNode } from "react";

type TagTone = "neutral" | "navy" | "correct" | "wrong";

interface TagProps {
  children: ReactNode;
  tone?: TagTone;
  className?: string;
}

const toneClasses: Record<TagTone, string> = {
  neutral: "bg-blue-faint text-text-muted border-border",
  navy: "bg-blue-soft text-navy border-navy/20",
  correct: "bg-[#eaf5ef] text-correct border-correct/30",
  wrong: "bg-[#fbecea] text-wrong border-wrong/30",
};

/**
 * Small pill-shaped status/label chip — the one place in the system pills
 * are allowed, per the design spec ("avoid pill shapes unless used for
 * small tags or status indicators").
 */
export default function Tag({ children, tone = "neutral", className = "" }: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-xs font-medium tracking-wide ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
