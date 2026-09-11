"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Subject } from "@/types";
import CategoryCheckboxGroup from "@/components/category/CategoryCheckboxGroup";

export type ModeTab = "sprint" | "practice";

interface ModeTabBarProps {
  active: ModeTab | null;
  onSelect: (tab: ModeTab) => void;
  subjects: Subject[];
  selectedIds: Set<string>;
  onToggleCategory: (categoryId: string) => void;
}

const TABS: { id: ModeTab; label: string }[] = [
  { id: "sprint", label: "Start Sprint" },
  { id: "practice", label: "Practice" },
];

/**
 * Thin toolbar row with two mode buttons. Each button has a small
 * dropdown chevron on its right edge — clicking the chevron opens a
 * floating overlay with the category checkbox group; clicking the
 * button text itself starts the chosen mode (inline, same tab).
 */
export default function ModeTabBar({
  active,
  onSelect,
  subjects,
  selectedIds,
  onToggleCategory,
}: ModeTabBarProps) {
  const [openDropdown, setOpenDropdown] = useState<ModeTab | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const chevronRefs = useRef<Map<ModeTab, HTMLButtonElement>>(new Map());

  const toggleDropdown = useCallback(
    (tab: ModeTab, e: React.MouseEvent) => {
      e.stopPropagation();
      setOpenDropdown((prev) => (prev === tab ? null : tab));
    },
    [],
  );

  // Close overlay on outside click
  useEffect(() => {
    if (!openDropdown) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node) &&
        chevronRefs.current.get(openDropdown!) &&
        !chevronRefs.current.get(openDropdown!)!.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  return (
    <div className="relative">
      <div
        role="toolbar"
        aria-label="Choose a mode"
        className="flex items-stretch overflow-hidden rounded-md border border-border"
      >
        {TABS.map((tab, i) => {
          const isActive = active === tab.id;
          const isDropdownOpen = openDropdown === tab.id;
          return (
            <div
              key={tab.id}
              className={`flex flex-1 items-center ${i === 0 ? "border-r border-border" : ""}`}
            >
              {/* Main button — starts the mode */}
              <button
                type="button"
                onClick={() => onSelect(tab.id)}
                className={`flex-1 px-4 py-2.5 text-left font-sans text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-white text-navy"
                    : "bg-blue-faint text-text-muted hover:bg-blue-soft hover:text-navy"
                }`}
              >
                {tab.label}
              </button>

              {/* Dropdown chevron — toggles the category overlay */}
              <button
                ref={(el) => {
                  if (el) chevronRefs.current.set(tab.id, el);
                }}
                type="button"
                aria-label={`${tab.label} categories`}
                aria-expanded={isDropdownOpen}
                onClick={(e) => toggleDropdown(tab.id, e)}
                className={`px-3 py-2.5 transition-colors duration-150 border-l ${
                  isActive
                    ? "bg-white text-navy border-border"
                    : "bg-blue-faint text-text-muted border-border hover:bg-blue-soft hover:text-navy"
                }`}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform duration-150 ${isDropdownOpen ? "rotate-180" : ""}`}
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating category overlay — positioned absolutely so it never pushes content */}
      {openDropdown && (
        <div
          ref={overlayRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-border bg-white p-4 shadow-[var(--shadow-card)]"
        >
          <div className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.08em] text-navy">
            Choose your topics
          </div>
          <CategoryCheckboxGroup
            subjects={subjects}
            selectedIds={selectedIds}
            onToggle={onToggleCategory}
          />
          {selectedIds.size === 0 && (
            <p className="mt-3 font-sans text-xs text-text-muted">
              Select at least one topic to continue.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
