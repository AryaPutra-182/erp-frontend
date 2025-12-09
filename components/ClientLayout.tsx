'use client'; // Wajib di paling atas

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import ToastProvider from './ToastProvider';
import AuthGuard from './AuthGuard'; 

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Cek apakah user sedang di halaman login/register
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <ToastProvider>
      <AuthGuard>
        <div className="min-h-screen bg-[#0D1117]">
          
          {/* Sidebar hanya muncul jika BUKAN halaman auth */}
          {!isAuthPage && <Sidebar />}

          {/* Geser konten jika ada sidebar */}
          <main className={`transition-all duration-300 ${!isAuthPage ? 'ml-64' : 'ml-0'}`}>
            {children}
          </main>

        </div>
      </AuthGuard>
    </ToastProvider>
  );
}