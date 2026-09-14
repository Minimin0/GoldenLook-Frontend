"use client";

import { Camera, ImagePlus, X } from "lucide-react";
import { ChoiceRow, ErrorText, LabeledInput } from "@/components/ui/Field";
import { BODY_TYPE_LABEL, GENDER_LABEL } from "@/lib/schemas";
import type { BodyType, Gender, PhotoMode } from "@/lib/schemas";

export type BodyDraft = { gender: Gender | ""; bodyType: BodyType | "" };

export function PhotoStep({
  photoMode,
  onPhotoModeChange,
  previewUrl,
  onPickFile,
  onClearPhoto,
  photoError,
  age,
  heightCm,
  onAgeChange,
  onHeightChange,
  body,
  onBodyChange,
}: {
  photoMode: PhotoMode;
  onPhotoModeChange: (mode: PhotoMode) => void;
  previewUrl: string | null;
  onPickFile: (file?: File | null) => void;
  onClearPhoto: () => void;
  photoError: string | null;
  age: string;
  heightCm: string;
  onAgeChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  body: BodyDraft;
  onBodyChange: (next: BodyDraft) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[20px] font-extrabold tracking-tight text-ink">
          실종자 사진을 올려 주세요
        </h2>
        <p className="mt-1 text-[14px] leading-relaxed text-muted">
          가장 최근 사진이 좋습니다. 사진은 발행 전까지 공개되지 않습니다.
        </p>
      </div>

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="업로드한 사진" className="aspect-[3/4] w-full object-cover" src={previewUrl} />
          <button
            type="button"
            onClick={onClearPhoto}
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-ink/70 text-white"
            aria-label="사진 지우기"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-line bg-white text-navy-700">
            <Camera size={24} strokeWidth={1.8} />
            <span className="text-[14px] font-bold">카메라</span>
            <input
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(event) => onPickFile(event.target.files?.[0])}
              type="file"
            />
          </label>
          <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-line bg-white text-navy-700">
            <ImagePlus size={24} strokeWidth={1.8} />
            <span className="text-[14px] font-bold">앨범에서 선택</span>
            <input
              accept="image/*"
              className="sr-only"
              onChange={(event) => onPickFile(event.target.files?.[0])}
              type="file"
            />
          </label>
        </div>
      )}

      <ErrorText>{photoError}</ErrorText>

      {/* 핵심 분기 체크박스. 기술 용어(body_visible/face_only)는 화면에 드러내지 않는다. (기획서 4.1) */}
      <label className="flex cursor-pointer gap-3 rounded-2xl border border-line bg-white p-4">
        <input
          checked={photoMode === "face_only"}
          className="mt-0.5 size-5 shrink-0 accent-navy-700"
          onChange={(event) => onPhotoModeChange(event.target.checked ? "face_only" : "body_visible")}
          type="checkbox"
        />
        <span>
          <span className="text-[15px] font-bold text-ink">얼굴만 나온 사진인가요?</span>
          <span className="mt-0.5 block text-[13px] leading-snug text-muted">
            몸이 보이지 않는 사진이라면 체크해 주세요. 나이와 체형을 바탕으로 서 있는 예상 모습을
            만들어 드립니다.
          </span>
        </span>
      </label>

      {photoMode === "face_only" && (
        <fieldset className="space-y-4 rounded-2xl border border-navy-200 bg-navy-50 p-4">
          <legend className="px-1 text-[13px] font-bold text-navy-700">
            예상 모습을 만들기 위한 정보
          </legend>

          <div className="grid grid-cols-2 gap-2">
            <LabeledInput
              inputMode="numeric"
              label="나이"
              max={120}
              min={1}
              onChange={onAgeChange}
              placeholder="78"
              suffix="세"
              type="number"
              value={age}
            />
            <LabeledInput
              inputMode="numeric"
              label="키"
              max={230}
              min={40}
              onChange={onHeightChange}
              placeholder="152"
              suffix="cm"
              type="number"
              value={heightCm}
            />
          </div>

          <ChoiceRow
            label="성별"
            onChange={(gender) => onBodyChange({ ...body, gender: gender as Gender })}
            options={Object.entries(GENDER_LABEL).map(([value, label]) => ({ value, label }))}
            value={body.gender}
          />

          <ChoiceRow
            label="체형"
            onChange={(bodyType) => onBodyChange({ ...body, bodyType: bodyType as BodyType })}
            options={Object.entries(BODY_TYPE_LABEL).map(([value, label]) => ({ value, label }))}
            value={body.bodyType}
          />

          <p className="text-[12px] leading-snug text-navy-600">
            몸무게는 받지 않습니다. 입력하신 정보는 예상 모습을 만드는 데만 쓰이고, 전단 글자에는
            나이와 키만 표시됩니다.
          </p>
        </fieldset>
      )}
    </section>
  );
}
