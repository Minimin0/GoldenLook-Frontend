import Link from "next/link";
import { ArrowRight, ChevronRight, Clock3, MapPinned, Share2 } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { FlyerCard } from "@/components/flyer/FlyerCard";
import { ButtonLink } from "@/components/ui/Button";
import { getRecentCases } from "@/lib/mock-data";

const FIRST_STEPS = [
  {
    icon: Clock3,
    title: "마지막으로 본 시각을 정합니다",
    body: "몇 시에 어디서 봤는지가 수색 범위를 가장 크게 줄여 줍니다.",
  },
  {
    icon: MapPinned,
    title: "그 자리에서 전단지를 만듭니다",
    body: "사진과 기억나는 옷차림을 고르면 예상 모습이 만들어집니다.",
  },
  {
    icon: Share2,
    title: "주변 상인·이웃에게 공유합니다",
    body: "링크 하나로 카카오톡·문자·단톡방에 바로 전달됩니다.",
  },
];

export default function HomePage() {
  const recent = getRecentCases();
  const activeCount = recent.filter((c) => c.status !== "found").length;

  return (
    <>
      <AppHeader unreadCount={activeCount} />

      <main className="nav-safe-area">
        {/* 히어로: 실종 직후 무엇부터 할지 한 문장으로.
            연한 하늘색 바탕으로 영역을 구분하고, 강조는 CTA 하나에만 준다. */}
        <section className="bg-navy-100 px-5 pb-7 pt-5">
          <p className="text-sm font-semibold text-navy-500">실종 신고를 하셨다면</p>
          <h1 className="mt-1.5 text-[26px] font-extrabold leading-[1.3] tracking-tight text-navy-800">
            전단지부터 만들어
            <br />
            주변에 알리세요
          </h1>
          <p className="mt-2.5 text-[15px] leading-relaxed text-navy-600">
            사진 한 장과 기억나는 옷차림만 있으면 됩니다. 실종 당시의 예상 모습을 만들어 바로 공유할
            수 있습니다.
          </p>

          <div className="mt-5 flex flex-col gap-2">
            <ButtonLink href="/create" variant="signal" size="lg" fullWidth>
              전단지 즉시 작성하기
              <ArrowRight size={19} />
            </ButtonLink>
            <Link
              href="/flyer/gl-7f3a21"
              className="flex h-12 items-center justify-center rounded-2xl bg-white/70 text-[15px] font-semibold text-navy-700 hover:bg-white"
            >
              30초 만에 예시 전단지 둘러보기
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
              <li
                key={title}
                className="flex gap-3 rounded-2xl border border-line bg-white p-3.5"
              >
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

        {/* 최근 등록 현황 */}
        <section className="border-t-8 border-paper px-5 py-6">
          <div className="flex items-end justify-between">
            <h2 className="text-[19px] font-extrabold tracking-tight text-ink">
              최근 등록된 전단지
            </h2>
            <Link
              href="/my"
              className="flex items-center gap-0.5 text-sm font-semibold text-navy-500"
            >
              전체 보기
              <ChevronRight size={16} />
            </Link>
          </div>
          <p className="mt-1 text-[13px] text-muted">
            현재 {activeCount}명을 함께 찾고 있습니다.
          </p>

          <ul className="mt-3.5 space-y-2.5">
            {recent.map((item) => (
              <FlyerCard key={item.id} item={item} />
            ))}
          </ul>
        </section>

        <section className="px-5 pb-8">
          <div className="rounded-2xl bg-paper p-4 text-[13px] leading-relaxed text-muted">
            <p>
              전단지의 인물 이미지는 보호자가 입력한 정보를 바탕으로 AI가 재현한 예상 모습이며, 실제
              촬영 사진이 아닙니다.
            </p>
            <p className="mt-1.5">
              등록된 전단지는 개인정보 보호를 위해 최대 48시간 뒤 자동으로 삭제되며, 작성자가 언제든
              직접 삭제할 수 있습니다.
            </p>
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
}
