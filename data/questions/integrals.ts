import type { Category, CategoryQuestionBank } from "@/types";

/**
 * "Integrals" subject — the antidifferentiation rules, grouped by family the
 * same way derivatives.ts groups its rules: each family becomes one Category,
 * and its items become one CategoryQuestionBank. Registered in
 * /data/subjects.ts; nothing outside /data needs to change.
 *
 * Prompts are written as the integrand plus `\,dx` — the quiz UI adds the
 * leading "∫ of:" label for any category id starting with "integrals", so
 * `fn` never contains the integral sign itself. Answers carry the `+C`.
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
  {
    id: "integrals-inverse-trig",
    label: "Inverse Trigonometric",
    subject: INTEGRALS_SUBJECT_NAME,
    subjectId: INTEGRALS_SUBJECT_ID,
  },
  {
    id: "integrals-hyperbolic",
    label: "Hyperbolic",
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
      { fn: "\\csc x\\cot x\\,dx", key: "-csc", ans: "-\\csc x+C" },
      { fn: "\\tan x\\,dx", key: "ln|sec|", ans: "\\ln|\\sec x|+C" },
      { fn: "\\cot x\\,dx", key: "ln|sin|", ans: "\\ln|\\sin x|+C" },
      { fn: "\\sec x\\,dx", key: "ln|sec+tan|", ans: "\\ln|\\sec x+\\tan x|+C" },
      { fn: "\\csc x\\,dx", key: "ln|csc-cot|", ans: "\\ln|\\csc x-\\cot x|+C" },
    ],
  },
  {
    categoryId: "integrals-inverse-trig",
    items: [
      {
        fn: "\\dfrac{1}{\\sqrt{a^2-x^2}}\\,dx",
        key: "sin-1(x/a)",
        ans: "\\sin^{-1}\\left(\\dfrac{x}{a}\\right)+C",
      },
      {
        fn: "\\dfrac{1}{a^2+x^2}\\,dx",
        key: "tan-1(x/a)/a",
        ans: "\\dfrac{1}{a}\\tan^{-1}\\left(\\dfrac{x}{a}\\right)+C",
      },
      {
        fn: "\\dfrac{1}{x\\sqrt{x^2-a^2}}\\,dx",
        key: "sec-1(x/a)/a",
        ans: "\\dfrac{1}{a}\\sec^{-1}\\left(\\dfrac{x}{a}\\right)+C",
      },
    ],
  },
  {
    categoryId: "integrals-hyperbolic",
    items: [
      { fn: "\\sinh x\\,dx", key: "cosh", ans: "\\cosh x+C" },
      { fn: "\\cosh x\\,dx", key: "sinh", ans: "\\sinh x+C" },
      { fn: "\\operatorname{sech}^2 x\\,dx", key: "tanh", ans: "\\tanh x+C" },
      { fn: "\\operatorname{csch}^2 x\\,dx", key: "-coth", ans: "-\\coth x+C" },
      {
        fn: "\\operatorname{sech} x\\tanh x\\,dx",
        key: "-sech",
        ans: "-\\operatorname{sech} x+C",
      },
      {
        fn: "\\operatorname{csch} x\\coth x\\,dx",
        key: "-csch",
        ans: "-\\operatorname{csch} x+C",
      },
      { fn: "\\tanh x\\,dx", key: "ln(cosh)", ans: "\\ln(\\cosh x)+C" },
      { fn: "\\coth x\\,dx", key: "ln|sinh|", ans: "\\ln|\\sinh x|+C" },
      { fn: "\\operatorname{sech} x\\,dx", key: "2tan-1(ex)", ans: "2\\tan^{-1}(e^x)+C" },
      {
        fn: "\\operatorname{csch} x\\,dx",
        key: "ln|csch-coth|",
        ans: "\\ln|\\operatorname{csch} x-\\coth x|+C",
      },
    ],
  },
];