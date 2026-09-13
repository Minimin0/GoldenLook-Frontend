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
import { isValidContact } from "@/lib/format";
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
        setStep(data.generationStatus === "GENERATED" && data.generatedUrl ? 3 : 1);
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
      router.push(`/c/${shareId}?created=1`);
    } catch (cause) {
      setError(errorMessage(cause));
      setPublishing(false);
    }
  };

  const canGoNext = (() => {
    if (step === 0) {
      if (!photoFile && !caseData) return false;
      if (photoMode !== "face_only") return true;
      return (
        inRange(form.age, 1, 120) &&
        inRange(form.heightCm, 40, 230) &&
        Boolean(body.gender) &&
        Boolean(body.bodyType)
      );
    }
    if (step === 1) return true;
    if (step === 2) return Boolean(caseData?.generatedUrl);
    return (
      form.name.trim() !== "" &&
      inRange(form.age, 1, 120) &&
      form.missingAt !== "" &&
      form.sido !== "" &&
      (!hasSigungu(form.sido) || form.sigungu !== "") &&
      isValidContact(form.contact) &&
      consent
    );
  })();

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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[480px] gap-2 px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
          {step > 0 && (
            <Button disabled={busy || publishing} onClick={() => setStep((s) => s - 1)} size="lg" variant="outline">
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
