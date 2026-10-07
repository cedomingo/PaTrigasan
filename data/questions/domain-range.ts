import type { Category, CategoryQuestionBank, QuestionKind } from "@/types";

/**
 * "Domain & Range" subject. Categories are split by function family (like
 * derivatives.ts), and each category mixes both Domain and Range questions
 * for that family's functions.
 *
 * The prompt itself is just the expression (`\sin x`) — which fact is being
 * asked is carried by the question's `kind` and rendered as the "Domain of:"
 * / "Range of:" label above it, rather than by wrapping the expression in
 * `\operatorname{dom}(...)` / `\operatorname{ran}(...)`. Stripping the
 * wrapper is what makes the two facts share a prompt: "Domain of: sin x" and
 * "Range of: sin x" are one expression asked two ways.
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
 * Each item is tagged with the fact it asks about. Stated per item — rather
 * than inferred from the prompt — because the prompt no longer mentions dom()
 * or ran(): the tag is now the only record of which fact is being asked, and
 * the DOMAIN / RANGE filter, the queue and the flashcard deck all read it
 * without having to parse LaTeX.
 */
const DOMAIN: QuestionKind = "domain";
const RANGE: QuestionKind = "range";

export const domainRangeQuestionBanks: CategoryQuestionBank[] = [
  {
    categoryId: "domain-range-trig",
    items: [
      // Domain
      { fn: "\\sin x", kind: DOMAIN, key: "R", ans: "\\mathbb{R}" },
      { fn: "\\cos x", kind: DOMAIN, key: "R", ans: "\\mathbb{R}" },
      {
        fn: "\\tan x",
        kind: DOMAIN,
        key: "R-oddpi2",
        ans: "\\mathbb{R} - \\left\\{(2n+1)\\dfrac{\\pi}{2} : n \\in \\mathbb{Z}\\right\\}",
      },
      {
        fn: "\\cot x",
        kind: DOMAIN,
        key: "R-npi",
        ans: "\\mathbb{R} - \\{n\\pi : n \\in \\mathbb{Z}\\}",
      },
      {
        fn: "\\sec x",
        kind: DOMAIN,
        key: "R-oddpi2",
        ans: "\\mathbb{R} - \\left\\{(2n+1)\\dfrac{\\pi}{2} : n \\in \\mathbb{Z}\\right\\}",
      },
      {
        fn: "\\csc x",
        kind: DOMAIN,
        key: "R-npi",
        ans: "\\mathbb{R} - \\{n\\pi : n \\in \\mathbb{Z}\\}",
      },
      // Range
      { fn: "\\sin x", kind: RANGE, key: "[-1,1]", ans: "[-1, 1]" },
      { fn: "\\cos x", kind: RANGE, key: "[-1,1]", ans: "[-1, 1]" },
      // Same answer as dom(sin x) / dom(cos x) above — shares key "R".
      { fn: "\\tan x", kind: RANGE, key: "R", ans: "\\mathbb{R}" },
      { fn: "\\cot x", kind: RANGE, key: "R", ans: "\\mathbb{R}" },
      {
        fn: "\\sec x",
        kind: RANGE,
        key: "R-(-1,1)",
        ans: "\\mathbb{R} - (-1, 1)",
      },
      {
        fn: "\\csc x",
        kind: RANGE,
        key: "R-(-1,1)",
        ans: "\\mathbb{R} - (-1, 1)",
      },
    ],
  },
  {
    categoryId: "domain-range-logexp",
    items: [
      // Domain
      { fn: "\\ln x", kind: DOMAIN, key: "(0,inf)", ans: "(0, \\infty)" },
      {
        fn: "\\ln|x|",
        kind: DOMAIN,
        key: "(-inf,0)U(0,inf)",
        ans: "(-\\infty, 0) \\cup (0, \\infty)",
      },
      // ln(-x) asks about the negative half-line, so its domain is the one
      // answer in this family nothing else supplies. It earns its place twice
      // over: the family's other answers are (0, ∞), ℝ and (-∞,0) ∪ (0,∞),
      // which left every question picking from only three choices.
      {
        fn: "\\ln(-x)",
        kind: DOMAIN,
        key: "(-inf,0)",
        ans: "(-\\infty, 0)",
      },
      // Same answer as dom(ln x) above — shares key "(0,inf)".
      {
        fn: "\\log_a(x)",
        kind: DOMAIN,
        key: "(0,inf)",
        ans: "(0, \\infty)",
      },
      // The whole real line is written ℝ here, the all-real symbol the
      // trigonometric families already use, rather than spelled out as
      // (-∞, ∞).
      {
        fn: "a^x",
        kind: DOMAIN,
        key: "(-inf,inf)",
        ans: "\\mathbb{R}",
      },
      {
        fn: "e^x",
        kind: DOMAIN,
        key: "(-inf,inf)",
        ans: "\\mathbb{R}",
      },
      // Range
      // Same answer as dom(a^x) / dom(e^x) above — shares key "(-inf,inf)".
      {
        fn: "\\ln x",
        kind: RANGE,
        key: "(-inf,inf)",
        ans: "\\mathbb{R}",
      },
      {
        fn: "\\ln|x|",
        kind: RANGE,
        key: "(-inf,inf)",
        ans: "\\mathbb{R}",
      },
      {
        fn: "\\log_a(x)",
        kind: RANGE,
        key: "(-inf,inf)",
        ans: "\\mathbb{R}",
      },
      // Same answer as dom(ln x) / dom(log_a(x)) above — shares key "(0,inf)".
      { fn: "a^x", kind: RANGE, key: "(0,inf)", ans: "(0, \\infty)" },
      { fn: "e^x", kind: RANGE, key: "(0,inf)", ans: "(0, \\infty)" },
    ],
  },
  {
    categoryId: "domain-range-inverse-trig",
    items: [
      // Domain
      { fn: "\\sin^{-1}x", kind: DOMAIN, key: "[-1,1]", ans: "[-1, 1]" },
      { fn: "\\cos^{-1}x", kind: DOMAIN, key: "[-1,1]", ans: "[-1, 1]" },
      {
        fn: "\\tan^{-1}x",
        kind: DOMAIN,
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      {
        fn: "\\cot^{-1}x",
        kind: DOMAIN,
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      {
        fn: "\\csc^{-1}x",
        kind: DOMAIN,
        key: "(-inf,-1]U[1,inf)",
        ans: "(-\\infty, -1] \\cup [1, \\infty)",
      },
      {
        fn: "\\sec^{-1}x",
        kind: DOMAIN,
        key: "(-inf,-1]U[1,inf)",
        ans: "(-\\infty, -1] \\cup [1, \\infty)",
      },
      // Range
      {
        fn: "\\sin^{-1}x",
        kind: RANGE,
        key: "[-pi/2,pi/2]",
        ans: "\\left[-\\dfrac{\\pi}{2}, \\dfrac{\\pi}{2}\\right]",
      },
      {
        fn: "\\cos^{-1}x",
        kind: RANGE,
        key: "[0,pi]",
        ans: "[0, \\pi]",
      },
      {
        fn: "\\tan^{-1}x",
        kind: RANGE,
        key: "(-pi/2,pi/2)",
        ans: "\\left(-\\dfrac{\\pi}{2}, \\dfrac{\\pi}{2}\\right)",
      },
      {
        fn: "\\csc^{-1}x",
        kind: RANGE,
        key: "[-pi/2,0)U(0,pi/2]",
        ans: "\\left[-\\dfrac{\\pi}{2}, 0\\right) \\cup \\left(0, \\dfrac{\\pi}{2}\\right]",
      },
      {
        fn: "\\sec^{-1}x",
        kind: RANGE,
        key: "[0,pi/2)U(pi/2,pi]",
        ans: "\\left[0, \\dfrac{\\pi}{2}\\right) \\cup \\left(\\dfrac{\\pi}{2}, \\pi\\right]",
      },
      {
        fn: "\\cot^{-1}x",
        kind: RANGE,
        key: "(0,pi)",
        ans: "(0, \\pi)",
      },
    ],
  },
  {
    categoryId: "domain-range-hyperbolic",
    items: [
      // Domain
      { fn: "\\cosh x", kind: DOMAIN, key: "[0,inf)", ans: "[0, \\infty)" },
      {
        fn: "\\sinh x",
        kind: DOMAIN,
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      {
        fn: "\\tanh x",
        kind: DOMAIN,
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      {
        fn: "\\operatorname{sech} x",
        kind: DOMAIN,
        key: "[0,inf)",
        ans: "[0, \\infty)",
      },
      {
        fn: "\\operatorname{csch} x",
        kind: DOMAIN,
        key: "(-inf,0)U(0,inf)",
        ans: "(-\\infty, 0) \\cup (0, \\infty)",
      },
      {
        fn: "\\coth x",
        kind: DOMAIN,
        key: "(-inf,0)U(0,inf)",
        ans: "(-\\infty, 0) \\cup (0, \\infty)",
      },
      // Range
      { fn: "\\cosh x", kind: RANGE, key: "[1,inf)", ans: "[1, \\infty)" },
      // Same answer as dom(sinh x) / dom(tanh x) above — shares key "(-inf,inf)".
      {
        fn: "\\sinh x",
        kind: RANGE,
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      { fn: "\\tanh x", kind: RANGE, key: "(-1,1)", ans: "(-1, 1)" },
      {
        fn: "\\operatorname{sech} x",
        kind: RANGE,
        key: "(0,1]",
        ans: "(0, 1]",
      },
      // Same answer as dom(csch x) / dom(coth x) above — shares key "(-inf,0)U(0,inf)".
      {
        fn: "\\operatorname{csch} x",
        kind: RANGE,
        key: "(-inf,0)U(0,inf)",
        ans: "(-\\infty, 0) \\cup (0, \\infty)",
      },
      {
        fn: "\\coth x",
        kind: RANGE,
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
        fn: "\\cosh^{-1}x",
        kind: DOMAIN,
        key: "[1,inf)",
        ans: "[1, \\infty)",
      },
      {
        fn: "\\sinh^{-1}x",
        kind: DOMAIN,
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      {
        fn: "\\tanh^{-1}x",
        kind: DOMAIN,
        key: "(-1,1)",
        ans: "(-1, 1)",
      },
      {
        fn: "\\operatorname{sech}^{-1}x",
        kind: DOMAIN,
        key: "(0,1]",
        ans: "(0, 1]",
      },
      {
        fn: "\\operatorname{csch}^{-1}x",
        kind: DOMAIN,
        key: "(-inf,0)U(0,inf)",
        ans: "(-\\infty, 0) \\cup (0, \\infty)",
      },
      {
        fn: "\\coth^{-1}x",
        kind: DOMAIN,
        key: "(-inf,-1)U(1,inf)",
        ans: "(-\\infty, -1) \\cup (1, \\infty)",
      },
      // Range
      {
        fn: "\\cosh^{-1}x",
        kind: RANGE,
        key: "[0,inf)",
        ans: "[0, \\infty)",
      },
      // Same answer as dom(sinh^-1 x) above — shares key "(-inf,inf)".
      {
        fn: "\\sinh^{-1}x",
        kind: RANGE,
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      {
        fn: "\\tanh^{-1}x",
        kind: RANGE,
        key: "(-inf,inf)",
        ans: "(-\\infty, \\infty)",
      },
      // Same answer as ran(cosh^-1 x) above — shares key "[0,inf)".
      {
        fn: "\\operatorname{sech}^{-1}x",
        kind: RANGE,
        key: "[0,inf)",
        ans: "[0, \\infty)",
      },
      // Same answer as dom(csch^-1 x) above — shares key "(-inf,0)U(0,inf)".
      {
        fn: "\\operatorname{csch}^{-1}x",
        kind: RANGE,
        key: "(-inf,0)U(0,inf)",
        ans: "(-\\infty, 0) \\cup (0, \\infty)",
      },
      {
        fn: "\\coth^{-1}x",
        kind: RANGE,
        key: "(-inf,0)U(0,inf)",
        ans: "(-\\infty, 0) \\cup (0, \\infty)",
      },
    ],
  },
];
