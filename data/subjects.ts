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
  domainRangeCategories,
  derivativesCategories,
  integralsCategories,
  
];
const questionBankModules: CategoryQuestionBank[][] = [
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

/** Every category id currently available, sorted — the canonical "full mix" set for leaderboard queries. */
export function getAllCategoryIdsSorted(): string[] {
  return getAllCategories()
    .map((c) => c.id)
    .sort();
}