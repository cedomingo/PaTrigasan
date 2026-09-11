import type { Category, CategoryQuestionBank } from "@/types";

/**
 * "Derivatives" subject — ported from the original Derivative Sprint's
 * FAMILIES array. Each family becomes one Category; its items become one
 * CategoryQuestionBank. This is the template to copy when adding a new
 * subject (e.g. Integrals): duplicate this file's shape, register it in
 * /data/subjects.ts, and nothing else needs to change.
 */

export const DERIVATIVES_SUBJECT_ID = "derivatives";
export const DERIVATIVES_SUBJECT_NAME = "Derivatives";

export const derivativesCategories: Category[] = [
  {
    id: "derivatives-trig",
    label: "Trigonometric",
    subject: DERIVATIVES_SUBJECT_NAME,
    subjectId: DERIVATIVES_SUBJECT_ID,
  },
  {
    id: "derivatives-logexp",
    label: "Logarithmic & Exponential",
    subject: DERIVATIVES_SUBJECT_NAME,
    subjectId: DERIVATIVES_SUBJECT_ID,
  },
  {
    id: "derivatives-inverse-trig",
    label: "Inverse Trigonometric",
    subject: DERIVATIVES_SUBJECT_NAME,
    subjectId: DERIVATIVES_SUBJECT_ID,
  },
];

export const derivativesQuestionBanks: CategoryQuestionBank[] = [
  {
    categoryId: "derivatives-trig",
    items: [
      { fn: "\\sin x", key: "cos", ans: "\\cos x" },
      { fn: "\\cos x", key: "-sin", ans: "-\\sin x" },
      { fn: "\\tan x", key: "sec2", ans: "\\sec^2 x" },
      { fn: "\\cot x", key: "-csc2", ans: "-\\csc^2 x" },
      { fn: "\\sec x", key: "sectan", ans: "\\sec x \\tan x" },
      { fn: "\\csc x", key: "-csccot", ans: "-\\csc x \\cot x" },
    ],
  },
  {
    categoryId: "derivatives-logexp",
    items: [
      { fn: "\\ln x", key: "1/x", ans: "\\dfrac{1}{x}" },
      { fn: "\\ln|x|", key: "1/x", ans: "\\dfrac{1}{x}" },
      { fn: "\\log_a(x)", key: "1/xlna", ans: "\\dfrac{1}{x\\ln a}" },
      { fn: "a^x", key: "axlna", ans: "a^x \\ln a" },
      { fn: "e^x", key: "ex", ans: "e^x" },
    ],
  },
  {
    categoryId: "derivatives-inverse-trig",
    items: [
      { fn: "\\sin^{-1}x", key: "1/sqrt1-x2", ans: "\\dfrac{1}{\\sqrt{1-x^2}}" },
      { fn: "\\cos^{-1}x", key: "-1/sqrt1-x2", ans: "-\\dfrac{1}{\\sqrt{1-x^2}}" },
      { fn: "\\tan^{-1}x", key: "1/1+x2", ans: "\\dfrac{1}{1+x^2}" },
      { fn: "\\cot^{-1}x", key: "-1/1+x2", ans: "-\\dfrac{1}{1+x^2}" },
      { fn: "\\sec^{-1}x", key: "1/xsqrtx2-1", ans: "\\dfrac{1}{x\\sqrt{x^2-1}}" },
      { fn: "\\csc^{-1}x", key: "-1/xsqrtx2-1", ans: "-\\dfrac{1}{x\\sqrt{x^2-1}}" },
    ],
  },
];
