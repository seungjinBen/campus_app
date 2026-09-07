// 카카오톡 초대 공유 — SDK 미탑재/초기화 실패 시 false 반환 (호출부가 클립보드 복사로 폴백)
export function shareInviteToKakao(code: string): boolean {
  const kakao = typeof window !== 'undefined' ? window.Kakao : undefined;
  if (!kakao?.isInitialized?.()) return false;

  const inviteUrl = `${window.location.origin}/invite/${code}`;

  try {
    kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '캠퍼스한장 초대장이 도착했어요',
        description: '사진 한 장으로 시작되는 설렘 — 세종대 학생만 만나는 축제 매칭',
        // 초대 코드별 동적 OG 이미지 (Next.js opengraph-image 라우트)
        imageUrl: `${window.location.origin}/invite/${code}/opengraph-image`,
        link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl },
      },
      buttons: [{ title: '초대 받기', link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl } }],
    });
    return true;
  } catch {
    return false;
  }
}
