import type { ColorId } from "./colors";
import type { Region } from "./regions";

/** 업로드 단계 체크박스 하나로 갈리는 핵심 분기 (동결) */
export type PhotoMode = "body_visible" | "face_only";

/** 사용자가 기억하는 정도. unknown 은 AI 프롬프트에서 사실로 확정하지 않는다. */
export type RecallStatus = "known" | "none" | "unknown";

export type CaseStatus = "urgent" | "searching" | "found";

export type Gender = "male" | "female";
export type BodyType = "slim" | "normal" | "heavy";

export interface ClothingPart {
  status: RecallStatus;
  colorId?: ColorId;
  /** 상의/하의 종류. 선택 입력이며 비어 있으면 AI 는 중립적 기본 의상을 쓴다. */
  type?: string;
  brand?: string;
}

export interface Belonging {
  type: string;
  colorId?: ColorId;
}

export interface Appearance {
  top: ClothingPart;
  bottom: ClothingPart;
  hat: ClothingPart;
  shoes: ClothingPart;
  items: Belonging[];
}

/** face_only 모드에서만 입력받는 몸 정보. 몸무게(kg)는 받지 않는다. */
export interface BodyProfile {
  gender: Gender;
  bodyType: BodyType;
}

export interface MissingCase {
  id: string;
  shareId: string;
  status: CaseStatus;

  name: string;
  age: number;
  gender: Gender;
  heightCm: number | null;

  /** 마지막으로 확인된 시각 (ISO 8601) */
  missingAt: string;
  /** 시도·시군구는 선택으로 받는다. 자유 텍스트로 두면 지역별 집계가 불가능하다. */
  region: Region;
  /** 시군구 아래 상세 위치. "영등포역 1번 출구" 처럼 사람이 찾아갈 수 있는 지점. */
  placeDetail?: string;

  /** 보호자 연락처. 공개 전단에 전체 공개된다. 데모는 더미 번호만 사용. */
  contact: string;
  notes?: string;

  photoMode: PhotoMode;
  appearance: Appearance;
  bodyProfile?: BodyProfile;

  /** AI 로 재현한 예상 모습. 공개 전단의 메인 이미지. */
  generatedImageUrl?: string | null;
  generationAttempts: number;

  createdAt: string;
  publishedAt?: string | null;
}

export const GENDER_LABEL: Record<Gender, string> = {
  male: "남성",
  female: "여성",
};

export const BODY_TYPE_LABEL: Record<BodyType, string> = {
  slim: "마른편",
  normal: "보통",
  heavy: "통통한편",
};

export const STATUS_LABEL: Record<CaseStatus, string> = {
  urgent: "긴급",
  searching: "수색중",
  found: "발견 완료",
};
