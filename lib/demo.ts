import type { Appearance } from "@/lib/schemas";

/**
 * 랜딩의 30초 체험용 합성 데이터. (기획서 2.1 P0 `synthetic demo` / 3장 플로우)
 *
 * 실제 인물·실제 연락처를 쓰지 않는다. (기획서 12. 보안·안전)
 * - 인물 이미지는 사진이 아니라 일러스트(`public/demo-figure.svg`)다.
 * - 연락처는 더미 번호 `010-0000-0000` 하나만 쓴다.
 * - Backend 를 호출하지 않는다. 로그인 없이 열린다.
 */
export const DEMO_CONTACT = "010-0000-0000";

export const DEMO_CASE = {
  name: "김정순",
  age: 78,
  heightCm: 152,
  gender: "여성",
  missingAt: "2026-09-13T10:20",
  place: "서울특별시 영등포구",
  placeDetail: "영등포역 1번 출구 앞 횡단보도",
  notes: "이름과 집 주소를 말하지 못합니다. 귀가 어두워 큰 소리로 말해야 들립니다.",
  contact: DEMO_CONTACT,
  photoMode: "face_only" as const,
  imageUrl: "/demo-figure.svg",
};

/** 20색 팔레트 id 만 사용한다. 데모라고 다른 색 이름을 쓰지 않는다. */
export const DEMO_APPEARANCE: Appearance = {
  top: { status: "known", color: "blue", type: "점퍼", brand: null },
  bottom: { status: "known", color: "gray", type: "면바지", brand: null },
  hat: { status: "none" },
  shoes: { status: "unknown" },
  items: [{ type: "나무 지팡이", color: "brown" }],
};
