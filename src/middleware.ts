import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 주의: '/'를 여기 넣으면 startsWith 특성상 모든 경로가 통과해 인증 체크가 무력화된다
const PUBLIC_PATHS = ['/auth/kakao/callback', '/invite'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/' || PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Access Token은 서버사이드에서 읽을 수 없으므로 Refresh Token 쿠키로 인증 체크.
  // 이건 UX용 가드일 뿐 — 실제 인가는 항상 백엔드(JWT + hasRole)가 최종 방어선이다.
  const hasRefreshToken = request.cookies.has('refreshToken');

  if (!hasRefreshToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// /auth/local은 로그인 진입 페이지라 쿠키 요구 대상이 아님 — prod 차단은 백엔드 @Profile이 담당
export const config = {
  matcher: [
    '/onboarding/:path*',
    '/match/:path*',
    '/settings/:path*',
    '/settings',
    '/admin/:path*',
  ],
};
