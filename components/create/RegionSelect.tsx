"use client";

import { SIDO_LIST, getSigunguList, hasSigungu } from "@/lib/regions";

/**
 * 시도 → 시군구 순으로 좁혀 받는다. 두 값 모두 REGIONS 상수에서만 나오므로
 * 나중에 지역별 집계나 근처 조회를 붙일 수 있다. 그 아래 상세 위치는 자유 텍스트다.
 *
 * Backend 계약의 `place` 는 문자열 한 칸이라, 저장 직전에 `composePlace()` 로 합친다.
 */
export function RegionSelect({
  sido,
  sigungu,
  onSidoChange,
  onSigunguChange,
}: {
  sido: string;
  sigungu: string;
  onSidoChange: (value: string) => void;
  onSigunguChange: (value: string) => void;
}) {
  const sigunguList = getSigunguList(sido);
  const needsSigungu = hasSigungu(sido);

  const selectClass =
    "mt-1.5 h-12 w-full appearance-none rounded-xl border border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-navy-400 disabled:bg-paper disabled:text-muted";

  return (
    <div>
      <p className="text-[13px] font-bold text-navy-700">마지막 목격 지역</p>
      <div className="flex gap-2">
        <label className="flex-1">
          <span className="sr-only">시 · 도</span>
          <select className={selectClass} onChange={(e) => onSidoChange(e.target.value)} value={sido}>
            <option value="">시 · 도 선택</option>
            {SIDO_LIST.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex-1">
          <span className="sr-only">시 · 군 · 구</span>
          <select
            className={selectClass}
            disabled={!sido || !needsSigungu}
            onChange={(e) => onSigunguChange(e.target.value)}
            value={sigungu}
          >
            <option value="">
              {!sido ? "시 · 도 먼저" : needsSigungu ? "시 · 군 · 구 선택" : "해당 없음"}
            </option>
            {sigunguList.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
