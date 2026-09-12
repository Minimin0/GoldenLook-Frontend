"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Eye, Link2, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ElapsedTime } from "@/components/ui/ElapsedTime";
import { Button, ButtonLink } from "@/components/ui/Button";
import { buildShareUrl, formatShortDateTime, summarizeAppearance } from "@/lib/format";
import { formatRegionShort } from "@/lib/regions";
import { MOCK_CASES } from "@/lib/mock-data";
import type { MissingCase } from "@/lib/types";

/** 로그인한 사용자가 작성한 전단지만 보인다. (기획서 7. 소유권) */
const MY_CASE_IDS = ["c_01", "c_03"];

export default function MyFlyersPage() {
  const [cases, setCases] = useState<MissingCase[]>(
    MOCK_CASES.filter((c) => MY_CASE_IDS.includes(c.id)),
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const markFound = (id: string) =>
    // 실제 연동 지점: PATCH /api/cases/[id]
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status: "found" } : c)));

  const remove = (id: string) => {
    if (!window.confirm("전단지를 삭제하면 공유된 링크도 즉시 열리지 않습니다. 삭제할까요?")) return;
    // 실제 연동 지점: DELETE /api/cases/[id]
    setCases((prev) => prev.filter((c) => c.id !== id));
  };

  const copyLink = async (item: MissingCase) => {
    await navigator.clipboard.writeText(buildShareUrl(item.shareId));
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <AppHeader />

      <main className="nav-safe-area px-5 pt-2">
        <h1 className="text-[22px] font-extrabold tracking-tight text-ink">내 전단지</h1>
        <p className="mt-1 text-[14px] leading-relaxed text-muted">
          발행한 전단지를 수정하거나 수색 완료로 바꿀 수 있습니다. 등록 후 48시간이 지나면 자동으로
          삭제됩니다.
        </p>

        {cases.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-12 text-center">
            <p className="text-[15px] font-bold text-ink">아직 만든 전단지가 없습니다</p>
            <p className="mt-1 text-[13px] leading-snug text-muted">
              사진 한 장과 기억나는 옷차림만 있으면 1분 안에 만들 수 있습니다.
            </p>
            <ButtonLink className="mt-5" href="/create" size="md" variant="primary">
              전단지 만들기
            </ButtonLink>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {cases.map((item) => (
              <li key={item.id} className="rounded-2xl border border-line bg-white p-4">
                <div className="flex items-center justify-between">
                  <StatusBadge status={item.status} />
                  <span className="text-[13px] text-muted">
                    {formatShortDateTime(item.createdAt)} 발행
                  </span>
                </div>

                <p className="mt-2.5 text-[19px] font-extrabold leading-tight text-ink">
                  {item.name}
                  <span className="ml-1.5 text-[15px] font-semibold text-muted">{item.age}세</span>
                </p>

                {item.status !== "found" && (
                  <ElapsedTime
                    className="mt-0.5 block text-[13px] font-bold text-signal-600"
                    missingAt={item.missingAt}
                  />
                )}

                <dl className="mt-3 space-y-1.5 rounded-xl bg-paper p-3 text-[14px]">
                  <div className="flex gap-2">
                    <dt className="w-10 shrink-0 font-bold text-navy-600">위치</dt>
                    <dd className="min-w-0 flex-1 font-semibold text-ink">
                      {formatRegionShort(item.region)}
                      {item.placeDetail && ` ${item.placeDetail}`}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-10 shrink-0 font-bold text-navy-600">착장</dt>
                    <dd className="min-w-0 flex-1 font-semibold text-ink">
                      {summarizeAppearance(item.appearance)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex gap-2">
                  <Button fullWidth onClick={() => copyLink(item)} type="button" variant="primary">
                    {copiedId === item.id ? (
                      <>
                        <Check size={18} />
                        링크 복사됨
                      </>
                    ) : (
                      <>
                        <Link2 size={18} />
                        전단지 공유하기
                      </>
                    )}
                  </Button>
                  <ButtonLink href={`/flyer/${item.shareId}`} variant="outline">
                    <Eye size={17} />
                    미리보기
                  </ButtonLink>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  {item.status === "found" ? (
                    <span className="text-[13px] font-semibold text-navy-600">
                      수색이 완료된 전단지입니다
                    </span>
                  ) : (
                    <button
                      className="text-[13px] font-bold text-navy-600 underline underline-offset-2"
                      onClick={() => markFound(item.id)}
                      type="button"
                    >
                      수색 완료로 바꾸기
                    </button>
                  )}
                  <button
                    className="flex items-center gap-1 text-[13px] font-bold text-muted"
                    onClick={() => remove(item.id)}
                    type="button"
                  >
                    <Trash2 size={15} />
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-center text-[13px] text-muted">
          공유한 링크는{" "}
          <Link className="font-semibold text-navy-600 underline" href="/">
            홈
          </Link>
          에서도 다시 확인할 수 있습니다.
        </p>
      </main>

      <BottomNav />
    </>
  );
}
