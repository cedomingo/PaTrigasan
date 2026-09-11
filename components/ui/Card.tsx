import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

type CardVariant = "default" | "selected" | "interactive";

interface CardOwnProps {
  variant?: CardVariant;
  children: ReactNode;
  className?: string;
}

type CardProps<T extends ElementType> = CardOwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps | "as">;

const variantClasses: Record<CardVariant, string> = {
  default: "bg-white border-border",
  selected: "bg-blue-faint border-navy",
  interactive:
    "bg-white border-border hover:bg-blue-faint hover:border-blue-medium hover:shadow-[var(--shadow-card-hover)] cursor-pointer",
};

/**
 * Base card: white surface, subtle blue-gray border, minimal shadow,
 * rounded corners, generous padding. Use `variant="selected"` for an
 * active/checked state (soft-blue fill + navy border) and
 * `variant="interactive"` for cards that respond to hover (e.g. answer
 * options, category checkboxes).
 */
export default function Card<T extends ElementType = "div">({
  as,
  variant = "default",
  children,
  className = "",
  ...rest
}: CardProps<T>) {
  const Component = as || "div";
  return (
    <Component
      className={`rounded-md border shadow-[var(--shadow-card)] transition-[color,background-color,border-color,box-shadow] duration-150 p-6 ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
