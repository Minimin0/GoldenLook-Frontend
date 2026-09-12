"use client";

import { Check } from "lucide-react";
import { PALETTE, type ColorId } from "@/lib/colors";
import { cn } from "@/lib/cn";

/**
 * 색은 자유 입력이 아니라 20색 팔레트에서만 고른다. (기획서 4.2)
 * 색상 id 는 동결 대상이므로 여기서 새 색을 추가하지 않는다.
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
            onClick={() => onChange(color.id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-1 py-2 transition-colors",
              selected ? "bg-navy-50" : "hover:bg-paper",
            )}
          >
            <span
              className={cn(
                "grid size-9 place-items-center rounded-full",
                color.border ? "border border-line" : "border border-black/5",
                selected && "ring-2 ring-navy-700 ring-offset-2",
              )}
              style={{ backgroundColor: color.hex }}
            >
              {selected && (
                <Check
                  size={18}
                  strokeWidth={3}
                  className={isLight(color.hex) ? "text-ink" : "text-white"}
                />
              )}
            </span>
            <span
              className={cn(
                "text-[11px] font-semibold",
                selected ? "text-navy-800" : "text-muted",
              )}
            >
              {color.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** 체크 아이콘 색을 정하기 위한 간이 명도 판정 */
function isLight(hex: string) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 165;
}
