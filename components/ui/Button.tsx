import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-navy text-white border border-navy hover:bg-navy-dark active:bg-navy-dark disabled:bg-border disabled:border-border disabled:text-text-muted",
  secondary:
    "bg-white text-navy border border-navy hover:bg-blue-faint active:bg-blue-soft disabled:text-text-muted disabled:border-border",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

/**
 * Rectangular, slightly rounded buttons per the design spec — never pill
 * shaped. Hover/press states are subtle color shifts, no transform or
 * shadow theatrics.
 */
export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`rounded-sm font-sans font-medium tracking-tight transition-colors duration-150 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
