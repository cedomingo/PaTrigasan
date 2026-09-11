"use client";

import { useEffect, useState } from "react";

interface IntroOverlayProps {
  onComplete: () => void;
}

export default function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const [phase, setPhase] = useState<"loading" | "done">("loading");

  useEffect(() => {
    const timer = setTimeout(() => setPhase("done"), 2200);
    const cleanup = setTimeout(onComplete, 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700 ${
        phase === "done" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-bg/60 backdrop-blur-md" />

      <div
        className={`relative z-10 w-full max-w-sm mx-6 rounded-md border border-border bg-white shadow-[var(--shadow-card)] px-8 py-10 text-center transition-all duration-500 ${
          phase === "done" ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <h1 className="font-serif text-4xl text-navy sm:text-5xl">
          Math Sprint
        </h1>

        <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-blue-faint">
          <div
            className={`h-full rounded-full bg-navy transition-all ease-linear ${
              phase === "done" ? "w-full" : "w-0"
            }`}
            style={{
              transitionDuration: phase === "done" ? "0ms" : "2000ms",
            }}
          />
        </div>
      </div>
    </div>
  );
}
