"use client";

import { AnimatePresence, MotionConfig, motion, useMotionValue, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import FlashcardCard from "./FlashcardCard";

const ADVANCE_THRESHOLD = 80;
const TAP_THRESHOLD = 6;

interface StackCard {
  id: number;
  categoryLabel: string;
  prompt: string;
  answer: string;
}

interface FlashcardStackProps {
  cards: StackCard[];
  flipped: boolean;
  onAdvance: (dir: "next" | "previous") => void;
  onFlip: () => void;
}

const STACK_OFFSETS = [
  { y: 0, scale: 1, rotate: 0, opacity: 1 },
  { y: 10, scale: 0.97, rotate: -1.5, opacity: 1 },
  { y: 18, scale: 0.94, rotate: 1.5, opacity: 1 },
];

export default function FlashcardStack({ cards, flipped, onAdvance, onFlip }: FlashcardStackProps) {
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);

  function handleAdvance(dir: "next" | "previous") {
    setExitDir(dir === "next" ? "left" : "right");
    onAdvance(dir);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative h-[280px] w-full">
        <AnimatePresence initial={false}>
          {cards.map((card, position) => (
            <StackedCard
              key={card.id}
              card={card}
              position={position}
              flipped={position === 0 ? flipped : false}
              onAdvance={handleAdvance}
              onFlip={onFlip}
              entryDir={position === 0 && exitDir ? (exitDir === "left" ? "right" : "left") : null}
            />
          ))}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

function StackedCard({
  card,
  position,
  flipped,
  onAdvance,
  onFlip,
  entryDir,
}: {
  card: StackCard;
  position: number;
  flipped: boolean;
  onAdvance: (dir: "next" | "previous") => void;
  onFlip: () => void;
  entryDir: "left" | "right" | null;
}) {
  const dragX = useMotionValue(0);
  const dragRotate = useTransform(dragX, [-200, 0, 200], [-12, 0, 12]);
  const [exitX, setExitX] = useState(0);
  const draggable = position === 0;
  const target = STACK_OFFSETS[position] ?? STACK_OFFSETS[STACK_OFFSETS.length - 1];
  const entryX = entryDir === "left" ? -260 : entryDir === "right" ? 260 : 0;

  const pointerDownTime = useRef(0);
  const pointerMoved = useRef(false);

  function handlePointerDown() {
    pointerDownTime.current = Date.now();
    pointerMoved.current = false;
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (pointerDownTime.current === 0) return;
    const moveX = Math.abs(e.clientX - (e.currentTarget.getBoundingClientRect().left + e.currentTarget.getBoundingClientRect().width / 2));
    if (moveX > TAP_THRESHOLD) {
      pointerMoved.current = true;
    }
  }

  function handlePointerUp() {
    const elapsed = Date.now() - pointerDownTime.current;
    if (!pointerMoved.current && elapsed < 300) {
      onFlip();
    }
    pointerDownTime.current = 0;
  }

  function handleDragEnd() {
    const x = dragX.get();
    if (Math.abs(x) < TAP_THRESHOLD) {
      onFlip();
      return;
    }
    if (x <= -ADVANCE_THRESHOLD) {
      setExitX(-260);
      onAdvance("next");
    } else if (x >= ADVANCE_THRESHOLD) {
      setExitX(260);
      onAdvance("previous");
    }
  }

  return (
    <motion.div
      style={{
        zIndex: 10 - position,
        x: draggable ? dragX : 0,
        rotate: draggable ? dragRotate : target.rotate,
      }}
      initial={entryDir ? { x: entryX, opacity: 0 } : false}
      animate={{ x: 0, y: target.y, scale: target.scale, rotate: target.rotate, opacity: target.opacity }}
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      drag={draggable ? "x" : false}
      dragElastic={0.5}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={draggable ? handleDragEnd : undefined}
      onPointerDown={draggable ? handlePointerDown : undefined}
      onPointerMove={draggable ? handlePointerMove : undefined}
      onPointerUp={draggable ? handlePointerUp : undefined}
      aria-hidden={!draggable}
      className={`absolute inset-0 ${draggable ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}`}
    >
      <FlashcardCard
        categoryLabel={card.categoryLabel}
        prompt={card.prompt}
        answer={card.answer}
        flipped={flipped}
      />
    </motion.div>
  );
}
