"use client";

import Link from "next/link";
import { ArrowRight, Clock3, MapPinned, Share2, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { AUTO_DELETE_NOTICE } from "@/lib/format";

const FIRST_STEPS = [
  {
    icon: Clock3,
    title: "마지막으로 본 시각을 정합니다",
    body: "몇 시에 어디서 봤는지가 수색 범위를 가장 크게 줄여 줍니다.",
  },
  {
    icon: MapPinned,
    title: "그 자리에서 전단을 만듭니다",
    body: "사진과 기억나는 옷차림을 고르면 실종 당시 예상 모습이 만들어집니다.",
  },
  {
    icon: Share2,
    title: "주변 상인·이웃에게 공유합니다",
    body: "링크 하나로 카카오톡·문자·단톡방에 바로 전달됩니다.",
  },
];

export default function HomePage() {
  const { session } = useAuth();

  return (
    <>
      <AppHeader />

      <main className="nav-safe-area">
        {/* 히어로: 실종 직후 무엇부터 할지 한 문장으로. 강조는 CTA 하나에만 준다. */}
        <section className="bg-navy-100 px-5 pb-7 pt-5">
          <p className="text-sm font-semibold text-navy-500">실종 신고를 하셨다면</p>
          <h1 className="mt-1.5 text-[26px] font-extrabold leading-[1.3] tracking-tight text-navy-800">
            전단부터 만들어
            <br />
            주변에 알리세요
          </h1>
          <p className="mt-2.5 text-[15px] leading-relaxed text-navy-600">
            사진을 올리고 실종 당시 옷차림을 고르면 AI가 예상 모습을 재현합니다. 완성된 전단은
            링크로 바로 공유할 수 있습니다.
          </p>

          <div className="mt-5 flex flex-col gap-2">
            <ButtonLink href="/demo" variant="signal" size="lg" fullWidth>
              30초 체험하기
              <ArrowRight size={19} />
            </ButtonLink>
            <Link
              href={session ? "/create" : "/login?next=%2Fcreate"}
              className="flex h-12 items-center justify-center rounded-2xl bg-white/70 text-[15px] font-semibold text-navy-700 hover:bg-white"
            >
              실제 전단 만들기
            </Link>
            <Link
              href={session ? "/my" : "/login"}
              className="text-center text-[14px] font-semibold text-navy-600 underline underline-offset-4"
            >
              {session ? "내가 만든 전단 보기" : "로그인 / 회원가입"}
            </Link>
          </div>
        </section>

        {/* 초기 대응: 순서가 있는 내용이므로 번호를 붙인다 */}
        <section className="px-5 py-6">
          <h2 className="text-[19px] font-extrabold tracking-tight text-ink">
            실종 직후 30분 안에 할 일
          </h2>
          <ol className="mt-3 space-y-2.5">
            {FIRST_STEPS.map(({ icon: Icon, title, body }, index) => (
              <li key={title} className="flex gap-3 rounded-2xl border border-line bg-white p-3.5">
                <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700">
                  <Icon size={20} strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-navy-800 text-[11px] font-bold text-white">
                    {index + 1}
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-ink">{title}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 두 가지 사진 모드를 미리 설명해 업로드 단계의 체크박스를 이해시킨다 */}
        <section className="border-t-8 border-paper px-5 py-6">
          <h2 className="text-[19px] font-extrabold tracking-tight text-ink">
            얼굴만 있는 사진도 괜찮습니다
          </h2>
          <div className="mt-3 grid gap-2.5">
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="text-[15px] font-bold text-ink">몸이 보이는 사진</p>
              <p className="mt-0.5 text-[13px] leading-snug text-muted">
                사진의 얼굴과 배경은 그대로 두고, 기억하시는 옷의 색과 형태만 바꿉니다.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="text-[15px] font-bold text-ink">얼굴만 나온 사진</p>
              <p className="mt-0.5 text-[13px] leading-snug text-muted">
                나이·키·성별·체형을 받아 서 있는 예상 모습을 만듭니다. 사진을 다시 찍지 않아도
                됩니다.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 pb-8">
          <div className="flex gap-3 rounded-2xl bg-paper p-4 text-[13px] leading-relaxed text-muted">
            <ShieldCheck className="mt-0.5 shrink-0 text-navy-500" size={18} />
            <div>
              <p>
                전단의 인물 이미지는 보호자가 입력한 정보를 바탕으로 AI 가 재현한 예상 모습이며,
                실제 촬영 사진이 아닙니다.
              </p>
              <p className="mt-1.5">
                전단은 검색엔진에 노출되지 않습니다. 생성된 데이터는 {AUTO_DELETE_NOTICE} 자동
                삭제되며, 작성자는 언제든 직접 삭제할 수 있습니다.
              </p>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
}
