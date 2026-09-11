"use client";

import { useCallback, useEffect, useState } from "react";
import { getAllSubjects } from "@/data";
import { getPlayerName, setPlayerName } from "@/lib/cookies";
import { Card } from "@/components/ui";
import IntroOverlay from "@/components/landing/IntroOverlay";
import LeaderboardSection from "@/components/leaderboard/LeaderboardSection";
import CategorySelector from "@/components/landing/CategorySelector";
import NameInput from "@/components/landing/NameInput";
import ModeButtons from "@/components/landing/ModeButtons";
import SprintView from "@/components/sprint/SprintView";
import FlashcardView from "@/components/flashcards/FlashcardView";

const subjects = getAllSubjects();

type View = "landing" | "sprint" | "flashcards";

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [introComplete, setIntroComplete] = useState(false);

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

  if (view === "sprint") {
    return (
      <SprintView
        categoryIds={Array.from(selectedIds)}
        name={name}
        onNameChange={handleNameChange}
        onExit={() => setView("landing")}
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
          <CategorySelector
            subjects={subjects}
            selectedIds={selectedIds}
            onToggle={handleToggleCategory}
          />

          <div className="mt-10 space-y-6">
            <ModeButtons
              disabled={selectedIds.size === 0}
              onStartSprint={() => setView("sprint")}
              onStartFlashcards={() => setView("flashcards")}
            />
            <NameInput name={name} onChange={handleNameChange} />
          </div>
        </Card>
      </section>

      <div className="mt-5" />

      <LeaderboardSection />
    </main>
  );
}
