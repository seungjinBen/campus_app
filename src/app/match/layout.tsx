import BottomNav from '@/components/layout/BottomNav';
import TopBar from '@/components/layout/TopBar';
import ProfileButton from '@/components/auth/ProfileButton';

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-brand-cream">
      <TopBar title="캠퍼스한장" right={<ProfileButton />} />
      <main className="flex-1 px-4 py-5 pb-24 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
