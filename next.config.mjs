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
};

export default nextConfig;
