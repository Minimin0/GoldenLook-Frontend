"use client";

import Script from "next/script";

/**
 * 카카오톡 공유(Kakao Share) SDK 로더.
 * NEXT_PUBLIC_KAKAO_JS_KEY 가 없으면 아무것도 로드하지 않고,
 * ShareActions 가 Web Share API → 링크 복사 순으로 대체 동작한다.
 *
 * JavaScript 키는 공개되는 값이지만, 카카오 개발자 콘솔에서
 * 사이트 도메인을 등록해 두어야 공유가 동작한다.
 */
export function KakaoScript() {
  const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!appKey) return null;

  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(appKey);
      }}
    />
  );
}
