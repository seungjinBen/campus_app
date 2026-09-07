// Kakao JS SDK 최소 타입 선언 — 공유(sendDefault)에 필요한 범위만
interface KakaoShareApi {
  sendDefault(options: {
    objectType: 'feed';
    content: {
      title: string;
      description: string;
      imageUrl: string;
      link: { mobileWebUrl: string; webUrl: string };
    };
    buttons?: { title: string; link: { mobileWebUrl: string; webUrl: string } }[];
  }): void;
}

interface KakaoSdk {
  init(jsKey: string): void;
  isInitialized(): boolean;
  Share: KakaoShareApi;
}

interface Window {
  Kakao?: KakaoSdk;
}
