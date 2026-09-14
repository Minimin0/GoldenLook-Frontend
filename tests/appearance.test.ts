import { describe, expect, it } from "vitest";
import {
  EMPTY_APPEARANCE_DRAFT,
  appearanceKey,
  describeGarment,
  missingColorParts,
  summarizeAppearance,
  toAppearance,
  toAppearanceDraft,
  type AppearanceDraft,
} from "@/lib/appearance";
import type { Appearance } from "@/lib/schemas";

function draft(overrides: Partial<AppearanceDraft> = {}): AppearanceDraft {
  return { ...EMPTY_APPEARANCE_DRAFT, items: [], ...overrides };
}

describe("입력 상태 → 계약 타입 변환", () => {
  it("색을 고르지 않은 known 은 unknown 으로 내린다", () => {
    // Backend 의 known 은 20색 중 하나를 반드시 가진다.
    // 색 없는 known 을 그대로 보내면 400 이고, 임의 색을 채우면 없는 사실을 만든다.
    const result = toAppearance(draft({ top: { status: "known" } }));
    expect(result.top).toEqual({ status: "unknown" });
  });

  it("계약에 없는 색도 unknown 으로 내린다", () => {
    const result = toAppearance(draft({ top: { status: "known", color: "bluish" } }));
    expect(result.top).toEqual({ status: "unknown" });
  });

  it("색이 있으면 known 을 유지하고 빈 문자열은 null 로 바꾼다", () => {
    const result = toAppearance(
      draft({ top: { status: "known", color: "navy", type: "  패딩 ", brand: "   " } }),
    );
    expect(result.top).toEqual({ status: "known", color: "navy", type: "패딩", brand: null });
  });

  it("none 은 none 그대로 둔다", () => {
    // "안 썼다" 는 사용자가 명시한 사실이라 unknown 으로 뭉개면 안 된다.
    expect(toAppearance(draft({ hat: { status: "none" } })).hat).toEqual({ status: "none" });
  });

  it("소지품은 5개·60자까지만 보낸다", () => {
    const result = toAppearance(
      draft({
        items: [
          { type: " 지팡이 ", color: "brown" },
          { type: "가방" },
          { type: "우산" },
          { type: "시계" },
          { type: "목도리" },
          { type: "여섯번째" },
        ],
      }),
    );
    expect(result.items).toHaveLength(5);
    expect(result.items[0]).toEqual({ type: "지팡이", color: "brown" });
    expect(result.items[1]).toEqual({ type: "가방", color: null });
  });

  it("빈 소지품 줄은 버린다", () => {
    expect(toAppearance(draft({ items: [{ type: "   " }] })).items).toEqual([]);
  });
});

describe("서버 값 → 입력 상태 복원", () => {
  it("왕복해도 내용이 보존된다", () => {
    const appearance: Appearance = {
      top: { status: "known", color: "navy", type: "패딩", brand: "나이키" },
      bottom: { status: "none" },
      hat: { status: "unknown" },
      shoes: { status: "known", color: "white", type: null, brand: null },
      items: [{ type: "가방", color: "black" }],
    };
    expect(toAppearance(toAppearanceDraft(appearance))).toEqual(appearance);
  });
});

describe("색이 빠진 항목 안내", () => {
  it("known 인데 색이 없는 부위만 집어낸다", () => {
    const missing = missingColorParts(
      draft({
        top: { status: "known" },
        bottom: { status: "known", color: "gray" },
        hat: { status: "unknown" },
        shoes: { status: "known" },
      }),
    );
    expect(missing).toEqual(["top", "shoes"]);
  });
});

describe("불필요한 PATCH 방지용 비교 키", () => {
  const base: Appearance = {
    top: { status: "known", color: "navy", type: "패딩", brand: null },
    bottom: { status: "unknown" },
    hat: { status: "none" },
    shoes: { status: "unknown" },
    items: [{ type: "가방", color: "black" }],
  };

  it("같은 내용이면 같은 키다", () => {
    // appearance 를 다시 보내면 Backend 가 생성 결과와 재생성 횟수를 초기화한다.
    expect(appearanceKey(structuredClone(base))).toBe(appearanceKey(base));
  });

  it("색이 바뀌면 키가 바뀐다", () => {
    const changed: Appearance = { ...base, top: { status: "known", color: "red", type: "패딩", brand: null } };
    expect(appearanceKey(changed)).not.toBe(appearanceKey(base));
  });

  it("브랜드만 바뀌어도 키가 바뀐다", () => {
    const changed: Appearance = { ...base, top: { status: "known", color: "navy", type: "패딩", brand: "나이키" } };
    expect(appearanceKey(changed)).not.toBe(appearanceKey(base));
  });

  it("소지품이 늘면 키가 바뀐다", () => {
    const changed: Appearance = { ...base, items: [...base.items, { type: "우산", color: null }] };
    expect(appearanceKey(changed)).not.toBe(appearanceKey(base));
  });
});

describe("사용자에게 보여 줄 문구", () => {
  it("unknown 을 추정값으로 채우지 않는다", () => {
    expect(describeGarment({ status: "unknown" }, "상의")).toBe("기억 안 남");
    expect(describeGarment({ status: "none" }, "모자")).toBe("착용 안 함");
    expect(describeGarment({ status: "known", color: "navy" }, "상의")).toBe("남색 상의");
    expect(describeGarment({ status: "known", color: "navy", type: "패딩" }, "상의")).toBe("남색 패딩");
  });

  it("상·하의를 모두 모르면 그렇게 말한다", () => {
    expect(
      summarizeAppearance({
        top: { status: "unknown" },
        bottom: { status: "none" },
        hat: { status: "unknown" },
        shoes: { status: "unknown" },
        items: [],
      }),
    ).toBe("착장 정보 기억 안 남");
  });
});
