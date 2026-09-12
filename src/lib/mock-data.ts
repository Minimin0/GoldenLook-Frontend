import type { MissingCase } from "./types";

/**
 * synthetic demo 데이터.
 * 기획서 12. 보안·안전 원칙에 따라 실제 인물/실제 연락처는 절대 넣지 않는다.
 * 연락처는 전부 더미 번호(010-0000-xxxx)다.
 *
 * 실제 연동 시 이 파일을 Supabase 조회로 교체하면 된다.
 */
export const MOCK_CASES: MissingCase[] = [
  {
    id: "c_01",
    shareId: "gl-7f3a21",
    status: "urgent",
    name: "김정순",
    age: 78,
    gender: "female",
    heightCm: 152,
    missingAt: "2026-09-12T11:20:00+09:00",
    region: { sido: "서울특별시", sigungu: "영등포구" },
    placeDetail: "영등포역 1번 출구 앞 횡단보도",
    contact: "010-0000-1234",
    notes:
      "알츠하이머 중기로 이름과 집 주소를 말하지 못합니다. 낯선 사람이 말을 걸면 놀라 자리를 피할 수 있으니 천천히 다가가 주세요.",
    photoMode: "face_only",
    appearance: {
      top: { status: "known", colorId: "coral", type: "바람막이", brand: "나이키" },
      bottom: { status: "known", colorId: "white", type: "청바지" },
      hat: { status: "none" },
      shoes: { status: "known", colorId: "orange", type: "구두" },
      items: [{ type: "검은색 손가방", colorId: "black" }],
    },
    bodyProfile: { gender: "female", bodyType: "slim" },
    generatedImageUrl: null,
    generationAttempts: 1,
    createdAt: "2026-09-12T12:05:00+09:00",
    publishedAt: "2026-09-12T12:11:00+09:00",
  },
  {
    id: "c_02",
    shareId: "gl-2b90cd",
    status: "searching",
    name: "박상철",
    age: 81,
    gender: "male",
    heightCm: 168,
    missingAt: "2026-09-12T07:40:00+09:00",
    region: { sido: "서울특별시", sigungu: "마포구" },
    placeDetail: "망원시장 정문",
    contact: "010-0000-5678",
    notes: "오른쪽 다리가 불편해 지팡이를 짚고 천천히 걷습니다. 청력이 약해 큰 소리로 말해야 들립니다.",
    photoMode: "body_visible",
    appearance: {
      top: { status: "known", colorId: "beige", type: "점퍼" },
      bottom: { status: "known", colorId: "charcoal", type: "면바지" },
      hat: { status: "known", colorId: "black", type: "중절모" },
      shoes: { status: "unknown" },
      items: [{ type: "나무 지팡이", colorId: "brown" }],
    },
    generatedImageUrl: null,
    generationAttempts: 2,
    createdAt: "2026-09-12T08:30:00+09:00",
    publishedAt: "2026-09-12T08:35:00+09:00",
  },
  {
    id: "c_03",
    shareId: "gl-55e1aa",
    status: "searching",
    name: "이영현",
    age: 23,
    gender: "male",
    heightCm: 176,
    missingAt: "2026-09-11T22:10:00+09:00",
    region: { sido: "서울특별시", sigungu: "영등포구" },
    placeDetail: "영등포역 1번 출구",
    contact: "010-0000-9012",
    notes: "친구와 헤어진 뒤 연락이 끊겼습니다. 휴대폰은 꺼져 있는 상태입니다.",
    photoMode: "body_visible",
    appearance: {
      top: { status: "known", colorId: "coral", type: "후드티", brand: "나이키" },
      bottom: { status: "known", colorId: "white", type: "청바지" },
      hat: { status: "unknown" },
      shoes: { status: "known", colorId: "orange", type: "구두" },
      items: [],
    },
    generatedImageUrl: null,
    generationAttempts: 1,
    createdAt: "2026-09-11T23:40:00+09:00",
    publishedAt: "2026-09-11T23:45:00+09:00",
  },
  {
    id: "c_04",
    shareId: "gl-9c04fe",
    status: "found",
    name: "최말순",
    age: 84,
    gender: "female",
    heightCm: 148,
    missingAt: "2026-09-10T14:00:00+09:00",
    region: { sido: "서울특별시", sigungu: "성동구" },
    placeDetail: "왕십리역 3번 출구",
    contact: "010-0000-3456",
    notes: "이웃 주민 제보로 인근 공원에서 무사히 발견되었습니다.",
    photoMode: "face_only",
    appearance: {
      top: { status: "known", colorId: "purple", type: "카디건" },
      bottom: { status: "known", colorId: "black", type: "치마" },
      hat: { status: "unknown" },
      shoes: { status: "unknown" },
      items: [],
    },
    bodyProfile: { gender: "female", bodyType: "normal" },
    generatedImageUrl: null,
    generationAttempts: 3,
    createdAt: "2026-09-10T15:10:00+09:00",
    publishedAt: "2026-09-10T15:15:00+09:00",
  },
];

export function getCaseByShareId(shareId: string) {
  return MOCK_CASES.find((c) => c.shareId === shareId) ?? null;
}

/** 홈 화면 "최근 등록" 목록: 발견 완료 건은 뒤로 보낸다. */
export function getRecentCases() {
  return [...MOCK_CASES].sort((a, b) => {
    if (a.status === "found" && b.status !== "found") return 1;
    if (b.status === "found" && a.status !== "found") return -1;
    return new Date(b.missingAt).getTime() - new Date(a.missingAt).getTime();
  });
}
