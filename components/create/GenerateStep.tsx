"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { AiPhoto } from "@/components/flyer/AiPhoto";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/Field";
import type { CaseDto, PhotoMode } from "@/lib/schemas";

/**
 * 재생성 한도는 Backend 가 관리한다. (`regenerationsRemaining`)
 * 화면에서 따로 세면 실패한 시도까지 차감돼 기획서 5.4 와 어긋난다.
 */
export function GenerateStep({
  photoMode,
  caseData,
  generating,
  error,
  onGenerate,
  onRefresh,
}: {
  photoMode: PhotoMode;
  caseData: CaseDto | null;
  generating: boolean;
  error: string | null;
  onGenerate: () => void;
  onRefresh: () => void;
}) {
  const generated = caseData?.generatedUrl ?? null;
  const remaining = caseData?.regenerationsRemaining ?? 0;
  const exhausted = Boolean(generated) && remaining <= 0;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[20px] font-extrabold tracking-tight text-ink">
          예상 모습을 확인해 주세요
        </h2>
        <p className="mt-1 text-[14px] leading-relaxed text-muted">
          {photoMode === "face_only"
            ? "입력하신 나이와 체형, 옷차림을 반영해 서 있는 모습을 만들었습니다."
            : "올리신 사진의 얼굴과 배경은 유지하고 옷차림만 바꿨습니다."}
        </p>
      </div>

      {generated && !generating ? (
        <AiPhoto
          alt="AI로 재현한 예상 모습"
          className="rounded-2xl"
          label={caseData?.label}
          onExpired={onRefresh}
          ratio="portrait"
          src={generated}
        />
      ) : (
        <div className="grid aspect-[3/4] place-items-center rounded-2xl bg-navy-50 text-center">
          {generating ? (
            <div className="flex flex-col items-center gap-2 text-navy-600">
              <Loader2 className="animate-spin" size={28} />
              <p className="text-[14px] font-bold">예상 모습을 만드는 중입니다</p>
              <p className="text-[13px] text-muted">30초에서 1분 정도 걸릴 수 있습니다</p>
            </div>
          ) : (
            <Button onClick={onGenerate} size="lg">
              예상 모습 만들기
            </Button>
          )}
        </div>
      )}

      <ErrorText>{error}</ErrorText>

      {generated && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4">
          <div>
            <p className="text-[14px] font-bold text-ink">마음에 들지 않나요?</p>
            <p className="text-[13px] text-muted">
              {exhausted
                ? "다시 만들기는 모두 사용했습니다."
                : `${remaining}번 더 만들 수 있습니다.`}
            </p>
          </div>
          <Button disabled={exhausted || generating} onClick={onGenerate} variant="outline">
            <RefreshCw size={17} />
            다시 만들기
          </Button>
        </div>
      )}

      <p className="rounded-xl bg-paper px-3 py-2.5 text-[13px] leading-snug text-muted">
        이 이미지는 실제 사진이 아니라 입력하신 정보로 재현한 예상 모습입니다. 전단에도 같은 안내가
        함께 표시됩니다. 실패한 시도는 다시 만들기 횟수에서 차감되지 않습니다.
      </p>
    </section>
  );
}
