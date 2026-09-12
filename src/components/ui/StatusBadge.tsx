import { cn } from "@/lib/cn";
import { getColor } from "@/lib/colors";
import type { ColorId } from "@/lib/colors";
import { STATUS_LABEL, type CaseStatus } from "@/lib/types";

const STATUS_STYLE: Record<CaseStatus, string> = {
  urgent: "bg-signal-500 text-white",
  searching: "bg-alert-50 text-alert-600 border border-alert-100",
  found: "bg-navy-50 text-navy-600 border border-navy-100",
};

export function StatusBadge({
  status,
  className,
}: {
  status: CaseStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 text-xs font-bold",
        STATUS_STYLE[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

/** 전단지 상단을 가로지르는 상태 리본 */
export function StatusRibbon({ status }: { status: CaseStatus }) {
  const style =
    status === "urgent"
      ? "bg-signal-500 text-white"
      : status === "searching"
        ? "bg-alert-500 text-white"
        : "bg-navy-600 text-white";

  const message =
    status === "urgent"
      ? "긴급 · 실종 직후 수색 중입니다"
      : status === "searching"
        ? "수색 중 · 목격 정보를 기다립니다"
        : "발견 완료 · 수색이 종료되었습니다";

  return (
    <div className={cn("flex items-center justify-center px-4 py-2.5 text-sm font-bold", style)}>
      {message}
    </div>
  );
}

/** 착장 색상 동그라미 */
export function ColorChip({
  colorId,
  size = 22,
}: {
  colorId?: ColorId | null;
  size?: number;
}) {
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
      className={cn(
        "inline-block shrink-0 rounded-full",
        color.border ? "border border-line" : "border border-black/5",
      )}
      style={{ width: size, height: size, backgroundColor: color.hex }}
      aria-hidden
    />
  );
}
