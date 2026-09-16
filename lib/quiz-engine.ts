import type { QuestionItem, QuestionKind } from "@/types";
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
 * streak state, end-of-run screen) lives in SprintView on top of these
 * primitives.
 */

export interface SprintQuestion {
  categoryId: string;
  fn: string;
  correctKey: string;
  /** Always includes the correct answer plus up to 3 same-category distractors, pre-shuffled. */
  options: { key: string; ans: string }[];
}

/**
 * Whether an item survives the DOMAIN / RANGE filter. Items with no `kind`
 * (Derivatives, Integrals) aren't part of any facet, so they always pass;
 * omitting `kinds` entirely means "no filter".
 */
function matchesKinds(item: QuestionItem, kinds?: QuestionKind[]): boolean {
  if (!kinds || !item.kind) return true;
  return kinds.includes(item.kind);
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
 * Builds a shuffled question queue restricted to the given category ids and,
 * when `kinds` is given, to those question kinds (DOMAIN / RANGE). Filtering
 * happens before distractors are drawn, so options always come from the same
 * facet as the question. Distractors are only ever drawn from the same
 * category as the correct answer, and are deduplicated by `key` (e.g. ln x /
 * ln|x| share a key so they never both appear as options).
 */
export function buildQuestionQueue(
  categoryIds: string[],
  kinds?: QuestionKind[]
): SprintQuestion[] {
  const banks = getAllQuestionBanks().filter((bank) =>
    categoryIds.includes(bank.categoryId)
  );

  const queue: SprintQuestion[] = [];

  for (const bank of banks) {
    const items = bank.items.filter((item) => matchesKinds(item, kinds));
    const pool = dedupeByKey(items);

    for (const item of items) {
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

/**
 * The state SprintView needs to enter a run mid-stream after a correct
 * preview answer: the rest of the already-shuffled queue, the index it
 * should advance to next, the pre-awarded score, and the streak the run
 * starts with. Built from the queue that the preview was drawing from so
 * the run continues seamlessly — no regeneration, no reshuffle.
 */
export interface SprintHandoff {
  queue: SprintQuestion[];
  nextIndex: number;
  score: number;
  streak: number;
}

/**
 * Builds a SprintHandoff from the preview's queue after the user answered
 * `answeredIndex` correctly, applying the standard scoring curve
 * (10 + min(streak, 5) * 2) for that answer.
 */
export function buildSprintHandoff(
  queue: SprintQuestion[],
  answeredIndex: number,
  streak: number
): SprintHandoff {
  return {
    queue,
    nextIndex: answeredIndex + 1,
    score: 10 + Math.min(streak, 5) * 2,
    streak: streak + 1,
  };
}

/**
 * All question items (unfiltered by dedup) for the given categories — used by
 * Flashcard mode. `kinds` narrows the deck the same way it narrows a sprint
 * queue.
 */
export function getFlashcardItems(
  categoryIds: string[],
  kinds?: QuestionKind[]
): { categoryId: string; item: QuestionItem }[] {
  return getAllQuestionBanks()
    .filter((bank) => categoryIds.includes(bank.categoryId))
    .flatMap((bank) =>
      bank.items
        .filter((item) => matchesKinds(item, kinds))
        .map((item) => ({ categoryId: bank.categoryId, item }))
    );
}
