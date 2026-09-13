"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileText, FileX2, House, Loader2, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/layout/AppHeader";
import { ShareBar } from "@/components/share/ShareActions";
import { getFlyerMeta, type FlyerMeta } from "@/lib/api/cases";
import { ButtonLink } from "@/components/ui/Button";
import { AI_LABEL } from "@/components/flyer/AiPhoto";
import { AUTO_DELETE_NOTICE, buildShareUrl } from "@/lib/format";
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
  const [meta, setMeta] = useState<FlyerMeta | null>(null);

  // 전화 버튼용 최소 공개 정보. Backend 가 아직 없으면 null 이라 버튼만 빠진다.
  useEffect(() => {
    let active = true;
    getFlyerMeta(shareId).then((next) => {
      if (active) setMeta(next);
    });
    return () => {
      active = false;
    };
  }, [shareId]);

  if (state === "gone") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-navy-50 text-navy-400">
          <FileX2 size={30} strokeWidth={1.6} />
        </span>
        <h1 className="mt-5 text-xl font-extrabold text-ink">이미 내려간 전단입니다</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          작성자가 삭제했거나, 자동 삭제 기간({AUTO_DELETE_NOTICE})이 지났습니다.
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
        {/* 링크로 들어온 사람도, 방금 발행한 보호자도 여기서 빠져나갈 수 있어야 한다. */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-line bg-white px-4 py-3">
          <Link className="flex items-center gap-2" href="/">
            <BrandMark size={26} />
            <span className="text-[15px] font-extrabold text-navy-800">Golden Look 전단</span>
          </Link>
          <Link
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold text-navy-700 hover:bg-navy-50"
            href={justCreated ? "/my" : "/"}
          >
            {justCreated ? <FileText size={16} /> : <House size={16} />}
            {justCreated ? "내 전단" : "홈"}
          </Link>
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
            보신 적이 있다면 아래 전화 버튼으로 보호자에게 시간과 장소를 함께 전해 주세요. 이 페이지는
            검색엔진에 노출되지 않습니다. 생성된 데이터는 {AUTO_DELETE_NOTICE} 자동 삭제됩니다.
          </p>

          <div className="mt-5 flex flex-col items-center gap-2">
            <Link
              className="text-[13px] font-bold text-navy-600 underline underline-offset-2"
              href={justCreated ? "/my" : "/"}
            >
              {justCreated ? "내 전단 목록으로 가기" : "Golden Look 홈으로"}
            </Link>
            {justCreated && (
              <Link
                className="text-[13px] font-semibold text-muted underline underline-offset-2"
                href="/"
              >
                홈으로
              </Link>
            )}
          </div>
        </section>
      </main>

      <ShareBar
        contact={meta?.contact}
        description="보신 분은 보호자에게 연락 부탁드립니다."
        imageUrl={imageUrl}
        shareUrl={buildShareUrl(shareId)}
        title={meta?.name ? `${meta.name}님을 찾고 있습니다` : "실종자를 찾고 있습니다"}
      />
    </>
  );
}
