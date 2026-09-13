"use client";

interface NameInputProps {
  name: string;
  onChange: (name: string) => void;
}

export default function NameInput({ name, onChange }: NameInputProps) {
  return (
    <div>
      <label
        htmlFor="player-name"
        className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.08em] text-text-muted"
      >
        Your name
      </label>
      <input
        id="player-name"
        type="text"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Isko"
        maxLength={20}
        className="w-full max-w-xs rounded-sm border border-border bg-white px-4 py-2.5 font-sans text-sm text-text placeholder:text-text-muted focus:border-blue-medium"
      />
    </div>
  );
}
