"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Constants ───────────────────────────────────────────────────────

const CELL = 50;

/** Minimum ms between moves for any given cell. */
const COOLDOWN_MS = 1000;

const PALETTE = [
  "rgba(63, 85, 111, 0.25)",
  "rgba(208, 214, 221, 0.30)",
  "rgba(160, 170, 183, 0.25)",
  "rgba(111, 127, 146, 0.25)",
];

type Motif =
  | "quarter-tl"
  | "quarter-tr"
  | "quarter-bl"
  | "quarter-br"
  | "circle"
  | "solid"
  | "blank";

const MOTIF_POOL: Motif[] = [
  "quarter-tl",
  "quarter-tr",
  "quarter-bl",
  "quarter-br",
  "quarter-tl",
  "quarter-tr",
  "quarter-bl",
  "quarter-br",
  "circle",
  "circle",
  "solid",
  "solid",
  "blank",
  "blank",
  "blank",
];

// ─── Seeded helpers ──────────────────────────────────────────────────

function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function pick<T>(pool: T[], seed: number): T {
  return pool[Math.floor(noise(seed) * pool.length)];
}

// ─── Grid types ──────────────────────────────────────────────────────

interface Cell {
  motif: Motif;
  color: string;
}

function createGrid(cols: number, rows: number): (Cell | null)[][] {
  const grid: (Cell | null)[][] = [];
  let seed = 42;
  for (let r = 0; r < rows; r++) {
    const row: (Cell | null)[] = [];
    for (let c = 0; c < cols; c++) {
      const motif = pick(MOTIF_POOL, seed++);
      if (motif === "blank") {
        row.push(null);
      } else {
        row.push({ motif, color: pick(PALETTE, seed++) });
      }
    }
    grid.push(row);
  }
  return grid;
}

// ─── Canvas drawing ──────────────────────────────────────────────────

function drawCell(
  ctx: CanvasRenderingContext2D,
  cell: Cell,
  x: number,
  y: number,
  size: number,
) {
  ctx.save();

  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.clip();

  ctx.fillStyle = cell.color;

  switch (cell.motif) {
    case "quarter-tl":
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y);
      ctx.arc(x, y, size, 0, Math.PI / 2);
      ctx.closePath();
      ctx.fill();
      break;

    case "quarter-tr":
      ctx.beginPath();
      ctx.moveTo(x + size, y);
      ctx.lineTo(x + size, y + size);
      ctx.arc(x + size, y, size, Math.PI / 2, Math.PI);
      ctx.closePath();
      ctx.fill();
      break;

    case "quarter-bl":
      ctx.beginPath();
      ctx.moveTo(x, y + size);
      ctx.lineTo(x, y);
      ctx.arc(x, y + size, size, -Math.PI / 2, 0);
      ctx.closePath();
      ctx.fill();
      break;

    case "quarter-br":
      ctx.beginPath();
      ctx.moveTo(x + size, y + size);
      ctx.lineTo(x, y + size);
      ctx.arc(x + size, y + size, size, Math.PI, Math.PI * 1.5);
      ctx.closePath();
      ctx.fill();
      break;

    case "circle":
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "solid":
      ctx.fillRect(x, y, size, size);
      break;
  }

  ctx.restore();
}

// ─── Animation helpers ───────────────────────────────────────────────

interface MovingTile {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  cell: Cell;
  duration: number;
  startTime: number;
  rotation: number;
}

function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── Component ───────────────────────────────────────────────────────

interface BauhausGridProps {
  className?: string;
}

export default function BauhausGrid({ className = "" }: BauhausGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<(Cell | null)[][]>([]);
  const movingRef = useRef<MovingTile[]>([]);
  const timerRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef({ cols: 0, rows: 0 });

  // Mouse position in viewport coords (-1 = not on screen).
  const mouseRef = useRef({ x: -1, y: -1 });

  // Hover tracking.
  const hoverRowRef = useRef(-1);
  const hoverColRef = useRef(-1);

  // ── Collision / cooldown state ────────────────────────────────
  // "r,c" → destination cell that a tile is currently sliding toward.
  // Prevents two tiles from targeting the same empty cell.
  const reservedRef = useRef(new Set<string>());

  // "r,c" → timestamp (ms) when the cell is allowed to move again.
  const cooldownRef = useRef(new Map<string, number>());

  /** True if a cell can move right now (not in cooldown). */
  const canMove = useCallback((row: number, col: number) => {
    const key = `${row},${col}`;
    const exp = cooldownRef.current.get(key);
    return !exp || performance.now() >= exp;
  }, []);

  /** True if a destination cell is available (empty, not reserved). */
  const canTarget = useCallback(
    (row: number, col: number) => {
      const { cols, rows } = sizeRef.current;
      if (row < 0 || row >= rows || col < 0 || col >= cols) return false;
      if (gridRef.current[row][col]) return false; // occupied
      if (reservedRef.current.has(`${row},${col}`)) return false; // in transit
      return true;
    },
    [],
  );

  // ── Initialise ─────────────────────────────────────────────────

  const initGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const cols = Math.ceil(w / CELL) + 2;
    const rows = Math.ceil(h / CELL) + 2;

    sizeRef.current = { cols, rows };
    gridRef.current = createGrid(cols, rows);
    movingRef.current = [];
    reservedRef.current.clear();
    cooldownRef.current.clear();
  }, []);

  const renderStatic = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const grid = gridRef.current;
    const { cols, rows } = sizeRef.current;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        if (cell) drawCell(ctx, cell, c * CELL, r * CELL, CELL);
      }
    }
    ctx.restore();
  }, []);

  // ── Execute a move (mutates grid, marks reserved + cooldown) ───

  const executeMove = useCallback(
    (
      fromRow: number,
      fromCol: number,
      toRow: number,
      toCol: number,
      duration: number,
    ) => {
      const grid = gridRef.current;
      const cell = grid[fromRow][fromCol];
      if (!cell) return;

      // Commit in grid.
      grid[toRow][toCol] = cell;
      grid[fromRow][fromCol] = null;

      // Reserve the destination so nothing else can target it.
      reservedRef.current.add(`${toRow},${toCol}`);

      // Cooldown on the source cell (it just vacated — don't let
      // something else immediately pile in and then move again).
      cooldownRef.current.set(
        `${fromRow},${fromCol}`,
        performance.now() + COOLDOWN_MS,
      );
      // Also cooldown on the destination — the arriving tile shouldn't
      // be triggered again for a while.
      cooldownRef.current.set(
        `${toRow},${toCol}`,
        performance.now() + COOLDOWN_MS,
      );

      movingRef.current.push({
        fromRow,
        fromCol,
        toRow,
        toCol,
        cell,
        duration,
        startTime: performance.now(),
        rotation: (Math.random() - 0.5) * Math.PI * 0.4,
      });
    },
    [],
  );

  // ── Move scheduling (automatic) ────────────────────────────────

  const findMove = useCallback(
    ():
      | { fromRow: number; fromCol: number; toRow: number; toCol: number }
      | null => {
      const { cols, rows } = sizeRef.current;
      const grid = gridRef.current;
      const now = performance.now();
      const moves: {
        fromRow: number;
        fromCol: number;
        toRow: number;
        toCol: number;
      }[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!grid[r][c]) continue;
          if (!canMove(r, c)) continue;

          const neighbours = [
            [r - 1, c],
            [r + 1, c],
            [r, c - 1],
            [r, c + 1],
          ];
          for (const [nr, nc] of neighbours) {
            if (canTarget(nr, nc)) {
              moves.push({
                fromRow: r,
                fromCol: c,
                toRow: nr,
                toCol: nc,
              });
            }
          }
        }
      }

      if (moves.length === 0) return null;
      return moves[Math.floor(Math.random() * moves.length)];
    },
    [canMove, canTarget],
  );

  const scheduleNext = useCallback(() => {
    const delay = 1800 + Math.random() * 3200;
    timerRef.current = window.setTimeout(() => {
      const move = findMove();
      if (move) {
        executeMove(
          move.fromRow,
          move.fromCol,
          move.toRow,
          move.toCol,
          600 + Math.random() * 400,
        );
      }

      scheduleNext();
    }, delay);
  }, [findMove, executeMove]);

  // ── Hover: trigger a slide ─────────────────────────────────────

  const triggerHoverSlide = useCallback(
    (row: number, col: number) => {
      const grid = gridRef.current;
      const { cols, rows } = sizeRef.current;
      if (!grid[row][col]) return;
      if (!canMove(row, col)) return;

      const neighbours = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ];
      const empty: [number, number][] = [];
      for (const [nr, nc] of neighbours) {
        if (canTarget(nr, nc)) {
          empty.push([nr, nc]);
        }
      }
      if (empty.length === 0) return;

      const [tr, tc] = empty[Math.floor(Math.random() * empty.length)];
      executeMove(row, col, tr, tc, 500);
    },
    [canMove, canTarget, executeMove],
  );

  // ── Render loop ─────────────────────────────────────────────────

  const render = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const grid = gridRef.current;
      const { cols, rows } = sizeRef.current;

      // ── Which cell is the mouse over? ────────────────────────
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const newHoverCol = mx >= 0 ? Math.floor(mx / CELL) : -1;
      const newHoverRow = my >= 0 ? Math.floor(my / CELL) : -1;

      // ── Detect hover cell change → trigger slide ─────────────
      if (
        newHoverRow !== hoverRowRef.current ||
        newHoverCol !== hoverColRef.current
      ) {
        hoverRowRef.current = newHoverRow;
        hoverColRef.current = newHoverCol;

        if (
          newHoverRow >= 0 &&
          newHoverRow < rows &&
          newHoverCol >= 0 &&
          newHoverCol < cols &&
          grid[newHoverRow]?.[newHoverCol]
        ) {
          triggerHoverSlide(newHoverRow, newHoverCol);
        }
      }

      // ── Cells mid-slide ──────────────────────────────────────
      const animating = new Set<string>();
      for (const m of movingRef.current) {
        animating.add(`${m.toRow},${m.toCol}`);
      }

      // ── Draw all static tiles ────────────────────────────────
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (animating.has(`${r},${c}`)) continue;
          const cell = grid[r][c];
          if (cell) drawCell(ctx, cell, c * CELL, r * CELL, CELL);
        }
      }

      // ── Draw sliding tiles + release reservations on completion ──
      const still: MovingTile[] = [];
      for (const m of movingRef.current) {
        const raw = Math.min((time - m.startTime) / m.duration, 1);
        const t = ease(raw);

        const fromX = m.fromCol * CELL;
        const fromY = m.fromRow * CELL;
        const toX = m.toCol * CELL;
        const toY = m.toRow * CELL;

        const x = fromX + (toX - fromX) * t;
        const y = fromY + (toY - fromY) * t;
        const rot = m.rotation * Math.sin(t * Math.PI);

        ctx.save();
        ctx.translate(x + CELL / 2, y + CELL / 2);
        ctx.rotate(rot);
        ctx.translate(-(x + CELL / 2), -(y + CELL / 2));
        drawCell(ctx, m.cell, x, y, CELL);
        ctx.restore();

        if (raw < 1) {
          still.push(m);
        } else {
          // Slide complete — release the reservation.
          reservedRef.current.delete(`${m.toRow},${m.toCol}`);
        }
      }
      movingRef.current = still;

      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    },
    [triggerHoverSlide],
  );

  // ── Mouse tracking via window (canvas is behind content) ───────

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -1, y: -1 };
      hoverRowRef.current = -1;
      hoverColRef.current = -1;
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  // ── Lifecycle ───────────────────────────────────────────────────

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    initGrid();

    if (mq.matches) {
      renderStatic();
      return;
    }

    scheduleNext();
    rafRef.current = requestAnimationFrame(render);

    const onResize = () => {
      initGrid();
      renderStatic();
    };
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [initGrid, scheduleNext, render, renderStatic]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 ${className}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
