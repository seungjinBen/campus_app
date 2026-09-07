import type { Metadata } from 'next';
import { ReactNode } from 'react';

// 초대 코드별 동적 메타데이터 — 카카오/SNS 미리보기에 초대자 닉네임 노출
// og:image는 같은 폴더의 opengraph-image.tsx가 컨벤션으로 자동 연결된다
export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  let nickname: string | null = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/referral/preview?code=${encodeURIComponent(params.code)}`,
      { next: { revalidate: 3600 } }
    );
    const json = (await res.json()) as { data?: { nickname?: string | null } };
    nickname = json.data?.nickname ?? null;
  } catch {
    // 백엔드 미기동/오류 시 기본 문구로 폴백 — 링크 미리보기가 깨지지 않게
  }

  const title = nickname ? `${nickname}님의 캠퍼스한장 초대장` : '캠퍼스한장 초대장';
  const description = '사진 한 장으로 시작되는 설렘 — 세종대 학생만 만나는 축제 매칭';

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function InviteLayout({ children }: { children: ReactNode }) {
  return children;
}
