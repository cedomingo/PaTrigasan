"use client";

import { useState } from "react";
import { Card, Button, Divider, SectionLabel } from "@/components/ui";
import NameInput from "@/components/landing/NameInput";
import { writeScore } from "@/lib/leaderboard";

interface SprintResultsProps {
  score: number;
  correctCount: number;
  missedCount: number;
  bestStreak: number;
  categoryIds: string[];
  name: string;
  onNameChange: (name: string) => void;
  onReplay: () => void;
  onExit: () => void;
}

type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * The end-of-run screen. Stats are final the moment this mounts — nothing
 * here affects the score. Saving to the leaderboard is a separate,
 * explicit step (not automatic) so a player who typo'd their name, or
 * hasn't set one yet, gets a chance to confirm it before it's written to
 * Firestore, per the roadmap's "name-confirm step if needed."
 */
export default function SprintResults({
  score,
  correctCount,
  missedCount,
  bestStreak,
  categoryIds,
  name,
  onNameChange,
  onReplay,
  onExit,
}: SprintResultsProps) {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const trimmedName = name.trim();

  async function handleSave() {
    if (!trimmedName) return;
    setSaveState("saving");
    try {
      await writeScore({
        name: trimmedName,
        score,
        correctCount,
        missedCount,
        bestStreak,
        categoryIds,
      });
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  return (
    <div className="flex min-h-[32rem] flex-col items-center justify-center text-center">
      <SectionLabel tone="muted">Time&apos;s up</SectionLabel>

      <p className="mt-4 font-sans text-sm text-text-muted">Final score</p>
      <div className="font-serif text-6xl text-navy">{score}</div>

      <div className="mx-auto mt-8 grid max-w-sm grid-cols-3 gap-3">
        <StatBox value={correctCount} label="Correct" />
        <StatBox value={missedCount} label="Missed" />
        <StatBox value={bestStreak} label="Best streak" />
      </div>

      <Divider className="my-8" />

      {saveState === "saved" ? (
        <p className="font-sans text-sm text-correct">
          Saved to the leaderboard as {trimmedName}.
        </p>
      ) : (
        <div className="mx-auto max-w-xs text-left">
          <NameInput name={name} onChange={onNameChange} />
          <Button
            variant="primary"
            size="md"
            className="mt-3 w-full"
            disabled={!trimmedName || saveState === "saving"}
            onClick={handleSave}
          >
            {saveState === "saving" ? "Saving…" : "Save to leaderboard"}
          </Button>
          {saveState === "error" && (
            <p className="mt-2 font-sans text-xs text-wrong">
              Couldn&apos;t save your score — try again.
            </p>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button variant="primary" size="lg" className="flex-1" onClick={onReplay}>
          Run it back
        </Button>
        <Button variant="secondary" size="lg" className="flex-1" onClick={onExit}>
          Back to home
        </Button>
      </div>
    </div>
  );
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
