import { MathText } from "@/components/ui";

export type AnswerOptionStatus = "default" | "correct" | "wrong" | "dim";

interface AnswerOptionProps {
  label: string;
  latex: string;
  status: AnswerOptionStatus;
  disabled: boolean;
  onClick: () => void;
}

const statusClasses: Record<AnswerOptionStatus, string> = {
  default: "border-border bg-white hover:border-blue-medium hover:bg-blue-faint hover:shadow-[var(--shadow-card-hover)]",
  correct: "border-correct bg-[#eaf5ef]",
  wrong: "border-wrong bg-[#fbecea]",
  dim: "border-border bg-white opacity-40",
};

/**
 * An academic-card answer option rather than a game-show button, per the
 * design spec. Reveal states (correct/wrong/dim) mirror the original
 * Derivative Sprint's `.opt.correct` / `.opt.wrong` / `.opt.dim` classes,
 * restyled with the app's palette instead of neon green/red.
 *
 * The reveal is never color-only: a correct/wrong option also gets a small
 * glyph and an accessible label suffix, so the result reads the same for
 * colorblind players and screen-reader users.
 */
export default function AnswerOption({
  label,
  latex,
  status,
  disabled,
  onClick,
}: AnswerOptionProps) {
  // Only override the accessible name once the answer is revealed — during
  // active play the button's own content (label + KaTeX's MathML) is the
  // right thing for a screen reader to announce, and replacing it with a
  // plain "Option A" would strip the actual math out of an unanswered
  // question.
  const revealLabel =
    status === "correct"
      ? `Option ${label}, correct answer`
      : status === "wrong"
        ? `Option ${label}, your answer, incorrect`
        : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={revealLabel}
      className={`flex min-h-[3.25rem] items-center gap-3 rounded-md border p-4 text-left shadow-[var(--shadow-card)] transition-[color,background-color,border-color,box-shadow] duration-150 disabled:cursor-default ${statusClasses[status]}`}
    >
      <span className="font-sans text-xs font-semibold text-text-muted">{label}</span>
      <MathText latex={latex} />
      {status === "correct" && (
        <span aria-hidden="true" className="ml-auto text-sm font-semibold text-correct">
          ✓
        </span>
      )}
      {status === "wrong" && (
        <span aria-hidden="true" className="ml-auto text-sm font-semibold text-wrong">
          ✗
        </span>
      )}
    </button>
  );
}
