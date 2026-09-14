/**
 * 날짜 표기는 Intl 을 쓰지 않고 직접 만든다.
 *
 * `Intl.DateTimeFormat("ko-KR")` 은 실행 환경의 ICU 데이터에 따라 결과가 달라진다.
 * (Node 는 `AM`, 브라우저는 `오전` 을 내놓는 경우가 있어 hydration 오류가 난다)
 * 한국 대상 서비스이므로 KST 고정 + 한국어 고정으로 직접 포맷한다.
 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** `2026-09-13T10:20` 처럼 시간대가 없는 값 (datetime-local 입력값) */
const NAIVE_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

/**
 * 시간대가 없는 문자열을 `new Date()` 에 그대로 넘기면 실행 환경의 로컬 시간으로 읽는다.
 * 서버(UTC)와 브라우저(KST)가 다른 시각을 만들므로, 시간대가 없으면 KST 로 고정해서 읽는다.
 */
function toDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(NAIVE_DATETIME.test(value.trim()) ? `${value.trim()}+09:00` : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** KST 기준 날짜 조각. UTC getter 만 써서 실행 환경에 영향받지 않는다. */
function kstParts(date: Date) {
  const shifted = new Date(date.getTime() + KST_OFFSET_MS);
  const hour24 = shifted.getUTCHours();
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    meridiem: hour24 < 12 ? "오전" : "오후",
    hour: hour24 % 12 === 0 ? 12 : hour24 % 12,
    minute: String(shifted.getUTCMinutes()).padStart(2, "0"),
  };
}

/**
 * 2026년 9월 13일 오후 3시 30분 — 파싱 불가한 값은 입력 그대로 보여 준다.
 * Backend `lib/server/flyer.ts` 의 `flyerDateTime()` 과 같은 형식이어야
 * 전단 PNG 와 화면 문구가 어긋나지 않는다.
 */
export function formatDateTime(value?: string | null) {
  const date = toDate(value);
  if (!date) return value?.trim() || "";
  const { year, month, day, meridiem, hour, minute } = kstParts(date);
  return `${year}년 ${month}월 ${day}일 ${meridiem} ${hour}시 ${minute}분`;
}

/** 9월 13일 오후 3시 30분 (목록용 축약형) */
export function formatShortDateTime(value?: string | null) {
  const date = toDate(value);
  if (!date) return value?.trim() || "";
  const { month, day, meridiem, hour, minute } = kstParts(date);
  return `${month}월 ${day}일 ${meridiem} ${hour}시 ${minute}분`;
}

/** "3시간 12분" — 경과 시간 */
export function formatElapsed(from: string, now: number = Date.now()) {
  const start = toDate(from);
  if (!start) return "";
  const totalMinutes = Math.floor(Math.max(0, now - start.getTime()) / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}일 ${hours}시간`;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}

/** 실종 후 6시간 이내면 초기 대응 구간으로 본다. */
export function isGoldenHour(from: string, now: number = Date.now()) {
  const start = toDate(from);
  return start ? now - start.getTime() <= 6 * 60 * 60 * 1000 : false;
}

/**
 * 자동 삭제 안내 문구.
 *
 * Backend 는 생성 24시간이 지난 case 를 지우지만 cron 이 하루 한 번 돌기 때문에
 * 실제 삭제 시점은 24~48시간 사이다. "24시간 후 정확히 삭제" 로 쓰면 안 되고,
 * 남은 시간을 시 단위로 세어 보여 주는 것도 같은 이유로 금지다. (팀 결정사항 ②)
 */
export const AUTO_DELETE_NOTICE = "최대 48시간 이내";

/**
 * 010-0000-0000 / 02-000-0000 — 보호자가 자기 번호를 확인하는 화면에도 쓰인다.
 * 서울 지역번호(02)만 두 자리라서 3자리로 자르면 남의 번호처럼 보인다.
 */
export function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  const split = (head: number) =>
    `${digits.slice(0, head)}-${digits.slice(head, digits.length - 4)}-${digits.slice(-4)}`;

  if (digits.startsWith("02") && (digits.length === 9 || digits.length === 10)) return split(2);
  if (digits.length === 10 || digits.length === 11) return split(3);
  return raw;
}

/**
 * Backend `contactSchema` 와 같은 규칙.
 * 발행 직전에 400 을 맞고 되돌아오는 것보다 입력 단계에서 막는 편이 낫다.
 */
export function isValidContact(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 40) return false;
  if (!/^\+?[0-9 ()-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

/** 공개 전단 주소. 배포 도메인은 NEXT_PUBLIC_BASE_URL 로 주입한다. */
export function buildShareUrl(shareId: string) {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    (typeof window === "undefined" ? "" : window.location.origin);
  return `${base}/c/${shareId}`;
}

/** 숫자를 소리 내어 읽었을 때의 받침. "010-1234-5678 로" 가 아니라 "…5678로" 가 맞다. */
const DIGIT_JONGSEONG: Record<string, number> = {
  "0": 21, "1": 8, "2": 0, "3": 16, "4": 0, "5": 0, "6": 1, "7": 8, "8": 8, "9": 0,
};

/** 마지막 글자의 받침 번호. 한글도 숫자도 아니면 null. */
function jongseong(word: string) {
  const last = word.trim().at(-1) ?? "";
  if (last in DIGIT_JONGSEONG) return DIGIT_JONGSEONG[last];
  const code = last.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3 ? (code - 0xac00) % 28 : null;
}

/**
 * 앞 단어의 받침에 맞춰 조사를 고른다.
 *
 * "사진 이(가) 필요합니다" 처럼 괄호로 적으면 안내문이 아니라 템플릿 찌꺼기로 읽힌다.
 * 막힌 이유를 읽어야 하는 사람은 대개 급한 상황이라 문장이 걸리면 안 된다.
 */
export function withParticle(word: string, withJongseong: string, withoutJongseong: string) {
  return jongseong(word) ? withJongseong : withoutJongseong;
}

/** 로 / 으로. ㄹ 받침은 받침 없는 것과 같이 "로" 를 쓴다. */
export function withRo(word: string) {
  const jong = jongseong(word);
  return jong && jong !== 8 ? "으로" : "로";
}
