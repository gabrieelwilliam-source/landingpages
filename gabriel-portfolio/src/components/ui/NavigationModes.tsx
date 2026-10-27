"use client";
import type { NavigationMode } from "@/lib/spatial-engine";
export default function NavigationModes({
  value,
  onChange,
}: {
  value: NavigationMode;
  onChange: (mode: NavigationMode) => void;
}) {
  return (
    <div
      className="navigation-modes"
      role="group"
      aria-label="Forma de explorar"
    >
      {(
        [
          { id: "walk", label: "Caminhar" },
          { id: "scroll", label: "Scroll" },
        ] as const
      ).map((mode) => (
        <button
          key={mode.id}
          aria-pressed={value === mode.id}
          onClick={() => onChange(mode.id)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
