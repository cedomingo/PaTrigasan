"use client";

import { useEffect, useRef, useState } from "react";

/** Per-question countdown length, in ms. */
export const QUESTION_MS = 5_000;

/** Below this percentage the fill switches to the wrong-tone red (urgency cue). */
const LOW_THRESHOLD = 25;

interface QuestionTimerBarProps {
  /** Frozen fill 0–100 for the pre-start preview — no countdown, no expiry. */
  percent?: number;
  /** Live countdown: called once when the question's time runs out. */
  onExpire?: () => void;
}

/**
 * The question countdown bar.
 *
 * A live bar measures wall-clock time via requestAnimationFrame instead of
 * adding up setInterval ticks. Interval callbacks fire late whenever the main
 * thread is busy — and React's own render work competes with them — so a
 * tick-counter countdown ran ~15% slower than real time and moved in uneven
 * jumps (the "buffering" the bar used to do), drifting further behind the
 * true 5s on every question. Reading performance.now() each frame keeps the
 * fill linear and exactly on time.
 *
 * Driving it from its own component also means the per-frame repaints never
 * re-render the question or its KaTeX options.
 */
export default function QuestionTimerBar({ percent, onExpire }: QuestionTimerBarProps) {
  const frozen = percent !== undefined;
  const [livePercent, setLivePercent] = useState(100);

  // Kept in a ref so the running frame loop always calls the latest callback
  // without restarting the countdown when the parent re-renders.
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (frozen) return;

    const startedAt = performance.now();
    let frame = 0;
    let expired = false;

    function tick(now: number) {
      const left = Math.max(0, 1 - (now - startedAt) / QUESTION_MS);
      setLivePercent(left * 100);
      if (left <= 0) {
        if (!expired) {
          expired = true;
          onExpireRef.current?.();
        }
        return; // stop: one expiry per question
      }
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [frozen]);

  const shown = frozen ? percent : livePercent;
  const low = shown < LOW_THRESHOLD;

  return (
    <div
      role="progressbar"
      aria-label="Time remaining for this question"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(shown)}
      className="mt-4 h-1.5 overflow-hidden rounded-sm bg-blue-faint"
    >
      <div
        className={`h-full rounded-sm ${low ? "bg-wrong" : "bg-navy"}`}
        style={{ width: `${shown}%` }}
      />
    </div>
  );
}
