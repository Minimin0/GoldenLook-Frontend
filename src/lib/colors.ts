/**
 * contracts/colors.json 과 1:1 대응하는 20색 팔레트.
 * 색상 id 는 동결 대상이므로 임의로 바꾸지 않는다. (기획서 15. 최종 동결 목록)
 */

export const COLOR_PALETTE = [
  { id: "white", label: "흰색", hex: "#FFFFFF", border: true },
  { id: "ivory", label: "아이보리", hex: "#F3EADA", border: true },
  { id: "beige", label: "베이지", hex: "#D9C3A0" },
  { id: "yellow", label: "노랑", hex: "#F7C948" },
  { id: "orange", label: "주황", hex: "#F28C28" },
  { id: "red", label: "빨강", hex: "#D93A33" },
  { id: "pink", label: "분홍", hex: "#EC9BB0" },
  { id: "coral", label: "코랄", hex: "#F26D5B" },
  { id: "purple", label: "보라", hex: "#8A63C9" },
  { id: "navy", label: "남색", hex: "#1F3A6E" },
  { id: "blue", label: "파랑", hex: "#2F6FD0" },
  { id: "skyblue", label: "하늘색", hex: "#8ECAEB" },
  { id: "mint", label: "민트", hex: "#63C7B2" },
  { id: "green", label: "초록", hex: "#3E9A56" },
  { id: "khaki", label: "카키", hex: "#6B7048" },
  { id: "brown", label: "갈색", hex: "#7A5232" },
  { id: "gray", label: "회색", hex: "#9AA3AF" },
  { id: "charcoal", label: "진회색", hex: "#4B5563" },
  { id: "black", label: "검정", hex: "#1A1A1A" },
  { id: "silver", label: "은색", hex: "#C8CDD4" },
] as const;

export type ColorId = (typeof COLOR_PALETTE)[number]["id"];

export interface PaletteColor {
  id: ColorId;
  label: string;
  hex: string;
  /** 밝은 색이라 테두리를 그려야 보이는 경우 */
  border?: boolean;
}

export const PALETTE: PaletteColor[] = COLOR_PALETTE.map((c) => ({ ...c }));

const COLOR_MAP = new Map<ColorId, PaletteColor>(PALETTE.map((c) => [c.id, c]));

export function getColor(id?: ColorId | null): PaletteColor | null {
  if (!id) return null;
  return COLOR_MAP.get(id) ?? null;
}

export function getColorLabel(id?: ColorId | null) {
  return getColor(id)?.label ?? "기억 안 남";
}
