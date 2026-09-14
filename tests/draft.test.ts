import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearDraft, clearExpiredDrafts, hasDraftContent, readDraft, writeDraft } from "@/lib/draft";
import type { FlyerForm } from "@/components/create/FlyerInfoStep";

const EMPTY: FlyerForm = {
  name: "", age: "", heightCm: "", missingAt: "",
  sido: "", sigungu: "", placeDetail: "", notes: "", contact: "",
};

class MemoryStorage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  key(index: number) { return [...this.map.keys()][index] ?? null; }
  getItem(key: string) { return this.map.get(key) ?? null; }
  setItem(key: string, value: string) { this.map.set(key, value); }
  removeItem(key: string) { this.map.delete(key); }
  clear() { this.map.clear(); }
}

/** jsdom 없이 localStorage 만 흉내 낸다. */
function installStorage() {
  const storage = new MemoryStorage();
  vi.stubGlobal("window", { localStorage: storage });
  return storage;
}

beforeEach(() => installStorage());
afterEach(() => vi.unstubAllGlobals());

describe("작성 중 전단 임시 저장", () => {
  it("빈 폼은 되살릴 가치가 없으니 저장하지 않는다", () => {
    expect(hasDraftContent(EMPTY, false)).toBe(false);
    writeDraft("case-1", EMPTY, false);
    expect(readDraft("case-1")).toBeNull();
  });

  it("동의 체크만 해도 복구 대상으로 본다", () => {
    expect(hasDraftContent(EMPTY, true)).toBe(true);
  });

  it("입력한 내용과 동의 여부를 되살린다", () => {
    const form = { ...EMPTY, name: "홍길동", contact: "010-1234-5678" };
    writeDraft("case-1", form, true);
    expect(readDraft("case-1")).toMatchObject({ form, consent: true });
  });

  it("내용을 다 지우면 저장분도 지운다", () => {
    writeDraft("case-1", { ...EMPTY, name: "홍길동" }, false);
    writeDraft("case-1", EMPTY, false);
    expect(readDraft("case-1")).toBeNull();
  });

  it("6시간이 지나면 읽지 않고 지운다", () => {
    // 연락처가 들어가므로 오래 남기지 않는다.
    const storage = installStorage();
    writeDraft("case-1", { ...EMPTY, name: "홍길동" }, false);
    const stored = JSON.parse(storage.getItem("goldenlook:draft:case-1")!);
    stored.savedAt = Date.now() - 6 * 60 * 60 * 1000 - 1;
    storage.setItem("goldenlook:draft:case-1", JSON.stringify(stored));

    expect(readDraft("case-1")).toBeNull();
    expect(storage.getItem("goldenlook:draft:case-1")).toBeNull();
  });

  it("읽을 때 다른 만료분까지 함께 지운다", () => {
    const storage = installStorage();
    storage.setItem(
      "goldenlook:draft:old",
      JSON.stringify({ savedAt: Date.now() - 7 * 60 * 60 * 1000, form: EMPTY, consent: false }),
    );
    storage.setItem("goldenlook:draft:broken", "{ not json");
    storage.setItem("other-app-key", "지키기");
    writeDraft("case-1", { ...EMPTY, name: "홍길동" }, false);

    readDraft("case-1");

    expect(storage.getItem("goldenlook:draft:old")).toBeNull();
    expect(storage.getItem("goldenlook:draft:broken")).toBeNull();
    expect(storage.getItem("other-app-key")).toBe("지키기");
    expect(readDraft("case-1")).not.toBeNull();
  });

  it("발행·삭제 뒤에는 즉시 지운다", () => {
    writeDraft("case-1", { ...EMPTY, name: "홍길동" }, false);
    clearDraft("case-1");
    expect(readDraft("case-1")).toBeNull();
  });

  it("localStorage 가 막혀 있어도 예외를 던지지 않는다", () => {
    // Safari 시크릿 모드는 접근 자체가 예외다. 임시 편의 기능이라 작성은 계속돼야 한다.
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new Error("blocked");
      },
    });
    expect(() => writeDraft("case-1", { ...EMPTY, name: "홍길동" }, false)).not.toThrow();
    expect(readDraft("case-1")).toBeNull();
    expect(() => clearDraft("case-1")).not.toThrow();
    expect(() => clearExpiredDrafts()).not.toThrow();
  });
});
