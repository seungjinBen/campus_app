'use client';

import { getKakaoAuthUrl } from '@/lib/api/auth';

interface Props {
  disabled?: boolean;
}

export default function KakaoLoginButton({ disabled = false }: Props) {
  const handleLogin = () => {
    if (disabled) return;
    window.location.href = getKakaoAuthUrl();
  };

  return (
    <button
      onClick={handleLogin}
      disabled={disabled}
      className="flex items-center justify-center gap-3 w-full max-w-xs py-3.5 px-6 rounded-2xl font-medium transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
      style={{ backgroundColor: '#FEE500', color: '#191919' }}
    >
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 0.5C4.03 0.5 0 3.73 0 7.71c0 2.53 1.69 4.76 4.25 6.03l-1.08 4.04c-.1.36.33.64.64.43l4.9-3.24c.42.05.86.08 1.29.08 4.97 0 9-3.23 9-7.21S13.97.5 9 .5z"
          fill="#191919"
        />
      </svg>
      카카오로 시작하기
    </button>
  );
}
