"use client";

import { useState } from "react";
import { Card, Button, Divider, SectionLabel } from "@/components/ui";
import { writeScore } from "@/lib/leaderboard";
import { getPlayerName } from "@/lib/cookies";

interface SprintResultsProps {
  score: number;
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
  correctCount,
  missedCount,
  bestStreak,
  categoryIds,
  onPlayAgain,
}: SprintResultsProps) {
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    const name = getPlayerName().trim();
    if (!name) return;
    try {
      await writeScore({
        name,
        score,
        correctCount,
        missedCount,
        bestStreak,
        categoryIds,
      });
      setSaved(true);
    } catch {
      // silently ignore
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="primary" size="lg" className="flex-1" onClick={onPlayAgain}>
          Play again
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? "Saved ✓" : "Save score"}
        </Button>
      </div>
    </div>
  );
}
