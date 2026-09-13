"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";

/**
 * 마지막으로 확인된 시각 입력.
 *
 * 네이티브 `datetime-local` 은 데스크톱에서 달력만 띄우고 시·분은 키보드로 쳐야 한다.
 * 1차 타깃이 큰 버튼/선택형 UI 가 필요한 사용자라(기획서 1.1) 날짜·오전오후·시·분을
 * 각각 고르게 나눈다.
 *
 * 저장 값은 Backend 계약 그대로 `YYYY-MM-DDTHH:mm` (24시간) 문자열이다.
 */
const MINUTE_STEP = 5;
const DEFAULT_HOUR_24 = 9;

type Parts = { date: string; hour24: number; minute: number };

function parse(value: string): Parts {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return { date: "", hour24: DEFAULT_HOUR_24, minute: 0 };
  return { date: match[1], hour24: Number(match[2]), minute: Number(match[3]) };
}

function compose({ date, hour24, minute }: Parts) {
  if (!date) return "";
  return `${date}T${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const parts = parse(value);
  const isPm = parts.hour24 >= 12;
  const hour12 = parts.hour24 % 12 === 0 ? 12 : parts.hour24 % 12;

  const emit = (next: Partial<Parts>) => onChange(compose({ ...parts, ...next }));

  const setMeridiem = (pm: boolean) => {
    if (pm === isPm) return;
    emit({ hour24: pm ? (hour12 % 12) + 12 : hour12 % 12 });
  };

  const setHour12 = (next: number) => emit({ hour24: isPm ? (next % 12) + 12 : next % 12 });

  const setNow = () => {
    // 렌더 중에 현재 시각을 읽으면 서버와 브라우저가 달라 hydration 오류가 난다.
    // 클릭 시점에만 읽는다.
    const now = new Date();
    const minute = Math.floor(now.getMinutes() / MINUTE_STEP) * MINUTE_STEP;
    onChange(
      compose({
        date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
        hour24: now.getHours(),
        minute,
      }),
    );
  };

  const minutes = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP);
  if (!minutes.includes(parts.minute)) minutes.push(parts.minute);
  minutes.sort((a, b) => a - b);

  const selectClass =
    "h-12 w-full appearance-none rounded-xl border border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-navy-400";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[13px] font-bold text-navy-700">{label}</p>
        <button
          className="flex items-center gap-1 text-[13px] font-bold text-navy-600 underline underline-offset-2"
          onClick={setNow}
          type="button"
        >
          <Clock size={14} />
          지금으로 설정
        </button>
      </div>

      <input
        className="mt-1.5 h-12 w-full rounded-xl border border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-navy-400"
        onChange={(event) => emit({ date: event.target.value })}
        type="date"
        value={parts.date}
      />

      <div className="mt-2 flex gap-1.5">
        {[
          { label: "오전", pm: false },
          { label: "오후", pm: true },
        ].map((option) => (
          <button
            aria-pressed={isPm === option.pm}
            className={cn(
              "h-11 flex-1 rounded-xl text-[14px] font-bold transition-colors",
              isPm === option.pm ? "bg-navy-800 text-white" : "bg-white text-muted hover:bg-navy-100",
            )}
            key={option.label}
            onClick={() => setMeridiem(option.pm)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <label className="flex-1">
          <span className="sr-only">시</span>
          <select
            className={selectClass}
            onChange={(event) => setHour12(Number(event.target.value))}
            value={hour12}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
              <option key={hour} value={hour}>
                {hour}시
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1">
          <span className="sr-only">분</span>
          <select
            className={selectClass}
            onChange={(event) => emit({ minute: Number(event.target.value) })}
            value={parts.minute}
          >
            {minutes.map((minute) => (
              <option key={minute} value={minute}>
                {String(minute).padStart(2, "0")}분
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-1.5 text-[12px] leading-snug text-muted" aria-live="polite">
        {value
          ? `전단에 ${formatDateTime(value)} 로 표시됩니다.`
          : "날짜를 먼저 고르면 시각을 맞출 수 있습니다."}
      </p>
    </div>
  );
}
