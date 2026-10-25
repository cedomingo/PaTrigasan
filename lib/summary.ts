import {
  getAllSubjects,
  getPromptText,
  getQuestionBankForCategory,
} from "@/data";
import type { CategoryQuestionBank, Subject } from "@/types";

/** One formula-sheet row: the prefix, the prompt, and the answer it equals. */
export interface SummaryRow {
  /** "Evaluate", "Domain of:", "Dₓ of:", "∫ of:", … */
  prefix: string;
  /** LaTeX for the problem. */
  prompt: string;
  /** LaTeX for the answer, already written with stacked fractions. */
  answer: string;
}

/** One selected category, as a section inside its subject's card. */
export interface SummaryCategory {
  categoryId: string;
  label: string;
  rows: SummaryRow[];
}

/** One selected subject, as a single card in the overlay. */
export interface SummarySubject {
  subjectId: string;
  name: string;
  categories: SummaryCategory[];
}

/**
 * Builds the summary sheet from the session's selected category ids.
 *
 * Pure and registry-driven: subjects and categories keep their registration
 * order (not the order they were selected in), every card in a selected
 * category is listed in data-file order, and the question kind filter is
 * deliberately ignored — the sheet is the whole reference, not the filtered
 * deck. A category with no items is skipped, and a subject left with no
 * categories disappears entirely, so nothing renders as an empty card.
 *
 * `subjects` and `getBank` default to the real registry; they're parameters
 * so the grouping can be tested with fixtures, including a 0-card category.
 */
export function buildSummary(
  selectedCategoryIds: Iterable<string>,
  subjects: Subject[] = getAllSubjects(),
  getBank: (categoryId: string) => CategoryQuestionBank | undefined = getQuestionBankForCategory
): SummarySubject[] {
  const selected = new Set(selectedCategoryIds);
  if (selected.size === 0) return [];

  const summary: SummarySubject[] = [];

  for (const subject of subjects) {
    const categories: SummaryCategory[] = [];

    for (const category of subject.categories) {
      if (!selected.has(category.id)) continue;

      const items = getBank(category.id)?.items ?? [];
      if (items.length === 0) continue;

      categories.push({
        categoryId: category.id,
        label: category.label,
        rows: items.map((item) => ({
          prefix: getPromptText(category.id, item.kind),
          prompt: item.fn,
          answer: item.ans,
        })),
      });
    }

    if (categories.length > 0) {
      summary.push({
        subjectId: subject.id,
        name: subject.name,
        categories,
      });
    }
  }

  return summary;
}
