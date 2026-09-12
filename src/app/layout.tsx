import type { Metadata, Viewport } from "next";
import { KakaoScript } from "@/components/KakaoScript";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GoldenLook · 실종자 전단지를 1분 만에",
    template: "%s · GoldenLook",
  },
  description:
    "보호자가 기억하는 실종 당시 정보를 바탕으로 예상 모습을 재현하고, 모바일 전단지로 바로 공유합니다.",
  // 공개 전단 페이지를 포함해 서비스 전체를 검색엔진에서 제외한다. (기획서 12. 보안·안전)
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#D8E4F4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="app-shell">{children}</div>
        <KakaoScript />
      </body>
    </html>
  );
}
