"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Divider, SectionLabel } from "@/components/ui";
import { getAllCategories } from "@/data";
import { getFlashcardItems, shuffle } from "@/lib/quiz-engine";
import FlashcardCard from "./FlashcardCard";

interface FlashcardViewProps {
  categoryIds: string[];
  onExit: () => void;
}

type SlideDir = "left" | "right" | null;

export default function FlashcardView({ categoryIds, onExit }: FlashcardViewProps) {
  const categoryLabels = useMemo(
    () => new Map(getAllCategories().map((c) => [c.id, c.label])),
    []
  );

  const [deck] = useState(() => getFlashcardItems(categoryIds));
  const [order, setOrder] = useState(() => shuffle(deck.map((_, i) => i)));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [slideDir, setSlideDir] = useState<SlideDir>(null);
  const [displayIndex, setDisplayIndex] = useState(index);
  const slideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = order.length;
  const current = total > 0 ? deck[order[displayIndex]] : null;

  function slideTo(nextIndex: number, dir: SlideDir) {
    if (slideTimer.current) clearTimeout(slideTimer.current);
    setSlideDir(dir);
    setFlipped(false);

    slideTimer.current = setTimeout(() => {
      setDisplayIndex(nextIndex);
      setIndex(nextIndex);
      setSlideDir(null);
    }, 200);
  }

  function handlePrevious() {
    if (total === 0) return;
    slideTo((index - 1 + total) % total, "right");
  }

  function handleNext() {
    if (total === 0) return;
    slideTo((index + 1) % total, "left");
  }

  function handleShuffle() {
    setOrder(shuffle(order));
    slideTo(0, "left");
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total]);

  const slideClass =
    slideDir === "left"
      ? "animate-slide-out-left"
      : slideDir === "right"
        ? "animate-slide-out-right"
        : "";

  const containerClass =
    slideDir === "left"
      ? "animate-slide-in-right"
      : slideDir === "right"
        ? "animate-slide-in-left"
        : "";

  return (
    <main className="min-h-screen px-6 py-12 sm:py-20 animate-view-enter">
      <div className="mx-auto max-w-2xl">
        <Card className="p-8 sm:p-10">
          <button
            type="button"
            onClick={onExit}
            className="-ml-2 -mt-2 mb-4 p-2 font-sans text-xs text-text-muted transition-colors hover:text-navy"
          >
            ‹ Exit flashcards
          </button>

          {current ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <SectionLabel tone="muted">Flashcards</SectionLabel>
                <span className="font-sans text-xs text-text-muted">
                  Card {index + 1} of {total}
                </span>
              </div>

              <div className={containerClass}>
                <div className={slideClass}>
                  <FlashcardCard
                    categoryLabel={categoryLabels.get(current.categoryId) ?? ""}
                    prompt={current.item.fn}
                    answer={current.item.ans}
                    flipped={flipped}
                    onFlip={() => setFlipped((f) => !f)}
                  />
                </div>
              </div>

              <Divider className="my-8" />

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="secondary" onClick={handlePrevious}>
                  Previous
                </Button>
                <Button variant="secondary" onClick={() => setFlipped((f) => !f)}>
                  {flipped ? "Flip" : "Flip"}
                </Button>
                <Button variant="secondary" onClick={handleShuffle}>
                  Shuffle
                </Button>
                <Button variant="primary" onClick={handleNext}>
                  Next
                </Button>
              </div>
            </>
          ) : (
            <p className="py-16 text-center font-sans text-sm text-text-muted">
              No cards match the selected topics.
            </p>
          )}
        </Card>
      </div>
    </main>
  );
}
