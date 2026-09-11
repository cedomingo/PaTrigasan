"use client";

import { Button } from "@/components/ui";

interface ModeButtonsProps {
  disabled: boolean;
  onStartSprint: () => void;
  onStartFlashcards: () => void;
}

/**
 * "Start Sprint" and "Start Flashcards" trigger their respective full-screen
 * view-state swaps.
 */
export default function ModeButtons({
  disabled,
  onStartSprint,
  onStartFlashcards,
}: ModeButtonsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        variant="primary"
        size="lg"
        disabled={disabled}
        aria-describedby={disabled ? "category-hint" : undefined}
        className="flex-1"
        onClick={onStartSprint}
      >
        Start Sprint
      </Button>
      <Button
        variant="secondary"
        size="lg"
        disabled={disabled}
        aria-describedby={disabled ? "category-hint" : undefined}
        className="flex-1"
        onClick={onStartFlashcards}
      >
        Practice
      </Button>
    </div>
  );
}
