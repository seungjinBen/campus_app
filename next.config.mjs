const isDev = process.env.NODE_ENV === 'development';

const csp = [
  "default-src 'self'",
  // unsafe-eval은 dev HMR 전용 — 프로덕션 CSP에는 포함하지 않는다
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://t1.kakaocdn.net`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://storage.googleapis.com",
  "font-src 'self' data:",
  `connect-src 'self' ${isDev ? 'http://localhost:8080 ' : ''}https://*.campushanjang.kr https://kauth.kakao.com https://kapi.kakao.com`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://kauth.kakao.com",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 백엔드에서 이미 1200×1600 / JPEG 85%로 최적화 후 Firebase에 저장하므로
    // Vercel의 이중 변환이 불필요 — Transformation 과금 방지
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/campushanjang.firebasestorage.app/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
