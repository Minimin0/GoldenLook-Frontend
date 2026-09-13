/**
 * 날짜 표기는 Intl 을 쓰지 않고 직접 만든다.
 *
 * `Intl.DateTimeFormat("ko-KR")` 은 실행 환경의 ICU 데이터에 따라 결과가 달라진다.
 * (Node 는 `AM`, 브라우저는 `오전` 을 내놓는 경우가 있어 hydration 오류가 난다)
 * 한국 대상 서비스이므로 KST 고정 + 한국어 고정으로 직접 포맷한다.
 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

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
    weekday: WEEKDAYS[shifted.getUTCDay()],
    meridiem: hour24 < 12 ? "오전" : "오후",
    hour: hour24 % 12 === 0 ? 12 : hour24 % 12,
    minute: String(shifted.getUTCMinutes()).padStart(2, "0"),
  };
}

/** 2026년 9월 13일 (일) 오전 10:20 — 파싱 불가한 값은 입력 그대로 보여 준다. */
export function formatDateTime(value?: string | null) {
  const date = toDate(value);
  if (!date) return value?.trim() || "";
  const { year, month, day, weekday, meridiem, hour, minute } = kstParts(date);
  return `${year}년 ${month}월 ${day}일 (${weekday}) ${meridiem} ${hour}:${minute}`;
}

/** 9월 13일 오전 10:20 (목록용 축약형) */
export function formatShortDateTime(value?: string | null) {
  const date = toDate(value);
  if (!date) return value?.trim() || "";
  const { month, day, meridiem, hour, minute } = kstParts(date);
  return `${month}월 ${day}일 ${meridiem} ${hour}:${minute}`;
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
 * 자동 삭제까지 남은 시간.
 * Backend 의 cleanup cron 은 생성 24시간이 지난 case 를 지운다.
 * (기획서 2.1 의 "최대 48시간" 정책 안쪽 값이다)
 */
export const AUTO_DELETE_HOURS = 24;

export function hoursUntilAutoDelete(createdAt: string, now: number = Date.now()) {
  const start = toDate(createdAt);
  if (!start) return 0;
  const expiresAt = start.getTime() + AUTO_DELETE_HOURS * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((expiresAt - now) / (60 * 60 * 1000)));
}

/** 010-0000-0000 */
export function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
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
