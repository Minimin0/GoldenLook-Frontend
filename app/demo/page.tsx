"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ImagePlus,
  MapPin,
  Phone,
  RotateCcw,
  Ruler,
  Shirt,
  Sparkles,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/components/auth/AuthProvider";
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
  const { session } = useAuth();
  const createHref = session ? "/create" : "/login?next=%2Fcreate";

  return (
    <>
      <PageHeader title="예시 전단 둘러보기" fallbackHref="/" />

      <main className="pb-28">
        <section id="demo-start" className="bg-navy-800 px-5 py-5 text-white">
          <p className="text-[13px] font-semibold text-navy-100">
            예시 데이터로 Golden Look의 흐름을 30초 안에 체험해 보세요.
          </p>
          <h1 className="mt-1.5 text-[24px] font-extrabold leading-tight">
            사진과 옷차림으로
            <br />
            전단까지 만드는 과정
          </h1>
        </section>

        <section className="space-y-3 bg-paper px-5 py-5">
          <DemoStep icon={ImagePlus} title="사진을 등록하면" body="예시 인물 사진으로 시작합니다.">
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              {/* 데모의 입력 사진 예시라 AI 라벨을 붙이지 않는다. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="예시 인물 사진"
                className="aspect-[3/4] w-full object-cover"
                src={DEMO_CASE.imageUrl}
              />
            </div>
          </DemoStep>

          <DemoStep
            icon={UserRound}
            title="사진 유형을 고르고"
            body="몸 전체가 보이는 사진인지, 얼굴 중심 사진인지 선택합니다."
          >
            <div className="grid grid-cols-2 gap-2">
              <Choice label="몸이 보이는 사진" />
              <Choice checked label="얼굴 중심 사진" />
            </div>
          </DemoStep>

          <DemoStep
            icon={Shirt}
            title="실종 당시 옷차림을 선택하면"
            body="상의, 하의, 모자, 신발처럼 기억나는 항목만 채웁니다."
          >
            <div className="grid grid-cols-2 gap-2 text-[13px] font-semibold">
              <Choice checked label="상의 파랑 점퍼" />
              <Choice checked label="하의 회색 면바지" />
              <Choice label="모자 없음" />
              <Choice label="신발 기억 안 남" />
            </div>
          </DemoStep>

          <DemoStep
            icon={Sparkles}
            title="AI가 예상 모습을 재현합니다"
            body="선택한 옷차림과 입력한 정보를 반영한 모습을 확인합니다."
          >
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              <AiPhoto
                alt="예시 인물의 실종 당시 예상 모습"
                ratio="portrait"
                src={DEMO_CASE.imageUrl}
              />
            </div>
          </DemoStep>
        </section>

        <section className="px-5 pb-2 pt-5">
          <h2 className="text-[19px] font-extrabold text-ink">바로 전단으로 만들 수 있습니다</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            아래는 같은 예시 데이터로 완성한 모바일 전단입니다. 연락처도 예시 번호입니다.
          </p>
        </section>

        <AiPhoto
          alt="예시 인물의 실종 당시 예상 모습이 담긴 전단"
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
            <h2 className="text-base font-extrabold text-signal-700">보호자 메모</h2>
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
          <ButtonLink fullWidth href={createHref} size="lg" variant="signal">
            내 전단 만들어보기
            <ArrowRight size={19} />
          </ButtonLink>
          <p className="mt-2 text-center text-xs text-muted">
            <Link className="inline-flex items-center gap-1 underline underline-offset-2" href="#demo-start">
              <RotateCcw size={13} />
              처음부터 다시 보기
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

function DemoStep({
  icon: Icon,
  title,
  body,
  children,
}: {
  icon: typeof ImagePlus;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <div className="flex gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700">
          <Icon size={20} strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-extrabold leading-snug text-ink">{title}</h2>
          <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{body}</p>
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </section>
  );
}

function Choice({ label, checked = false }: { label: string; checked?: boolean }) {
  return (
    <span className="flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-2 text-navy-700">
      <CheckCircle2
        className={checked ? "text-signal-500" : "text-muted/50"}
        size={16}
        strokeWidth={2}
      />
      {label}
    </span>
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
