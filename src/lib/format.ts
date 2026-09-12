import { getColorLabel } from "./colors";
import type { Appearance, ClothingPart, MissingCase } from "./types";

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

/** 2026년 9월 12일 (토) 오후 2:40 */
export function formatDateTime(iso: string) {
  return FULL_DATE.format(new Date(iso));
}

/** 9월 12일 오후 2:40 (목록용 축약형) */
export function formatShortDateTime(iso: string) {
  return SHORT_DATE.format(new Date(iso));
}

/** "3시간 12분" — 골든타임 스트립에서 쓰는 경과 시간 */
export function formatElapsed(fromIso: string, now: number = Date.now()) {
  const diffMs = Math.max(0, now - new Date(fromIso).getTime());
  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}일 ${hours}시간`;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}

/** 실종 후 6시간 이내면 초기 대응 구간으로 본다. */
export function isGoldenHour(fromIso: string, now: number = Date.now()) {
  return now - new Date(fromIso).getTime() <= 6 * 60 * 60 * 1000;
}

/** 자동 삭제까지 남은 시간 (최대 48시간 정책) */
export function hoursUntilAutoDelete(createdAtIso: string, now: number = Date.now()) {
  const expiresAt = new Date(createdAtIso).getTime() + 48 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((expiresAt - now) / (60 * 60 * 1000)));
}

/** 010-0000-0000 */
export function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

/** "파랑 반팔 티셔츠" / "기억 안 남" / "착용 안 함" */
export function describeClothing(part: ClothingPart, fallbackNoun: string) {
  if (part.status === "none") return "착용 안 함";
  if (part.status === "unknown") return "기억 안 남";
  const color = getColorLabel(part.colorId);
  const noun = part.type?.trim() || fallbackNoun;
  return `${color} ${noun}`.trim();
}

/** 목록 카드 한 줄 요약: "파랑 반팔 티셔츠 · 회색 면바지" */
export function summarizeAppearance(appearance: Appearance) {
  const parts = [
    appearance.top.status === "known" ? describeClothing(appearance.top, "상의") : null,
    appearance.bottom.status === "known" ? describeClothing(appearance.bottom, "하의") : null,
  ].filter(Boolean);

  if (parts.length === 0) return "착장 정보 기억 안 남";
  return parts.join(" · ");
}

export function buildShareUrl(shareId: string) {
  if (typeof window === "undefined") return `/flyer/${shareId}`;
  return `${window.location.origin}/flyer/${shareId}`;
}

export function caseHeadline(c: MissingCase) {
  return `${c.name} (${c.age}세)`;
}
