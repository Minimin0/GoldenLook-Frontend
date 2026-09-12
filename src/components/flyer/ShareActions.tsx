"use client";

import { useEffect, useState } from "react";
import { Check, Link2, MessageCircle, Phone } from "lucide-react";
import { buildShareUrl, formatPhone } from "@/lib/format";

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: {
        sendDefault: (settings: Record<string, unknown>) => void;
      };
    };
  }
}

interface Props {
  shareId: string;
  name: string;
  age: number;
  place: string;
  contact: string;
  imageUrl?: string | null;
}

export function ShareActions({ shareId, name, age, place, contact, imageUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(`/flyer/${shareId}`);

  useEffect(() => {
    setShareUrl(buildShareUrl(shareId));
  }, [shareId]);

  const shareTitle = `${name}(${age}세)님을 찾고 있습니다`;
  const shareText = `${place} 부근에서 실종되었습니다. 보신 분은 보호자에게 연락 부탁드립니다.`;

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
          title: shareTitle,
          description: shareText,
          imageUrl: imageUrl ?? `${window.location.origin}/og-default.png`,
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        },
        buttons: [
          {
            title: "전단지 보기",
            link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
          },
        ],
      });
      return;
    }

    // Kakao SDK 미로딩 환경: 기본 공유 시트 → 링크 복사 순으로 대체
    if (navigator.share) {
      void navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      return;
    }
    void copyLink();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur">
      <div className="mx-auto w-full max-w-[480px] px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        <div className="flex gap-2">
          <a
            href={`tel:${contact.replace(/\D/g, "")}`}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-signal-500 text-base font-bold text-white hover:bg-signal-600"
          >
            <Phone size={20} />
            보호자에게 전화
          </a>

          <button
            type="button"
            onClick={shareToKakao}
            aria-label="카카오톡으로 공유"
            className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#FEE500] text-[#191600] hover:brightness-95"
          >
            <MessageCircle size={22} fill="currentColor" strokeWidth={0} />
          </button>

          <button
            type="button"
            onClick={copyLink}
            aria-label="전단지 링크 복사"
            className="grid size-14 shrink-0 place-items-center rounded-2xl border border-line bg-white text-navy-800 hover:bg-navy-50"
          >
            {copied ? <Check size={22} className="text-navy-600" /> : <Link2 size={22} />}
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-muted" aria-live="polite">
          {copied ? "링크를 복사했습니다." : `연락처 ${formatPhone(contact)}`}
        </p>
      </div>
    </div>
  );
}
