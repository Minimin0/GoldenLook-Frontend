"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { ClothingField, TYPE_OPTIONS } from "@/components/create/ClothingField";
import { ColorPicker } from "@/components/create/ColorPicker";
import { ColorChip } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import type { AppearanceDraft, GarmentDraft, RecolorablePart } from "@/lib/appearance";
import type { ColorId } from "@/lib/colors";

export function AppearanceStep({
  draft,
  onChange,
  missingColors,
  onPendingItemChange,
}: {
  draft: AppearanceDraft;
  onChange: (next: AppearanceDraft) => void;
  missingColors: RecolorablePart[];
  onPendingItemChange?: (pending: boolean) => void;
}) {
  const [itemDraft, setItemDraft] = useState("");
  const [itemColor, setItemColor] = useState<ColorId | null>(null);
  const [colorOpen, setColorOpen] = useState(false);

  const setPart = (key: RecolorablePart) => (part: GarmentDraft) =>
    onChange({ ...draft, [key]: part });

  useEffect(() => () => onPendingItemChange?.(false), [onPendingItemChange]);

  const addItem = () => {
    const type = itemDraft.trim();
    if (!type || draft.items.length >= 5) return;
    onChange({ ...draft, items: [...draft.items, { type, color: itemColor }] });
    setItemDraft("");
    onPendingItemChange?.(false);
    setItemColor(null);
    setColorOpen(false);
  };

  const removeItem = (index: number) =>
    onChange({ ...draft, items: draft.items.filter((_, i) => i !== index) });

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[20px] font-extrabold tracking-tight text-ink">
          실종 당시 옷차림을 골라 주세요
        </h2>
        <p className="mt-1 text-[14px] leading-relaxed text-muted">
          확실한 것만 고르면 됩니다. 기억나지 않는 항목은 &lsquo;기억 안 나요&rsquo; 로 두어도 전단을
          만들 수 있습니다.
        </p>
      </div>

      <ClothingField
        colorMissing={missingColors.includes("top")}
        onChange={setPart("top")}
        part={draft.top}
        title="상의"
        typeOptions={TYPE_OPTIONS.top}
        withBrand
      />
      <ClothingField
        colorMissing={missingColors.includes("bottom")}
        onChange={setPart("bottom")}
        part={draft.bottom}
        title="하의"
        typeOptions={TYPE_OPTIONS.bottom}
        withBrand
      />
      <ClothingField
        allowNone
        colorMissing={missingColors.includes("hat")}
        onChange={setPart("hat")}
        part={draft.hat}
        title="모자"
        typeOptions={TYPE_OPTIONS.hat}
      />
      <ClothingField
        allowNone
        colorMissing={missingColors.includes("shoes")}
        onChange={setPart("shoes")}
        part={draft.shoes}
        title="신발"
        typeOptions={TYPE_OPTIONS.shoes}
      />

      <div className="rounded-2xl border border-line bg-white p-4">
        <h3 className="text-[15px] font-extrabold text-ink">가지고 있던 물건</h3>
        <p className="mt-0.5 text-[13px] text-muted">
          지팡이, 가방처럼 눈에 띄는 물건이 있으면 적어 주세요. 전단 글자에만 들어갑니다. (최대 5개)
        </p>

        <div className="mt-3 flex gap-2">
          <input
            className="h-11 flex-1 rounded-xl border border-line px-3 text-[15px] outline-none focus:border-navy-400"
            maxLength={60}
            onChange={(event) => {
              const value = event.target.value;
              setItemDraft(value);
              onPendingItemChange?.(Boolean(value.trim()));
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addItem();
              }
            }}
            placeholder="예: 나무 지팡이"
            value={itemDraft}
          />
          <Button disabled={!itemDraft.trim() || draft.items.length >= 5} onClick={addItem} variant="ghost">
            <Plus size={18} />
            추가
          </Button>
        </div>

        <button
          className="mt-2 flex items-center gap-2 text-[13px] font-bold text-navy-600"
          onClick={() => setColorOpen((open) => !open)}
          type="button"
        >
          <ColorChip colorId={itemColor} size={18} />
          {itemColor ? "색 바꾸기" : "색도 기억나요"}
        </button>
        {colorOpen && (
          <div className="mt-2">
            <ColorPicker onChange={(color) => setItemColor(color)} value={itemColor} />
          </div>
        )}

        {draft.items.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {draft.items.map((item, index) => (
              <li
                className="flex items-center gap-1.5 rounded-lg bg-paper py-1.5 pl-2.5 pr-1.5 text-[14px] font-semibold"
                key={`${item.type}-${index}`}
              >
                <ColorChip colorId={item.color} size={16} />
                {item.type}
                <button
                  aria-label={`${item.type} 삭제`}
                  className="grid size-6 place-items-center rounded-md text-muted hover:bg-line"
                  onClick={() => removeItem(index)}
                  type="button"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
