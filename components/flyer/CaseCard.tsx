"use client";

import Link from "next/link";
import { Clock3, Eye, PencilLine, Trash2 } from "lucide-react";
import { AiThumb } from "@/components/flyer/AiPhoto";
import { CaseStatusBadge } from "@/components/ui/StatusBadge";
import { ShareInline } from "@/components/share/ShareActions";
import { Button, ButtonLink } from "@/components/ui/Button";
import { flyerImageUrl } from "@/lib/api/cases";
import { buildShareUrl, formatShortDateTime, hoursUntilAutoDelete } from "@/lib/format";
import type { CaseListItem } from "@/lib/schemas";

export function CaseCard({
  item,
  onDelete,
  onExpiredThumb,
  deleting,
}: {
  item: CaseListItem;
  onDelete: (item: CaseListItem) => void;
  onExpiredThumb: () => void;
  deleting: boolean;
}) {
  const remaining = hoursUntilAutoDelete(item.createdAt);

  return (
    <li className="rounded-2xl border border-line bg-white p-4">
      <div className="flex gap-3.5">
        <AiThumb
          alt={item.name ? `${item.name} 예상 모습` : "예상 모습"}
          onExpired={onExpiredThumb}
          src={item.generatedUrl}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <CaseStatusBadge item={item} />
            <span className="text-[12px] text-muted">{formatShortDateTime(item.createdAt)}</span>
          </div>

          <p className="mt-1.5 text-[18px] font-extrabold leading-tight text-ink">
            {item.name ?? "이름 미입력"}
          </p>

          <p className="mt-1 flex items-center gap-1 text-[12px] text-muted">
            <Clock3 size={13} />
            {remaining > 0 ? `자동 삭제까지 약 ${remaining}시간` : "곧 자동 삭제됩니다"}
          </p>

          <p className="mt-1 text-[12px] text-muted">
            {item.photoMode === "face_only" ? "얼굴 사진 기반 재현" : "몸 사진 기반 편집"} ·{" "}
            {item.published
              ? "발행 완료"
              : `다시 만들기 ${item.regenerationsRemaining}회 남음`}
          </p>
        </div>
      </div>

      {item.published && item.shareId ? (
        <div className="mt-3 space-y-2">
          <ShareInline
            description="보신 분은 보호자에게 연락 부탁드립니다."
            imageUrl={flyerImageUrl(item.shareId)}
            shareUrl={buildShareUrl(item.shareId)}
            title={`${item.name ?? "실종자"}님을 찾고 있습니다`}
          />
          <ButtonLink fullWidth href={`/c/${item.shareId}`} variant="outline">
            <Eye size={17} />
            공개 전단 보기
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-3">
          <ButtonLink fullWidth href={`/create?case=${item.id}`}>
            <PencilLine size={17} />
            이어서 작성하기
          </ButtonLink>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <Link className="text-[13px] font-semibold text-muted underline underline-offset-2" href="/create">
          새 전단 만들기
        </Link>
        <Button
          className="!h-9 !px-3 text-[13px]"
          disabled={deleting}
          onClick={() => onDelete(item)}
          variant="outline"
        >
          <Trash2 size={15} />
          삭제
        </Button>
      </div>
    </li>
  );
}
