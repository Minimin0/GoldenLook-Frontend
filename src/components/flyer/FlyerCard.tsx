import Link from "next/link";
import { MapPin } from "lucide-react";
import { AiThumb } from "@/components/flyer/AiPhoto";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ElapsedTime } from "@/components/ui/ElapsedTime";
import { formatShortDateTime, summarizeAppearance } from "@/lib/format";
import { formatRegionShort } from "@/lib/regions";
import type { MissingCase } from "@/lib/types";
import { GENDER_LABEL } from "@/lib/types";

export function FlyerCard({ item }: { item: MissingCase }) {
  return (
    <li>
      <Link
        href={`/flyer/${item.shareId}`}
        className="flex gap-3.5 rounded-2xl border border-line bg-white p-3.5 transition-colors hover:border-navy-200"
      >
        <AiThumb alt={`${item.name} 예상 모습`} src={item.generatedImageUrl} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <StatusBadge status={item.status} />
            {item.status !== "found" && (
              <ElapsedTime
                missingAt={item.missingAt}
                className="text-xs font-bold text-signal-600"
              />
            )}
          </div>

          <p className="mt-1.5 text-[17px] font-extrabold leading-tight text-ink">
            {item.name}
            <span className="ml-1.5 text-sm font-semibold text-muted">
              {item.age}세 {GENDER_LABEL[item.gender]}
            </span>
          </p>

          <p className="mt-1 flex items-start gap-1 text-[13px] leading-snug text-muted">
            <MapPin size={14} className="mt-0.5 shrink-0" />
            <span className="line-clamp-1">
              {formatRegionShort(item.region)}
              {item.placeDetail && ` · ${item.placeDetail}`}
            </span>
          </p>

          <p className="mt-1.5 truncate rounded-lg bg-paper px-2 py-1 text-[13px] font-semibold text-navy-700">
            {summarizeAppearance(item.appearance)}
          </p>

          <p className="mt-1.5 text-xs text-muted">
            실종 {formatShortDateTime(item.missingAt)}
          </p>
        </div>
      </Link>
    </li>
  );
}
