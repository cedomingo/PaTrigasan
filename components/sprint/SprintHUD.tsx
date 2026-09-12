interface SprintHUDProps {
  score: number;
  secondsLeft: number;
  /** 0–100, the current question's remaining time as a percentage of Q_MS. */
  qPercent: number;
}

/**
 * Mirrors the original Derivative Sprint's HUD (score left, seconds-left
 * right, countdown bar beneath) reskinned per the design spec: serif
 * numerals, small-caps sans labels, a thin bar rather than a heavy game-show
 * clock. The bar shifts from navy to the wrong-tone red under 25% remaining,
 * porting the original's urgency cue without the neon styling.
 */
export default function SprintHUD({ score, secondsLeft, qPercent }: SprintHUDProps) {
  const low = qPercent < 25;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-serif text-2xl text-navy">{score}</div>
          <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
            Score
          </div>
        </div>
        <div className="text-right">
          <div className="font-serif text-2xl text-navy">{secondsLeft}</div>
          <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
            Seconds left
          </div>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label="Time remaining for this question"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(qPercent)}
        className="mt-4 h-1.5 overflow-hidden rounded-sm bg-blue-faint"
      >
        <div
          className={`h-full rounded-sm ${low ? "bg-wrong" : "bg-navy"}`}
          style={{ width: `${qPercent}%` }}
        />
      </div>
    </div>
  );
}