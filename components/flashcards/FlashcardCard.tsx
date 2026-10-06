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

// Tight horizontal padding on phones so the formula has as much room as the
// card can give it (see MathText's fit-to-width shrink); the roomier 2.5rem
// inset returns from `sm:` up, where there is space to spare.
//
// The height comes from `--flashcard-face-h` (globals.css) rather than a fixed
// 360px, so the face gives way on short screens instead of pushing the rest of
// the practice card — and its Next button — below the fold.
const cardFaceClass =
  "flex h-[var(--flashcard-face-h)] w-full flex-col items-center overflow-hidden px-4 pt-2 pb-2 text-center sm:px-10 [backface-visibility:hidden]";
const cardContentClass = "flex w-full flex-1 flex-col items-center overflow-hidden";

// The formula's slot. `w-full` (not just an auto width) matters: as a flex
// item in the column above, an auto width is its own fit-content width, so a
// long formula would widen this box past the card and be measured against
// that inflated width — the math would then run out through the card's
// padding, which is exactly what this is here to prevent. `gap-6` is the space
// between the "D_x of:" line and the formula now that KaTeX's own display
// margins are zeroed (globals.css), and it is fixed rather than scaling with
// the formula the way those margins did — the slot's height is what the face
// has to budget for.
const cardFormulaClass =
  "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-6";

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

          <div className={cardFormulaClass}>
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

          <div className={cardFormulaClass}>
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