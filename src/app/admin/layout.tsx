import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-brand-cream">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-brand-sand bg-white/50">
        <Link href="/match" className="text-brand-mid hover:text-brand-dark transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold text-brand-dark">관리자</h1>
        <LogoutButton />
      </header>
      <main className="flex-1 px-4 py-5">{children}</main>
    </div>
  );
}
