"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Divider, MathText, SectionLabel } from "@/components/ui";
import { getAllCategories } from "@/data";
import type { QuestionKind } from "@/types";
import { buildQuestionQueue, type SprintHandoff, type SprintQuestion } from "@/lib/quiz-engine";
import { getDeviceBestScore } from "@/lib/leaderboard";
import { getDeviceId } from "@/lib/device";
import AnswerOption, { type AnswerOptionStatus } from "./AnswerOption";
import SprintHUD from "./SprintHUD";
import confetti from "canvas-confetti";
import { playCorrect, resetPitch } from "@/lib/sfx";
import SprintResults from "./SprintResults";

/**
 * Sprint mode — a full-screen view-state swap (no route change), ported
 * from the original Derivative Sprint's game loop:
 *   - 60s total run timer, ticking every 100ms.
 *   - 5s per-question countdown, ticking every 40ms (tracked as an elapsed
 *     tick count rather than wall-clock time, so the loop never reaches for
 *     an impure timing API mid-component); auto-reveals as a miss if time
 *     runs out before an answer is chosen.
 *   - Same scoring curve: +10, plus +2 per streak point up to a +10 cap
 *     (i.e. 10 + min(streak, 5) * 2).
 *   - Correct answers advance immediately; wrong/missed answers pause
 *     900ms on the reveal before advancing, exactly as in the original.
 *   - The queue is rebuilt and appended whenever it runs out, so a run
 *     never stalls even on a small category selection.
 * Confetti and the neon palette are intentionally dropped — the design
 * spec calls for "no leftover ed-tech/gamified visual artifacts."
 */

const TOTAL_MS = 60_000;
const Q_MS = 5_000;
const Q_TICK_MS = 40;
const TOTAL_TICK_MS = 100;
/** Answers landing under this land in the "fast" pitch-raising window. */
const FAST_ANSWER_MS = 2_500;

/**
 * Optional mid-stream entry: when provided, the run skips the first
 * question and resumes from the preview's already-shuffled queue with the
 * preview's score/streak carried over. Used by SprintPreview — the landing
 * page's answer-to-start first question — so the timed run continues
 * seamlessly from what the user just answered. Only timers are (re)started
 * here; the preview's points were awarded before the handoff and are never
 * re-scored.
 */
interface SprintViewProps {
  categoryIds: string[];
  /** Question kinds the DOMAIN / RANGE toggles left on — also applied when
   *  the queue is rebuilt mid-run, so a refill never leaks the other kind in. */
  kinds: QuestionKind[];
  onExit: () => void;
  onGameEnd?: () => void;
  handoff?: SprintHandoff;
}

interface RevealedAnswer {
  chosenKey: string | null;
  correctKey: string;
}

function firstQuestionOf(categoryIds: string[], kinds: QuestionKind[]): {
  queue: SprintQuestion[];
  question: SprintQuestion | null;
} {
  const queue = buildQuestionQueue(categoryIds, kinds);
  return { queue, question: queue[0] ?? null };
}

export default function SprintView({
  categoryIds,
  kinds,
  onExit,
  onGameEnd,
  handoff,
}: SprintViewProps) {
  const categoryLabels = useMemo(
    () => new Map(getAllCategories().map((c) => [c.id, c.label])),
    []
  );

  // The queue/first-question pair is computed once, up front, via a plain
  // (non-hook) call — used to seed both the state below and the refs that
  // track it, so no setState call is needed inside an effect just to get
  // the game to its starting position. With a handoff, the queue, cursor
  // and score come from the preview instead and the first question here is
  // the one after the preview's.
  const initialRun = useState(() => {
    if (handoff) {
      return {
        queue: handoff.queue,
        question: handoff.queue[handoff.nextIndex] ?? null,
      };
    }
    return firstQuestionOf(categoryIds, kinds);
  })[0];

  const [phase, setPhase] = useState<"playing" | "ended">("playing");
  const [question, setQuestion] = useState<SprintQuestion | null>(initialRun.question);
  const [answer, setAnswer] = useState<RevealedAnswer | null>(null);
  const [score, setScore] = useState(handoff?.score ?? 0);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [qPercent, setQPercent] = useState(100);
  const [statusMessage, setStatusMessage] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  // Best streak starts from the handoff so a preview-correct answer (streak 1)
  // still counts on the results screen if the run ends before another hit.
  const [bestStreak, setBestStreak] = useState(handoff?.streak ?? 0);
  // This device's best saved score for these categories, read once at the
  // start of the run so the results screen can tell a record run from an
  // ordinary one. Read here rather than on the results screen on purpose: by
  // then autosave may already have overwritten the old best with this very
  // run, making every score look unremarkable. null until the read resolves.
  const [previousBest, setPreviousBest] = useState<number | null>(null);

  // Fast-ticking game-loop bookkeeping lives in refs, not state, so the
  // 40ms/100ms interval callbacks never fight React's batching — only the
  // values that actually need to repaint go through useState. None of
  // these are read during render, only from effects/handlers/timers.
  const queueRef = useRef<SprintQuestion[]>(initialRun.queue);
  const qIndexRef = useRef(handoff?.nextIndex ?? 0);
  const qElapsedRef = useRef(0);
  const streakRef = useRef(handoff?.streak ?? 0);
  const totalTimeLeftRef = useRef(TOTAL_MS);
  const totalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answeredRef = useRef(false);
  const endedRef = useRef(false);
  const questionStartRef = useRef(performance.now());

  function clearTimers() {
    if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    if (qTimerRef.current) clearInterval(qTimerRef.current);
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
  }

  function startTotalTimer() {
    totalTimerRef.current = setInterval(() => {
      totalTimeLeftRef.current -= TOTAL_TICK_MS;
      setSecondsLeft(Math.max(0, Math.ceil(totalTimeLeftRef.current / 1000)));
      if (totalTimeLeftRef.current <= 0) {
        endGame();
      }
    }, TOTAL_TICK_MS);
  }

  /** Starts the 5s countdown for whichever question is currently in state. */
  function startQuestionTimer(q: SprintQuestion) {
    qElapsedRef.current = 0;
    if (qTimerRef.current) clearInterval(qTimerRef.current);
    qTimerRef.current = setInterval(() => {
      qElapsedRef.current += Q_TICK_MS;
      const pct = Math.max(0, 100 - (qElapsedRef.current / Q_MS) * 100);
      setQPercent(pct);
      if (qElapsedRef.current >= Q_MS && !answeredRef.current) {
        revealAnswer(q.correctKey, null);
      }
    }, Q_TICK_MS);
  }

  function endGame() {
    if (endedRef.current) return;
    endedRef.current = true;
    clearTimers();
    resetPitch();
    setPhase("ended");
    onGameEnd?.();
  }

  function nextQuestion() {
    qIndexRef.current += 1;
    if (qIndexRef.current >= queueRef.current.length) {
      queueRef.current = queueRef.current.concat(buildQuestionQueue(categoryIds, kinds));
    }
    const q = queueRef.current[qIndexRef.current];
    if (!q) return;

    answeredRef.current = false;
    questionStartRef.current = performance.now();
    setQuestion(q);
    setAnswer(null);
    setStatusMessage("");
    setQPercent(100);

    startQuestionTimer(q);
  }

  function revealAnswer(correctKey: string, chosenKey: string | null) {
    if (answeredRef.current) return;
    answeredRef.current = true;
    setAnswer({ chosenKey, correctKey });

    const isCorrect = chosenKey === correctKey;

    if (isCorrect) {
      // Subtle confetti burst from the center.
      confetti({ particleCount: 20, spread: 60, startVelocity: 30, gravity: 1, ticks: 90, scalar: 1.6, origin: { x: 0.5, y: 0.6 }, colors: ["#1e3a5f", "#315d8f", "#dce8f5"] });

      const answeredQuickly = performance.now() - questionStartRef.current < FAST_ANSWER_MS;
      playCorrect(answeredQuickly);

      const gained = 10 + Math.min(streakRef.current, 5) * 2;
      streakRef.current += 1;
      setScore((s) => s + gained);
      setCorrectCount((c) => c + 1);
      setBestStreak((b) => Math.max(b, streakRef.current));
      setStatusMessage(streakRef.current > 1 ? `Streak × ${streakRef.current}` : "Correct.");

      if (totalTimeLeftRef.current > 0) {
        nextQuestion();
      }
    } else {
      streakRef.current = 0;
      resetPitch();
      setMissedCount((m) => m + 1);
      setStatusMessage(chosenKey ? "Not quite — keep going." : "Time's up — keep going.");

      revealTimeoutRef.current = setTimeout(() => {
        if (totalTimeLeftRef.current > 0 && !endedRef.current) {
          nextQuestion();
        }
      }, 900);
    }
  }

  function selectAnswer(chosenKey: string, correctKey: string) {
    if (answeredRef.current) return;
    revealAnswer(correctKey, chosenKey);
  }

  /** Full reset — used by the "Run it back" button (an event handler, not an effect). */
  function startGame() {
    clearTimers();

    const run = firstQuestionOf(categoryIds, kinds);
    queueRef.current = run.queue;
    qIndexRef.current = 0;
    streakRef.current = 0;
    totalTimeLeftRef.current = TOTAL_MS;
    answeredRef.current = false;
    endedRef.current = false;
    questionStartRef.current = performance.now();
    resetPitch();

    setPhase("playing");
    setQuestion(run.question);
    setAnswer(null);
    setStatusMessage("");
    setQPercent(100);
    setScore(0);
    setCorrectCount(0);
    setMissedCount(0);
    setBestStreak(0);
    setSecondsLeft(60);

    startTotalTimer();
    if (run.question) startQuestionTimer(run.question);
  }

  // Keyboard shortcuts: A/B/C/D map to options 1–4
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (phase !== "playing" || !question || answeredRef.current) return;
      const key = e.key.toUpperCase();
      if (key.startsWith("ARROW")) return;
      const index = key.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      if (index < 0 || index >= question.options.length) return;
      const opt = question.options[index];
      selectAnswer(opt.key, question.correctKey);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, question]);

  // Mount-only: start the two interval subscriptions for the run that was
  // already seeded synchronously above — no setState call happens directly
  // in this effect body, only inside the interval/timeout callbacks it sets
  // up (which is the pattern React's docs recommend for effects).
  useEffect(() => {
    startTotalTimer();
    if (initialRun.question) startQuestionTimer(initialRun.question);
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One read per run (the component is keyed by category selection, so a new
  // run remounts it). A failure just leaves the best unknown — the results
  // screen then says "Final score" rather than claiming a record it can't
  // verify.
  useEffect(() => {
    let cancelled = false;
    getDeviceBestScore(getDeviceId(), categoryIds)
      .then((best) => {
        if (!cancelled) setPreviousBest(best);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function optionStatus(key: string): AnswerOptionStatus {
    if (!answer) return "default";
    if (key === answer.correctKey) return "correct";
    if (key === answer.chosenKey) return "wrong";
    return "dim";
  }

  // Narrower card inset on phones (`p-5`, not `p-8`): the difference is width
  // the asked function (display math, at text-4xl) and the answer options
  // would otherwise have to be scaled down into. See MathText.
  return (
    <div className="min-h-[36rem]">
        {phase === "playing" && question && (
          <Card className="h-full p-5 sm:p-10">
            <SprintHUD score={score} secondsLeft={secondsLeft} qPercent={qPercent} />

            <div className="mt-8">
              <SectionLabel underline>
                {categoryLabels.get(question.categoryId) ?? ""}
              </SectionLabel>
              <p className="mt-6 font-sans text-sm text-text-muted">
                {question.categoryId.startsWith("integrals") ? "∫" : <>D<sub>x</sub></>} of:
              </p>
              {/*
               * Fixed-height slot for the asked function. A display-style
               * fraction (e.g. \dfrac{1}{x}) is ~2.25em of KaTeX leading —
               * ~5.1rem at the text-4xl (2.25rem) font size used here —
               * versus ~0.7em for a plain function like \sin x. Without a
               * reserved height, a fraction question would stretch the card
               * and shove the options/footer down between questions. The
               * 6rem slot fits the tallest construct in the bank, centered,
               * with room to spare — nothing is ever clipped (mirrors the
               * fixed h-16 on AnswerOption).
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
                  disabled={answer !== null}
                  onClick={() => selectAnswer(opt.key, question.correctKey)}
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
              <button
                type="button"
                onClick={() => { resetPitch(); onExit(); }}
                className="shrink-0 py-0 px-2 font-sans text-xs text-text-muted transition-colors hover:text-navy"
              >
                ≪ Exit sprint
              </button>
            </div>
          </Card>
        )}

        {phase === "ended" && (
          <Card className="h-full p-5 sm:p-10">
            <SprintResults
              score={score}
              previousBest={previousBest}
              correctCount={correctCount}
              missedCount={missedCount}
              bestStreak={bestStreak}
              categoryIds={categoryIds}
              onPlayAgain={onExit}
            />
          </Card>
        )}
    </div>
  );
}