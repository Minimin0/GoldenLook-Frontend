"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  right,
  onBack,
  fallbackHref = "/",
}: {
  title: string;
  right?: ReactNode;
  /** 위저드처럼 앞 단계로 돌아가야 할 때 브라우저 히스토리 대신 쓴다. */
  onBack?: () => void;
  fallbackHref?: string;
}) {
  const router = useRouter();

  const goBack = () => {
    if (onBack) return onBack();
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-white px-2 py-2.5">
      <button
        type="button"
        onClick={goBack}
        aria-label="뒤로 가기"
        className="grid size-10 shrink-0 place-items-center rounded-full text-navy-800 hover:bg-navy-50"
      >
        <ChevronLeft size={24} />
      </button>
      <h1 className="flex-1 text-base font-bold text-ink">{title}</h1>
      {right}
    </header>
  );
}
