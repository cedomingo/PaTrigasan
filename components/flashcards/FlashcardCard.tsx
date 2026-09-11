"use client";

import { useEffect, useState } from "react";
import ReactCardFlip from "react-card-flip";
import { Card, MathText, SectionLabel } from "@/components/ui";

interface FlashcardCardProps {
  categoryLabel: string;
  prompt: string;
  answer: string;
  flipped: boolean;
  onFlip: () => void;
}

const cardFaceClass =
  "flex h-[280px] w-full flex-col items-center justify-center gap-1 p-10 text-center";

export default function FlashcardCard({
  categoryLabel,
  prompt,
  answer,
  flipped,
  onFlip,
}: FlashcardCardProps) {
  // react-card-flip animates via inline styles/transitions, so it isn't
  // covered by the global `prefers-reduced-motion` rule in globals.css.
  // Mirror that preference here by dropping the flip speed to 0.
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const flipSpeed = reducedMotion ? 0 : 0.4;

  return (
    <ReactCardFlip
      isFlipped={flipped}
      flipDirection="horizontal"
      flipSpeedFrontToBack={flipSpeed}
      flipSpeedBackToFront={flipSpeed}
    >
      {/* FRONT */}
      <Card
        as="button"
        type="button"
        variant="interactive"
        onClick={onFlip}
        className={cardFaceClass}
      >
        <SectionLabel tone="muted" underline>
          {categoryLabel}
        </SectionLabel>

        <p className="mt-6 font-sans text-sm text-text-muted">
          D<sub>x</sub> of:
        </p>

        <div className="mt-1">
          <MathText latex={prompt} display className="text-4xl" />
        </div>

        <p className="mt-8 font-sans text-xs text-text-muted">
          Tap to reveal the derivative
        </p>
      </Card>

      {/* BACK */}
      <Card
        as="button"
        type="button"
        variant="interactive"
        onClick={onFlip}
        className={cardFaceClass}
      >
        <SectionLabel tone="navy" underline>
          Answer
        </SectionLabel>

        <div className="mt-6">
          <MathText latex={answer} display className="text-4xl" />
        </div>

        <p className="mt-8 font-sans text-xs text-text-muted">
          Tap to flip back
        </p>
      </Card>
    </ReactCardFlip>
  );
}
