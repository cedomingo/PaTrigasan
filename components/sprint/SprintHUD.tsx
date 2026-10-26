import QuestionTimerBar from "./QuestionTimerBar";

interface SprintHUDProps {
  score: number;
  secondsLeft: number;
  /**
   * Show the institution logo centered between score and seconds-left
   * (the library kiosk's sprint card only — see MathSprintApp's `library`
   * variant). Absent on the public site, where the HUD stays wordless.
   */
  showLogo?: boolean;
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
  showLogo = false,
  qPercent,
  timerKey,
  onExpire,
}: SprintHUDProps) {
  return (
    <div>
      {/* Three columns rather than justify-between: the middle cell holds the
          logo, and with equal `1fr` sides it lands on the card's true center
          regardless of how much wider "Seconds left" is than "Score". With
          the logo absent the empty middle cell collapses to zero width, so
          the two stats sit exactly where they always have. */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          <div className="font-serif text-2xl text-navy">{score}</div>
          <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
            Score
          </div>
        </div>
        {showLogo && (
          <img
            src="/Logo.svg"
            alt="University of the Philippines Diliman"
            // Logo.svg is 330×70 with no intrinsic size of its own; the
            // attributes give it that ratio up front so the space it occupies
            // is reserved before the file lands (the CSS height is what
            // actually sizes it).
            width={330}
            height={70}
            className="h-7 w-auto sm:h-10"
          />
        )}
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