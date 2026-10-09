import type {
  Category,
  CategoryQuestionBank,
  QuestionKind,
  Subject,
} from "@/types";
import {
  derivativesCategories,
  derivativesQuestionBanks,
} from "./questions/derivatives";
import {
  integralsCategories,
  integralsQuestionBanks,
} from "./questions/integrals";
import {
  domainRangeCategories,
  domainRangeQuestionBanks,
} from "./questions/domain-range";
import {
  unitCircleCategories,
  unitCircleQuestionBanks,
} from "./questions/unit-circle";
/**
 * Registration point for every subject in the app.
 *
 * To add a new subject later (e.g. Integrals):
 *   1. Create /data/questions/integrals.ts following the same shape as
 *      derivatives.ts (a categories array + a question-bank array).
 *   2. Import both arrays here and add them to `categoryModules` /
 *      `questionBankModules` below.
 * No component, page, or quiz-engine logic needs to change — every screen
 * (category selector, Sprint, Flashcards, leaderboard filters) reads
 * through the functions in this file.
 */

const categoryModules: Category[][] = [
  unitCircleCategories,
  domainRangeCategories,
  derivativesCategories,
  integralsCategories,

];
const questionBankModules: CategoryQuestionBank[][] = [
  unitCircleQuestionBanks,
  domainRangeQuestionBanks,
  derivativesQuestionBanks,
  integralsQuestionBanks,

];

/** Flat list of every category across every subject. */
export function getAllCategories(): Category[] {
  return categoryModules.flat();
}

/** Categories grouped by subject, in registration order — what the landing page renders. */
export function getAllSubjects(): Subject[] {
  const categories = getAllCategories();
  const subjectOrder: string[] = [];
  const bySubject = new Map<string, Subject>();

  for (const category of categories) {
    if (!bySubject.has(category.subjectId)) {
      subjectOrder.push(category.subjectId);
      bySubject.set(category.subjectId, {
        id: category.subjectId,
        name: category.subject,
        categories: [],
      });
    }
    bySubject.get(category.subjectId)!.categories.push(category);
  }

  return subjectOrder.map((id) => bySubject.get(id)!);
}

/** Flat list of every question bank across every subject. */
export function getAllQuestionBanks(): CategoryQuestionBank[] {
  return questionBankModules.flat();
}

/** The question bank for a single category id, or undefined if unknown. */
export function getQuestionBankForCategory(
  categoryId: string
): CategoryQuestionBank | undefined {
  return getAllQuestionBanks().find((bank) => bank.categoryId === categoryId);
}

/** Display order for question kinds, so headings read "Domain & Range". */
const KIND_ORDER: QuestionKind[] = ["domain", "range"];

/**
 * The question kinds a subject splits its questions into, in display order.
 * Subjects whose questions carry no `kind` (Derivatives, Integrals) return an
 * empty array — their headings stay plain text.
 */
export function getSubjectKinds(subjectId: string): QuestionKind[] {
  const categoryIds = new Set(
    getAllCategories()
      .filter((category) => category.subjectId === subjectId)
      .map((category) => category.id)
  );

  const present = new Set<QuestionKind>();
  for (const bank of getAllQuestionBanks()) {
    if (!categoryIds.has(bank.categoryId)) continue;
    for (const item of bank.items) {
      if (item.kind) present.add(item.kind);
    }
  }

  return KIND_ORDER.filter((kind) => present.has(kind));
}

/**
 * Wording shown above a question, keyed by subject id (the ids live in
 * /data/questions/*.ts). Only subjects whose prompt can't be read as a
 * derivative/integral prefix get an entry: Derivatives keep the default
 * "D_x of:" and Integrals their "∫ of:", so neither appears here.
 */
export const SUBJECT_PROMPT_LABELS: Record<string, string> = {
  "unit-circle": "Evaluate",
};

/**
 * Wording for a subject that splits its questions by `kind` (Domain & Range).
 * `kind` beats `SUBJECT_PROMPT_LABELS`, so a kind-split subject doesn't need
 * an entry in both maps — the kind alone says which fact is being asked.
 */
export const KIND_PROMPT_LABELS: Record<QuestionKind, string> = {
  domain: "Domain of:",
  range: "Range of:",
};

/**
 * The wording to show above a question, or undefined when the subject keeps
 * its default prefix. `kind` wins when the item is tagged with one — a
 * domain/range question is addressed as much by "Domain of:" as by the
 * expression itself — otherwise the answer comes from the category's
 * subject. Unknown category ids return undefined rather than guessing.
 */
export function getPromptLabel(
  categoryId: string,
  kind?: QuestionKind
): string | undefined {
  if (kind) return KIND_PROMPT_LABELS[kind];

  const subjectId = getAllCategories().find(
    (category) => category.id === categoryId
  )?.subjectId;

  return subjectId ? SUBJECT_PROMPT_LABELS[subjectId] : undefined;
}

/** Every category id currently available, sorted — the canonical "full mix" set for leaderboard queries. */
export function getAllCategoryIdsSorted(): string[] {
  return getAllCategories()
    .map((c) => c.id)
    .sort();
}

/** Leaderboard key for a run that covers every category across every subject. */
export const FULL_MIX_KEY = "full-mix";

/**
 * Maps a set of checked category ids to the leaderboard it counts toward, or
 * undefined when the run isn't saveable. Saveable means the selection is
 * *exactly* either:
 *   - every category of one subject and nothing else -> that subject's id, or
 *   - every category of every subject                 -> FULL_MIX_KEY.
 * Partial subjects, or any mix of partial subjects, return undefined.
 * Derived from getAllSubjects(), so new subjects need no change here.
 */
export function getLeaderboardKey(
  selectedIds: Iterable<string>
): string | undefined {
  const selected = new Set(selectedIds);
  if (selected.size === 0) return undefined;

  const subjects = getAllSubjects();
  const coversExactly = (ids: string[]) =>
    ids.length === selected.size && ids.every((id) => selected.has(id));

  for (const subject of subjects) {
    if (coversExactly(subject.categories.map((c) => c.id))) return subject.id;
  }
  if (coversExactly(subjects.flatMap((s) => s.categories.map((c) => c.id)))) {
    return FULL_MIX_KEY;
  }
  return undefined;
}
