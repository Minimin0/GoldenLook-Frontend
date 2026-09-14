import { describe, expect, it } from "vitest";
import {
  formatDateTime,
  formatElapsed,
  formatPhone,
  formatShortDateTime,
  isGoldenHour,
  isValidContact,
  withParticle,
  withRo,
} from "@/lib/format";

/** 2026-09-13 15:30 KST */
const KST_1530 = Date.UTC(2026, 8, 13, 6, 30);

describe("날짜 표기", () => {
  it("시간대 없는 입력값을 KST 로 읽는다", () => {
    // `new Date("2026-09-13T15:30")` 은 실행 환경의 로컬 시간으로 읽힌다.
    // 서버(UTC)와 브라우저(KST)가 다른 시각을 만들어 hydration 오류가 났었다.
    expect(formatDateTime("2026-09-13T15:30")).toBe("2026년 9월 13일 오후 3시 30분");
  });

  it("TZ 가 무엇이든 같은 문자열을 낸다", () => {
    // Intl 대신 UTC getter 로만 계산하므로 실행 환경에 흔들리지 않아야 한다.
    const before = process.env.TZ;
    try {
      process.env.TZ = "UTC";
      const utc = formatDateTime("2026-09-13T15:30");
      process.env.TZ = "America/New_York";
      expect(formatDateTime("2026-09-13T15:30")).toBe(utc);
    } finally {
      process.env.TZ = before;
    }
  });

  it("오프셋이 붙은 값도 KST 로 옮겨 보여 준다", () => {
    expect(formatDateTime("2026-09-13T06:30:00Z")).toBe("2026년 9월 13일 오후 3시 30분");
  });

  it("자정과 정오를 12시로 쓴다", () => {
    expect(formatDateTime("2026-09-13T00:05")).toBe("2026년 9월 13일 오전 12시 05분");
    expect(formatDateTime("2026-09-13T12:00")).toBe("2026년 9월 13일 오후 12시 00분");
  });

  it("목록용 축약형은 연도를 뺀다", () => {
    expect(formatShortDateTime("2026-09-13T15:30")).toBe("9월 13일 오후 3시 30분");
  });

  it("읽을 수 없는 값은 입력 그대로 보여 준다", () => {
    expect(formatDateTime("언제였는지 모름")).toBe("언제였는지 모름");
    expect(formatDateTime(null)).toBe("");
  });
});

describe("경과 시간", () => {
  it("시간과 분을 함께 센다", () => {
    expect(formatElapsed("2026-09-13T15:30", KST_1530 + 3 * 3600_000 + 12 * 60_000)).toBe("3시간 12분");
  });

  it("하루가 넘으면 일 단위로 센다", () => {
    expect(formatElapsed("2026-09-13T15:30", KST_1530 + 26 * 3600_000)).toBe("1일 2시간");
  });

  it("한 시간 안쪽은 분만 센다", () => {
    expect(formatElapsed("2026-09-13T15:30", KST_1530 + 12 * 60_000)).toBe("12분");
  });

  it("미래 시각은 0분으로 막는다", () => {
    expect(formatElapsed("2026-09-13T15:30", KST_1530 - 60_000)).toBe("0분");
  });

  it("6시간까지를 초기 대응 구간으로 본다", () => {
    expect(isGoldenHour("2026-09-13T15:30", KST_1530 + 6 * 3600_000)).toBe(true);
    expect(isGoldenHour("2026-09-13T15:30", KST_1530 + 6 * 3600_000 + 1)).toBe(false);
  });
});

describe("연락처", () => {
  it("Backend contactSchema 와 같은 기준으로 막는다", () => {
    // 발행 직전에 400 을 맞고 되돌아오는 것보다 입력 단계에서 막는 편이 낫다.
    expect(isValidContact("010-1234-5678")).toBe(true);
    expect(isValidContact("+82 10 1234 5678")).toBe(true);
    expect(isValidContact("(02) 123-4567")).toBe(true);
    expect(isValidContact("010123")).toBe(false); // 7자리 미만
    expect(isValidContact("0101234567890123")).toBe(false); // 15자리 초과
    expect(isValidContact("010-1234-오공칠팔")).toBe(false);
    expect(isValidContact("  ")).toBe(false);
  });

  it("자리수에 맞춰 하이픈을 넣고, 아니면 그대로 둔다", () => {
    expect(formatPhone("01012345678")).toBe("010-1234-5678");
    expect(formatPhone("0311234567")).toBe("031-123-4567");
    expect(formatPhone("+821012345678")).toBe("+821012345678");
  });

  it("서울 지역번호는 두 자리로 자른다", () => {
    // 3자리로 자르면 보호자가 확인 화면에서 남의 번호를 보게 된다.
    expect(formatPhone("0212345678")).toBe("02-1234-5678");
    expect(formatPhone("021234567")).toBe("02-123-4567");
  });
});

describe("조사 선택", () => {
  it("받침이 있으면 이/을, 없으면 가/를 을 쓴다", () => {
    // "사진 이(가) 필요합니다" 처럼 괄호로 적으면 템플릿 찌꺼기로 읽힌다.
    expect(withParticle("실종자 사진", "이", "가")).toBe("이");
    expect(withParticle("예상 모습 만들기", "이", "가")).toBe("가");
    expect(withParticle("연락처 공개 확인", "을", "를")).toBe("을");
    expect(withParticle("보호자 연락처", "을", "를")).toBe("를");
  });

  it("한글이 아니면 받침 없는 형태로 둔다", () => {
    expect(withParticle("photo", "이", "가")).toBe("가");
    expect(withParticle("", "이", "가")).toBe("가");
  });

  it("로 / 으로 는 ㄹ 받침을 받침 없는 것과 같이 다룬다", () => {
    expect(`${"…30분"}${withRo("2026년 9월 13일 오후 3시 30분")}`).toBe("…30분으로");
    expect(withRo("010-1234-5678")).toBe("로");   // 팔 → ㄹ
    expect(withRo("010-1234-5670")).toBe("으로"); // 영 → ㅇ
    expect(withRo("010-1234-5673")).toBe("으로"); // 삼 → ㅁ
    expect(withRo("010-1234-5676")).toBe("으로"); // 육 → ㄱ
    expect(withRo("02-123-4567")).toBe("로");     // 칠 → ㄹ
  });
});
