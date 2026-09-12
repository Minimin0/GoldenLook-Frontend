"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  right,
  fallbackHref = "/",
}: {
  title: string;
  right?: ReactNode;
  fallbackHref?: string;
}) {
  const router = useRouter();

  const goBack = () => {
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
