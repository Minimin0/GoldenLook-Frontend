"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { formatElapsed, isGoldenHour } from "@/lib/format";

/**
 * GoldenLook 의 핵심 장치.
 * 마지막으로 확인된 시각부터 흐른 시간을 계속 갱신해 우선순위를 드러낸다.
 * 서버/클라이언트 렌더 시점이 달라 생기는 1분 단위 차이는 suppressHydrationWarning 으로 흡수한다.
 */
export function ElapsedTime({
  missingAt,
  className,
  prefix = "실종 후",
}: {
  missingAt: string;
  className?: string;
  prefix?: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className={cn("tabular", className)} suppressHydrationWarning>
      {prefix} {formatElapsed(missingAt, now)}
    </span>
  );
}

/** 전단 상세 상단에 붙는 경과 시간 바 */
export function ElapsedBar({ missingAt }: { missingAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const golden = isGoldenHour(missingAt, now);

  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-3 px-5 py-4",
        golden ? "bg-signal-50" : "bg-navy-50",
      )}
    >
      <div>
        <p className={cn("text-xs font-semibold", golden ? "text-signal-600" : "text-navy-500")}>
          마지막으로 확인된 시각 이후
        </p>
        <p
          className={cn(
            "tabular text-2xl font-extrabold leading-tight",
            golden ? "text-signal-600" : "text-navy-800",
          )}
          suppressHydrationWarning
        >
          {formatElapsed(missingAt, now)} 경과
        </p>
      </div>
      {golden && (
        <span className="shrink-0 rounded-md bg-signal-500 px-2 py-1 text-xs font-bold text-white">
          초기 6시간
        </span>
      )}
    </div>
  );
}
