"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { CaseCard } from "@/components/flyer/CaseCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/Field";
import { deleteCase, listCases } from "@/lib/api/cases";
import { errorMessage } from "@/lib/api/client";
import { AUTO_DELETE_NOTICE } from "@/lib/format";
import { clearDraft, clearExpiredDrafts } from "@/lib/draft";
import type { CaseListItem } from "@/lib/schemas";

function MyFlyers() {
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CaseListItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** 목록 새로고침. 만료된 썸네일 signed URL 을 다시 받을 때도 쓴다. */
  const load = useCallback(
    (active: () => boolean = () => true) =>
      listCases()
        .then((next) => {
          if (!active()) return;
          // 만료된 임시 저장을 정리한다. 연락처를 브라우저에 오래 남기지 않는다.
          clearExpiredDrafts();
          setCases(next);
          setError(null);
        })
        .catch((cause) => {
          if (active()) setError(errorMessage(cause));
        })
        .finally(() => {
          if (active()) setLoading(false);
        }),
    [],
  );

  useEffect(() => {
    let active = true;
    void load(() => active);
    return () => {
      active = false;
    };
  }, [load]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setDeletingId(target.id);
    try {
      await deleteCase(target.id);
      clearDraft(target.id);
      setCases((prev) => prev.filter((item) => item.id !== target.id));
      setPendingDelete(null);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <AppHeader />

      <main className="nav-safe-area px-5 pt-2">
        <h1 className="text-[22px] font-extrabold tracking-tight text-ink">내 전단</h1>
        <p className="mt-1 text-[14px] leading-relaxed text-muted">
          내가 만든 전단만 보입니다. 생성된 데이터는 {AUTO_DELETE_NOTICE} 자동 삭제되며, 언제든 직접
          삭제할 수 있습니다.
        </p>

        <div className="mt-3">
          <ErrorText>{error}</ErrorText>
        </div>

        {loading ? (
          <div className="grid min-h-[40dvh] place-items-center text-navy-500">
            <Loader2 className="animate-spin" size={24} />
            <span className="sr-only">불러오는 중</span>
          </div>
        ) : cases.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-12 text-center">
            <p className="text-[15px] font-bold text-ink">아직 만든 전단이 없습니다</p>
            <p className="mt-1 text-[13px] leading-snug text-muted">
              사진 한 장과 기억나는 옷차림만 있으면 1분 안에 만들 수 있습니다.
            </p>
            <ButtonLink className="mt-5" href="/create">
              전단 만들기
            </ButtonLink>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {cases.map((item) => (
              <CaseCard
                deleting={deletingId === item.id}
                item={item}
                key={item.id}
                onDelete={setPendingDelete}
                onExpiredThumb={() => void load()}
              />
            ))}
          </ul>
        )}
      </main>

      {pendingDelete && (
        <div
          aria-modal
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 px-4 pb-6"
          role="dialog"
        >
          <div className="w-full max-w-[448px] rounded-3xl bg-white p-5">
            <h2 className="text-[18px] font-extrabold text-ink">전단을 삭제할까요?</h2>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
              {pendingDelete.name ? `${pendingDelete.name} 님의 전단입니다. ` : ""}
              삭제하면 이미 공유한 링크도 즉시 열리지 않고, 올린 사진과 생성된 이미지도 함께
              지워집니다. 되돌릴 수 없습니다.
            </p>
            <div className="mt-5 flex gap-2">
              <Button
                disabled={Boolean(deletingId)}
                fullWidth
                onClick={() => setPendingDelete(null)}
                size="lg"
                variant="outline"
              >
                그대로 두기
              </Button>
              <Button
                disabled={Boolean(deletingId)}
                fullWidth
                onClick={confirmDelete}
                size="lg"
                variant="signal"
              >
                {deletingId && <Loader2 className="animate-spin" size={19} />}
                삭제하기
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </>
  );
}

export default function MyFlyersPage() {
  return (
    <RequireAuth>
      <MyFlyers />
    </RequireAuth>
  );
}
