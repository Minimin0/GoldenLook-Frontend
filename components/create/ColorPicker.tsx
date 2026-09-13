"use client";

import { Check } from "lucide-react";
import { PALETTE, type ColorId } from "@/lib/colors";
import { cn } from "@/lib/cn";

/**
 * 색은 자유 입력이 아니라 20색 팔레트에서만 고른다. (기획서 4.2)
 * 색 id 는 동결 항목이라 여기서 새 색을 추가하지 않는다. 목록은
 * `lib/generated/colors.json` = Integration `contracts/colors.json` 한 곳에서만 온다.
 */
export function ColorPicker({
  value,
  onChange,
  labelledBy,
}: {
  value?: ColorId | null;
  onChange: (id: ColorId) => void;
  labelledBy?: string;
}) {
  return (
    <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-labelledby={labelledBy}>
      {PALETTE.map((color) => {
        const selected = value === color.id;
        return (
          <button
            key={color.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={color.name}
            onClick={() => onChange(color.id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-1 py-2 transition-colors",
              selected ? "bg-navy-50" : "hover:bg-paper",
            )}
          >
            <span
              className={cn(
                "grid size-9 place-items-center rounded-full",
                color.light ? "border border-line" : "border border-black/5",
                selected && "ring-2 ring-navy-700 ring-offset-2",
              )}
              style={{ backgroundColor: color.hex }}
            >
              {selected && (
                <Check size={18} strokeWidth={3} className={color.light ? "text-ink" : "text-white"} />
              )}
            </span>
            <span className={cn("text-[11px] font-semibold", selected ? "text-navy-800" : "text-muted")}>
              {color.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
