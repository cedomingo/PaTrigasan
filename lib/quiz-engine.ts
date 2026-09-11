import type { QuestionItem } from "@/types";
import { getAllQuestionBanks } from "@/data";

/**
 * Pure question-queue building logic, ported from the original Derivative
 * Sprint's `buildQueue()`. Kept here (not in a component) so both the
 * Sprint quiz and the Flashcard deck can reuse it, and so it's covered by
 * the "question bank is data, not code" principle — this file has zero
 * subject-specific knowledge, it just operates on whatever categories/items
 * it's given.
 *
 * Full game-loop wiring (60s run timer, 5s per-question countdown, score/
 * streak state, end-of-run screen) is built in Phase 4 on top of these
 * primitives.
 */

export interface SprintQuestion {
  categoryId: string;
  fn: string;
  correctKey: string;
  /** Always includes the correct answer plus up to 3 same-category distractors, pre-shuffled. */
  options: { key: string; ans: string }[];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds a shuffled question queue restricted to the given category ids.
 * Distractors are only ever drawn from the same category as the correct
 * answer, and are deduplicated by `key` (e.g. ln x / ln|x| share a key so
 * they never both appear as options).
 */
export function buildQuestionQueue(categoryIds: string[]): SprintQuestion[] {
  const banks = getAllQuestionBanks().filter((bank) =>
    categoryIds.includes(bank.categoryId)
  );

  const queue: SprintQuestion[] = [];

  for (const bank of banks) {
    const pool = dedupeByKey(bank.items);

    for (const item of bank.items) {
      const others = pool.filter((p) => p.key !== item.key);
      const distractors = shuffle(others).slice(0, 3);
      const options = shuffle([
        { key: item.key, ans: item.ans },
        ...distractors,
      ]);
      queue.push({
        categoryId: bank.categoryId,
        fn: item.fn,
        correctKey: item.key,
        options,
      });
    }
  }

  return shuffle(queue);
}

function dedupeByKey(items: QuestionItem[]): { key: string; ans: string }[] {
  const seen = new Set<string>();
  const pool: { key: string; ans: string }[] = [];
  for (const item of items) {
    if (!seen.has(item.key)) {
      seen.add(item.key);
      pool.push({ key: item.key, ans: item.ans });
    }
  }
  return pool;
}

/** All question items (unfiltered by dedup) for the given categories — used by Flashcard mode. */
export function getFlashcardItems(
  categoryIds: string[]
): { categoryId: string; item: QuestionItem }[] {
  return getAllQuestionBanks()
    .filter((bank) => categoryIds.includes(bank.categoryId))
    .flatMap((bank) =>
      bank.items.map((item) => ({ categoryId: bank.categoryId, item }))
    );
}
