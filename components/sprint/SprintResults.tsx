"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, Button, Divider, SectionLabel } from "@/components/ui";
import { writeScore } from "@/lib/leaderboard";
import { getPlayerNameOrDefault } from "@/lib/cookies";
import { getDeviceId } from "@/lib/device";
import { useAutosaveScore } from "@/lib/preferences";

/** How long the score headline shows before the message replaces it. */
const HEADLINE_HOLD_MS = 5000;
/** How long the "Click here to save" prompt shows before fading back. */
const PROMPT_HOLD_MS = 4000;
/** Matches the duration-500 on the fading wrapper below. */
const FADE_MS = 500;

type MessageStage = "headline" | "ineligible" | "prompt" | "saved";

interface SprintResultsProps {
  score: number;
  /**
   * The device's best saved score for this category set, read before the run
   * started. `null` means the read hadn't resolved (or failed), so no record
   * claim is made rather than guessing.
   */
  previousBest: number | null;
  correctCount: number;
  missedCount: number;
  bestStreak: number;
  categoryIds: string[];
  /**
   * Which leaderboard this run belongs to (see getLeaderboardKey), or
   * undefined when the selection isn't saveable.
   */
  leaderboardKey: string | undefined;
  onPlayAgain: () => void;
}

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <Card className="p-2.5 sm:p-3">
      <div className="font-serif text-xl text-navy">{value}</div>
      <div className="mt-1 font-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
        {label}
      </div>
    </Card>
  );
}

export default function SprintResults({
  score,
  previousBest,
  correctCount,
  missedCount,
  bestStreak,
  categoryIds,
  leaderboardKey,
  onPlayAgain,
}: SprintResultsProps) {
  const [visible, setVisible] = useState(false);
  const autosaveScore = useAutosaveScore();
  const isNewHighScore = previousBest !== null && score > previousBest;

  // Fade in after mount.
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const saveable = leaderboardKey !== undefined;

  // Message under the score: the headline first, then (after a pause) a
  // message that depends on whether the run can be saved. `shown` drives the
  // fade; `stage` is what's rendered while it's visible.
  const [stage, setStage] = useState<MessageStage>("headline");
  const [messageShown, setMessageShown] = useState(true);
  const stageRef = useRef<MessageStage>("headline");
  const autosaveRef = useRef(autosaveScore);
  const timersRef = useRef<number[]>([]);
  useEffect(() => {
    autosaveRef.current = autosaveScore;
  }, [autosaveScore]);

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  // Fade out, swap the content while invisible, fade back in.
  const swapTo = useCallback(
    (next: MessageStage) => {
      setMessageShown(false);
      later(() => {
        stageRef.current = next;
        setStage(next);
        setMessageShown(true);
      }, FADE_MS);
    },
    [later]
  );

  // Writes the run once. Shared by autosave and the click-to-save prompt, and
  // guarded by one ref so the two can never both write (strict mode, a click
  // racing the autosave toggle, a double click). Reset on failure so a retry
  // is possible. writeScore itself only ever keeps the higher score for this
  // device + leaderboard, so a repeat save can never lower what's stored.
  const savedRef = useRef(false);
  const saveRun = useCallback((): boolean => {
    if (leaderboardKey === undefined || savedRef.current) return false;
    savedRef.current = true;
    writeScore({
      deviceId: getDeviceId(),
      name: getPlayerNameOrDefault(),
      score,
      correctCount,
      missedCount,
      bestStreak,
      categoryIds,
      leaderboardKey,
    }).catch(() => {
      savedRef.current = false;
      if (stageRef.current === "saved") {
        stageRef.current = "prompt";
        setStage("prompt");
      }
    });
    return true;
  }, [leaderboardKey, score, correctCount, missedCount, bestStreak, categoryIds]);

  // Autosave while the setting is on and the run is saveable. This reacts to
  // the setting rather than running once, so turning autosave ON from the
  // leaderboard header after a run that finished with it off saves that run
  // too. Not-saveable runs never write.
  useEffect(() => {
    if (!autosaveScore) return;
    saveRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosaveScore]);

  // Mount-only message timeline.
  useEffect(() => {
    const timers = timersRef.current;
    later(() => {
      if (!saveable) {
        swapTo("ineligible");
        return;
      }
      // Autosave on (or already saved): nothing to prompt for.
      if (autosaveRef.current || savedRef.current) return;

      swapTo("prompt");
      later(() => {
        if (stageRef.current !== "prompt" || autosaveRef.current) return;
        swapTo("headline");
      }, FADE_MS + PROMPT_HOLD_MS);
    }, HEADLINE_HOLD_MS);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.length = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSaveClick() {
    if (!saveRun()) return;
    swapTo("saved");
  }

  // Turning autosave on while the prompt is up retires the prompt.
  const displayStage: MessageStage =
    stage === "prompt" && autosaveScore ? "headline" : stage;

  return (
    // The 32rem floor and the roomy mobile rhythm are desktop sizing: on a
    // phone they pushed the card past the viewport (the whole of "Play again"
    // sat below the fold, with ~70px of dead space above "Time's up"). Below
    // the sm breakpoint the result is sized by its content and spaced tighter,
    // so the score, stats and button all fit one screen.
    <div
      className={`flex flex-col items-center justify-center text-center transition-opacity duration-500 ease-out sm:min-h-[32rem] ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <SectionLabel tone="muted">Time&apos;s up</SectionLabel>

      {/* Fixed-height slot (two lines of text-sm) so swapping the headline
          for a longer message never moves the score or anything below it. */}
      <div
        role="status"
        aria-live="polite"
        className="mt-3 flex min-h-[2.5rem] items-end justify-center sm:mt-4"
      >
        <div
          className={`transition-opacity duration-500 ease-out ${
            messageShown ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {displayStage === "headline" && (
            <p className="font-sans text-sm text-text-muted">
              {isNewHighScore ? "New highscore!" : "Final score"}
            </p>
          )}
          {displayStage === "ineligible" && (
            <p className="max-w-xs font-sans text-sm text-text-muted">
              Only select all topics under the same category to save your score!
            </p>
          )}
          {displayStage === "prompt" && (
            <button
              type="button"
              onClick={handleSaveClick}
              className="rounded-sm px-1 font-sans text-sm font-semibold text-navy underline underline-offset-4 transition-colors hover:text-blue-medium"
            >
              Click here to save your score!
            </button>
          )}
          {displayStage === "saved" && (
            <p className="font-sans text-sm font-semibold text-navy">
              Score saved!
            </p>
          )}
        </div>
      </div>
      <div className="font-serif text-5xl text-navy sm:text-6xl">{score}</div>

      <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-2 sm:mt-8 sm:gap-3">
        <StatBox value={correctCount} label="Correct" />
        <StatBox value={missedCount} label="Missed" />
        <StatBox value={bestStreak} label="Best streak" />
      </div>

      <Divider className="my-6 sm:my-8" />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="primary" size="lg" className="flex-1" onClick={onPlayAgain}>
          Play again
        </Button>
      </div>
    </div>
  );
}
