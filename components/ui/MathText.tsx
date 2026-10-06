"use client";

import katex from "katex";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

interface MathTextProps {
  latex: string;
  /** Inline (default) renders within text flow; display centers on its own line, slightly larger. */
  display?: boolean;
  className?: string;
}

/**
 * `useLayoutEffect` warns when React renders on the server, and this app is
 * server-rendered (the first flashcard's formula is in the initial HTML), so
 * fall back to `useEffect` there. Either way the effect only touches the DOM,
 * never the markup — and in the browser a layout effect runs before the first
 * paint, which is what keeps an over-wide formula from flashing past the
 * card's edge for a frame before it is shrunk to fit.
 */
const useFitLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * How much room inline math has: the parent's content box, measured from the
 * math's own left edge. Inline math shares its line with whatever precedes it
 * (an answer option's "A" marker, a leading "D_x of:"), so the parent's full
 * width would overstate the space actually available to it.
 */
function inlineRoom(frame: HTMLElement): number {
  const parent = frame.parentElement;
  if (!parent) return 0;

  const style = getComputedStyle(parent);
  const parentRect = parent.getBoundingClientRect();
  const contentRight =
    parentRect.right -
    (parseFloat(style.paddingRight) || 0) -
    (parseFloat(style.borderRightWidth) || 0);

  return contentRight - frame.getBoundingClientRect().left;
}

/**
 * Renders LaTeX via KaTeX server-side (renderToString), so math never
 * flashes unstyled and works without client JS. Used everywhere the app
 * shows a function or an answer — never hand-rolled CSS fractions, per the
 * design spec.
 *
 * Formulas are also shrunk to fit their container when they would otherwise
 * overflow it. KaTeX never wraps, so the long set-builder domains and ranges
 * (e.g. `\mathbb{R} - \left\{(2n+1)\dfrac{\pi}{2} : n \in \mathbb{Z}\right\}`)
 * are wider than a phone's card at any legible size and used to run out past
 * the card's padding. The scale is applied as a **font-size multiplier**
 * rather than a `transform`: everything KaTeX lays out is sized in `em`, so
 * the formula's own box shrinks with it, whereas a transform would scale the
 * glyphs but still reserve their full, overflowing width in layout. The
 * shrink only ever applies to a formula that genuinely does not fit, so
 * anything short enough still renders at its `className` size.
 *
 * Only width is fitted, never height. Height is handled by the containers
 * instead — the flashcard's slot reserves room for the tallest construct in
 * the bank (see `--flashcard-face-h` in globals.css) — because a formula that
 * does not fit its slot can always be given a taller slot, whereas scaling
 * one down to fit a cramped one would eventually make it unreadable.
 */
export default function MathText({ latex, display = false, className = "" }: MathTextProps) {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: display,
  });

  const frameRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  // Mirrors `scale` for the measurement below, which needs the size the
  // formula is *currently* rendered at to turn a measured width into a scale.
  const scaleRef = useRef(1);
  const [scale, setScale] = useState(1);

  const fit = useCallback(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;

    const available = display ? frame.clientWidth : inlineRoom(frame);
    if (!available) return;

    // Natural (unshrunk) width of the formula, measured with the box's own
    // width cap lifted — still inside the same layout pass, before paint, so
    // this wider size is never shown.
    const cap = content.style.maxWidth;
    content.style.maxWidth = "none";
    const natural = content.getBoundingClientRect().width;
    content.style.maxWidth = cap;

    if (!natural) return;

    const current = scaleRef.current;
    // Ratio of the room to the formula *at its current size*. Multiplying by
    // it lands the formula exactly on the room in one step, and because the
    // ratio is measured against the current size rather than a fixed baseline,
    // re-running with the formula already fitted is a no-op — which is what
    // keeps the resize observer from looping. Capped at 1 so nothing ever
    // grows past its `className` size, and uncapped below it so a formula
    // shrunk for a narrow container grows back when the container (a rotated
    // phone, a resized window) gets wider again.
    const next = Math.min(1, current * (available / natural));

    // Ignore sub-pixel churn from further layout passes (the shrink changes
    // the frame's height, which re-triggers this through the observer).
    if (Math.abs(next - current) < 0.005) return;

    scaleRef.current = next;
    setScale(next);
  }, [display]);

  useFitLayoutEffect(() => {
    fit();

    const frame = frameRef.current;
    let observer: ResizeObserver | undefined;
    if (frame && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(fit);
      observer.observe(frame);
    }

    // Re-fit once the KaTeX webfonts land: until then the browser measures
    // fallback glyphs, whose widths are not the ones the fit was based on.
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(fit).catch(() => {});
    }

    return () => observer?.disconnect();
    // `html` rather than `latex`: it changes exactly when the rendered formula
    // does, and `className` because that is where the base type size lives.
  }, [fit, html, className]);

  if (display) {
    return (
      <span
        ref={frameRef}
        // `min-w-0` so the frame can be narrower than its own nowrap content
        // when it is a flex item (the sprint's question slot) — without it the
        // item would grow to the formula's full width and there would be
        // nothing to measure against.
        className={`block w-full min-w-0 overflow-hidden font-serif text-navy ${className}`}
      >
        <span
          ref={contentRef}
          className="mx-auto block w-max max-w-full"
          style={{ fontSize: `${scale}em` }}
          dangerouslySetInnerHTML={{ __html: html }}
          suppressHydrationWarning
        />
      </span>
    );
  }

  return (
    <span ref={frameRef} className={`font-serif text-navy ${className}`}>
      <span
        ref={contentRef}
        style={{ fontSize: `${scale}em` }}
        dangerouslySetInnerHTML={{ __html: html }}
        suppressHydrationWarning
      />
    </span>
  );
}
