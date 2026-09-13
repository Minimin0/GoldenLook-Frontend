import { cn } from "@/lib/cn";
import { ColorChip } from "@/components/ui/StatusBadge";
import { PART_LABEL, describeGarment, recolorableParts } from "@/lib/appearance";
import type { Appearance } from "@/lib/schemas";

export function AppearanceBox({ appearance }: { appearance: Appearance }) {
  return (
    <section className="rounded-2xl border-2 border-navy-800 bg-white p-4">
      <h2 className="text-base font-extrabold text-navy-800">실종 당시 착장</h2>
      <p className="mt-0.5 text-[13px] text-muted">
        보호자가 기억하는 정보만 적혀 있습니다. 비어 있는 항목은 확인되지 않았습니다.
      </p>

      <div className="mt-2 divide-y divide-line">
        {recolorableParts.map((key) => {
          const part = appearance[key];
          const known = part.status === "known";
          return (
            <div className="flex items-center gap-3 py-2.5" key={key}>
              <span className="w-12 shrink-0 text-sm font-bold text-navy-600">
                {PART_LABEL[key]}
              </span>
              <ColorChip colorId={known ? part.color : null} />
              <span
                className={cn(
                  "flex-1 text-[15px] font-semibold",
                  known ? "text-ink" : "text-muted/80",
                )}
              >
                {describeGarment(part, PART_LABEL[key])}
                {known && part.brand && (
                  <span className="ml-1.5 text-[13px] font-medium text-muted">{part.brand}</span>
                )}
              </span>
            </div>
          );
        })}

        <div className="flex items-start gap-3 py-2.5">
          <span className="w-12 shrink-0 pt-0.5 text-sm font-bold text-navy-600">소지품</span>
          <div className="flex-1">
            {appearance.items.length === 0 ? (
              <span className="text-[15px] font-semibold text-muted/80">기억 안 남</span>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {appearance.items.map((item) => (
                  <li
                    key={item.type}
                    className="flex items-center gap-1.5 rounded-lg bg-paper px-2.5 py-1.5 text-[14px] font-semibold text-ink"
                  >
                    <ColorChip colorId={item.color} size={16} />
                    {item.type}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
