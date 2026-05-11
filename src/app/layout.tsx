import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: '캠퍼스한장',
  description: '사진 한 장으로 느낌을 보고, 이상형이 맞으면 바로 연결 — 대학생 전용 매칭 서비스',
  keywords: ['대학생 소개팅', '캠퍼스 매칭', '대학교 이상형', '번호 교환', '대학생 만남'],
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: '캠퍼스한장',
    description: '사진 한 장, 하루 세 번의 설렘 — 대학생 전용 매칭 서비스',
    siteName: '캠퍼스한장',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '캠퍼스한장',
    description: '사진 한 장, 하루 세 번의 설렘 — 대학생 전용 매칭 서비스',
  },
  robots: {
    index: true,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-brand-cream antialiased min-h-screen" suppressHydrationWarning>
        <div className="mx-auto max-w-md min-h-screen relative">
          {children}
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#111827',
              color: '#F8F8FA',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
            },
          }}
        />
      </body>
    </html>
  );
}
