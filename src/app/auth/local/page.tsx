'use client';

// 테스트 계정 로그인 — prod는 화이트리스트(LOCAL_LOGIN_ALLOWED_EMAILS) 이메일만 허용

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { localLogin } from '@/lib/api/auth';
import { getProfileComplete } from '@/lib/api/user';
import { useAuthStore } from '@/lib/store/authStore';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LocalLoginPage() {
  const router = useRouter();
  const { setAccessToken } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await localLogin(
        email, password, localStorage.getItem('refCode'), birthDate, department,
      );
      if (!result.success || !result.data?.accessToken) {
        throw new Error('no token');
      }
      localStorage.removeItem('refCode');
      setAccessToken(result.data.accessToken);

      const { complete } = await getProfileComplete();
      // 미완성 유저는 학생인증(1단계)부터 — 이미 인증된 경우 verify 페이지가 profile로 넘겨줌
      router.replace(complete ? '/match' : '/onboarding/verify');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(axiosErr.response?.data?.error?.message ?? '로그인에 실패했어요');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 bg-brand-cream">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center space-y-2">
          <span className="text-xs text-amber-700 bg-amber-100 border border-amber-300 rounded-full px-3 py-1">
            테스트 전용 — 허용된 이메일만 사용 가능
          </span>
          <h1 className="text-xl font-bold text-brand-dark pt-2">테스트 계정 로그인</h1>
          <p className="text-sm text-brand-mid">
            처음 입력하는 이메일은 자동으로 계정이 생성돼요.
            <br />
            신규 계정은 생년월일·학과를 함께 입력해야 카드에 노출돼요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-brand-dark placeholder-brand-light focus:outline-none focus:ring-2 focus:ring-brand-rose text-sm"
          />
          <input
            type="password"
            placeholder="비밀번호 (8자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="current-password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-brand-dark placeholder-brand-light focus:outline-none focus:ring-2 focus:ring-brand-rose text-sm"
          />
          {/* 신규 가입 시에만 사용 — 기존 계정 로그인이면 무시됨 */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              title="생년월일 (신규 가입용)"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-rose text-sm"
            />
            <input
              type="text"
              placeholder="학과 (신규 가입용)"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-brand-dark placeholder-brand-light focus:outline-none focus:ring-2 focus:ring-brand-rose text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-brand-dark text-brand-cream font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                로그인 중...
              </>
            ) : (
              '로그인 / 계정 생성'
            )}
          </button>
        </form>

        <button
          onClick={() => router.push('/')}
          className="w-full text-xs text-brand-light text-center"
        >
          ← 돌아가기
        </button>
      </div>
    </main>
  );
}
