"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, Button, Divider, SectionLabel } from "@/components/ui";
import { writeScore } from "@/lib/leaderboard";
import { getPlayerNameOrDefault } from "@/lib/cookies";
import { getDeviceId } from "@/lib/device";
import { useAutosaveScore } from "@/lib/preferences";

/**
 * How long each message under the score stays up before it trades places with
 * the other one. The headline and the run's status line alternate for as long
 * as the results screen is up, so the score is always paired with what did (or
 * didn't) happen to it; a message that lands once and then sits there reads as
 * if the run had saved.
 */
const MESSAGE_CYCLE_MS = 3000;
/** Matches the duration-500 on the fading wrapper below. */
const FADE_MS = 500;

/**
 * "headline" is the score's own line ("New highscore!" / "Final score"); every
 * other value alternates with it and says what the run's state means for the
 * leaderboard.
 */
type MessageStage = "headline" | "ineligible" | "beaten" | "prompt" | "saved";

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
  const saveable = leaderboardKey !== undefined;

  // Fade in after mount.
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // The message under the score is two slots taking turns: the headline, then
  // whatever the run's state has to say about saving it. `slot` is which one is
  // up; the text itself is derived from the live state below, so a save landing
  // or autosave being toggled shows up on the next render without disturbing
  // the loop. `messageShown` drives the cross-fade between the two.
  const [slot, setSlot] = useState<"headline" | "context">("headline");
  const [messageShown, setMessageShown] = useState(true);
  const [saved, setSaved] = useState(false);
  const timersRef = useRef<number[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  // Writes the run once. Shared by autosave and the click-to-save prompt, and
  // guarded by one ref so the two can never both write (strict mode, a click
  // racing the autosave toggle, a double click). Reset on failure so a retry
  // is possible. writeScore itself only ever keeps the higher score for this
  // device + leaderboard, so a repeat save can never lower what's stored.
  const savedRef = useRef(false);
  const saveRun = useCallback((): boolean => {
    if (leaderboardKey === undefined || savedRef.current) return false;
    savedRef.current = true;
    setSaved(true);
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
      setSaved(false);
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

  // Mount-only loop: alternate the headline and the status line forever, one
  // dwell plus a fade apart. Every timer is tracked so unmounting cancels the
  // whole chain.
  useEffect(() => {
    const timers = timersRef.current;

    function step() {
      later(() => {
        setMessageShown(false);
        later(() => {
          setSlot((current) => (current === "headline" ? "context" : "headline"));
          setMessageShown(true);
          step();
        }, FADE_MS);
      }, MESSAGE_CYCLE_MS);
    }
    step();

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.length = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSaveClick() {
    saveRun();
  }

  // What the headline alternates with. A miss we can't verify (the pre-run best
  // read failed) never claims the score beat the leaderboard — inviting a save
  // is safe there, since writeScore only ever keeps the higher score.
  const contextStage: MessageStage = !saveable
    ? "ineligible"
    : saved || autosaveScore
      ? isNewHighScore || previousBest === null
        ? "saved"
        : "beaten"
      : isNewHighScore || previousBest === null
        ? "prompt"
        : "beaten";

  const displayStage: MessageStage =
    slot === "headline" ? "headline" : contextStage;

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
          for a longer message never moves the score or anything below it, and
          vertically centred so the one-line headline sits in the middle of
          the slot rather than down at the bottom edge. */}
      <div
        role="status"
        aria-live="polite"
        className="mt-3 flex min-h-[2.5rem] items-center justify-center sm:mt-4"
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
          {displayStage === "beaten" && (
            <p className="max-w-xs font-sans text-sm text-text-muted">
              Beat your high score to set a new record!
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
