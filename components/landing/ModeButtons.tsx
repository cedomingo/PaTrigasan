"use client";

import { Button } from "@/components/ui";

interface ModeButtonsProps {
  disabled: boolean;
  onStartFlashcards: () => void;
}

/**
 * Practice is the only direct-start entry point — it launches straight
 * into flip-cards, unchanged. Sprint no longer has a start button: its
 * run begins when the landing page's preview question is answered
 * correctly (see SprintPreview), which hands off into SprintView.
 */
export default function ModeButtons({ disabled, onStartFlashcards }: ModeButtonsProps) {
  return (
    <Button
      variant="secondary"
      size="lg"
      disabled={disabled}
      aria-describedby={disabled ? "category-hint" : undefined}
      className="w-full sm:w-56"
      onClick={onStartFlashcards}
    >
      Practice
    </Button>
  );
}
