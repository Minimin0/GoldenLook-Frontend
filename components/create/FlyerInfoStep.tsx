"use client";

import { DateTimeField } from "@/components/create/DateTimeField";
import { RegionSelect } from "@/components/create/RegionSelect";
import { AppearanceBox } from "@/components/flyer/AppearanceBox";
import { LabeledInput } from "@/components/ui/Field";
import type { Appearance, PhotoMode } from "@/lib/schemas";
import { formatPhone, isValidContact } from "@/lib/format";

export type FlyerForm = {
  name: string;
  age: string;
  heightCm: string;
  missingAt: string;
  sido: string;
  sigungu: string;
  placeDetail: string;
  notes: string;
  contact: string;
};

export function FlyerInfoStep({
  form,
  onChange,
  photoMode,
  appearance,
  consent,
  onConsentChange,
  onEditBodyInfo,
}: {
  form: FlyerForm;
  onChange: (next: FlyerForm) => void;
  photoMode: PhotoMode;
  appearance: Appearance;
  consent: boolean;
  onConsentChange: (value: boolean) => void;
  /** face_only 의 나이·키는 생성 입력이라 여기서 고치면 이미지가 초기화된다. */
  onEditBodyInfo: () => void;
}) {
  const set = (key: keyof FlyerForm) => (value: string) => onChange({ ...form, [key]: value });
  const contactTouched = form.contact.trim().length > 0;
  const contactValid = isValidContact(form.contact);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[20px] font-extrabold tracking-tight text-ink">
          전단에 넣을 정보를 적어 주세요
        </h2>
        <p className="mt-1 text-[14px] leading-relaxed text-muted">
          보신 분이 바로 연락할 수 있도록 연락처는 전단에 그대로 표시됩니다.
        </p>
      </div>

      <LabeledInput label="이름" maxLength={80} onChange={set("name")} placeholder="예: 김정순" value={form.name} />

      <div className="grid grid-cols-2 gap-2">
        <LabeledInput
          disabled={photoMode === "face_only"}
          inputMode="numeric"
          label="나이"
          max={120}
          min={1}
          onChange={set("age")}
          placeholder="78"
          suffix="세"
          type="number"
          value={form.age}
        />
        <LabeledInput
          disabled={photoMode === "face_only"}
          inputMode="numeric"
          label="키"
          max={230}
          min={40}
          onChange={set("heightCm")}
          placeholder="152"
          suffix="cm"
          type="number"
          value={form.heightCm}
        />
      </div>

      {photoMode === "face_only" && (
        <p className="-mt-2 text-[12px] leading-snug text-muted">
          나이와 키는 예상 모습을 만드는 데 쓴 값입니다.{" "}
          <button
            className="font-bold text-navy-600 underline underline-offset-2"
            onClick={onEditBodyInfo}
            type="button"
          >
            사진 단계에서 수정
          </button>
          하면 예상 모습을 다시 만들게 됩니다.
        </p>
      )}

      <DateTimeField
        label="마지막으로 확인된 시각"
        onChange={set("missingAt")}
        value={form.missingAt}
      />

      <RegionSelect
        onSidoChange={(sido) => onChange({ ...form, sido, sigungu: "" })}
        onSigunguChange={set("sigungu")}
        sido={form.sido}
        sigungu={form.sigungu}
      />

      <LabeledInput
        label="상세 위치"
        maxLength={100}
        onChange={set("placeDetail")}
        placeholder="예: 영등포역 1번 출구 앞 횡단보도"
        value={form.placeDetail}
      />

      <label className="block">
        <span className="text-[13px] font-bold text-navy-700">특이사항</span>
        <textarea
          className="mt-1.5 min-h-28 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[15px] leading-relaxed outline-none focus:border-navy-400"
          maxLength={500}
          onChange={(event) => set("notes")(event.target.value)}
          placeholder="예: 이름과 집 주소를 말하지 못합니다. 큰 소리로 말해야 들립니다."
          value={form.notes}
        />
      </label>

      <LabeledInput
        hint={
          contactTouched && !contactValid
            ? "숫자 7~15자리의 연락처를 입력해 주세요."
            : contactValid
              ? `전단에 ${formatPhone(form.contact)} 로 표시됩니다.`
              : undefined
        }
        inputMode="tel"
        label="보호자 연락처"
        maxLength={40}
        onChange={set("contact")}
        placeholder="010-0000-0000"
        type="tel"
        value={form.contact}
      />

      <AppearanceBox appearance={appearance} />

      {/* 발행 전 연락처 전체 공개 확인. 체크 없이는 발행 버튼이 눌리지 않는다. (기획서 8) */}
      <label className="flex cursor-pointer gap-3 rounded-2xl border-2 border-signal-500 bg-signal-50 p-4">
        <input
          checked={consent}
          className="mt-0.5 size-5 shrink-0 accent-signal-500"
          onChange={(event) => onConsentChange(event.target.checked)}
          type="checkbox"
        />
        <span className="text-[14px] font-semibold leading-snug text-ink">
          공개 전단과 공유 이미지에 입력한 보호자 연락처가 전체 공개되는 것을 확인했습니다.
        </span>
      </label>
    </section>
  );
}
