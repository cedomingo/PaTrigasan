import type { Metadata } from "next";
import MathSprintApp from "@/components/MathSprintApp";

export const metadata: Metadata = {
  title: "Math Sprint — Library",
  description: "Math Sprint for the school library.",
  // Not linked from the public site; keep it out of search results too.
  robots: { index: false, follow: false },
};

export default function MathLibPage() {
  return <MathSprintApp variant="library" />;
}
