"use client";

import { useState } from "react";
import { CheckCircle2, FileX2, Loader2, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/layout/AppHeader";
import { ShareBar } from "@/components/share/ShareActions";
import { ButtonLink } from "@/components/ui/Button";
import { AI_LABEL } from "@/components/flyer/AiPhoto";
import { AUTO_DELETE_HOURS, buildShareUrl } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * 공개 전단은 Backend 가 렌더한 PNG(`GET /api/flyer/[shareId]`)를 그대로 보여 준다.
 * 같은 내용을 HTML 로 한 번 더 그리면 전단 이미지와 화면 문구가 갈라진다.
 * 삭제/미발행 전단은 PNG 가 404 라서 이미지 로드 실패로 판별한다.
 */
export function FlyerView({
  shareId,
  imageUrl,
  justCreated,
}: {
  shareId: string;
  imageUrl: string;
  justCreated: boolean;
}) {
  const [state, setState] = useState<"loading" | "ready" | "gone">("loading");

  if (state === "gone") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-navy-50 text-navy-400">
          <FileX2 size={30} strokeWidth={1.6} />
        </span>
        <h1 className="mt-5 text-xl font-extrabold text-ink">이미 내려간 전단입니다</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          작성자가 삭제했거나, 등록 후 약 {AUTO_DELETE_HOURS}시간이 지나 자동으로 삭제되었습니다.
          <br />
          링크를 다시 확인해 주세요.
        </p>
        <ButtonLink className="mt-6" href="/" size="lg">
          Golden Look 홈으로
        </ButtonLink>
      </main>
    );
  }

  return (
    <>
      <main className="pb-36">
        <header className="flex items-center gap-2 px-5 py-3">
          <BrandMark size={26} />
          <span className="text-[15px] font-extrabold text-navy-800">Golden Look 전단</span>
        </header>

        {justCreated && (
          <div className="mx-5 mb-3 flex items-start gap-2 rounded-2xl bg-navy-50 p-3.5 text-[14px] font-semibold text-navy-700">
            <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
            전단이 발행되었습니다. 아래 버튼으로 주변에 알려 주세요.
          </div>
        )}

        <div className="relative min-h-[260px] bg-navy-50">
          {state === "loading" && (
            <div className="absolute inset-0 grid place-items-center text-navy-500">
              <Loader2 className="animate-spin" size={26} />
              <span className="sr-only">전단을 불러오는 중</span>
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="실종자를 찾습니다 — AI로 재현한 예상 모습이 담긴 전단"
            className={cn("w-full transition-opacity", state === "ready" ? "opacity-100" : "opacity-0")}
            onError={() => setState("gone")}
            onLoad={() => setState("ready")}
            /* 서버에서 내려온 <img> 는 hydration 전에 load/error 가 끝날 수 있어
               onLoad/onError 가 아예 호출되지 않는다. ref 로 완료 상태를 한 번 더 확인한다. */
            ref={(element) => {
              if (element?.complete) setState(element.naturalWidth > 0 ? "ready" : "gone");
            }}
            src={imageUrl}
          />
        </div>

        <section className="px-5 pt-4">
          <p className="flex items-center gap-1.5 text-[14px] font-bold text-navy-700">
            <Sparkles size={16} />
            {AI_LABEL}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            전단의 인물 이미지는 보호자가 입력한 정보를 바탕으로 AI 가 재현한 예상 모습이며, 실제
            촬영 사진이 아닙니다. 실제 모습과 다를 수 있으니 옷차림과 인상착의를 함께 확인해 주세요.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            보신 적이 있다면 전단에 적힌 보호자 연락처로 시간과 장소를 함께 전해 주세요. 이 페이지는
            검색엔진에 노출되지 않고, 등록 후 약 {AUTO_DELETE_HOURS}시간이 지나면 자동으로
            삭제됩니다.
          </p>
        </section>
      </main>

      <ShareBar
        description="보신 분은 전단에 적힌 보호자 연락처로 연락 부탁드립니다."
        imageUrl={imageUrl}
        shareUrl={buildShareUrl(shareId)}
        title="실종자를 찾고 있습니다"
      />
    </>
  );
}
