interface DividerProps {
  className?: string;
}

/** A thin horizontal rule, used to separate HUD/header regions from content below. */
export default function Divider({ className = "" }: DividerProps) {
  return <hr className={`border-t border-border ${className}`} />;
}
