import assert from "node:assert/strict";
import { test } from "node:test";
import { getAllSubjects } from "@/data";
import type { CategoryQuestionBank, Subject } from "@/types";
import { buildSummary } from "./summary";

test("no selection produces no cards", () => {
  assert.deepEqual(buildSummary([]), []);
  assert.deepEqual(buildSummary(new Set<string>()), []);
});

test("one category of one subject lists every item in data order", () => {
  const summary = buildSummary(["unit-circle-trig"]);

  assert.equal(summary.length, 1);
  assert.equal(summary[0].subjectId, "unit-circle");
  assert.equal(summary[0].name, "Unit Circle");
  assert.deepEqual(
    summary[0].categories.map((category) => category.categoryId),
    ["unit-circle-trig"]
  );
  assert.equal(summary[0].categories[0].rows.length, 13);
  assert.deepEqual(summary[0].categories[0].rows[1], {
    prefix: "Evaluate",
    prompt: "\\sin \\dfrac{\\pi}{6}",
    answer: "\\dfrac{1}{2}",
  });
});

test("a partial subject shows only its selected categories, in registry order", () => {
  const summary = buildSummary([
    "derivatives-hyperbolic",
    "derivatives-trig",
  ]);

  assert.equal(summary.length, 1);
  assert.deepEqual(
    summary[0].categories.map((category) => category.categoryId),
    ["derivatives-trig", "derivatives-hyperbolic"]
  );
});

test("two subjects keep registry order regardless of selection order", () => {
  const summary = buildSummary(["integrals-power", "unit-circle-inverse-trig"]);

  assert.deepEqual(
    summary.map((subject) => subject.subjectId),
    ["unit-circle", "integrals"]
  );
});

test("all subjects produce 4 cards, 16 sections and 142 rows", () => {
  const selected = getAllIds();
  const summary = buildSummary(selected);

  assert.deepEqual(
    summary.map((subject) => subject.subjectId),
    ["unit-circle", "domain-range", "derivatives", "integrals"]
  );
  assert.equal(summary.reduce((n, s) => n + s.categories.length, 0), 16);
  assert.equal(
    summary.reduce(
      (n, s) => n + s.categories.reduce((m, c) => m + c.rows.length, 0),
      0
    ),
    142
  );
});

test("domain and range rows use the kind's prefix", () => {
  const [subject] = buildSummary(["domain-range-trig"]);
  const rows = subject.categories[0].rows;

  assert.equal(rows.length, 12);
  assert.equal(rows[0].prefix, "Domain of:");
  assert.equal(rows[6].prefix, "Range of:");
  // Items stay in data-file order: all six domain rows, then all six range rows.
  assert.deepEqual(
    rows.map((row) => row.prefix),
    [
      "Domain of:",
      "Domain of:",
      "Domain of:",
      "Domain of:",
      "Domain of:",
      "Domain of:",
      "Range of:",
      "Range of:",
      "Range of:",
      "Range of:",
      "Range of:",
      "Range of:",
    ]
  );
});

test("subjects with no explicit label fall back to their default prefix", () => {
  const derivatives = buildSummary(["derivatives-trig"])[0].categories[0].rows;
  const integrals = buildSummary(["integrals-power"])[0].categories[0].rows;

  assert.equal(derivatives[0].prefix, "Dₓ of:");
  assert.equal(integrals[0].prefix, "∫ of:");
});

test("a category with 0 cards is skipped, and an empty subject disappears", () => {
  const subjects: Subject[] = [
    {
      id: "fixture",
      name: "Fixture",
      categories: [
        {
          id: "fixture-empty",
          label: "Empty",
          subject: "Fixture",
          subjectId: "fixture",
        },
        {
          id: "fixture-full",
          label: "Full",
          subject: "Fixture",
          subjectId: "fixture",
        },
        {
          id: "fixture-missing",
          label: "Missing",
          subject: "Fixture",
          subjectId: "fixture",
        },
      ],
    },
    {
      id: "fixture-blank",
      name: "Blank",
      categories: [
        {
          id: "fixture-blank-empty",
          label: "Nothing",
          subject: "Blank",
          subjectId: "fixture-blank",
        },
      ],
    },
  ];

  const banks: Record<string, CategoryQuestionBank> = {
    "fixture-empty": { categoryId: "fixture-empty", items: [] },
    "fixture-full": {
      categoryId: "fixture-full",
      items: [{ fn: "x", key: "x", ans: "x" }],
    },
    "fixture-blank-empty": { categoryId: "fixture-blank-empty", items: [] },
  };

  const summary = buildSummary(
    ["fixture-empty", "fixture-full", "fixture-missing", "fixture-blank-empty"],
    subjects,
    (categoryId) => banks[categoryId]
  );

  assert.equal(summary.length, 1);
  assert.equal(summary[0].subjectId, "fixture");
  assert.deepEqual(
    summary[0].categories.map((category) => category.categoryId),
    ["fixture-full"]
  );

  assert.deepEqual(
    buildSummary(["fixture-empty", "fixture-blank-empty"], subjects, (id) => banks[id]),
    []
  );
});

/** Every registered category id, in registry order. */
function getAllIds(): string[] {
  return getAllSubjects().flatMap((subject) =>
    subject.categories.map((category) => category.id)
  );
}
