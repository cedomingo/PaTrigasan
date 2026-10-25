"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button, Divider, SectionLabel } from "@/components/ui";
import {
  LIBRARY_NAME_MAX_LENGTH,
  cleanLibraryName,
  writeLibraryScore,
} from "@/lib/leaderboard";
import { getDeviceId } from "@/lib/device";
import { StatBox } from "./SprintResults";

/**
 * Results screen for the library site (/mathlib). Nothing is saved on its own:
 * when the run is eligible for a leaderboard it asks for a name and a Save
 * button (leaving without saving is just "Play again"). The field always starts empty — the computer is shared, so the last
 * student's name must never be offered to the next one.
 *
 * Eligibility is the same rule as the public site (see getLeaderboardKey): the
 * selection has to be every topic of one category, or all of them. Otherwise
 * `leaderboardKey` is undefined and the name prompt never appears.
 */

type Status = "asking" | "saving" | "saved" | "error";

interface LibrarySprintResultsProps {
  score: number;
  correctCount: number;
  missedCount: number;
  bestStreak: number;
  categoryIds: string[];
  /** The board this run counts toward, or undefined when it isn't eligible. */
  leaderboardKey: string | undefined;
  onPlayAgain: () => void;
}

export default function LibrarySprintResults({
  score,
  correctCount,
  missedCount,
  bestStreak,
  categoryIds,
  leaderboardKey,
  onPlayAgain,
}: LibrarySprintResultsProps) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("asking");

  const eligible = leaderboardKey !== undefined;
  const cleanName = cleanLibraryName(name);
  const canSave = cleanName.length > 0 && status !== "saving";

  // Fade in after mount.
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!eligible || !canSave) return;
    setStatus("saving");
    try {
      await writeLibraryScore({
        deviceId: getDeviceId(),
        name: cleanName,
        score,
        correctCount,
        missedCount,
        bestStreak,
        categoryIds,
        leaderboardKey,
      });
      setStatus("saved");
    } catch {
      // Unlike the public site's silent autosave, say so and let them retry —
      // a kiosk user would otherwise assume the score was saved.
      setStatus("error");
    }
  }

  return (
    <div
      className={`flex flex-col items-center justify-center text-center transition-opacity duration-500 ease-out sm:min-h-[32rem] ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <SectionLabel tone="muted">Time&apos;s up</SectionLabel>
      <p className="mt-3 font-sans text-sm text-text-muted sm:mt-4">Final score</p>
      <div className="font-serif text-5xl text-navy sm:text-6xl">{score}</div>

      <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-2 sm:mt-8 sm:gap-3">
        <StatBox value={correctCount} label="Correct" />
        <StatBox value={missedCount} label="Missed" />
        <StatBox value={bestStreak} label="Best streak" />
      </div>

      <Divider className="my-6 sm:my-8" />

      <div role="status" aria-live="polite" className="w-full max-w-sm">
        {!eligible && (
          <p className="font-sans text-sm text-text-muted">
            Only select all topics under the same category to save your score!
          </p>
        )}

        {eligible && (status === "asking" || status === "saving" || status === "error") && (
          <form onSubmit={handleSave}>
            <label
              htmlFor="library-player-name"
              className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.08em] text-text-muted"
            >
              Your namehttps://github.com/cedomingo/PaTrigasan
            </label>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <input
                id="library-player-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Isko"
                maxLength={LIBRARY_NAME_MAX_LENGTH}
                autoComplete="off"
                disabled={status === "saving"}
                className="w-32 rounded-sm border border-border bg-white px-3 py-2 text-center font-sans text-sm text-text placeholder:text-text-muted focus:border-blue-medium disabled:opacity-60"
              />
              <Button type="submit" variant="primary" disabled={!canSave}>
                {status === "saving" ? "Saving…" : "Save"}
              </Button>
            </div>
            {status === "error" && (
              <p className="mt-2 font-sans text-sm text-text-muted">
                Couldn&apos;t save your score. Please try again.
              </p>
            )}
          </form>
        )}

        {eligible && status === "saved" && (
          <p className="font-sans text-sm font-semibold text-navy">Score saved!</p>
        )}
      </div>

      <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
        <Button variant="primary" size="lg" className="flex-1" onClick={onPlayAgain}>
          Play again
        </Button>
      </div>
    </div>
  );
}