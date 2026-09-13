"use client";

import { useState } from "react";
import { Check, ImageDown, Link2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: { sendDefault: (settings: Record<string, unknown>) => void };
    };
  }
}

export type ShareTarget = {
  shareUrl: string;
  title: string;
  description: string;
  /** 카카오 피드 썸네일 / "이미지로 보기" 대상. 공개 전단 PNG 주소를 넣는다. */
  imageUrl?: string | null;
};

export function useShare({ shareUrl, title, description, imageUrl }: ShareTarget) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // 클립보드 권한이 없는 브라우저용 대체 경로
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToKakao = () => {
    const kakao = window.Kakao;

    if (kakao?.isInitialized()) {
      kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title,
          description,
          imageUrl: imageUrl ?? "",
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        },
        buttons: [{ title: "전단지 보기", link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }],
      });
      return;
    }

    // Kakao SDK 미로딩 환경: 기본 공유 시트 → 링크 복사 순으로 대체
    if (navigator.share) {
      void navigator.share({ title, text: description, url: shareUrl }).catch(() => undefined);
      return;
    }
    void copyLink();
  };

  return { copied, copyLink, shareToKakao };
}

/** 공개 전단 하단에 고정되는 공유 바 */
export function ShareBar(props: ShareTarget & { className?: string }) {
  const { copied, copyLink, shareToKakao } = useShare(props);

  return (
    <div
      className={cn("app-bar border-t border-line bg-white/95 backdrop-blur", props.className)}
    >
      <div className="px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={shareToKakao}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#FEE500] text-base font-bold text-[#191600] hover:brightness-95"
          >
            <MessageCircle size={20} fill="currentColor" strokeWidth={0} />
            카카오톡으로 알리기
          </button>

          <button
            type="button"
            onClick={copyLink}
            aria-label="전단지 링크 복사"
            className="grid size-14 shrink-0 place-items-center rounded-2xl border border-line bg-white text-navy-800 hover:bg-navy-50"
          >
            {copied ? <Check size={22} className="text-navy-600" /> : <Link2 size={22} />}
          </button>

          {props.imageUrl && (
            <a
              href={props.imageUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="전단지 이미지 크게 보기"
              className="grid size-14 shrink-0 place-items-center rounded-2xl border border-line bg-white text-navy-800 hover:bg-navy-50"
            >
              <ImageDown size={22} />
            </a>
          )}
        </div>

        <p className="mt-2 text-center text-xs text-muted" aria-live="polite">
          {copied ? "링크를 복사했습니다." : "링크를 받은 사람은 로그인 없이 전단지를 볼 수 있습니다."}
        </p>
      </div>
    </div>
  );
}

/** 내 전단 목록에서 쓰는 인라인 공유 버튼 */
export function ShareInline(props: ShareTarget) {
  const { copied, copyLink, shareToKakao } = useShare(props);

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={shareToKakao}
        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-[15px] font-semibold text-[#191600] hover:brightness-95"
      >
        <MessageCircle size={18} fill="currentColor" strokeWidth={0} />
        카카오톡 공유
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-white text-[15px] font-semibold text-navy-800 hover:bg-navy-50"
      >
        {copied ? <Check size={18} /> : <Link2 size={18} />}
        {copied ? "복사됨" : "링크 복사"}
      </button>
    </div>
  );
}
