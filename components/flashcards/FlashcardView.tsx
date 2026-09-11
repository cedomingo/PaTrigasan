"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, Divider, SectionLabel } from "@/components/ui";
import { getAllCategories } from "@/data";
import { getFlashcardItems, shuffle } from "@/lib/quiz-engine";
import FlashcardStack from "./FlashcardStack";

interface FlashcardViewProps {
  categoryIds: string[];
  onExit: () => void;
}

const VISIBLE_DEPTH = 3;

export default function FlashcardView({ categoryIds, onExit }: FlashcardViewProps) {
  const categoryLabels = useMemo(
    () => new Map(getAllCategories().map((c) => [c.id, c.label])),
    []
  );

  const [deck] = useState(() => getFlashcardItems(categoryIds));
  const [order, setOrder] = useState(() => shuffle(deck.map((_, i) => i)));
  const [flipped, setFlipped] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);

  const total = order.length;
  const position = total > 0 ? ((cycleIndex % total) + total) % total : 0;

  const visibleCards = order.slice(0, VISIBLE_DEPTH).map((deckIndex) => {
    const { categoryId, item } = deck[deckIndex];
    return {
      id: deckIndex,
      categoryLabel: categoryLabels.get(categoryId) ?? "",
      prompt: item.fn,
      answer: item.ans,
    };
  });

  function advance(dir: "next" | "previous") {
    if (total === 0) return;
    setFlipped(false);
    setOrder((prev) =>
      dir === "next"
        ? [...prev.slice(1), prev[0]]
        : [prev[prev.length - 1], ...prev.slice(0, -1)]
    );
    setCycleIndex((c) => (dir === "next" ? c + 1 : c - 1));
  }

  function handleShuffle() {
    if (total === 0) return;
    setFlipped(false);
    setOrder((prev) => shuffle(prev));
    setCycleIndex(0);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); advance("next"); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); advance("previous"); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

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

          {total > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <SectionLabel tone="muted">Flashcards</SectionLabel>
                <span className="font-sans text-xs text-text-muted">
                  Card {position + 1} of {total}
                </span>
              </div>

              <FlashcardStack
                cards={visibleCards}
                flipped={flipped}
                onAdvance={advance}
                onFlip={() => setFlipped((f) => !f)}
              />

              <Divider className="my-8" />

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="secondary" onClick={() => advance("previous")}>Previous</Button>
                <Button variant="secondary" onClick={() => setFlipped((f) => !f)}>Flip</Button>
                <Button variant="secondary" onClick={handleShuffle}>Shuffle</Button>
                <Button variant="primary" onClick={() => advance("next")}>Next</Button>
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