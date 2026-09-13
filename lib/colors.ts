import palette from "@/lib/generated/colors.json";

/**
 * 20색 팔레트. `lib/generated/colors.json` 은 Integration 의 `contracts/colors.json`
 * 사본이며 색 id 는 동결 항목이다. (기획서 15. 최종 동결 목록)
 *
 * 스와치 hex 는 contract 의 rgb 를 그대로 쓴다. 보기 좋으라고 다른 값을 넣으면
 * 사용자가 고른 색과 AI 프롬프트에 넘어가는 색 이름이 어긋난다.
 */
export type ColorId = string;

export interface PaletteColor {
  id: ColorId;
  name: string;
  hex: string;
  /** 밝은 색이라 테두리를 그려야 보이는 경우 */
  light: boolean;
}

function hex([r, g, b]: number[]) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function luminance([r, g, b]: number[]) {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export const PALETTE: PaletteColor[] = palette.map((color) => ({
  id: color.id,
  name: color.name,
  hex: hex(color.rgb),
  light: luminance(color.rgb) > 165,
}));

export const COLOR_IDS = PALETTE.map((color) => color.id);

const BY_ID = new Map(PALETTE.map((color) => [color.id, color]));

export function getColor(id?: ColorId | null) {
  return id ? BY_ID.get(id) ?? null : null;
}

export function getColorName(id?: ColorId | null) {
  return getColor(id)?.name ?? null;
}

export function isColorId(value: unknown): value is ColorId {
  return typeof value === "string" && BY_ID.has(value);
}
