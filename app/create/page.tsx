"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { PhotoStep, type BodyDraft } from "@/components/create/PhotoStep";
import { AppearanceStep } from "@/components/create/AppearanceStep";
import { GenerateStep } from "@/components/create/GenerateStep";
import { FlyerInfoStep, type FlyerForm } from "@/components/create/FlyerInfoStep";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/Field";
import {
  EMPTY_APPEARANCE_DRAFT,
  appearanceKey,
  missingColorParts,
  toAppearance,
  toAppearanceDraft,
  type AppearanceDraft,
  type RecolorablePart,
} from "@/lib/appearance";
import { errorMessage } from "@/lib/api/client";
import {
  createCase,
  generateCase,
  getCase,
  patchCase,
  publishCase,
  replaceCasePhoto,
} from "@/lib/api/cases";
import { composePlace, hasSigungu, parsePlace } from "@/lib/regions";
import { isValidContact, withParticle } from "@/lib/format";
import { clearDraft, readDraft, writeDraft, type FlyerDraft } from "@/lib/draft";
import { preparePhoto } from "@/lib/resize-image";
import { cn } from "@/lib/cn";
import type { CaseDto, CasePatch, PhotoMode } from "@/lib/schemas";

const STEPS = ["사진", "옷차림", "예상 모습", "전단 정보"];

const EMPTY_FORM: FlyerForm = {
  name: "",
  age: "",
  heightCm: "",
  missingAt: "",
  sido: "",
  sigungu: "",
  placeDetail: "",
  notes: "",
  contact: "",
};

function intOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

function inRange(value: string, min: number, max: number) {
  const parsed = intOrNull(value);
  return parsed !== null && parsed >= min && parsed <= max;
}

/** 저장된 `missingAt` 문자열을 datetime-local 입력값으로 되돌린다. */
function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTime() - date.getTimezoneOffset() * 60_000;
  return new Date(offset).toISOString().slice(0, 16);
}

/**
 * 이어서 작성할 때 돌아갈 단계.
 * face_only 인데 나이·키·성별·체형이 비어 있으면 generate 가 INVALID_INPUT 이라,
 * 옷차림이 아니라 사진 단계부터 다시 받아야 한다.
 */
function resumeStep(data: CaseDto) {
  if (data.generationStatus === "GENERATED" && data.generatedUrl) return 3;
  if (data.photoMode === "face_only") {
    const body = data.bodyProfile ?? {};
    if (!data.age || !data.heightCm || !body.gender || !body.bodyType) return 0;
  }
  return 1;
}

function CreateWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const resumeId = params.get("case");

  const [step, setStep] = useState(0);
  const [caseData, setCaseData] = useState<CaseDto | null>(null);
  const [loading, setLoading] = useState(Boolean(resumeId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [photoMode, setPhotoMode] = useState<PhotoMode>("body_visible");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const objectUrl = useRef<string | null>(null);

  const [body, setBody] = useState<BodyDraft>({ gender: "", bodyType: "" });
  const [appearance, setAppearance] = useState<AppearanceDraft>(EMPTY_APPEARANCE_DRAFT);
  const [missingColors, setMissingColors] = useState<RecolorablePart[]>([]);

  const [form, setForm] = useState<FlyerForm>(EMPTY_FORM);
  const [consent, setConsent] = useState(false);

  /** 탭이 죽어서 잃어버린 작성 내용. 복구할지 사용자가 고른다. */
  const [draftOffer, setDraftOffer] = useState<FlyerDraft | null>(null);

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const releaseObjectUrl = useCallback(() => {
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    }
  }, []);

  useEffect(() => releaseObjectUrl, [releaseObjectUrl]);

  /** 이어서 작성: 저장된 case 를 화면 상태로 되돌린다. */
  useEffect(() => {
    if (!resumeId) return;
    let active = true;

    getCase(resumeId)
      .then((data) => {
        if (!active) return;
        if (data.published) {
          router.replace("/my");
          return;
        }
        const { region, placeDetail } = parsePlace(data.place);
        setCaseData(data);
        setPhotoMode(data.photoMode);
        setPreviewUrl(data.originalUrl);
        setBody({
          gender: data.bodyProfile?.gender ?? "",
          bodyType: data.bodyProfile?.bodyType ?? "",
        });
        setAppearance(toAppearanceDraft(data.appearance));
        setForm({
          name: data.name ?? "",
          age: data.age?.toString() ?? "",
          heightCm: data.heightCm?.toString() ?? "",
          missingAt: toDateTimeLocal(data.missingAt),
          sido: region.sido,
          sigungu: region.sigungu,
          placeDetail,
          notes: data.notes ?? "",
          contact: data.contact ?? "",
        });
        setConsent(data.contactDisclosureConsent);
        setStep(resumeStep(data));
        setDraftOffer(readDraft(data.id));
      })
      .catch((cause) => active && setError(errorMessage(cause)))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [resumeId, router]);

  /** signed URL 은 5분이면 만료된다. 이미지가 깨지면 case 를 다시 읽어 주소만 갱신한다. */
  const refreshUrls = useCallback(async () => {
    if (!caseData) return;
    try {
      const fresh = await getCase(caseData.id);
      setCaseData(fresh);
      if (!photoFile) setPreviewUrl(fresh.originalUrl);
    } catch {
      // 화면 상태를 망가뜨리지 않는다. 다음 동작에서 다시 시도된다.
    }
  }, [caseData, photoFile]);

  // 4단계 입력은 발행할 때 한 번에 서버로 간다. 그 전에 탭이 죽어도 남도록 브라우저에 둔다.
  useEffect(() => {
    if (!caseData?.id || caseData.published) return;
    writeDraft(caseData.id, form, consent);
  }, [caseData?.id, caseData?.published, form, consent]);

  const applyDraft = () => {
    if (!draftOffer) return;
    setForm((prev) => ({
      ...draftOffer.form,
      // face_only 의 나이·키는 생성 입력이라 서버 값이 기준이다.
      ...(photoMode === "face_only" ? { age: prev.age, heightCm: prev.heightCm } : {}),
    }));
    setConsent(draftOffer.consent);
    setDraftOffer(null);
  };

  const discardDraft = () => {
    if (caseData) clearDraft(caseData.id);
    setDraftOffer(null);
  };

  const pickFile = async (file?: File | null) => {
    if (!file) return;
    setPhotoError(null);
    try {
      const prepared = await preparePhoto(file);
      releaseObjectUrl();
      objectUrl.current = prepared.previewUrl;
      setPhotoFile(prepared.file);
      setPreviewUrl(prepared.previewUrl);
    } catch (cause) {
      setPhotoError(errorMessage(cause));
    }
  };

  const clearPhoto = () => {
    releaseObjectUrl();
    setPhotoFile(null);
    setPreviewUrl(caseData && !photoFile ? null : caseData?.originalUrl ?? null);
  };

  async function submitPhotoStep() {
    if (!caseData) {
      if (!photoFile) throw new Error("사진을 올려 주세요.");
      const created = await createCase({
        photo: photoFile,
        photoMode,
        ...(photoMode === "face_only"
          ? {
              age: intOrNull(form.age),
              heightCm: intOrNull(form.heightCm),
              bodyProfile: { gender: body.gender || null, bodyType: body.bodyType || null },
            }
          : {}),
      });
      releaseObjectUrl();
      setPhotoFile(null);
      setCaseData(created);
      setPreviewUrl(created.originalUrl);
      return;
    }

    // 생성 입력(photoMode/나이/키/체형)을 다시 보내면 Backend 가 결과를 초기화한다.
    // 실제로 바뀐 값만 담는다.
    const patch: CasePatch = {};
    if (caseData.photoMode !== photoMode) patch.photoMode = photoMode;
    if (photoMode === "face_only") {
      if (caseData.age !== intOrNull(form.age)) patch.age = intOrNull(form.age);
      if (caseData.heightCm !== intOrNull(form.heightCm)) patch.heightCm = intOrNull(form.heightCm);
      const gender = body.gender || null;
      const bodyType = body.bodyType || null;
      if (
        (caseData.bodyProfile?.gender ?? null) !== gender ||
        (caseData.bodyProfile?.bodyType ?? null) !== bodyType
      ) {
        patch.bodyProfile = { gender, bodyType };
      }
    }

    if (photoFile) {
      const updated = await replaceCasePhoto(caseData.id, photoFile, patch);
      releaseObjectUrl();
      setPhotoFile(null);
      setCaseData(updated);
      setPreviewUrl(updated.originalUrl);
      return;
    }
    if (Object.keys(patch).length === 0) return;
    setCaseData(await patchCase(caseData.id, patch));
  }

  async function submitAppearanceStep() {
    if (!caseData) throw new Error("사진 단계를 먼저 마쳐 주세요.");
    const next = toAppearance(appearance);
    if (appearanceKey(next) === appearanceKey(caseData.appearance)) return;
    setCaseData(await patchCase(caseData.id, { appearance: next }));
  }

  const generate = async () => {
    if (!caseData) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      const result = await generateCase(caseData.id);
      setCaseData((prev) =>
        prev
          ? {
              ...prev,
              generationStatus: result.status,
              generatedUrl: result.generatedUrl,
              label: result.label || prev.label,
              regenerationCount: result.regenerationCount,
              regenerationsRemaining: result.regenerationsRemaining,
            }
          : prev,
      );
    } catch (cause) {
      setGenerateError(errorMessage(cause));
      void refreshUrls();
    } finally {
      setGenerating(false);
    }
  };

  const publish = async () => {
    if (!caseData) return;
    setPublishing(true);
    setError(null);
    try {
      const place = composePlace({ sido: form.sido, sigungu: form.sigungu }, form.placeDetail);
      const patch: CasePatch = {};
      const name = form.name.trim();
      const contact = form.contact.trim();
      const notes = form.notes.trim();

      if ((caseData.name ?? "") !== name) patch.name = name || null;
      if ((caseData.missingAt ?? "") !== form.missingAt) patch.missingAt = form.missingAt || null;
      if ((caseData.place ?? "") !== place) patch.place = place || null;
      if ((caseData.contact ?? "") !== contact) patch.contact = contact || null;
      if ((caseData.notes ?? "") !== notes) patch.notes = notes || null;
      if (caseData.contactDisclosureConsent !== consent) patch.contactDisclosureConsent = consent;
      // face_only 의 나이·키는 생성 입력이라 여기서 건드리지 않는다.
      if (photoMode === "body_visible") {
        if (caseData.age !== intOrNull(form.age)) patch.age = intOrNull(form.age);
        if (caseData.heightCm !== intOrNull(form.heightCm)) patch.heightCm = intOrNull(form.heightCm);
      }

      if (Object.keys(patch).length > 0) setCaseData(await patchCase(caseData.id, patch));
      const { shareId } = await publishCase(caseData.id);
      clearDraft(caseData.id);
      router.push(`/c/${shareId}?created=1`);
    } catch (cause) {
      setError(errorMessage(cause));
      setPublishing(false);
    }
  };

  /**
   * 다음/발행 버튼이 막힌 이유를 화면에 그대로 보여 주기 위한 목록.
   * 버튼만 비활성화하면 사용자는 무엇이 빠졌는지 알 수 없다.
   */
  const blockers = (() => {
    const missing: string[] = [];
    if (step === 0) {
      // 서버에 저장된 사진이든 방금 고른 사진이든, 보이는 사진이 있어야 넘어간다.
      if (!previewUrl) missing.push("실종자 사진");
      if (photoMode === "face_only") {
        if (!inRange(form.age, 1, 120)) missing.push("나이");
        if (!inRange(form.heightCm, 40, 230)) missing.push("키");
        if (!body.gender) missing.push("성별");
        if (!body.bodyType) missing.push("체형");
      }
      return missing;
    }
    if (step === 1) return missing;
    if (step === 2) {
      if (!caseData?.generatedUrl) missing.push("예상 모습 만들기");
      return missing;
    }
    if (!form.name.trim()) missing.push("이름");
    if (!inRange(form.age, 1, 120)) missing.push("나이");
    if (!form.missingAt) missing.push("마지막으로 확인된 시각");
    if (!form.sido || (hasSigungu(form.sido) && !form.sigungu)) missing.push("마지막 목격 지역");
    if (!isValidContact(form.contact)) missing.push("보호자 연락처");
    if (!consent) missing.push("연락처 공개 확인");
    return missing;
  })();

  const canGoNext = blockers.length === 0;

  const goNext = async () => {
    setError(null);
    if (step === 1) {
      const missing = missingColorParts(appearance);
      setMissingColors(missing);
      if (missing.length > 0) return;
    }

    setBusy(true);
    try {
      if (step === 0) await submitPhotoStep();
      if (step === 1) await submitAppearanceStep();
      setStep((current) => current + 1);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-[60dvh] place-items-center text-navy-500">
        <Loader2 className="animate-spin" size={26} />
        <span className="sr-only">전단을 불러오는 중</span>
      </main>
    );
  }

  return (
    <>
      <PageHeader
        fallbackHref="/"
        onBack={step > 0 ? () => setStep((current) => current - 1) : undefined}
        title="전단 만들기"
      />

      <ol className="flex gap-1.5 border-b border-line bg-white px-5 pb-3 pt-1">
        {STEPS.map((label, index) => (
          <li key={label} className="flex-1">
            <div className={cn("h-1 rounded-full", index <= step ? "bg-navy-800" : "bg-line")} />
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
        {step === 0 && (
          <PhotoStep
            age={form.age}
            body={body}
            heightCm={form.heightCm}
            onAgeChange={(age) => setForm((prev) => ({ ...prev, age }))}
            onBodyChange={setBody}
            onClearPhoto={clearPhoto}
            onHeightChange={(heightCm) => setForm((prev) => ({ ...prev, heightCm }))}
            onPhotoModeChange={setPhotoMode}
            onPickFile={pickFile}
            photoError={photoError}
            photoMode={photoMode}
            previewUrl={previewUrl}
          />
        )}

        {step === 1 && (
          <AppearanceStep
            draft={appearance}
            missingColors={missingColors}
            onChange={(next) => {
              setAppearance(next);
              setMissingColors([]);
            }}
          />
        )}

        {step === 2 && (
          <GenerateStep
            caseData={caseData}
            error={generateError}
            generating={generating}
            onGenerate={generate}
            onRefresh={refreshUrls}
            photoMode={photoMode}
          />
        )}

        {step === 3 && caseData && draftOffer && (
          <div className="mb-4 rounded-2xl border border-navy-200 bg-navy-50 p-4">
            <p className="text-[14px] font-bold text-navy-800">작성하던 내용이 남아 있습니다</p>
            <p className="mt-0.5 text-[13px] leading-snug text-navy-600">
              이 기기에만 임시로 저장된 내용입니다. 불러오면 아래 입력란이 채워집니다.
            </p>
            <div className="mt-3 flex gap-2">
              <Button fullWidth onClick={applyDraft}>
                이어서 쓰기
              </Button>
              <Button className="shrink-0" onClick={discardDraft} variant="outline">
                새로 쓰기
              </Button>
            </div>
          </div>
        )}

        {step === 3 && caseData && (
          <FlyerInfoStep
            appearance={toAppearance(appearance)}
            consent={consent}
            form={form}
            onChange={setForm}
            onConsentChange={setConsent}
            onEditBodyInfo={() => setStep(0)}
            photoMode={photoMode}
          />
        )}

        {error && (
          <div className="mt-4">
            <ErrorText>{error}</ErrorText>
          </div>
        )}
      </main>

      <div className="app-bar border-t border-line bg-white/95 backdrop-blur">
        {blockers.length > 0 && (
          <p
            className="px-5 pt-2.5 text-[13px] font-semibold leading-snug text-navy-600"
            aria-live="polite"
          >
            {blockers.join(", ")}
            {step === 3
              ? `${withParticle(blockers[blockers.length - 1], "을", "를")} 채우면 발행할 수 있습니다.`
              : `${withParticle(blockers[blockers.length - 1], "이", "가")} 필요합니다.`}
          </p>
        )}
        <div className="flex gap-2 px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
          {step > 0 && (
            <Button
              className="shrink-0"
              disabled={busy || publishing}
              onClick={() => setStep((s) => s - 1)}
              size="lg"
              variant="outline"
            >
              이전
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button disabled={!canGoNext || busy} fullWidth onClick={goNext} size="lg">
              {busy && <Loader2 className="animate-spin" size={19} />}
              다음
            </Button>
          ) : (
            <Button
              disabled={!canGoNext || publishing}
              fullWidth
              onClick={publish}
              size="lg"
              variant="signal"
            >
              {publishing && <Loader2 className="animate-spin" size={19} />}
              전단 발행하기
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

export default function CreatePage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <main className="grid min-h-[60dvh] place-items-center text-navy-500">
            <Loader2 className="animate-spin" size={26} />
          </main>
        }
      >
        <CreateWizard />
      </Suspense>
    </RequireAuth>
  );
}
