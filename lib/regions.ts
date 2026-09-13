/**
 * 전국 시도 · 시군구 목록 (2026년 기준).
 *
 * 주소를 자유 텍스트로 받으면 지역별 집계나 근처 조회를 붙일 수 없어서,
 * 시도/시군구는 선택으로 받고 그 아래(역 출구, 건물명 등)만 상세 텍스트로 받는다.
 *
 * 주의:
 * - 행정구역 개편이 있으면 이 파일을 직접 고쳐야 한다.
 *   (2023년 대구 군위군 편입, 2024년 전북특별자치도 전환까지 반영돼 있다)
 * - 세종특별자치시는 하위 시군구가 없어 빈 배열이다. UI 에서 시군구 선택을 건너뛴다.
 * - 값은 화면 표시 문자열이자 저장 값이다. 백엔드와 표기를 맞춰서 쓴다.
 */

export interface Region {
  sido: string;
  sigungu: string;
}

export const REGIONS: Record<string, string[]> = {
  서울특별시: [
    "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구",
    "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구",
    "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구",
  ],
  부산광역시: [
    "강서구", "금정구", "남구", "동구", "동래구", "부산진구", "북구", "사상구",
    "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구", "기장군",
  ],
  대구광역시: [
    "남구", "달서구", "동구", "북구", "서구", "수성구", "중구", "달성군", "군위군",
  ],
  인천광역시: [
    "계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "중구",
    "강화군", "옹진군",
  ],
  광주광역시: ["광산구", "남구", "동구", "북구", "서구"],
  대전광역시: ["대덕구", "동구", "서구", "유성구", "중구"],
  울산광역시: ["남구", "동구", "북구", "중구", "울주군"],
  세종특별자치시: [],
  경기도: [
    "가평군", "고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시",
    "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시",
    "안양시", "양주시", "양평군", "여주시", "연천군", "오산시", "용인시", "의왕시",
    "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시",
  ],
  강원특별자치도: [
    "강릉시", "동해시", "삼척시", "속초시", "원주시", "춘천시", "태백시", "고성군",
    "양구군", "양양군", "영월군", "인제군", "정선군", "철원군", "평창군", "홍천군",
    "화천군", "횡성군",
  ],
  충청북도: [
    "제천시", "청주시", "충주시", "괴산군", "단양군", "보은군", "영동군", "옥천군",
    "음성군", "증평군", "진천군",
  ],
  충청남도: [
    "계룡시", "공주시", "논산시", "당진시", "보령시", "서산시", "아산시", "천안시",
    "금산군", "부여군", "서천군", "예산군", "청양군", "태안군", "홍성군",
  ],
  전북특별자치도: [
    "군산시", "김제시", "남원시", "익산시", "전주시", "정읍시", "고창군", "무주군",
    "부안군", "순창군", "완주군", "임실군", "장수군", "진안군",
  ],
  전라남도: [
    "광양시", "나주시", "목포시", "순천시", "여수시", "강진군", "고흥군", "곡성군",
    "구례군", "담양군", "무안군", "보성군", "신안군", "영광군", "영암군", "완도군",
    "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군",
  ],
  경상북도: [
    "경산시", "경주시", "구미시", "김천시", "문경시", "상주시", "안동시", "영주시",
    "영천시", "포항시", "고령군", "봉화군", "성주군", "영덕군", "영양군", "예천군",
    "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군",
  ],
  경상남도: [
    "거제시", "김해시", "밀양시", "사천시", "양산시", "진주시", "창원시", "통영시",
    "거창군", "고성군", "남해군", "산청군", "의령군", "창녕군", "하동군", "함안군",
    "함양군", "합천군",
  ],
  제주특별자치도: ["서귀포시", "제주시"],
};

export const SIDO_LIST = Object.keys(REGIONS);

export function getSigunguList(sido: string): string[] {
  return REGIONS[sido] ?? [];
}

/** 세종처럼 하위 시군구가 없는 광역자치단체인지 */
export function hasSigungu(sido: string): boolean {
  return getSigunguList(sido).length > 0;
}

/** "서울특별시 영등포구" — 시군구가 없으면 시도만 */
export function formatRegion(region?: Region | null): string {
  if (!region?.sido) return "";
  return region.sigungu ? `${region.sido} ${region.sigungu}` : region.sido;
}

/** 목록 카드처럼 좁은 자리에서 쓰는 축약형: "서울 영등포구" */
const SIDO_SHORT: Record<string, string> = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "경기",
  강원특별자치도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전북특별자치도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주",
};

export function formatRegionShort(region?: Region | null): string {
  if (!region?.sido) return "";
  const sido = SIDO_SHORT[region.sido] ?? region.sido;
  return region.sigungu ? `${sido} ${region.sigungu}` : sido;
}

/**
 * Backend 계약의 `place` 는 문자열 한 칸이다. (기획서 10. 데이터 모델)
 * 화면에서는 집계 가능한 시도·시군구를 선택으로 받고, 저장할 때만 한 줄로 합친다.
 * 이렇게 하면 Backend/DB 스키마를 건드리지 않고도 지역 표기를 고정할 수 있다.
 */
export function composePlace(region: Region, placeDetail?: string): string {
  return [formatRegion(region), placeDetail?.trim()].filter(Boolean).join(" ").slice(0, 160);
}

/** 이어서 작성할 때 저장된 `place` 문자열을 다시 선택값으로 되돌린다. */
export function parsePlace(place?: string | null): { region: Region; placeDetail: string } {
  const empty = { region: { sido: "", sigungu: "" }, placeDetail: "" };
  const value = place?.trim();
  if (!value) return empty;

  const sido = SIDO_LIST.find((name) => value === name || value.startsWith(`${name} `));
  if (!sido) return { ...empty, placeDetail: value };

  const rest = value.slice(sido.length).trim();
  const sigungu = getSigunguList(sido).find((name) => rest === name || rest.startsWith(`${name} `));
  return {
    region: { sido, sigungu: sigungu ?? "" },
    placeDetail: sigungu ? rest.slice(sigungu.length).trim() : rest,
  };
}
