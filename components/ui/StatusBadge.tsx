import { cn } from "@/lib/cn";
import { getColor, type ColorId } from "@/lib/colors";
import type { CaseListItem } from "@/lib/schemas";

/**
 * 전단 상태는 Backend 가 알려 주는 값만 쓴다.
 * 생성 상태(PENDING/GENERATING/GENERATED/TEMPORARY_ERROR) + 발행 여부가 전부이며,
 * "수색중 / 발견 완료" 같은 상태는 v4 MVP 데이터 모델에 없다.
 */
type Tone = "draft" | "ready" | "published" | "error";

const TONE_STYLE: Record<Tone, string> = {
  draft: "bg-paper text-muted border border-line",
  ready: "bg-navy-50 text-navy-700 border border-navy-100",
  published: "bg-signal-500 text-white",
  error: "bg-alert-50 text-alert-600 border border-alert-100",
};

export function caseStatus(item: Pick<CaseListItem, "published" | "generationStatus">) {
  if (item.published) return { tone: "published" as Tone, label: "발행됨" };
  switch (item.generationStatus) {
    case "GENERATED":
      return { tone: "ready" as Tone, label: "발행 전" };
    case "GENERATING":
      return { tone: "ready" as Tone, label: "생성 중" };
    case "TEMPORARY_ERROR":
      return { tone: "error" as Tone, label: "생성 실패" };
    default:
      return { tone: "draft" as Tone, label: "작성 중" };
  }
}

export function CaseStatusBadge({
  item,
  className,
}: {
  item: Pick<CaseListItem, "published" | "generationStatus">;
  className?: string;
}) {
  const { tone, label } = caseStatus(item);
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 text-xs font-bold",
        TONE_STYLE[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

/** 착장 색상 동그라미 */
export function ColorChip({ colorId, size = 22 }: { colorId?: ColorId | null; size?: number }) {
  const color = getColor(colorId);

  if (!color) {
    return (
      <span
        className="inline-block shrink-0 rounded-full border border-dashed border-navy-200 bg-white"
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    <span
      className={cn("inline-block shrink-0 rounded-full", color.light ? "border border-line" : "border border-black/5")}
      style={{ width: size, height: size, backgroundColor: color.hex }}
      aria-hidden
    />
  );
}
