"use client";

import { useCallback, useEffect, useState } from "react";
import { getAllSubjects } from "@/data";
import { getPlayerName, setPlayerName } from "@/lib/cookies";
import { Card } from "@/components/ui";
import IntroOverlay from "@/components/landing/IntroOverlay";
import LeaderboardSection from "@/components/leaderboard/LeaderboardSection";
import CategoryDropdown from "@/components/category/CategoryDropdown";
import NameInput from "@/components/landing/NameInput";
import ModeButtons from "@/components/landing/ModeButtons";
import SprintPreview from "@/components/sprint/SprintPreview";
import SprintView from "@/components/sprint/SprintView";
import FlashcardView from "@/components/flashcards/FlashcardView";
import type { SprintHandoff } from "@/lib/quiz-engine";

const subjects = getAllSubjects();

type View = "landing" | "sprint" | "flashcards";

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [introComplete, setIntroComplete] = useState(false);
  const [handoff, setHandoff] = useState<SprintHandoff | null>(null);

  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);

  // Cookie read only happens client-side, after mount — SSR has no
  // access to it, so this can't be moved into render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(getPlayerName());
  }, []);

  function handleToggleCategory(categoryId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  function handleNameChange(value: string) {
    setName(value);
    setPlayerName(value);
  }

  // Answer-to-start: the landing preview's correct answer carries its
  // already-shuffled queue + pre-awarded points straight into the timed
  // run. Exiting the run clears the handoff so the landing preview starts
  // fresh next time.
  function handleSprintHandoff(next: SprintHandoff) {
    setHandoff(next);
    setView("sprint");
  }

  function handleSprintExit() {
    setHandoff(null);
    setView("landing");
  }

  // Stable identity for the current selection, used to remount the
  // preview (and so regenerate its first question) whenever the category
  // selection changes.
  const selectionKey = Array.from(selectedIds).sort().join(",");

  if (view === "sprint") {
    return (
      <SprintView
        categoryIds={Array.from(selectedIds)}
        name={name}
        onNameChange={handleNameChange}
        onExit={handleSprintExit}
        handoff={handoff ?? undefined}
      />
    );
  }

  if (view === "flashcards") {
    return (
      <FlashcardView
        categoryIds={Array.from(selectedIds)}
        onExit={() => setView("landing")}
      />
    );
  }

  return (
    <main className="pb-24 animate-view-enter">
      {!introComplete && <IntroOverlay onComplete={handleIntroComplete} />}

      <section className="mx-auto max-w-2xl px-6 pt-12 sm:pt-16">
        <Card variant="default" className="p-8 sm:p-10">
          <div className="flex flex-col gap-3 sm:flex-row">
            <CategoryDropdown
              subjects={subjects}
              selectedIds={selectedIds}
              onToggle={handleToggleCategory}
              className="sm:w-56 sm:shrink-0"
            />
            <ModeButtons
              disabled={selectedIds.size === 0}
              onStartFlashcards={() => setView("flashcards")}
            />
          </div>

          <div className="mt-6 space-y-6">
            {selectedIds.size === 0 && (
              <p id="category-hint" className="font-sans text-xs text-text-muted">
                Select at least one topic to practice — or to preview the sprint below.
              </p>
            )}
            <NameInput name={name} onChange={handleNameChange} />
          </div>
        </Card>
      </section>

      {selectedIds.size > 0 && (
        <section className="mx-auto mt-5 max-w-2xl px-6">
          {/* key remounts on selection change, regenerating the preview's
              first question from the newly selected categories. */}
          <SprintPreview
            key={selectionKey}
            categoryIds={Array.from(selectedIds)}
            onHandoff={handleSprintHandoff}
          />
        </section>
      )}

      <div className="mt-5" />

      <LeaderboardSection />
    </main>
  );
}
