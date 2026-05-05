import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/auth/kakao/callback'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Access Token은 서버사이드에서 읽을 수 없으므로 Refresh Token 쿠키로 인증 체크
  const hasRefreshToken = request.cookies.has('refreshToken');

  if (!hasRefreshToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/onboarding/:path*', '/match/:path*', '/settings/:path*', '/settings'],
};
