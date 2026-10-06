import QuestionTimerBar from "./QuestionTimerBar";

interface SprintHUDProps {
  score: number;
  secondsLeft: number;
  /**
   * Frozen question-bar fill 0–100, for the pre-start preview where no
   * countdown is running. Omit it in a live run and pass `timerKey` /
   * `onExpire` instead.
   */
  qPercent?: number;
  /** Live countdown: change this to start a fresh question's 5s. */
  timerKey?: string | number;
  /** Live countdown: called once when the question's time runs out. */
  onExpire?: () => void;
}

/**
 * Mirrors the original Derivative Sprint's HUD (score left, seconds-left
 * right, countdown bar beneath) reskinned per the design spec: serif
 * numerals, small-caps sans labels, a thin bar rather than a heavy game-show
 * clock. The bar shifts from navy to the wrong-tone red under 25% remaining,
 * porting the original's urgency cue without the neon styling.
 */
export default function SprintHUD({
  score,
  secondsLeft,
  qPercent,
  timerKey,
  onExpire,
}: SprintHUDProps) {
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

      {qPercent !== undefined ? (
        <QuestionTimerBar percent={qPercent} />
      ) : (
        <QuestionTimerBar key={timerKey} onExpire={onExpire} />
      )}
    </div>
  );
}