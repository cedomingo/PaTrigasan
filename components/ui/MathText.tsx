import katex from "katex";

interface MathTextProps {
  latex: string;
  /** Inline (default) renders within text flow; display centers on its own line, slightly larger. */
  display?: boolean;
  className?: string;
}

/**
 * Renders LaTeX via KaTeX server-side (renderToString), so math never
 * flashes unstyled and works without client JS. Used everywhere the app
 * shows a function or an answer — never hand-rolled CSS fractions, per the
 * design spec.
 */
export default function MathText({ latex, display = false, className = "" }: MathTextProps) {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: display,
  });

  return (
    <span
      className={`font-serif text-navy ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
