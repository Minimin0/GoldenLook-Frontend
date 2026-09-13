"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, FlaskConical, MapPin, Phone, Ruler, ShieldAlert, UserRound } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AiPhoto } from "@/components/flyer/AiPhoto";
import { AppearanceBox } from "@/components/flyer/AppearanceBox";
import { ButtonLink } from "@/components/ui/Button";
import { DEMO_APPEARANCE, DEMO_CASE } from "@/lib/demo";
import { formatDateTime, formatPhone } from "@/lib/format";

/**
 * 랜딩의 30초 체험. 로그인도 Backend 호출도 없이 완성된 전단이 어떻게 보이는지만 보여 준다.
 * 데이터는 전부 `lib/demo.ts` 의 합성 값이다.
 */
export default function DemoPage() {
  return (
    <>
      <PageHeader title="예시 전단 둘러보기" fallbackHref="/" />

      <main className="pb-28">
        <div className="flex items-start gap-2.5 bg-navy-800 px-5 py-3.5 text-white">
          <FlaskConical className="mt-0.5 shrink-0" size={18} />
          <p className="text-[13px] font-semibold leading-snug">
            합성 데이터로 만든 예시입니다. 실제 실종자도, 실제 연락처도 아닙니다.
          </p>
        </div>

        <AiPhoto
          alt="합성 예시 인물의 실종 당시 예상 모습"
          ratio="portrait"
          src={DEMO_CASE.imageUrl}
        />

        <section className="px-5 pt-5">
          <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-ink">
            {DEMO_CASE.name}
            <span className="ml-2 text-xl font-bold text-navy-600">{DEMO_CASE.age}세</span>
          </h1>

          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            <li className="flex items-center gap-1 rounded-lg bg-paper px-2.5 py-1.5 text-[13px] font-semibold text-navy-700">
              <UserRound size={14} />
              {DEMO_CASE.gender}
            </li>
            <li className="flex items-center gap-1 rounded-lg bg-paper px-2.5 py-1.5 text-[13px] font-semibold text-navy-700">
              <Ruler size={14} />키 {DEMO_CASE.heightCm}cm
            </li>
            <li className="rounded-lg bg-paper px-2.5 py-1.5 text-[13px] font-semibold text-navy-700">
              얼굴 사진 기반 재현
            </li>
          </ul>
        </section>

        <section className="mt-2 divide-y divide-line px-5">
          <InfoRow
            icon={CalendarClock}
            label="마지막으로 확인된 시각"
            value={formatDateTime(DEMO_CASE.missingAt)}
          />
          <InfoRow
            icon={MapPin}
            label="마지막 목격 장소"
            sub={DEMO_CASE.placeDetail}
            value={DEMO_CASE.place}
          />
        </section>

        <section className="px-5 pt-5">
          <AppearanceBox appearance={DEMO_APPEARANCE} />
        </section>

        <section className="px-5 pt-4">
          <div className="rounded-2xl bg-signal-50 p-4">
            <h2 className="flex items-center gap-1.5 text-base font-extrabold text-signal-700">
              <ShieldAlert size={18} />
              이런 점을 주의해 주세요
            </h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{DEMO_CASE.notes}</p>
          </div>
        </section>

        <section className="px-5 pt-4">
          <div className="rounded-2xl border border-line bg-white p-4">
            <h2 className="text-base font-extrabold text-ink">보호자 연락처</h2>
            <p className="mt-0.5 text-[13px] text-muted">
              실제 전단에서는 이 자리에 보호자가 입력한 번호가 그대로 표시됩니다.
            </p>
            {/* 더미 번호이므로 전화 링크를 걸지 않는다 */}
            <p className="tabular mt-3 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-navy-800">
              <Phone size={22} className="text-signal-500" />
              {formatPhone(DEMO_CASE.contact)}
              <span className="text-[13px] font-semibold text-muted">(예시 번호)</span>
            </p>
          </div>
        </section>

        <section className="px-5 py-6">
          <p className="text-[13px] leading-relaxed text-muted">
            인물 이미지는 보호자가 고른 옷 색과 입력한 몸 정보를 반영해 AI 가 재현한 예상 모습이며,
            실제 촬영 사진이 아닙니다. 이 예시에서는 상의 파랑 점퍼, 하의 회색 면바지, 갈색 지팡이를
            선택한 결과를 보여 줍니다. 기억나지 않는다고 표시한 신발은 전단에도 &lsquo;기억 안
            남&rsquo; 으로만 적힙니다.
          </p>
        </section>
      </main>

      <div className="app-bar border-t border-line bg-white/95 backdrop-blur">
        <div className="px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
          <ButtonLink fullWidth href="/create" size="lg" variant="signal">
            내 전단 직접 만들기
            <ArrowRight size={19} />
          </ButtonLink>
          <p className="mt-2 text-center text-xs text-muted">
            <Link className="underline underline-offset-2" href="/">
              홈으로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex gap-3 py-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy-600">
        <Icon size={18} strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-muted">{label}</p>
        <p className="text-[15px] font-bold leading-snug text-ink">{value}</p>
        {sub && <p className="mt-0.5 text-[13px] leading-snug text-muted">{sub}</p>}
      </div>
    </div>
  );
}
