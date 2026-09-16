/**
 * Optional facet a question can belong to. "Domain & Range" questions are
 * tagged `"domain"` or `"range"` (the `dom(...)` / `ran(...)` prompts);
 * subjects with no such split (Derivatives, Integrals) leave `kind` unset.
 * Unset questions are never narrowed by the DOMAIN / RANGE toggles.
 */
export type QuestionKind = "domain" | "range";

/**
 * One entry in a question bank. Mirrors the shape used by the original
 * Derivative Sprint's FAMILIES array, generalized so any subject
 * (derivatives, later integrals, etc.) can plug in.
 */
export interface QuestionItem {
  /** LaTeX for the prompt shown to the player, e.g. "\\sin x". */
  fn: string;
  /**
   * Unique key identifying the correct answer *within its category*, used
   * for distractor dedup (e.g. ln x and ln|x| share key "1/x" so they never
   * appear as two different-looking "correct" answers) and for answer
   * matching. Does not need to be globally unique, only unique per category.
   */
  key: string;
  /** LaTeX for the correct answer, e.g. "\\cos x". */
  ans: string;
  /** Facet this question belongs to, when its subject is split by one. */
  kind?: QuestionKind;
}

/** A question bank entry bound to its category id, as consumed by the quiz engine. */
export interface CategoryQuestionBank {
  categoryId: string;
  items: QuestionItem[];
}
