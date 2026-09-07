'use client';

import Script from 'next/script';

// Kakao JS SDK 로드 + 초기화 — 루트 레이아웃에서 1회 마운트
// JS 키는 브라우저 노출 전제로 설계된 키 (등록 도메인에서만 동작) — NEXT_PUBLIC 허용
export default function KakaoScript() {
  const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!jsKey) return null; // 키 미설정 환경(예: CI)에서는 공유 버튼이 클립보드 복사로 폴백

  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(jsKey);
        }
      }}
    />
  );
}
