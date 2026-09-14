import { describe, expect, it } from "vitest";
import palette from "@/lib/generated/colors.json";
import { COLOR_IDS, PALETTE, getColorName, isColorId } from "@/lib/colors";
import { BODY_TYPE_LABEL, DEFAULT_APPEARANCE, GENDER_LABEL } from "@/lib/schemas";

/**
 * 계약 동결 항목을 지키는지 확인한다.
 * `lib/generated/colors.json` 은 Integration `contracts/colors.json` 사본이고,
 * 색 id 가 하나라도 달라지면 Backend 의 `colorSchema` 가 요청을 400 으로 돌려보낸다.
 */
const FROZEN_COLOR_IDS = [
  "black", "charcoal", "gray", "white", "ivory",
  "beige", "brown", "khaki", "green", "mint",
  "skyblue", "blue", "denim", "navy", "purple",
  "pink", "red", "wine", "orange", "yellow",
];

describe("색 팔레트 계약", () => {
  it("20색 id 가 계약과 순서까지 같다", () => {
    expect(COLOR_IDS).toEqual(FROZEN_COLOR_IDS);
  });

  it("스와치 hex 를 계약 rgb 에서 그대로 만든다", () => {
    // 보기 좋으라고 hex 를 손대면 사용자가 고른 색과 AI 가 받는 색 이름이 어긋난다.
    for (const [index, color] of PALETTE.entries()) {
      const [r, g, b] = palette[index].rgb;
      expect(color.hex).toBe(
        `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`,
      );
    }
  });

  it("계약에 없는 색 id 는 거부한다", () => {
    expect(isColorId("navy")).toBe(true);
    expect(isColorId("bluish")).toBe(false);
    expect(isColorId(null)).toBe(false);
    expect(getColorName("navy")).toBe("남색");
    expect(getColorName("bluish")).toBeNull();
  });
});

describe("열거형 계약", () => {
  it("bodyType 은 slim|average|heavy 다", () => {
    // 팀 초안에 있던 `normal` 을 쓰면 Backend 가 INVALID_INPUT 을 낸다.
    expect(Object.keys(BODY_TYPE_LABEL)).toEqual(["slim", "average", "heavy"]);
  });

  it("gender 는 male|female 다", () => {
    expect(Object.keys(GENDER_LABEL)).toEqual(["male", "female"]);
  });

  it("기본 착장은 네 부위 모두 unknown 이고 소지품은 비어 있다", () => {
    // 입력하지 않은 항목을 추정값으로 채우지 않는다는 원칙의 시작점이다.
    expect(DEFAULT_APPEARANCE).toEqual({
      top: { status: "unknown" },
      bottom: { status: "unknown" },
      hat: { status: "unknown" },
      shoes: { status: "unknown" },
      items: [],
    });
  });
});
