"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { getAllSubjects, getAllCategories } from "@/data";
import { getPlayerName, setPlayerName } from "@/lib/cookies";
import type { QuestionKind } from "@/types";
import { getFlashcardItems, shuffle, type SprintHandoff } from "@/lib/quiz-engine";
import { Button, Card, Divider, SectionLabel } from "@/components/ui";
import IntroOverlay from "@/components/landing/IntroOverlay";
import LeaderboardSection from "@/components/leaderboard/LeaderboardSection";
import NameInput from "@/components/landing/NameInput";
import ModeTabBar, { type ModeTab } from "@/components/landing/ModeTabBar";
import SprintView from "@/components/sprint/SprintView";
import FlashcardStack from "@/components/flashcards/FlashcardStack";

/**
 * SprintPreview picks its first question with `Math.random()` inside a
 * `useState` initializer. That initializer runs once during SSR (to
 * produce the HTML) and once again during client hydration — two separate
 * random draws — so the server's shuffle and the client's shuffle almost
 * never match. `MathText` renders its KaTeX markup with
 * `suppressHydrationWarning`, which stops React from patching that
 * mismatch back into the DOM, so the page keeps showing the *server's*
 * answer text while every click handler and "correct/wrong" highlight is
 * wired to the *client's* (different) shuffle — the correct option's text
 * ends up sitting wherever a distractor landed on the server's draw, so it
 * visually reads as "wrong" and vice versa. This only ever affects the
 * very first question, since every later question is generated entirely
 * client-side after hydration with nothing server-rendered to conflict
 * with.
 *
 * Loading SprintPreview with `ssr: false` means there is no server-drawn
 * version to disagree with in the first place — the very first question
 * is picked exactly once, on the client, and the DOM the user sees is the
 * DOM the click handlers were bound against.
 */
const SprintPreview = dynamic(() => import("@/components/sprint/SprintPreview"), {
  ssr: false,
  loading: () => (
    <Card className="min-h-[36rem] p-5 sm:p-10">
      <p className="font-sans text-sm text-text-muted">Loading question…</p>
    </Card>
  ),
});

const subjects = getAllSubjects();

/** Trigonometric derivatives — checked by default, matching the target screenshot. */
const DEFAULT_CATEGORY_ID = "derivatives-trig";

/**
 * Domain & Range splits its questions into DOMAIN and RANGE. Domain starts
 * on, and at least one of the two always stays on — see `handleToggleKind`.
 */
const DEFAULT_KINDS: QuestionKind[] = ["domain"];

const VISIBLE_DEPTH = 3;

export default function Home() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set([DEFAULT_CATEGORY_ID])
  );
  const [activeTab, setActiveTab] = useState<ModeTab>("sprint");
  const [kinds, setKinds] = useState<Set<QuestionKind>>(() => new Set(DEFAULT_KINDS));
  const kindsArray = useMemo(() => Array.from(kinds), [kinds]);
  const [name, setName] = useState("");
  const [introComplete, setIntroComplete] = useState(false);
  const [sprintHandoff, setSprintHandoff] = useState<SprintHandoff | null>(null);
  const [sprintLive, setSprintLive] = useState(false);

  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);

  useEffect(() => {
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

  /**
   * Toggles a DOMAIN / RANGE kind. The last remaining one can't be turned
   * off — checking the other first is the only way to drop it.
   */
  function handleToggleKind(kind: QuestionKind) {
    setKinds((prev) => {
      if (!prev.has(kind)) return new Set([...prev, kind]);
      if (prev.size === 1) return prev;
      return new Set([...prev].filter((k) => k !== kind));
    });
  }

  function handleNameChange(value: string) {
    setName(value);
    setPlayerName(value);
  }

  function handleTabSelect(tab: ModeTab) {
    setActiveTab(tab);
    if (tab !== "sprint") {
      setSprintHandoff(null);
      setSprintLive(false);
    }
  }

  function handleSprintHandoff(handoff: SprintHandoff) {
    setSprintHandoff(handoff);
    setSprintLive(true);
  }

  function handleSprintExit() {
    setActiveTab("sprint");
    setSprintHandoff(null);
    setSprintLive(false);
  }

  function handleSprintGameEnd() {
    setSprintLive(false);
  }

  /** Categories *and* kinds — a change to either regenerates the question queues. */
  const selectionKey = `${Array.from(selectedIds).sort().join(",")}|${kindsArray.join()}`;

  // Flashcards state (inline)
  const categoryLabels = useMemo(
    () => new Map(getAllCategories().map((c) => [c.id, c.label])),
    []
  );
  const [deck, setDeck] = useState(() =>
    getFlashcardItems(Array.from(selectedIds), kindsArray)
  );
  const [order, setOrder] = useState(() => shuffle(deck.map((_, i) => i)));
  const [flipped, setFlipped] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);

  const total = order.length;
  const position = total > 0 ? ((cycleIndex % total) + total) % total : 0;

  const visibleCards = useMemo(() => {
    return order.slice(0, VISIBLE_DEPTH).map((deckIndex) => {
      const { categoryId, item } = deck[deckIndex];
      return {
        id: deckIndex,
        categoryLabel: categoryLabels.get(categoryId) ?? "",
        prompt: item.fn,
        answer: item.ans,
      };
    });
  }, [order, deck, categoryLabels]);

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

  // Update deck+order together when selection changes
  useEffect(() => {
    const newDeck = getFlashcardItems(Array.from(selectedIds), kindsArray);
    const newOrder = shuffle(newDeck.map((_, i) => i));
    setDeck(newDeck);
    setOrder(newOrder);
    setCycleIndex(0);
    setFlipped(false);
  }, [selectionKey]);

  // Suppress arrow keys during sprint so they don't scroll or trigger anything
  useEffect(() => {
    if (activeTab !== "sprint") return;

    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  // Keyboard shortcuts for practice mode: A/D or arrows for prev/next, W/S or arrows for flip
  useEffect(() => {
    if (activeTab !== "practice" || total === 0) return;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "a" || key === "arrowleft") {
        e.preventDefault();
        advance("previous");
      } else if (key === "d" || key === "arrowright") {
        e.preventDefault();
        advance("next");
      } else if (key === "w" || key === "arrowup" || key === "s" || key === "arrowdown") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, total]);

  /** Shared classes to hide surrounding UI during a live sprint without
   *  removing it from the DOM (keeps layout stable). */
  const liveSprintHidden = sprintLive
    ? "pointer-events-none opacity-0"
    : "opacity-100";

  return (
    <main className="pb-24 animate-view-enter">
      {!introComplete && <IntroOverlay onComplete={handleIntroComplete} />}

      {/* Tab bar + dropdown overlay — hidden during live sprint but kept in layout */}
      <section
        className={`mx-auto max-w-2xl px-6 pt-12 sm:pt-16 transition-opacity duration-200 ${liveSprintHidden}`}
        inert={sprintLive}
      >
        <ModeTabBar
          active={activeTab}
          onSelect={handleTabSelect}
          subjects={subjects}
          selectedIds={selectedIds}
          onToggleCategory={handleToggleCategory}
          kinds={kinds}
          onToggleKind={handleToggleKind}
        />
      </section>

      {/* Sprint game — frozen preview first, live game after correct answer */}
      {activeTab === "sprint" && selectedIds.size > 0 && (
        <section className="mx-auto mt-5 max-w-2xl px-6">
          {sprintHandoff === null ? (
            <SprintPreview
              key={selectionKey}
              categoryIds={Array.from(selectedIds)}
              kinds={kindsArray}
              onHandoff={handleSprintHandoff}
            />
          ) : (
            <SprintView
              key={`sprint-run-${selectionKey}`}
              categoryIds={Array.from(selectedIds)}
              kinds={kindsArray}
              onExit={handleSprintExit}
              onGameEnd={handleSprintGameEnd}
              handoff={sprintHandoff}
            />
          )}
        </section>
      )}

      {/* Practice flashcards — same card wrapper as sprint for visual consistency */}
      {activeTab === "practice" && selectedIds.size > 0 && (
        <section className="mx-auto mt-5 max-w-2xl px-6">
          {/* Narrower inset on phones: the card's own padding is width the
              long set-builder answers would otherwise have to be scaled down
              into (see MathText). */}
          <Card className="p-5 sm:p-10">
            {total > 0 ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <SectionLabel tone="muted">Practice</SectionLabel>
                  <span className="font-sans text-xs text-text-muted">
                    Card {position + 1} of {total}
                  </span>
                </div>

                {/* FlashcardCard's own face height plus the 14px of headroom the
                    stacked deck behind it needs (offset y:18 / scale 0.94). Both
                    come from the same viewport-aware token, so the stack stays
                    proportional when the face shrinks on short screens. Plain
                    block-flow sizing rather than flex-grow, mirroring Sprint: the
                    card's height is driven by real content, and that content is
                    viewport-aware, so it no longer needs a 36rem floor to hold its
                    shape — a floor only ever pushed the Next button under the fold
                    on screens shorter than 36rem plus the toolbar. */}
                <div className="h-[calc(var(--flashcard-face-h)+14px)]">
                  <FlashcardStack
                    cards={visibleCards}
                    flipped={flipped}
                    onAdvance={advance}
                    onFlip={() => setFlipped((f) => !f)}
                  />
                </div>

                <Divider className="my-5 sm:my-8" />

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button variant="secondary" onClick={() => advance("previous")}>
                    Previous
                  </Button>
                  <Button variant="secondary" onClick={() => setFlipped((f) => !f)}>
                    Flip
                  </Button>
                  <Button variant="secondary" onClick={handleShuffle}>
                    Shuffle
                  </Button>
                  <Button variant="primary" onClick={() => advance("next")}>
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
        </section>
      )}

      {/* Name input — below the game, hidden during live sprint but kept in layout */}
      <section
        className={`mx-auto max-w-2xl px-6 transition-opacity duration-200 ${liveSprintHidden}`}
        inert={sprintLive}
      >
        <div className="mt-6">
          <NameInput name={name} onChange={handleNameChange} />
        </div>
      </section>

      <div className="mt-5" />

      {/* Leaderboard — hidden during live sprint but kept in layout */}
      <div
        className={`transition-opacity duration-200 ${liveSprintHidden}`}
        inert={sprintLive}
      >
        <LeaderboardSection categoryIds={Array.from(selectedIds)} />
      </div>
    </main>
  );
}