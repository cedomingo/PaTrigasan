"use client";

import { useState } from "react";
import { Card, Button, Tag, SectionLabel, Divider, MathText } from "@/components/ui";
import { SubtleArc, FaintGrid, TranslucentCircle } from "@/components/background";

const SWATCHES: { name: string; varName: string; hex: string }[] = [
  { name: "Primary navy", varName: "--color-navy", hex: "#1E3A5F" },
  { name: "Dark navy", varName: "--color-navy-dark", hex: "#162B46" },
  { name: "Medium blue", varName: "--color-blue-medium", hex: "#315D8F" },
  { name: "Soft blue", varName: "--color-blue-soft", hex: "#DCE8F5" },
  { name: "Very light blue", varName: "--color-blue-faint", hex: "#EEF4FA" },
  { name: "Background", varName: "--color-bg", hex: "#F8FAFC" },
  { name: "Pure white", varName: "--color-white", hex: "#FFFFFF" },
  { name: "Main text", varName: "--color-text", hex: "#1F2937" },
  { name: "Secondary text", varName: "--color-text-muted", hex: "#64748B" },
  { name: "Border", varName: "--color-border", hex: "#D7E0EA" },
];

export default function DesignPreviewPage() {
  const [selected, setSelected] = useState<string | null>("B");

  return (
    <div className="relative mx-auto max-w-3xl px-6 py-16">
      <TranslucentCircle
        tone="blue"
        size={360}
        className="-right-32 -top-24 -z-10"
      />
      <FaintGrid className="inset-x-0 -top-8 -z-10 h-72 w-full" />

      <header className="mb-16">
        <SectionLabel underline>Design preview</SectionLabel>
        <h1 className="font-serif mt-3 text-4xl">Math Sprint — Style Guide</h1>
        <p className="mt-3 max-w-lg font-sans text-sm leading-6 text-text-muted">
          Design tokens and base components, for visual QA
          before real screens get built on top. This page can be removed or
          kept as a living reference.
        </p>
      </header>

      {/* Color tokens */}
      <section className="mb-16">
        <SectionLabel>Color tokens</SectionLabel>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {SWATCHES.map((s) => (
            <div key={s.varName}>
              <div
                className="h-16 rounded-sm border border-border"
                style={{ background: s.hex }}
              />
              <p className="mt-1.5 font-sans text-xs font-medium">{s.name}</p>
              <p className="font-sans text-[11px] text-text-muted">{s.hex}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider className="mb-16" />

      {/* Typography */}
      <section className="mb-16">
        <SectionLabel>Typography</SectionLabel>
        <div className="mt-4 space-y-4">
          <p className="font-serif text-4xl text-navy">Serif display — Aa Bb Cc</p>
          <p className="font-sans text-base text-text">
            Sans body / UI — The derivative of a composite function follows the chain rule.
          </p>
          <p className="font-sans text-xs uppercase tracking-[0.08em] text-text-muted">
            Sans label — small uppercase, letter-spaced
          </p>
          <div className="flex items-center gap-8 pt-2">
            <div>
              <p className="mb-1 font-sans text-xs text-text-muted">Math (KaTeX)</p>
              <MathText latex="\csc^{-1}x" className="text-3xl" />
            </div>
            <div>
              <p className="mb-1 font-sans text-xs text-text-muted">Answer</p>
              <MathText latex="\dfrac{1}{x\sqrt{x^2-1}}" className="text-2xl" />
            </div>
          </div>
        </div>
      </section>

      <Divider className="mb-16" />

      {/* Buttons */}
      <section className="mb-16">
        <SectionLabel>Buttons</SectionLabel>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button variant="primary">Start Sprint</Button>
          <Button variant="secondary">Start Flashcards</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </section>

      <Divider className="mb-16" />

      {/* Tags */}
      <section className="mb-16">
        <SectionLabel>Tags / badges</SectionLabel>
        <div className="mt-4 flex flex-wrap gap-3">
          <Tag tone="neutral">Derivatives</Tag>
          <Tag tone="navy">Selected</Tag>
          <Tag tone="correct">Correct</Tag>
          <Tag tone="wrong">Missed</Tag>
        </div>
      </section>

      <Divider className="mb-16" />

      {/* Cards */}
      <section className="mb-16">
        <SectionLabel>Cards</SectionLabel>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card variant="default">
            <p className="font-sans text-sm font-medium text-navy">Default card</p>
            <p className="mt-1 font-sans text-sm text-text-muted">
              Thin border, minimal shadow, generous padding.
            </p>
          </Card>
          <Card variant="selected">
            <p className="font-sans text-sm font-medium text-navy">Selected card</p>
            <p className="mt-1 font-sans text-sm text-text-muted">
              Soft-blue fill, navy border — used for checked categories.
            </p>
          </Card>
        </div>
      </section>

      <Divider className="mb-16" />

      {/* Answer-option style interactive cards */}
      <section className="mb-16">
        <SectionLabel underline>Inverse trigonometric</SectionLabel>
        <p className="mt-4 font-serif text-lg text-blue-medium">
          <MathText latex="D_x" className="text-lg" /> of:
        </p>
        <p className="mt-1">
          <MathText latex="\csc^{-1}x" className="text-4xl" />
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { id: "A", latex: "\\dfrac{1}{\\sqrt{1-x^2}}" },
            { id: "B", latex: "\\dfrac{1}{x\\sqrt{x^2-1}}" },
            { id: "C", latex: "-\\dfrac{1}{x\\sqrt{x^2-1}}" },
            { id: "D", latex: "-\\dfrac{1}{\\sqrt{1-x^2}}" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`flex items-center gap-3 rounded-md border p-4 text-left transition-colors duration-150 ${
                selected === opt.id
                  ? "border-navy bg-blue-faint"
                  : "border-border bg-white hover:bg-blue-faint hover:border-blue-medium"
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-soft font-sans text-xs font-semibold text-navy">
                {opt.id}
              </span>
              <MathText latex={opt.latex} className="text-lg" />
            </button>
          ))}
        </div>
      </section>

      <Divider className="mb-16" />

      {/* Background accents */}
      <section className="mb-16">
        <SectionLabel>Background accents</SectionLabel>
        <div className="relative mt-4 h-40 overflow-hidden rounded-md border border-border bg-white">
          <SubtleArc className="-bottom-24 -right-24" />
          <FaintGrid className="inset-0" />
          <TranslucentCircle tone="navy" size={140} className="-left-10 -top-10" />
          <p className="absolute bottom-3 left-4 font-sans text-xs text-text-muted">
            SubtleArc + FaintGrid + TranslucentCircle, layered at low opacity
          </p>
        </div>
      </section>
    </div>
  );
}
