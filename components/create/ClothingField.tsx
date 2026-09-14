"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import type { ColorId } from "@/lib/colors";
import type { GarmentDraft } from "@/lib/appearance";
import type { GarmentStatus } from "@/lib/schemas";
import { ColorPicker } from "./ColorPicker";

export const TYPE_OPTIONS = {
  top: ["반팔 티셔츠", "긴팔 티셔츠", "셔츠", "니트", "후드티", "점퍼", "패딩", "코트", "바람막이"],
  bottom: ["청바지", "면바지", "반바지", "정장바지", "트레이닝복", "치마", "원피스"],
  hat: ["야구모자", "중절모", "비니", "챙 넓은 모자"],
  shoes: ["운동화", "구두", "슬리퍼", "샌들", "부츠", "등산화"],
} as const;

type Props = {
  title: string;
  hint?: string;
  part: GarmentDraft;
  onChange: (next: GarmentDraft) => void;
  typeOptions?: readonly string[];
  /** 모자처럼 "착용 안 함" 선택이 필요한 항목 */
  allowNone?: boolean;
  withBrand?: boolean;
  /** "기억나요" 인데 색을 안 고른 상태 */
  colorMissing?: boolean;
};

export function ClothingField({
  title,
  hint,
  part,
  onChange,
  typeOptions,
  allowNone,
  withBrand,
  colorMissing,
}: Props) {
  const headingId = useId();
  const [brandOpen, setBrandOpen] = useState(Boolean(part.brand));

  const statusOptions: Array<{ value: GarmentStatus; label: string }> = [
    { value: "known", label: "기억나요" },
    ...(allowNone ? [{ value: "none" as const, label: "안 썼어요" }] : []),
    { value: "unknown", label: "기억 안 나요" },
  ];

  const setStatus = (status: GarmentStatus) => {
    if (status === "known") onChange({ ...part, status });
    else onChange({ status });
  };

  return (
    <fieldset className="rounded-2xl border border-line bg-white p-4">
      <legend className="contents">
        <h3 id={headingId} className="text-[15px] font-extrabold text-ink">
          {title}
        </h3>
      </legend>
      {hint && <p className="mt-0.5 text-[13px] text-muted">{hint}</p>}

      <div className="mt-3 flex gap-1.5">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setStatus(option.value)}
            aria-pressed={part.status === option.value}
            className={cn(
              "h-9 flex-1 rounded-lg text-[13px] font-bold transition-colors",
              part.status === option.value
                ? "bg-navy-800 text-white"
                : "bg-paper text-muted hover:bg-navy-50",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {part.status === "known" && (
        <div className="mt-4 space-y-4">
          <div>
            <ColorPicker
              labelledBy={headingId}
              value={part.color}
              onChange={(color: ColorId) => onChange({ ...part, color })}
            />
            {colorMissing && (
              <p className="mt-2 text-[13px] font-semibold text-signal-600" role="alert">
                색을 고르거나 &lsquo;기억 안 나요&rsquo; 를 선택해 주세요.
              </p>
            )}
          </div>

          {typeOptions && (
            <div>
              <p className="text-[13px] font-bold text-navy-700">
                종류 <span className="font-medium text-muted">(기억나면 골라 주세요)</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {typeOptions.map((option) => {
                  const selected = part.type === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => onChange({ ...part, type: selected ? null : option })}
                      aria-pressed={selected}
                      className={cn(
                        "h-9 rounded-lg px-3 text-[13px] font-semibold transition-colors",
                        selected
                          ? "bg-navy-50 text-navy-800 ring-1 ring-navy-300"
                          : "bg-paper text-muted hover:bg-navy-50",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[12px] leading-snug text-muted">
                고르지 않으면 AI 가 로고·무늬 없는 기본 옷으로 그리고, 전단 글자에는 적지 않습니다.
              </p>
            </div>
          )}

          {withBrand && (
            <div>
              {/* "없음", "모름" 같은 문자열이 그대로 들어오면 AI 프롬프트에서 처리하기 어렵다.
                  기억날 때만 체크해서 입력받고, 해제하면 값을 비운다. */}
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  checked={brandOpen}
                  className="size-5 shrink-0 accent-navy-800"
                  onChange={(event) => {
                    const open = event.target.checked;
                    setBrandOpen(open);
                    if (!open) onChange({ ...part, brand: null });
                  }}
                  type="checkbox"
                />
                <span className="text-[13px] font-bold text-navy-700">브랜드가 기억나요</span>
              </label>

              {brandOpen && (
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px] outline-none focus:border-navy-400"
                  maxLength={80}
                  onChange={(event) => onChange({ ...part, brand: event.target.value || null })}
                  placeholder="예: 나이키"
                  value={part.brand ?? ""}
                />
              )}
            </div>
          )}
        </div>
      )}

      {part.status === "unknown" && (
        <p className="mt-3 rounded-xl bg-paper px-3 py-2.5 text-[13px] leading-snug text-muted">
          기억나지 않는 정보는 전단지에 적지 않고, AI 도 임의로 만들어 넣지 않습니다.
        </p>
      )}
    </fieldset>
  );
}
