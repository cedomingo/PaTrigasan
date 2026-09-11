import type { Category, CategoryQuestionBank } from "@/types";

/**
 * "Integrals" subject — the Phase 6 extensibility test. This file is a
 * pure data addition, copied from derivatives.ts's shape: two categories,
 * a handful of items each. Nothing outside /data was touched to make this
 * appear in the category selector, Sprint, Flashcards, and leaderboard
 * filtering — that's the point of the test.
 *
 * This is a stub/demo, not a real content pass (only a few basic rules are
 * covered). Keep it as a working example of "add a subject == add a data
 * file," or delete this file and its one line of registration in
 * subjects.ts to remove it — no other code depends on it existing.
 */

export const INTEGRALS_SUBJECT_ID = "integrals";
export const INTEGRALS_SUBJECT_NAME = "Integrals";

export const integralsCategories: Category[] = [
  {
    id: "integrals-power",
    label: "Power & Exponential",
    subject: INTEGRALS_SUBJECT_NAME,
    subjectId: INTEGRALS_SUBJECT_ID,
  },
  {
    id: "integrals-trig",
    label: "Trigonometric",
    subject: INTEGRALS_SUBJECT_NAME,
    subjectId: INTEGRALS_SUBJECT_ID,
  },
];

export const integralsQuestionBanks: CategoryQuestionBank[] = [
  {
    categoryId: "integrals-power",
    items: [
      { fn: "x^n\\,dx", key: "xn+1/n+1", ans: "\\dfrac{x^{n+1}}{n+1}+C" },
      { fn: "\\dfrac{1}{x}\\,dx", key: "ln|x|", ans: "\\ln|x|+C" },
      { fn: "e^x\\,dx", key: "ex", ans: "e^x+C" },
      { fn: "a^x\\,dx", key: "ax/lna", ans: "\\dfrac{a^x}{\\ln a}+C" },
      { fn: "1\\,dx", key: "x", ans: "x+C" },
    ],
  },
  {
    categoryId: "integrals-trig",
    items: [
      { fn: "\\cos x\\,dx", key: "sin", ans: "\\sin x+C" },
      { fn: "\\sin x\\,dx", key: "-cos", ans: "-\\cos x+C" },
      { fn: "\\sec^2 x\\,dx", key: "tan", ans: "\\tan x+C" },
      { fn: "\\csc^2 x\\,dx", key: "-cot", ans: "-\\cot x+C" },
      { fn: "\\sec x\\tan x\\,dx", key: "sec", ans: "\\sec x+C" },
    ],
  },
];
