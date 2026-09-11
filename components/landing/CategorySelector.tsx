"use client";

import type { Subject } from "@/types";
import { SectionLabel } from "@/components/ui";
import CategoryCheckboxGroup from "@/components/category/CategoryCheckboxGroup";

interface CategorySelectorProps {
  subjects: Subject[];
  selectedIds: Set<string>;
  onToggle: (categoryId: string) => void;
}

export default function CategorySelector({
  subjects,
  selectedIds,
  onToggle,
}: CategorySelectorProps) {
  return (
    <div>
      <SectionLabel underline>Choose your topics</SectionLabel>
      <CategoryCheckboxGroup
        subjects={subjects}
        selectedIds={selectedIds}
        onToggle={onToggle}
      />
    </div>
  );
}
