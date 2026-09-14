"use client";

import { Sparkles, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * 기획서 5.3 / 15. 동결 목록:
 * AI 결과 이미지에는 반드시 "AI로 재현한 예상 모습" 라벨이 함께 표시되어야 한다.
 * 이 컴포넌트를 거치지 않고 생성 이미지를 직접 <img> 로 그리지 말 것.
 *
 * 라벨 문구는 Backend 가 돌려주는 `label` 을 그대로 쓰고, 값이 없을 때만 상수로 채운다.
 */
export const AI_LABEL = "AI로 재현한 예상 모습";

export function AiPhoto({
  src,
  alt,
  label = AI_LABEL,
  ratio = "portrait",
  className,
  onExpired,
}: {
  src?: string | null;
  alt: string;
  label?: string;
  ratio?: "square" | "portrait";
  className?: string;
  /** signed URL 은 5분이면 만료된다. 깨지면 case 를 다시 읽는다. */
  onExpired?: () => void;
}) {
  return (
    <figure
      className={cn(
        "relative overflow-hidden bg-navy-50",
        ratio === "square" ? "aspect-square" : "aspect-[3/4]",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="size-full object-cover" onError={onExpired} />
      ) : (
        <div className="grid size-full place-items-center bg-gradient-to-b from-navy-100 to-navy-50 text-navy-300">
          <div className="flex flex-col items-center gap-2">
            <UserRound size={64} strokeWidth={1.2} />
            <span className="text-xs font-semibold text-navy-400">생성된 이미지 준비 중</span>
          </div>
        </div>
      )}

      <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-ink/85 to-ink/0 px-4 pb-3 pt-8 text-[13px] font-semibold text-white">
        <Sparkles size={15} />
        {label || AI_LABEL}
      </figcaption>
    </figure>
  );
}

/** 목록 카드용 소형 썸네일 (라벨은 배지 형태로 축약) */
export function AiThumb({
  src,
  alt,
  onExpired,
}: {
  src?: string | null;
  alt: string;
  onExpired?: () => void;
}) {
  return (
    <div className="relative size-[92px] shrink-0 overflow-hidden rounded-xl bg-navy-50">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="size-full object-cover" onError={onExpired} />
      ) : (
        <div className="grid size-full place-items-center text-navy-300">
          <UserRound size={36} strokeWidth={1.3} />
        </div>
      )}
      <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-0.5 text-center text-[10px] font-bold text-white">
        AI 재현
      </span>
    </div>
  );
}
