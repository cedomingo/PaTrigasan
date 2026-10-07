import { getPromptLabel } from "@/data";
import type { QuestionKind } from "@/types";

interface PromptLabelProps {
  /** Category the question belongs to — its subject decides the wording. */
  categoryId: string;
  /** Facet the question asks about, when its subject is split by one. */
  kind?: QuestionKind;
  className?: string;
}

/**
 * The line above a question saying which task is being asked: a subject's own
 * wording (Unit Circle "Evaluate", Domain & Range "Domain of:" / "Range of:"),
 * or the prefix the rest have always had — an integral sign for integrals,
 * "D_x of:" otherwise.
 *
 * Shared by every question surface rather than re-spelled-out in each. The
 * Sprint card and the flashcard previously kept separate copies of that
 * default, which is how the flashcard went on showing "D_x of:" for a
 * question the Sprint card had already given an integral sign.
 */
export default function PromptLabel({
  categoryId,
  kind,
  className = "",
}: PromptLabelProps) {
  const label = getPromptLabel(categoryId, kind);

  return (
    <p className={className}>
      {label ? (
        label
      ) : categoryId.startsWith("integrals") ? (
        <>∫ of:</>
      ) : (
        <>
          D<sub>x</sub> of:
        </>
      )}
    </p>
  );
}
