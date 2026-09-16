import type { Category, CategoryQuestionBank } from "@/types";

/**
 * "Domain & Range" subject. Categories are split by function family (like
 * derivatives.ts), and each category mixes both Domain and Range questions
 * for that family's functions — dom()/ran() prompts distinguish which fact
 * is being asked.
 */

export const DOMAIN_RANGE_SUBJECT_ID = "domain-range";
export const DOMAIN_RANGE_SUBJECT_NAME = "Domain & Range";

export const domainRangeCategories: Category[] = [
  {
    id: "domain-range-trig",
    label: "Trigonometric",
    subject: DOMAIN_RANGE_SUBJECT_NAME,
    subjectId: DOMAIN_RANGE_SUBJECT_ID,
  },
  {
    id: "domain-range-logexp",
    label: "Logarithmic & Exponential",
    subject: DOMAIN_RANGE_SUBJECT_NAME,
    subjectId: DOMAIN_RANGE_SUBJECT_ID,
  },
  {
    id: "domain-range-inverse-trig",
    label: "Inverse Trigonometric",
    subject: DOMAIN_RANGE_SUBJECT_NAME,
    subjectId: DOMAIN_RANGE_SUBJECT_ID,
  },
  {
    id: "domain-range-hyperbolic",
    label: "Hyperbolic",
    subject: DOMAIN_RANGE_SUBJECT_NAME,
    subjectId: DOMAIN_RANGE_SUBJECT_ID,
  },
  {
    id: "domain-range-inverse-hyperbolic",
    label: "Inverse Hyperbolic",
    subject: DOMAIN_RANGE_SUBJECT_NAME,
    subjectId: DOMAIN_RANGE_SUBJECT_ID,
  },
];

/**
 * Every prompt in this subject reads `\operatorname{dom}(...)` or
 * `\operatorname{ran}(...)`. Tagging each item once, here, lets the question
 * queue and the flashcard deck narrow by DOMAIN / RANGE without the quiz
 * engine having to parse LaTeX.
 */
const tagKind = (bank: CategoryQuestionBank): CategoryQuestionBank => ({
  ...bank,
  items: bank.items.map((item) => ({
    ...item,
    kind: item.fn.includes("\\operatorname{ran}") ? "range" : "domain",
  })),
});

export const domainRangeQuestionBanks: CategoryQuestionBank[] = [
  {
    categoryId: "domain-range-trig",
    items: [
      // Domain
      { fn: "\\operatorname{dom}(\\sin x)", key: "R", ans: "\\mathbb{R}" },
      { fn: "\\operatorname{dom}(\\cos x)", key: "R", ans: "\\mathbb{R}" },
      {
        fn: "\\operatorname{dom}(\\tan x)",
        key: "R-oddpi2",
        ans: "\\mathbb{R} - \\left\\{(2n+1)\\dfrac{\\pi}{2} : n \\in \\mathbb{Z}\\right\\}",
      },
      {
        fn: "\\operatorname{dom}(\\cot x)",
        key: "R-npi",
        ans: "\\mathbb{R} - \\{n\\pi : n \\in \\mathbb{Z}\\}",
      },
      {
        fn: "\\operatorname{dom}(\\sec x)",
        key: "R-oddpi2",
        ans: "\\mathbb{R} - \\left\\{(2n+1)\\dfrac{\\pi}{2} : n \\in \\mathbb{Z}\\right\\}",
      },
      {
        fn: "\\operatorname{dom}(\\csc x)",
        key: "R-npi",
        ans: "\\mathbb{R} - \\{n\\pi : n \\in \\mathbb{Z}\\}",
      },
      // Range
      { fn: "\\operatorname{ran}(\\sin x)", key: "[-1,1]", ans: "[-1, 1]" },
      { fn: "\\operatorname{ran}(\\cos x)", key: "[-1,1]", ans: "[-1, 1]" },
      // Same answer as dom(sin x) / dom(cos x) above — shares key "R".
      { fn: "\\operatorname{ran}(\\tan x)", key: "R", ans: "\\mathbb{R}" },
      { fn: "\\operatorname{ran}(\\cot x)", key: "R", ans: "\\mathbb{R}" },
      {
        fn: "\\operatorname{ran}(\\sec x)",
        key: "R-(-1,1)",
        ans: "\\mathbb{R} - (-1, 1)",
      },
      {
        fn: "\\operatorname{ran}(\\csc x)",
        key: "R-(-1,1)",
        ans: "\\mathbb{R} - (-1, 1)",
      },
    ],
  },
  {
    categoryId: "domain-range-logexp",
    items: [
      // Domain
      { fn: "\\operatorname{dom}(\\ln x)", key: "(0,inf)", ans: "(0, \\infty)" },
      {
        fn: "\\operatorname{dom}(\\ln|x|)",
        key: "(-inf,0)U(0,inf)",
        ans: "(-\\infty, 0) \\cup (0, \\infty)",
      },
      // Same answer as dom(ln x) above — shares key "(0,inf)".
      {
        fn: "\\operatorname{dom}(\\log_a(x))",
        key: "(0,inf)",
        ans: "(0, \\infty)",
      },
      {
        fn: "\\operatorname{dom}(a^x)",
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      {
        fn: "\\operatorname{dom}(e^x)",
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      // Range
      // Same answer as dom(a^x) / dom(e^x) above — shares key "(-inf,inf)".
      {
        fn: "\\operatorname{ran}(\\ln x)",
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      {
        fn: "\\operatorname{ran}(\\ln|x|)",
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      {
        fn: "\\operatorname{ran}(\\log_a(x))",
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      // Same answer as dom(ln x) / dom(log_a(x)) above — shares key "(0,inf)".
      { fn: "\\operatorname{ran}(a^x)", key: "(0,inf)", ans: "(0, \\infty)" },
      { fn: "\\operatorname{ran}(e^x)", key: "(0,inf)", ans: "(0, \\infty)" },
    ],
  },
  {
    categoryId: "domain-range-inverse-trig",
    items: [
      // Domain
      { fn: "\\operatorname{dom}(\\sin^{-1}x)", key: "[-1,1]", ans: "[-1, 1]" },
      { fn: "\\operatorname{dom}(\\cos^{-1}x)", key: "[-1,1]", ans: "[-1, 1]" },
      {
        fn: "\\operatorname{dom}(\\tan^{-1}x)",
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      {
        fn: "\\operatorname{dom}(\\cot^{-1}x)",
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      {
        fn: "\\operatorname{dom}(\\csc^{-1}x)",
        key: "(-inf,-1]U[1,inf)",
        ans: "(-\\infty, -1] \\cup [1, \\infty)",
      },
      {
        fn: "\\operatorname{dom}(\\sec^{-1}x)",
        key: "(-inf,-1]U[1,inf)",
        ans: "(-\\infty, -1] \\cup [1, \\infty)",
      },
      // Range
      {
        fn: "\\operatorname{ran}(\\sin^{-1}x)",
        key: "[-pi/2,pi/2]",
        ans: "\\left[-\\dfrac{\\pi}{2}, \\dfrac{\\pi}{2}\\right]",
      },
      { fn: "\\operatorname{ran}(\\cos^{-1}x)", key: "[0,pi]", ans: "[0, \\pi]" },
      {
        fn: "\\operatorname{ran}(\\tan^{-1}x)",
        key: "(-pi/2,pi/2)",
        ans: "\\left(-\\dfrac{\\pi}{2}, \\dfrac{\\pi}{2}\\right)",
      },
      {
        fn: "\\operatorname{ran}(\\csc^{-1}x)",
        key: "[-pi/2,0)U(0,pi/2]",
        ans: "\\left[-\\dfrac{\\pi}{2}, 0\\right) \\cup \\left(0, \\dfrac{\\pi}{2}\\right]",
      },
      {
        fn: "\\operatorname{ran}(\\sec^{-1}x)",
        key: "[0,pi/2)U(pi/2,pi]",
        ans: "\\left[0, \\dfrac{\\pi}{2}\\right) \\cup \\left(\\dfrac{\\pi}{2}, \\pi\\right]",
      },
      { fn: "\\operatorname{ran}(\\cot^{-1}x)", key: "(0,pi)", ans: "(0, \\pi)" },
    ],
  },
  {
    categoryId: "domain-range-hyperbolic",
    items: [
      // Domain
      { fn: "\\operatorname{dom}(\\cosh x)", key: "[0,inf)", ans: "[0, \\infty)" },
      {
        fn: "\\operatorname{dom}(\\sinh x)",
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      {
        fn: "\\operatorname{dom}(\\tanh x)",
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      {
        fn: "\\operatorname{dom}(\\operatorname{sech} x)",
        key: "[0,inf)",
        ans: "[0, \\infty)",
      },
      {
        fn: "\\operatorname{dom}(\\operatorname{csch} x)",
        key: "(-inf,0)U(0,inf)",
        ans: "(-\\infty, 0) \\cup (0, \\infty)",
      },
      {
        fn: "\\operatorname{dom}(\\coth x)",
        key: "(-inf,0)U(0,inf)",
        ans: "(-\\infty, 0) \\cup (0, \\infty)",
      },
      // Range
      { fn: "\\operatorname{ran}(\\cosh x)", key: "[1,inf)", ans: "[1, \\infty)" },
      // Same answer as dom(sinh x) / dom(tanh x) above — shares key "(-inf,inf)".
      {
        fn: "\\operatorname{ran}(\\sinh x)",
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      { fn: "\\operatorname{ran}(\\tanh x)", key: "(-1,1)", ans: "(-1, 1)" },
      {
        fn: "\\operatorname{ran}(\\operatorname{sech} x)",
        key: "(0,1]",
        ans: "(0, 1]",
      },
      // Same answer as dom(csch x) / dom(coth x) above — shares key "(-inf,0)U(0,inf)".
      {
        fn: "\\operatorname{ran}(\\operatorname{csch} x)",
        key: "(-inf,0)U(0,inf)",
        ans: "(-\\infty, 0) \\cup (0, \\infty)",
      },
      {
        fn: "\\operatorname{ran}(\\coth x)",
        key: "(-inf,-1)U(1,inf)",
        ans: "(-\\infty, -1) \\cup (1, \\infty)",
      },
    ],
  },
  {
    categoryId: "domain-range-inverse-hyperbolic",
    items: [
      // Domain
      {
        fn: "\\operatorname{dom}(\\cosh^{-1}x)",
        key: "[1,inf)",
        ans: "[1, \\infty)",
      },
      {
        fn: "\\operatorname{dom}(\\sinh^{-1}x)",
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      {
        fn: "\\operatorname{dom}(\\tanh^{-1}x)",
        key: "(-1,1)",
        ans: "(-1, 1)",
      },
      {
        fn: "\\operatorname{dom}(\\operatorname{sech}^{-1}x)",
        key: "(0,1]",
        ans: "(0, 1]",
      },
      {
        fn: "\\operatorname{dom}(\\operatorname{csch}^{-1}x)",
        key: "(-inf,0)U(0,inf)",
        ans: "(-\\infty, 0) \\cup (0, \\infty)",
      },
      {
        fn: "\\operatorname{dom}(\\coth^{-1}x)",
        key: "(-inf,-1)U(1,inf)",
        ans: "(-\\infty, -1) \\cup (1, \\infty)",
      },
      // Range
      {
        fn: "\\operatorname{ran}(\\cosh^{-1}x)",
        key: "[0,inf)",
        ans: "[0, \\infty)",
      },
      // Same answer as dom(sinh^-1 x) above — shares key "(-inf,inf)".
      {
        fn: "\\operatorname{ran}(\\sinh^{-1}x)",
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      {
        fn: "\\operatorname{ran}(\\tanh^{-1}x)",
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      // Same answer as ran(cosh^-1 x) above — shares key "[0,inf)".
      {
        fn: "\\operatorname{ran}(\\operatorname{sech}^{-1}x)",
        key: "[0,inf)",
        ans: "[0, \\infty)",
      },
      // Same answer as dom(csch^-1 x) above — shares key "(-inf,0)U(0,inf)".
      {
        fn: "\\operatorname{ran}(\\operatorname{csch}^{-1}x)",
        key: "(-inf,0)U(0,inf)",
        ans: "(-\\infty, 0) \\cup (0, \\infty)",
      },
      {
        fn: "\\operatorname{ran}(\\coth^{-1}x)",
        key: "(-inf,0)U(0,inf)",
        ans: "(-\\infty, 0) \\cup (0, \\infty)",
      },
    ],
  },
].map(tagKind);