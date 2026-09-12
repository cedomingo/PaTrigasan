import type { CSSProperties } from "react";

interface BauhausGridProps {
  className?: string;
}

type Motif =
  | "quarter-tl"
  | "quarter-tr"
  | "quarter-bl"
  | "quarter-br"
  | "half-top"
  | "half-bottom"
  | "half-left"
  | "half-right"
  | "circle"
  | "solid"
  | "blank";

const CELL = 84;
const COLS = 32;
const ROWS = 20;

/** Motif pool — repeated entries bias the mix (quarters/halves are the
 *  workhorses, "blank" appears often so the page keeps breathing room). */
const MOTIF_POOL: Motif[] = [
  "quarter-tl",
  "quarter-tr",
  "quarter-bl",
  "quarter-br",
  "half-top",
  "half-bottom",
  "half-left",
  "half-right",
  "circle",
  "circle",
  "solid",
  "solid",
  "blank",
  "blank",
  "blank",
  "blank",
];

/** Soft, muted fills only — the navy/blue palette from globals.css, with
 *  the two accent tones pre-mixed down to a low alpha so nothing in the
 *  pool needs a separate opacity knob (keeps `opacity` free for the hover
 *  transition below). Lighter tones repeat more often than the accents. */
const COLOR_POOL = [
  "var(--color-blue-faint)",
  "var(--color-blue-faint)",
  "var(--color-blue-faint)",
  "var(--color-blue-soft)",
  "var(--color-blue-soft)",
  "var(--color-white)",
  "rgba(49, 93, 143, 0.16)" /* blue-medium, muted */,
  "rgba(30, 58, 95, 0.12)" /* navy, muted */,
];

/** Deterministic pseudo-random in [0, 1). No Math.random()/Date — the grid
 *  must render byte-identical on the server and on the client, or React
 *  hydration mismatches on every single cell. */
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function pick<T>(pool: T[], seed: number): T {
  return pool[Math.floor(noise(seed) * pool.length)];
}

/** One quarter-circle "pie slice" per corner (radius = full cell side, so
 *  it reaches the two far corners) and one half-circle per edge (radius =
 *  half the side, diameter flush against that edge). Every path is built
 *  from the cell's own 0..CELL box, so a shape can never reach past its
 *  own cell — that's what keeps the grid overlap-free even once the hover
 *  transform rotates or scales it. */
function motifShape(motif: Motif): { kind: "path" | "circle" | "rect" | "none"; d?: string } {
  switch (motif) {
    case "quarter-tl":
      return { kind: "path", d: `M0,0 L${CELL},0 A${CELL},${CELL} 0 0 1 0,${CELL} Z` };
    case "quarter-tr":
      return { kind: "path", d: `M${CELL},0 L${CELL},${CELL} A${CELL},${CELL} 0 0 1 0,0 Z` };
    case "quarter-br":
      return { kind: "path", d: `M${CELL},${CELL} L0,${CELL} A${CELL},${CELL} 0 0 1 ${CELL},0 Z` };
    case "quarter-bl":
      return { kind: "path", d: `M0,${CELL} L0,0 A${CELL},${CELL} 0 0 1 ${CELL},${CELL} Z` };
    case "half-top":
      return { kind: "path", d: `M0,0 A${CELL / 2},${CELL / 2} 0 0 0 ${CELL},0 Z` };
    case "half-bottom":
      return { kind: "path", d: `M0,${CELL} A${CELL / 2},${CELL / 2} 0 0 1 ${CELL},${CELL} Z` };
    case "half-left":
      return { kind: "path", d: `M0,0 A${CELL / 2},${CELL / 2} 0 0 1 0,${CELL} Z` };
    case "half-right":
      return { kind: "path", d: `M${CELL},0 A${CELL / 2},${CELL / 2} 0 0 0 ${CELL},${CELL} Z` };
    case "circle":
      return { kind: "circle" };
    case "solid":
      return { kind: "rect" };
    case "blank":
    default:
      return { kind: "none" };
  }
}

interface Cell {
  key: number;
  color: string;
  shape: ReturnType<typeof motifShape>;
  idle: "sway" | "drift" | "none";
  style?: CSSProperties;
}

/** Built once at module load (pure function of index, not of props or the
 *  viewport) so it's the same array on the server and on every client
 *  render — no per-render recompute, no hydration drift. */
const CELLS: Cell[] = Array.from({ length: COLS * ROWS }, (_, i) => {
  const motif = pick(MOTIF_POOL, i * 1.7 + 1);
  const color = pick(COLOR_POOL, i * 3.1 + 11);
  const idleRoll = noise(i * 5.3 + 3);
  const idle: Cell["idle"] = motif === "blank" ? "none" : idleRoll < 0.45 ? "sway" : idleRoll < 0.9 ? "drift" : "none";
  const duration = 7 + noise(i * 9.3 + 5) * 9; // 7-16s, staggered so cells don't move in lockstep
  const delay = -(noise(i * 2.2 + 7) * duration); // negative: starts mid-cycle instead of all at rest on load
  const amount = idle === "sway" ? 4 + noise(i * 4.4 + 9) * 6 : 2 + noise(i * 6.6 + 13) * 3;

  return {
    key: i,
    color,
    shape: motifShape(motif),
    idle,
    style:
      idle === "none"
        ? undefined
        : ({
            animationName: idle === "sway" ? "bauhaus-sway" : "bauhaus-drift",
            animationDuration: `${duration.toFixed(2)}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: `${delay.toFixed(2)}s`,
            "--sway-deg": `${amount.toFixed(2)}deg`,
            "--drift-amt": `${amount.toFixed(2)}px`,
          } as CSSProperties),
  };
});

/**
 * A full-page Bauhaus tile pattern — fixed behind everything, in the
 * site's own navy/blue tokens rather than a full-color palette, so it
 * reads as texture rather than a competing graphic. Every cell is clipped
 * to its own square (`overflow-hidden`), so no shape can ever paint over
 * its neighbor even while animating.
 *
 * Unlike its siblings in this folder, this one is deliberately NOT
 * `pointer-events-none`: each tile drifts or sways at rest and gives a
 * small rotate/scale response on hover. `aria-hidden` since it's purely
 * ornamental either way. Motion is neutralized automatically by the
 * `prefers-reduced-motion` rule in globals.css.
 */
export default function BauhausGrid({ className = "" }: BauhausGridProps) {
  return (
    <div aria-hidden="true" className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      <div
        className="absolute grid"
        style={{
          top: -CELL / 2,
          left: -CELL / 2,
          gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
          gridAutoRows: `${CELL}px`,
        }}
      >
        {CELLS.map((cell) => (
          <div key={cell.key} className="group relative overflow-hidden">
            {cell.shape.kind !== "none" && (
              <div className="absolute inset-0" style={cell.style}>
                <svg
                  viewBox={`0 0 ${CELL} ${CELL}`}
                  className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.15] group-hover:rotate-[30deg]"
                >
                  {cell.shape.kind === "path" && <path d={cell.shape.d} fill={cell.color} />}
                  {cell.shape.kind === "circle" && (
                    <circle cx={CELL / 2} cy={CELL / 2} r={CELL / 2} fill={cell.color} />
                  )}
                  {cell.shape.kind === "rect" && <rect width={CELL} height={CELL} fill={cell.color} />}
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
