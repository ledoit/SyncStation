"use client";

import {
  BLANK_SLOT_COLOR,
  MOODLIGHT_COLOR_SLOTS,
  MOODLIGHT_SLOT_COUNT,
  normalizeHex,
} from "@strob/lib/colors";

type ColorPaletteProps = {
  colors: string[];
  onChange: (colors: string[]) => void;
};

export function ColorPalette({ colors, onChange }: ColorPaletteProps) {
  const slots = Array.from(
    { length: MOODLIGHT_SLOT_COUNT },
    (_, i) => colors[i] ?? MOODLIGHT_COLOR_SLOTS[i] ?? "",
  );

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-300">Colors</p>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((color, index) => {
          const hex = normalizeHex(color);
          const isBlank = !hex;
          return (
            <label
              key={index}
              className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full ring-2 ring-zinc-600 transition hover:ring-zinc-400"
              style={{
                backgroundColor: isBlank ? BLANK_SLOT_COLOR : hex,
              }}
              title={isBlank ? `Color ${index + 1} (empty)` : `Color ${index + 1}`}
            >
              <input
                type="color"
                value={isBlank ? "#ffffff" : hex}
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => {
                  const next = [...slots];
                  next[index] = e.target.value;
                  onChange(next);
                }}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
