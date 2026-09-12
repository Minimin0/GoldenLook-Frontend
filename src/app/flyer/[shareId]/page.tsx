import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock, MapPin, Phone, Ruler, ShieldAlert, UserRound } from "lucide-react";
import { AiPhoto } from "@/components/flyer/AiPhoto";
import { AppearanceBox } from "@/components/flyer/AppearanceBox";
import { ShareActions } from "@/components/flyer/ShareActions";
import { ElapsedBar } from "@/components/ui/ElapsedTime";
import { StatusRibbon } from "@/components/ui/StatusBadge";
import { BrandMark } from "@/components/layout/AppHeader";
import { formatDateTime, formatPhone, hoursUntilAutoDelete } from "@/lib/format";
import { formatRegion } from "@/lib/regions";
import { getCaseByShareId } from "@/lib/mock-data";
import { GENDER_LABEL } from "@/lib/types";

// Next.js 15 에서 params 는 Promise 다.
type PageProps = { params: Promise<{ shareId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareId } = await params;
  const item = getCaseByShareId(shareId);

  if (!item) return { title: "전단지를 찾을 수 없습니다" };

  return {
    title: `${item.name}(${item.age}세)님을 찾고 있습니다`,
    description: `${formatRegion(item.region)} 부근에서 실종되었습니다. 보신 분은 보호자에게 연락 부탁드립니다.`,
    robots: { index: false, follow: false },
  };
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

export default async function FlyerPage({ params }: PageProps) {
  const { shareId } = await params;
  const item = getCaseByShareId(shareId);

  if (!item) notFound();

  const remainingHours = hoursUntilAutoDelete(item.createdAt);

  return (
    <>
      <StatusRibbon status={item.status} />

      <main className="pb-40">
        <header className="flex items-center gap-2 px-5 py-3">
          <BrandMark size={26} />
          <span className="text-[15px] font-extrabold text-navy-800">GoldenLook 전단지</span>
        </header>

        <AiPhoto
          alt={`${item.name}님의 실종 당시 예상 모습`}
          ratio="portrait"
          src={item.generatedImageUrl}
        />

        <ElapsedBar missingAt={item.missingAt} />

        <section className="px-5 pt-5">
          <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-ink">
            {item.name}
            <span className="ml-2 text-xl font-bold text-navy-600">{item.age}세</span>
          </h1>

          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            <li className="flex items-center gap-1 rounded-lg bg-paper px-2.5 py-1.5 text-[13px] font-semibold text-navy-700">
              <UserRound size={14} />
              {GENDER_LABEL[item.gender]}
            </li>
            {item.heightCm && (
              <li className="flex items-center gap-1 rounded-lg bg-paper px-2.5 py-1.5 text-[13px] font-semibold text-navy-700">
                <Ruler size={14} />키 {item.heightCm}cm
              </li>
            )}
            <li className="rounded-lg bg-paper px-2.5 py-1.5 text-[13px] font-semibold text-navy-700">
              {item.photoMode === "face_only" ? "얼굴 사진 기반 재현" : "실제 사진 기반 재현"}
            </li>
          </ul>
        </section>

        <section className="mt-2 divide-y divide-line px-5">
          <InfoRow
            icon={CalendarClock}
            label="마지막으로 확인된 시각"
            value={formatDateTime(item.missingAt)}
          />
          <InfoRow
            icon={MapPin}
            label="마지막 목격 장소"
            sub={item.placeDetail}
            value={formatRegion(item.region)}
          />
        </section>

        <section className="px-5 pt-5">
          <AppearanceBox appearance={item.appearance} />
        </section>

        {item.notes && (
          <section className="px-5 pt-4">
            <div className="rounded-2xl bg-signal-50 p-4">
              <h2 className="flex items-center gap-1.5 text-base font-extrabold text-signal-700">
                <ShieldAlert size={18} />
                이런 점을 주의해 주세요
              </h2>
              <p className="mt-1.5 whitespace-pre-line text-[15px] leading-relaxed text-ink">
                {item.notes}
              </p>
            </div>
          </section>
        )}

        <section className="px-5 pt-4">
          <div className="rounded-2xl border border-line bg-white p-4">
            <h2 className="text-base font-extrabold text-ink">보호자 연락처</h2>
            <p className="mt-0.5 text-[13px] text-muted">
              보신 적이 있다면 시간과 장소를 함께 전해 주세요.
            </p>
            <a
              href={`tel:${item.contact.replace(/\D/g, "")}`}
              className="tabular mt-3 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-navy-800"
            >
              <Phone size={22} className="text-signal-500" />
              {formatPhone(item.contact)}
            </a>
          </div>
        </section>

        <section className="px-5 py-6">
          <p className="text-[13px] leading-relaxed text-muted">
            이 전단지의 인물 이미지는 보호자가 입력한 정보를 바탕으로 AI가 재현한 예상 모습이며,
            실제 촬영 사진이 아닙니다. 실제 모습과 다를 수 있으니 옷차림과 인상착의를 함께 확인해
            주세요.
          </p>
          <p className="mt-2 text-[13px] text-muted">
            이 페이지는 검색엔진에 노출되지 않으며, 등록 후 최대 48시간이 지나면 자동으로 삭제됩니다.
            {remainingHours > 0 && ` (삭제까지 약 ${remainingHours}시간 남음)`}
          </p>
        </section>
      </main>

      <ShareActions
        age={item.age}
        contact={item.contact}
        imageUrl={item.generatedImageUrl}
        name={item.name}
        place={formatRegion(item.region)}
        shareId={item.shareId}
      />
    </>
  );
}
