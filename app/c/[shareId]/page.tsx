import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { flyerImageUrl } from "@/lib/api/cases";
import { FlyerView } from "./FlyerView";

type PageProps = {
  params: Promise<{ shareId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Backend 가 발급하는 shareId 형식 (base64url 12자) */
const SHARE_ID = /^[A-Za-z0-9_-]{12}$/;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareId } = await params;
  return {
    title: "실종자를 찾고 있습니다",
    description:
      "보호자가 기억하는 실종 당시 정보로 재현한 예상 모습입니다. 보신 분은 전단의 보호자 연락처로 연락 부탁드립니다.",
    // 공개 전단은 검색엔진에서 제외한다. (기획서 12. 보안·안전)
    robots: { index: false, follow: false },
    openGraph: {
      title: "실종자를 찾고 있습니다",
      description: "보신 분은 전단의 보호자 연락처로 연락 부탁드립니다.",
      images: SHARE_ID.test(shareId) ? [flyerImageUrl(shareId)] : [],
    },
  };
}

export default async function SharedFlyerPage({ params, searchParams }: PageProps) {
  const { shareId } = await params;
  if (!SHARE_ID.test(shareId)) notFound();
  const query = await searchParams;

  return (
    <FlyerView
      imageUrl={flyerImageUrl(shareId)}
      justCreated={query.created === "1"}
      shareId={shareId}
    />
  );
}
