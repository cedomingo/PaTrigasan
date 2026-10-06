"use client";

import { useEffect, useState } from "react";
import ReactCardFlip from "react-card-flip";
import { Card, MathText, SectionLabel } from "@/components/ui";

interface FlashcardCardProps {
  categoryLabel: string;
  prompt: string;
  answer: string;
  flipped: boolean;
  /** When false the card surface stays visible but its contents are blank. */
  contentVisible?: boolean;
}

/**
 * The face is a fixed *rem* height, not pixels, so it scales with the
 * root font size exactly like every other fixed dimension in the app
 * (AnswerOption's h-16, its h-24 math slot, min-h-[36rem] on the Sprint
 * card). With `px` the box stayed put while the text inside it grew — at
 * a larger browser font size / text-only zoom the card's prompt, math and
 * "Tap to reveal" caption were squeezed together and eventually spilled
 * out of the card, while the all-rem Sprint card scaled cleanly.
 */
const cardFaceClass =
  "flex h-[22.5rem] w-full flex-col items-center px-10 pt-2 pb-2 text-center [backface-visibility:hidden]";
const cardContentClass = "flex w-full flex-1 flex-col items-center";

export default function FlashcardCard({
  categoryLabel,
  prompt,
  answer,
  flipped,
  contentVisible = true,
}: FlashcardCardProps) {
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
  const contentFade = reducedMotion ? "none" : "opacity 120ms ease-out";

  return (
    <ReactCardFlip
      isFlipped={flipped}
      flipDirection="horizontal"
      flipSpeedFrontToBack={flipSpeed}
      flipSpeedBackToFront={flipSpeed}
    >
      <Card className={cardFaceClass}>
        <div
          className={cardContentClass}
          style={{ opacity: contentVisible ? 1 : 0, transition: contentFade }}
        >
          <SectionLabel tone="muted" underline>
            {categoryLabel}
          </SectionLabel>

          <div className="flex flex-1 flex-col items-center justify-center gap-1">
            <p className="font-sans text-sm text-text-muted">
              D<sub>x</sub> of:
            </p>
            <MathText latex={prompt} display className="text-4xl" />
          </div>

          <p className="font-sans text-xs text-text-muted">Tap to reveal</p>
        </div>
      </Card>

      <Card className={cardFaceClass}>
        <div
          className={cardContentClass}
          style={{ opacity: contentVisible ? 1 : 0, transition: contentFade }}
        >
          <SectionLabel tone="navy" underline>
            Answer
          </SectionLabel>

          <div className="flex flex-1 flex-col items-center justify-center gap-1">
            <p className="font-sans text-sm text-text-muted opacity-0">
              D<sub>x</sub> of:
            </p>
            <MathText latex={answer} display className="text-4xl" />
          </div>

          <p className="font-sans text-xs text-text-muted">Tap to flip back</p>
        </div>
      </Card>
    </ReactCardFlip>
  );
}