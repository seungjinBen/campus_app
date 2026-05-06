'use client';

import { useOnboardingStore } from '@/lib/store/onboardingStore';
import ProgressBar from '@/components/ui/ProgressBar';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { currentStep } = useOnboardingStore();
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream">
      <div className="sticky top-0 z-10 bg-white border-b border-brand-sand/60 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center px-4 py-3 gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 text-brand-mid hover:text-brand-dark transition-colors"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <ProgressBar current={currentStep} total={4} />
          </div>
          <span className="text-xs text-brand-light w-8 text-right">{currentStep}/4</span>
        </div>
      </div>
      <main className="flex-1 px-5 py-6">{children}</main>
    </div>
  );
}
