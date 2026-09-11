"use client";

import { useEffect, useState } from "react";
import { Card, MathText, SectionLabel } from "@/components/ui";

interface FlashcardCardProps {
  categoryLabel: string;
  prompt: string;
  answer: string;
  flipped: boolean;
  onFlip: () => void;
}

export default function FlashcardCard({
  categoryLabel,
  prompt,
  answer,
  flipped,
  onFlip,
}: FlashcardCardProps) {
  const [displayFlipped, setDisplayFlipped] = useState(flipped);
  const [animClass, setAnimClass] = useState("");

  useEffect(() => {
    if (flipped === displayFlipped) return;

    setAnimClass("animate-flip-out");
    const timer = setTimeout(() => {
      setDisplayFlipped(flipped);
      setAnimClass("animate-flip-in");
    }, 200);

    const clear = setTimeout(() => setAnimClass(""), 400);
    return () => {
      clearTimeout(timer);
      clearTimeout(clear);
    };
  }, [flipped]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="perspective-[800px]">
      <Card
        as="button"
        type="button"
        variant="interactive"
        onClick={onFlip}
        className={`flex h-[280px] w-full flex-col items-center justify-center gap-1 p-10 text-center ${animClass}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <SectionLabel tone={displayFlipped ? "navy" : "muted"} underline>
          {displayFlipped ? "Answer" : categoryLabel}
        </SectionLabel>

        {!displayFlipped && (
          <p className="mt-6 font-sans text-sm text-text-muted">
            D<sub>x</sub> of:
          </p>
        )}

        <div className={displayFlipped ? "mt-6" : "mt-1"}>
          <MathText
            latex={displayFlipped ? answer : prompt}
            display
            className="text-4xl"
          />
        </div>

        <p className="mt-8 font-sans text-xs text-text-muted">
          {displayFlipped ? "Tap to flip back" : "Tap to reveal the derivative"}
        </p>
      </Card>
    </div>
  );
}
