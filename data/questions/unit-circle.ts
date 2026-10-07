import type { Category, CategoryQuestionBank } from "@/types";

export const UNIT_CIRCLE_SUBJECT_ID = "unit-circle";
export const UNIT_CIRCLE_SUBJECT_NAME = "Unit Circle";

export const unitCircleCategories: Category[] = [
  {
    id: "unit-circle-trig",
    label: "Trigonometric",
    subject: UNIT_CIRCLE_SUBJECT_NAME,
    subjectId: UNIT_CIRCLE_SUBJECT_ID,
  },
  {
    id: "unit-circle-inverse-trig",
    label: "Inverse Trigonometric",
    subject: UNIT_CIRCLE_SUBJECT_NAME,
    subjectId: UNIT_CIRCLE_SUBJECT_ID,
  },
];

export const unitCircleQuestionBanks: CategoryQuestionBank[] = [
  {
    categoryId: "unit-circle-trig",
    items: [
      { fn: "\\sin 0", key: "0", ans: "0" },
      { fn: "\\sin \\dfrac{\\pi}{6}", key: "1/2", ans: "\\dfrac{1}{2}" },
      { fn: "\\sin \\dfrac{\\pi}{4}", key: "sqrt2/2", ans: "\\dfrac{\\sqrt{2}}{2}" },
      { fn: "\\sin \\dfrac{\\pi}{3}", key: "sqrt3/2", ans: "\\dfrac{\\sqrt{3}}{2}" },
      { fn: "\\sin \\dfrac{\\pi}{2}", key: "1", ans: "1" },
      { fn: "\\cos 0", key: "1", ans: "1" },
      { fn: "\\cos \\dfrac{\\pi}{6}", key: "sqrt3/2", ans: "\\dfrac{\\sqrt{3}}{2}" },
      { fn: "\\cos \\dfrac{\\pi}{4}", key: "sqrt2/2", ans: "\\dfrac{\\sqrt{2}}{2}" },
      { fn: "\\cos \\dfrac{\\pi}{3}", key: "1/2", ans: "\\dfrac{1}{2}" },
      { fn: "\\cos \\dfrac{\\pi}{2}", key: "0", ans: "0" },
      { fn: "\\tan \\dfrac{\\pi}{6}", key: "sqrt3/3", ans: "\\dfrac{\\sqrt{3}}{3}" },
      { fn: "\\tan \\dfrac{\\pi}{4}", key: "1", ans: "1" },
      { fn: "\\tan \\dfrac{\\pi}{3}", key: "sqrt3", ans: "\\sqrt{3}" },
    ],
  },
  {
    categoryId: "unit-circle-inverse-trig",
    items: [
      { fn: "\\sin^{-1}(0)", key: "0", ans: "0" },
      { fn: "\\sin^{-1}\\left(\\dfrac{1}{2}\\right)", key: "pi/6", ans: "\\dfrac{\\pi}{6}" },
      { fn: "\\sin^{-1}\\left(\\dfrac{\\sqrt{2}}{2}\\right)", key: "pi/4", ans: "\\dfrac{\\pi}{4}" },
      { fn: "\\sin^{-1}\\left(\\dfrac{\\sqrt{3}}{2}\\right)", key: "pi/3", ans: "\\dfrac{\\pi}{3}" },
      { fn: "\\sin^{-1}(1)", key: "pi/2", ans: "\\dfrac{\\pi}{2}" },
      { fn: "\\cos^{-1}(1)", key: "0", ans: "0" },
      { fn: "\\cos^{-1}\\left(\\dfrac{\\sqrt{3}}{2}\\right)", key: "pi/6", ans: "\\dfrac{\\pi}{6}" },
      { fn: "\\cos^{-1}\\left(\\dfrac{\\sqrt{2}}{2}\\right)", key: "pi/4", ans: "\\dfrac{\\pi}{4}" },
      { fn: "\\cos^{-1}\\left(\\dfrac{1}{2}\\right)", key: "pi/3", ans: "\\dfrac{\\pi}{3}" },
      { fn: "\\cos^{-1}(0)", key: "pi/2", ans: "\\dfrac{\\pi}{2}" },
      { fn: "\\tan^{-1}\\left(\\dfrac{\\sqrt{3}}{3}\\right)", key: "pi/6", ans: "\\dfrac{\\pi}{6}" },
      { fn: "\\tan^{-1}(1)", key: "pi/4", ans: "\\dfrac{\\pi}{4}" },
      { fn: "\\tan^{-1}(\\sqrt{3})", key: "pi/3", ans: "\\dfrac{\\pi}{3}" },
    ],
  },
];