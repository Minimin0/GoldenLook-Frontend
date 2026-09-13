import { getColorName, isColorId, type ColorId } from "@/lib/colors";
import type { Appearance, BelongingItem, Garment, GarmentStatus } from "@/lib/schemas";

/** 색·형태를 편집할 수 있는 항목. 소지품(items)은 전단 텍스트 전용이다. */
export const recolorableParts = ["top", "bottom", "hat", "shoes"] as const;

export type RecolorablePart = (typeof recolorableParts)[number];

export const PART_LABEL: Record<RecolorablePart, string> = {
  top: "상의",
  bottom: "하의",
  hat: "모자",
  shoes: "신발",
};

/**
 * "파랑 반팔 티셔츠" / "착용 안 함" / "기억 안 남".
 * unknown 을 추정값으로 채우지 않는다. (기획서 4.2 입력 원칙)
 */
export function describeGarment(part: Garment, fallbackNoun: string) {
  if (part.status === "none") return "착용 안 함";
  if (part.status === "unknown") return "기억 안 남";
  return [getColorName(part.color), part.type?.trim() || fallbackNoun].filter(Boolean).join(" ");
}

/** 목록 카드 한 줄 요약: "파랑 반팔 티셔츠 · 회색 면바지" */
export function summarizeAppearance(appearance: Appearance) {
  const parts = (["top", "bottom"] as const)
    .filter((key) => appearance[key].status === "known")
    .map((key) => describeGarment(appearance[key], PART_LABEL[key]));
  return parts.length ? parts.join(" · ") : "착장 정보 기억 안 남";
}

/* ───────── 입력 중 상태(draft) ─────────
 * Backend 의 `known` 은 20색 중 하나를 반드시 가진다.
 * 화면에서는 "기억나요" 를 먼저 누르고 색을 고르는 순서라 색이 비는 순간이 있어서,
 * 입력용 타입을 따로 두고 제출 직전에 계약 타입으로 변환한다.
 */

export type GarmentDraft = {
  status: GarmentStatus;
  color?: ColorId | null;
  type?: string | null;
  brand?: string | null;
};

export type AppearanceDraft = {
  top: GarmentDraft;
  bottom: GarmentDraft;
  hat: GarmentDraft;
  shoes: GarmentDraft;
  items: BelongingItem[];
};

export const EMPTY_APPEARANCE_DRAFT: AppearanceDraft = {
  top: { status: "known" },
  bottom: { status: "known" },
  hat: { status: "unknown" },
  shoes: { status: "unknown" },
  items: [],
};

/** "기억나요" 로 두고 색을 안 고른 항목을 알려 준다. */
export function missingColorParts(draft: AppearanceDraft): RecolorablePart[] {
  return recolorableParts.filter(
    (key) => draft[key].status === "known" && !isColorId(draft[key].color),
  );
}

export function toAppearance(draft: AppearanceDraft): Appearance {
  const convert = (part: GarmentDraft): Garment => {
    if (part.status !== "known") return { status: part.status === "none" ? "none" : "unknown" };
    if (!isColorId(part.color)) return { status: "unknown" };
    return {
      status: "known",
      color: part.color,
      type: part.type?.trim() || null,
      brand: part.brand?.trim() || null,
    };
  };

  return {
    top: convert(draft.top),
    bottom: convert(draft.bottom),
    hat: convert(draft.hat),
    shoes: convert(draft.shoes),
    items: draft.items
      .map((item) => ({ type: item.type.trim().slice(0, 60), color: item.color ?? null }))
      .filter((item) => item.type.length > 0)
      .slice(0, 5),
  };
}

/** 이어서 작성할 때 서버 값을 입력 상태로 되돌린다. */
export function toAppearanceDraft(appearance: Appearance): AppearanceDraft {
  const convert = (part: Garment): GarmentDraft =>
    part.status === "known"
      ? { status: "known", color: part.color, type: part.type ?? null, brand: part.brand ?? null }
      : { status: part.status };

  return {
    top: convert(appearance.top),
    bottom: convert(appearance.bottom),
    hat: convert(appearance.hat),
    shoes: convert(appearance.shoes),
    items: appearance.items.map((item) => ({ type: item.type, color: item.color ?? null })),
  };
}

/**
 * 같은 착장인지 비교하는 키.
 * 불필요한 PATCH 를 막기 위한 것이다. appearance 를 다시 보내면 Backend 가
 * 생성 결과와 재생성 횟수를 초기화하므로, 바뀌지 않았으면 보내지 않는다.
 */
export function appearanceKey(appearance: Appearance) {
  const part = (garment: Garment) =>
    garment.status === "known"
      ? ["known", garment.color, garment.type ?? "", garment.brand ?? ""].join("|")
      : garment.status;

  return [
    ...recolorableParts.map((key) => `${key}:${part(appearance[key])}`),
    ...appearance.items.map((item) => `item:${item.type}|${item.color ?? ""}`),
  ].join("/");
}
