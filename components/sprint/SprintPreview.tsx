"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Divider, MathText, SectionLabel } from "@/components/ui";
import { getAllCategories } from "@/data";
import type { QuestionKind } from "@/types";
import {
  buildQuestionQueue,
  buildSprintHandoff,
  type SprintHandoff,
  type SprintQuestion,
} from "@/lib/quiz-engine";
import confetti from "canvas-confetti";
import { playCorrect } from "@/lib/sfx";
import AnswerOption, { type AnswerOptionStatus } from "./AnswerOption";
import SprintHUD from "./SprintHUD";

/**
 * Pre-start Sprint preview, shown on the landing page in place of a static
 * "press start" gate: the first question of the current selection is live
 * and answerable right here.
 *
 *   - The HUD is visible but frozen (60s left, full bar) — the run's
 *     timers only start once the question is answered correctly, never
 *     before.
 *   - A wrong pick shows inline feedback for the same reveal cadence the
 *     run uses (900ms), then resets the same question for another try.
 *     No points, no advancing, no lockout.
 *   - The correct pick awards full points for the question immediately
 *     (only the correct attempt scores) and, after the reveal settles,
 *     hands the already-shuffled queue off to SprintView, which starts
 *     the 60s run at that exact moment on the next question.
 *
 * The parent remounts this component (via `key`) when the category
 * selection changes, which regenerates the first question from the new
 * selection — no internal sync logic needed.
 */

/** Reveal-pause duration; matches SprintView's 900ms. */
const REVEAL_MS = 900;
/** Frozen HUD values; mirror a fresh run's starting state in SprintView. */
const PREVIEW_SECONDS = 60;
const PREVIEW_SCORE = 0;

interface SprintPreviewProps {
  categoryIds: string[];
  /** Question kinds the DOMAIN / RANGE toggles left on. */
  kinds: QuestionKind[];
  onHandoff: (handoff: SprintHandoff) => void;
}

type PreviewPhase = "answering" | "revealed";

/** First question of a fresh, shuffled queue for the given categories. */
function firstQuestionOf(categoryIds: string[], kinds: QuestionKind[]): {
  queue: SprintQuestion[];
  question: SprintQuestion | null;
} {
  const queue = buildQuestionQueue(categoryIds, kinds);
  return { queue, question: queue[0] ?? null };
}

export default function SprintPreview({
  categoryIds,
  kinds,
  onHandoff,
}: SprintPreviewProps) {
  const categoryLabels = useMemo(
    () => new Map(getAllCategories().map((c) => [c.id, c.label])),
    []
  );

  // Computed once per mount via a plain (non-hook) call — the parent
  // remounts this component with a new `key` when the category selection
  // changes, so a fresh queue/question is generated then without any
  // sync-to-props effect.
  const initial = useState(() => firstQuestionOf(categoryIds, kinds))[0];

  const [phase, setPhase] = useState<PreviewPhase>("answering");
  const [chosenKey, setChosenKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Choose the correct answer."
  );

  const answeredRef = useRef(false);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearRevealTimeout() {
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    revealTimeoutRef.current = null;
  }

  // Mount-only cleanup: the reveal timeout must not fire after unmount
  // (e.g. the user changed categories or exited mid-reveal).
  useEffect(() => {
    return () => clearRevealTimeout();
  }, []);

  function selectAnswer(key: string) {
    if (answeredRef.current || !initial.question) return;
    answeredRef.current = true;

    const isCorrect = key === initial.question.correctKey;
    setChosenKey(key);
    setPhase("revealed");

    if (isCorrect) {
      // Subtle confetti + sound on correct preview answer.
      confetti({ particleCount: 20, spread: 60, startVelocity: 30, gravity: 1, ticks: 90, scalar: 1.6, origin: { x: 0.5, y: 0.6 }, colors: ["#1e3a5f", "#315d8f", "#dce8f5"] });
      playCorrect(true);

      // Full points for the first-question answer, streak starting at 0 —
      // the same curve the run uses. Hand off immediately so SprintView
      // starts the timers on the *next* question (index 1), not the one
      // the user just answered.
      const handoff = buildSprintHandoff(initial.queue, 1, 0);
      onHandoff(handoff);
    } else {
      // Inline feedback only: mark the pick wrong, keep the correct answer
      // unrevealed, then let them retry the same question.
      revealTimeoutRef.current = setTimeout(() => {
        answeredRef.current = false;
        setChosenKey(null);
        setPhase("answering");
      }, REVEAL_MS);
    }
  }

  // Keyboard shortcuts: A/B/C/D map to options 1–4, guarded against text
  // inputs (the name field shares this page, unlike the full-screen run).
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (answeredRef.current || !initial.question) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      const key = e.key.toUpperCase();
      if (key.startsWith("ARROW")) return;
      const index = key.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      if (index < 0 || index >= initial.question.options.length) return;
      selectAnswer(initial.question.options[index].key);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  function optionStatus(key: string): AnswerOptionStatus {
    if (phase !== "revealed" || chosenKey === null || !initial.question) {
      return "default";
    }
    const isCorrect = chosenKey === initial.question.correctKey;
    if (isCorrect) {
      return key === initial.question.correctKey ? "correct" : "dim";
    }
    // Wrong pick: mark only the chosen option, keep the correct answer
    // unrevealed so the retry isn't a giveaway.
    return key === chosenKey ? "wrong" : "default";
  }

  const question = initial.question;
  if (!question) return null;

  // Narrower inset on phones: the difference is width the asked function
  // (display math, text-4xl) would otherwise have to be scaled down into.
  return (
    <Card className="min-h-[36rem] p-5 sm:p-10">
      <SprintHUD score={PREVIEW_SCORE} secondsLeft={PREVIEW_SECONDS} qPercent={100} />

      <div className="mt-8">
        <SectionLabel underline>
          {categoryLabels.get(question.categoryId) ?? ""}
        </SectionLabel>        <p className="mt-6 font-sans text-sm text-text-muted">
            {question.categoryId.startsWith("integrals") ? "∫" : <>D<sub>x</sub></>} of:
          </p>
        {/*
         * Fixed-height slot for the asked function. A display-style fraction
         * (e.g. \dfrac{1}{x}) is ~2.25em of KaTeX leading — ~5.1rem at the
         * text-4xl (2.25rem) font size used here — versus ~0.7em for a plain
         * function like \sin x. Without a reserved height a fraction would
         * stretch the card and shift the layout down (mirrors the fixed h-16
         * on AnswerOption). The 6rem slot fits the tallest construct in the
         * bank, centered, with room to spare — nothing is ever clipped.
         */}
        <div className="mt-1 flex h-24 items-center justify-center overflow-visible">
          <MathText latex={question.fn} display className="text-4xl" />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((opt, i) => (
          <AnswerOption
            key={`${opt.key}-${i}`}
            label={String.fromCharCode(65 + i)}
            latex={opt.ans}
            status={optionStatus(opt.key)}
            disabled={phase !== "answering"}
            onClick={() => selectAnswer(opt.key)}
          />
        ))}
      </div>

      <Divider className="mt-8" />
      <div className="mt-3 flex min-h-[1.25rem] items-center justify-between">
        <p
          role="status"
          aria-live="polite"
          className="font-sans text-xs text-text-muted"
        >
          {statusMessage}
        </p>
      </div>
    </Card>
  );
}