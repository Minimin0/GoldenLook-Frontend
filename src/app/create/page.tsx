"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImagePlus, Loader2, Plus, RefreshCw, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClothingField, TYPE_OPTIONS } from "@/components/create/ClothingField";
import { AiPhoto } from "@/components/flyer/AiPhoto";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { SIDO_LIST, getSigunguList, hasSigungu } from "@/lib/regions";
import { resizeImage } from "@/lib/resize-image";
import type { Appearance, Belonging, BodyProfile, PhotoMode } from "@/lib/types";
import { BODY_TYPE_LABEL, GENDER_LABEL } from "@/lib/types";

const MAX_ATTEMPTS = 3; // 기획서 5.4 재생성 최대 3회 (동결)

const STEPS = ["사진", "옷차림", "예상 모습", "전단 정보"];

const EMPTY_APPEARANCE: Appearance = {
  top: { status: "known" },
  bottom: { status: "known" },
  hat: { status: "unknown" },
  shoes: { status: "unknown" },
  items: [],
};

export default function CreatePage() {
  const router = useRouter();

  const [step, setStep] = useState(0);

  // 1단계
  const [photoMode, setPhotoMode] = useState<PhotoMode>("body_visible");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [bodyProfile, setBodyProfile] = useState<BodyProfile>({
    gender: "female",
    bodyType: "normal",
  });

  // 2단계
  const [appearance, setAppearance] = useState<Appearance>(EMPTY_APPEARANCE);
  const [itemDraft, setItemDraft] = useState("");

  // 3단계
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // 4단계
  const [form, setForm] = useState({
    name: "",
    age: "",
    heightCm: "",
    missingAt: "",
    sido: "",
    sigungu: "",
    placeDetail: "",
    notes: "",
    contact: "",
  });
  const [contactConfirmed, setContactConfirmed] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const setField = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("이미지 파일만 올릴 수 있습니다.");
      return;
    }
    try {
      setPhotoError(null);
      setPhoto(await resizeImage(file));
    } catch {
      setPhotoError("사진을 불러오지 못했습니다. 다른 사진을 선택해 주세요.");
    }
  };

  const addItem = () => {
    const type = itemDraft.trim();
    if (!type) return;
    const next: Belonging = { type };
    setAppearance((prev) => ({ ...prev, items: [...prev.items, next] }));
    setItemDraft("");
  };

  const removeItem = (type: string) =>
    setAppearance((prev) => ({ ...prev, items: prev.items.filter((i) => i.type !== type) }));

  const generate = async () => {
    if (attempts >= MAX_ATTEMPTS) return;
    setGenerating(true);
    setGenerateError(null);

    try {
      // 실제 연동 지점:
      // const res = await fetch(`/api/cases/${caseId}/generate`, { method: "POST" });
      // const data = await res.json();  // { status, imageUrl, attempt }
      await new Promise((resolve) => setTimeout(resolve, 1600));
      setGenerated(photo);
      setAttempts((n) => n + 1);
    } catch {
      // provider/temporary 오류는 재생성 횟수에서 차감하지 않는다. (기획서 5.4)
      setGenerateError("잠시 후 다시 시도해 주세요.");
    } finally {
      setGenerating(false);
    }
  };

  const publish = async () => {
    setPublishing(true);
    // 실제 연동 지점: POST /api/cases → POST /api/cases/[id]/publish
    await new Promise((resolve) => setTimeout(resolve, 800));
    router.push("/my");
  };

  const canGoNext = (() => {
    if (step === 0) return Boolean(photo);
    if (step === 1) return true;
    if (step === 2) return Boolean(generated);
    return (
      form.name.trim() !== "" &&
      form.missingAt !== "" &&
      form.sido !== "" &&
      (!hasSigungu(form.sido) || form.sigungu !== "") &&
      form.contact.trim() !== "" &&
      contactConfirmed
    );
  })();

  return (
    <>
      <PageHeader title="전단지 만들기" />

      {/* 진행 단계 */}
      <ol className="flex gap-1.5 border-b border-line bg-white px-5 pb-3 pt-1">
        {STEPS.map((label, index) => (
          <li key={label} className="flex-1">
            <div
              className={cn(
                "h-1 rounded-full",
                index <= step ? "bg-navy-800" : "bg-line",
              )}
            />
            <p
              className={cn(
                "mt-1.5 text-[12px] font-bold",
                index === step ? "text-navy-800" : "text-muted",
              )}
            >
              {label}
            </p>
          </li>
        ))}
      </ol>

      <main className="px-5 pb-36 pt-5">
        {/* ───────── 1단계: 사진 ───────── */}
        {step === 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-[20px] font-extrabold tracking-tight text-ink">
                실종자 사진을 올려 주세요
              </h2>
              <p className="mt-1 text-[14px] leading-relaxed text-muted">
                가장 최근 사진이 좋습니다. 사진은 발행 전까지 공개되지 않습니다.
              </p>
            </div>

            {photo ? (
              <div className="relative overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="업로드한 사진" className="aspect-[3/4] w-full object-cover" src={photo} />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
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
                    onChange={(e) => handleFile(e.target.files?.[0])}
                    type="file"
                  />
                </label>
                <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-line bg-white text-navy-700">
                  <ImagePlus size={24} strokeWidth={1.8} />
                  <span className="text-[14px] font-bold">앨범에서 선택</span>
                  <input
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                    type="file"
                  />
                </label>
              </div>
            )}

            {photoError && (
              <p className="rounded-xl bg-signal-50 px-3 py-2.5 text-[13px] font-semibold text-signal-600">
                {photoError}
              </p>
            )}

            {/* 핵심 분기 체크박스 (동결) */}
            <label className="flex cursor-pointer gap-3 rounded-2xl border border-line bg-white p-4">
              <input
                checked={photoMode === "face_only"}
                className="mt-0.5 size-5 shrink-0 accent-[#143462]"
                onChange={(e) => setPhotoMode(e.target.checked ? "face_only" : "body_visible")}
                type="checkbox"
              />
              <span>
                <span className="text-[15px] font-bold text-ink">얼굴만 나온 사진인가요?</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-muted">
                  몸이 보이지 않는 사진이라면 체크해 주세요. 나이와 체형을 바탕으로 서 있는 모습을
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
                    label="나이"
                    onChange={setField("age")}
                    placeholder="78"
                    suffix="세"
                    type="number"
                    value={form.age}
                  />
                  <LabeledInput
                    label="키"
                    onChange={setField("heightCm")}
                    placeholder="152"
                    suffix="cm"
                    type="number"
                    value={form.heightCm}
                  />
                </div>

                <ChoiceRow
                  label="성별"
                  onChange={(gender) =>
                    setBodyProfile((prev) => ({ ...prev, gender: gender as BodyProfile["gender"] }))
                  }
                  options={Object.entries(GENDER_LABEL).map(([value, label]) => ({ value, label }))}
                  value={bodyProfile.gender}
                />

                <ChoiceRow
                  label="체형"
                  onChange={(bodyType) =>
                    setBodyProfile((prev) => ({
                      ...prev,
                      bodyType: bodyType as BodyProfile["bodyType"],
                    }))
                  }
                  options={Object.entries(BODY_TYPE_LABEL).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                  value={bodyProfile.bodyType}
                />
              </fieldset>
            )}
          </section>
        )}

        {/* ───────── 2단계: 옷차림 ───────── */}
        {step === 1 && (
          <section className="space-y-3">
            <div>
              <h2 className="text-[20px] font-extrabold tracking-tight text-ink">
                실종 당시 옷차림을 골라 주세요
              </h2>
              <p className="mt-1 text-[14px] leading-relaxed text-muted">
                확실한 것만 고르면 됩니다. 기억나지 않는 항목은 비워 두어도 전단지를 만들 수
                있습니다.
              </p>
            </div>

            <ClothingField
              onChange={(top) => setAppearance((prev) => ({ ...prev, top }))}
              part={appearance.top}
              title="상의"
              typeOptions={TYPE_OPTIONS.top}
              withBrand
            />
            <ClothingField
              onChange={(bottom) => setAppearance((prev) => ({ ...prev, bottom }))}
              part={appearance.bottom}
              title="하의"
              typeOptions={TYPE_OPTIONS.bottom}
              withBrand
            />
            <ClothingField
              allowNone
              onChange={(hat) => setAppearance((prev) => ({ ...prev, hat }))}
              part={appearance.hat}
              title="모자"
              typeOptions={TYPE_OPTIONS.hat}
            />
            <ClothingField
              onChange={(shoes) => setAppearance((prev) => ({ ...prev, shoes }))}
              part={appearance.shoes}
              title="신발"
              typeOptions={TYPE_OPTIONS.shoes}
            />

            <div className="rounded-2xl border border-line bg-white p-4">
              <h3 className="text-[15px] font-extrabold text-ink">가지고 있던 물건</h3>
              <p className="mt-0.5 text-[13px] text-muted">
                지팡이, 가방처럼 눈에 띄는 물건이 있으면 적어 주세요.
              </p>

              <div className="mt-3 flex gap-2">
                <input
                  className="h-11 flex-1 rounded-xl border border-line px-3 text-[15px] outline-none focus:border-navy-400"
                  onChange={(e) => setItemDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem();
                    }
                  }}
                  placeholder="예: 나무 지팡이"
                  value={itemDraft}
                />
                <Button onClick={addItem} type="button" variant="ghost">
                  <Plus size={18} />
                  추가
                </Button>
              </div>

              {appearance.items.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {appearance.items.map((item) => (
                    <li
                      key={item.type}
                      className="flex items-center gap-1.5 rounded-lg bg-paper py-1.5 pl-3 pr-1.5 text-[14px] font-semibold"
                    >
                      {item.type}
                      <button
                        aria-label={`${item.type} 삭제`}
                        className="grid size-6 place-items-center rounded-md text-muted hover:bg-line"
                        onClick={() => removeItem(item.type)}
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {/* ───────── 3단계: 예상 모습 ───────── */}
        {step === 2 && (
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

            {generated ? (
              <AiPhoto
                alt="AI로 재현한 예상 모습"
                className="rounded-2xl"
                ratio="portrait"
                src={generated}
              />
            ) : (
              <div className="grid aspect-[3/4] place-items-center rounded-2xl bg-navy-50 text-center">
                {generating ? (
                  <div className="flex flex-col items-center gap-2 text-navy-600">
                    <Loader2 className="animate-spin" size={28} />
                    <p className="text-[14px] font-bold">예상 모습을 만드는 중입니다</p>
                    <p className="text-[13px] text-muted">20초 정도 걸립니다</p>
                  </div>
                ) : (
                  <Button onClick={generate} size="lg" variant="primary">
                    예상 모습 만들기
                  </Button>
                )}
              </div>
            )}

            {generateError && (
              <p className="rounded-xl bg-signal-50 px-3 py-2.5 text-[13px] font-semibold text-signal-600">
                {generateError}
              </p>
            )}

            {generated && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4">
                <div>
                  <p className="text-[14px] font-bold text-ink">마음에 들지 않나요?</p>
                  <p className="text-[13px] text-muted">
                    {attempts >= MAX_ATTEMPTS
                      ? "다시 만들기는 모두 사용했습니다."
                      : `${MAX_ATTEMPTS - attempts}번 더 만들 수 있습니다.`}
                  </p>
                </div>
                <Button
                  disabled={attempts >= MAX_ATTEMPTS || generating}
                  onClick={generate}
                  type="button"
                  variant="outline"
                >
                  <RefreshCw size={17} />
                  다시 만들기
                </Button>
              </div>
            )}

            <p className="rounded-xl bg-paper px-3 py-2.5 text-[13px] leading-snug text-muted">
              이 이미지는 실제 사진이 아니라 입력하신 정보로 재현한 예상 모습입니다. 전단지에도 같은
              안내가 함께 표시됩니다.
            </p>
          </section>
        )}

        {/* ───────── 4단계: 전단 정보 ───────── */}
        {step === 3 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-[20px] font-extrabold tracking-tight text-ink">
                전단지에 넣을 정보를 적어 주세요
              </h2>
              <p className="mt-1 text-[14px] leading-relaxed text-muted">
                보신 분이 바로 연락할 수 있도록 연락처는 전단지에 그대로 표시됩니다.
              </p>
            </div>

            <LabeledInput
              label="이름"
              onChange={setField("name")}
              placeholder="예: 김정순"
              value={form.name}
            />

            <div className="grid grid-cols-2 gap-2">
              <LabeledInput
                label="나이"
                onChange={setField("age")}
                placeholder="78"
                suffix="세"
                type="number"
                value={form.age}
              />
              <LabeledInput
                label="키"
                onChange={setField("heightCm")}
                placeholder="152"
                suffix="cm"
                type="number"
                value={form.heightCm}
              />
            </div>

            <LabeledInput
              label="마지막으로 확인된 시각"
              onChange={setField("missingAt")}
              type="datetime-local"
              value={form.missingAt}
            />

            <RegionSelect
              onSidoChange={(sido) => setForm((prev) => ({ ...prev, sido, sigungu: "" }))}
              onSigunguChange={setField("sigungu")}
              sido={form.sido}
              sigungu={form.sigungu}
            />

            <LabeledInput
              label="상세 위치"
              onChange={setField("placeDetail")}
              placeholder="예: 영등포역 1번 출구 앞 횡단보도"
              value={form.placeDetail}
            />

            <label className="block">
              <span className="text-[13px] font-bold text-navy-700">특이사항</span>
              <textarea
                className="mt-1.5 min-h-28 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[15px] leading-relaxed outline-none focus:border-navy-400"
                onChange={(e) => setField("notes")(e.target.value)}
                placeholder="예: 이름과 집 주소를 말하지 못합니다. 큰 소리로 말해야 들립니다."
                value={form.notes}
              />
            </label>

            <LabeledInput
              inputMode="tel"
              label="보호자 연락처"
              onChange={setField("contact")}
              placeholder="010-0000-0000"
              type="tel"
              value={form.contact}
            />

            <label className="flex cursor-pointer gap-3 rounded-2xl border-2 border-signal-500 bg-signal-50 p-4">
              <input
                checked={contactConfirmed}
                className="mt-0.5 size-5 shrink-0 accent-[#E8392B]"
                onChange={(e) => setContactConfirmed(e.target.checked)}
                type="checkbox"
              />
              <span className="text-[14px] font-semibold leading-snug text-ink">
                공개 전단지와 공유 이미지에 입력한 보호자 연락처가 전체 공개되는 것을 확인했습니다.
              </span>
            </label>
          </section>
        )}
      </main>

      {/* 하단 고정 이동 버튼 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[480px] gap-2 px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
          {step > 0 && (
            <Button onClick={() => setStep((s) => s - 1)} size="lg" type="button" variant="outline">
              이전
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              disabled={!canGoNext}
              fullWidth
              onClick={() => setStep((s) => s + 1)}
              size="lg"
              type="button"
            >
              다음
            </Button>
          ) : (
            <Button
              disabled={!canGoNext || publishing}
              fullWidth
              onClick={publish}
              size="lg"
              type="button"
              variant="signal"
            >
              {publishing ? <Loader2 className="animate-spin" size={19} /> : null}
              전단지 발행하기
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

/* ───────── 작은 입력 컴포넌트들 ───────── */

/**
 * 시도 → 시군구 순으로 좁혀 받는다. 두 값 모두 REGIONS 상수에서만 나오므로
 * 나중에 지역별 집계나 근처 조회를 붙일 수 있다. 그 아래 상세 위치는 자유 텍스트다.
 */
function RegionSelect({
  sido,
  sigungu,
  onSidoChange,
  onSigunguChange,
}: {
  sido: string;
  sigungu: string;
  onSidoChange: (value: string) => void;
  onSigunguChange: (value: string) => void;
}) {
  const sigunguList = getSigunguList(sido);
  const needsSigungu = hasSigungu(sido);

  const selectClass =
    "mt-1.5 h-12 w-full appearance-none rounded-xl border border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-navy-400 disabled:bg-paper disabled:text-muted";

  return (
    <div>
      <p className="text-[13px] font-bold text-navy-700">마지막 목격 지역</p>
      <div className="flex gap-2">
        <label className="flex-1">
          <span className="sr-only">시 · 도</span>
          <select
            className={selectClass}
            onChange={(e) => onSidoChange(e.target.value)}
            value={sido}
          >
            <option value="">시 · 도 선택</option>
            {SIDO_LIST.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex-1">
          <span className="sr-only">시 · 군 · 구</span>
          <select
            className={selectClass}
            disabled={!sido || !needsSigungu}
            onChange={(e) => onSigunguChange(e.target.value)}
            value={sigungu}
          >
            <option value="">
              {!sido ? "시 · 도 먼저" : needsSigungu ? "시 · 군 · 구 선택" : "해당 없음"}
            </option>
            {sigunguList.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  suffix,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  suffix?: string;
  inputMode?: "tel" | "numeric" | "text";
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-bold text-navy-700">{label}</span>
      <span className="mt-1.5 flex h-12 items-center rounded-xl border border-line bg-white px-3 focus-within:border-navy-400">
        <input
          className="h-full w-full bg-transparent text-[15px] outline-none"
          inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          value={value}
        />
        {suffix && <span className="pl-1 text-[14px] font-semibold text-muted">{suffix}</span>}
      </span>
    </label>
  );
}

function ChoiceRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-[13px] font-bold text-navy-700">{label}</p>
      <div className="mt-1.5 flex gap-1.5">
        {options.map((option) => (
          <button
            aria-pressed={value === option.value}
            className={cn(
              "h-11 flex-1 rounded-xl text-[14px] font-bold transition-colors",
              value === option.value
                ? "bg-navy-800 text-white"
                : "bg-white text-muted hover:bg-navy-100",
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
