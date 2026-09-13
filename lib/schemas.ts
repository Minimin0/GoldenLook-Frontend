import type { ColorId } from "@/lib/colors";

/**
 * Backend v4 의 app-facing DTO 를 그대로 옮긴 타입.
 * `GoldenLook-Backend/lib/contracts.ts` 와 필드명·값이 1:1 로 맞아야 한다.
 * AI provider 내부 구현은 여기에 드러나지 않는다. (기획서 6.2)
 */

/** 업로드 단계 체크박스 하나로 갈리는 핵심 분기 (동결) */
export type PhotoMode = "body_visible" | "face_only";

/** 사용자가 기억하는 정도. unknown 은 AI 프롬프트에서 사실로 확정하지 않는다. */
export type GarmentStatus = "known" | "none" | "unknown";

export type Garment =
  | { status: "known"; color: ColorId; type?: string | null; brand?: string | null }
  | { status: "none" }
  | { status: "unknown" };

export type BelongingItem = { type: string; color?: ColorId | null };

export type Appearance = {
  top: Garment;
  bottom: Garment;
  hat: Garment;
  shoes: Garment;
  items: BelongingItem[];
};

export type Gender = "male" | "female";
export type BodyType = "slim" | "average" | "heavy";

/** face_only 모드에서만 입력받는다. 몸무게(kg)는 받지 않는다. (기획서 4.3) */
export type BodyProfile = { gender?: Gender | null; bodyType?: BodyType | null } | null;

export type GenerationStatus = "PENDING" | "GENERATING" | "GENERATED" | "TEMPORARY_ERROR";

export type CaseDto = {
  id: string;
  photoMode: PhotoMode;
  appearance: Appearance;
  bodyProfile: BodyProfile;
  age: number | null;
  heightCm: number | null;
  generationStatus: GenerationStatus;
  regenerationCount: number;
  regenerationsRemaining: number;
  /** 5분짜리 signed URL. 만료되면 case 를 다시 읽어야 한다. */
  originalUrl: string | null;
  generatedUrl: string | null;
  label: string;
  published: boolean;
  shareId: string | null;
  flyerUrl: string | null;
  name: string | null;
  missingAt: string | null;
  place: string | null;
  contact: string | null;
  notes: string | null;
  contactDisclosureConsent: boolean;
};

export type CaseListItem = {
  id: string;
  photoMode: PhotoMode;
  generatedUrl: string | null;
  generationStatus: GenerationStatus;
  regenerationCount: number;
  regenerationsRemaining: number;
  published: boolean;
  shareId: string | null;
  flyerUrl: string | null;
  name: string | null;
  createdAt: string;
  publishedAt: string | null;
  label: string;
};

export type GenerationResult = {
  status: GenerationStatus;
  generatedUrl: string | null;
  label: string;
  regenerationCount: number;
  regenerationsRemaining: number;
};

export type CasePatch = Partial<{
  photoMode: PhotoMode;
  appearance: Appearance;
  bodyProfile: BodyProfile;
  age: number | null;
  heightCm: number | null;
  name: string | null;
  missingAt: string | null;
  place: string | null;
  contact: string | null;
  notes: string | null;
  contactDisclosureConsent: boolean;
}>;

export const GENDER_LABEL: Record<Gender, string> = {
  male: "남성",
  female: "여성",
};

export const BODY_TYPE_LABEL: Record<BodyType, string> = {
  slim: "마른편",
  average: "보통",
  heavy: "통통한편",
};

export const DEFAULT_APPEARANCE: Appearance = {
  top: { status: "unknown" },
  bottom: { status: "unknown" },
  hat: { status: "unknown" },
  shoes: { status: "unknown" },
  items: [],
};
