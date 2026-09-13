/**
 * 서버(UTC)와 브라우저(KST)가 다른 문자열을 만들어 hydration 오류가 나는 것을 막기 위해
 * 날짜 표기는 항상 Asia/Seoul 기준으로 고정한다.
 */
const FULL_DATE = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
});

const SHORT_DATE = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function toDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 2026년 9월 12일 (토) 오후 2:40 — 파싱 불가한 값은 입력 그대로 보여 준다. */
export function formatDateTime(value?: string | null) {
  const date = toDate(value);
  return date ? FULL_DATE.format(date) : value?.trim() || "";
}

/** 9월 12일 오후 2:40 (목록용 축약형) */
export function formatShortDateTime(value?: string | null) {
  const date = toDate(value);
  return date ? SHORT_DATE.format(date) : value?.trim() || "";
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
