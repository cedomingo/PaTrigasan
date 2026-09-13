"use client";

import { useEffect, useRef, useState } from "react";
import { Card, Button, Divider, SectionLabel } from "@/components/ui";
import { writeScore } from "@/lib/leaderboard";
import { getPlayerNameOrDefault } from "@/lib/cookies";
import { getDeviceId } from "@/lib/device";
import { useAutosaveScore } from "@/lib/preferences";

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
  onPlayAgain: () => void;
}

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <Card className="p-3">
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
  onPlayAgain,
}: SprintResultsProps) {
  const [visible, setVisible] = useState(false);
  const autosaveScore = useAutosaveScore();
  const savedRef = useRef(false);
  const isNewHighScore = previousBest !== null && score > previousBest;

  // Fade in after mount.
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Autosave the finished run while the setting is on. Because this reacts to
  // the setting rather than running once on mount, it also covers the player
  // turning autosave ON from the results screen after a run that finished with
  // it off — the run is saved then, under the same rules. writeScore only ever
  // keeps the higher score for this device + category set, so a repeat attempt
  // can never lower what's already stored, and renaming yourself relabels the
  // existing row instead of adding a second one.
  //
  // The ref guard prevents a double write in React strict mode / concurrent
  // renders; it's reset on failure so a later toggle can retry.
  useEffect(() => {
    if (!autosaveScore || savedRef.current) return;

    const name = getPlayerNameOrDefault();

    savedRef.current = true;
    writeScore({
      deviceId: getDeviceId(),
      name,
      score,
      correctCount,
      missedCount,
      bestStreak,
      categoryIds,
    }).catch(() => {
      savedRef.current = false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosaveScore]);

  return (
    <div
      className={`flex min-h-[32rem] flex-col items-center justify-center text-center transition-opacity duration-500 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <SectionLabel tone="muted">Time&apos;s up</SectionLabel>

      <p className="mt-4 font-sans text-sm text-text-muted">
        {isNewHighScore ? "New highscore!" : "Final score"}
      </p>
      <div className="font-serif text-6xl text-navy">{score}</div>

      <div className="mx-auto mt-8 grid max-w-sm grid-cols-3 gap-3">
        <StatBox value={correctCount} label="Correct" />
        <StatBox value={missedCount} label="Missed" />
        <StatBox value={bestStreak} label="Best streak" />
      </div>

      <Divider className="my-8" />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="primary" size="lg" className="flex-1" onClick={onPlayAgain}>
          Play again
        </Button>
      </div>
    </div>
  );
}
