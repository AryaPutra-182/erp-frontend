'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // Untuk tahu kita lagi di halaman mana
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Daftar halaman yang BEBAS AKSES (Public)
    const publicPaths = ['/login', '/register'];

    // LOGIKA PENGECEKAN:
    if (!token && !publicPaths.includes(pathname)) {
      // 1. Gak ada token & bukan di halaman login -> TENDANG KELUAR
      router.push('/login');
      setAuthorized(false);
    } else {
      // 2. Ada token ATAU sedang di halaman login -> LANJUT
      setAuthorized(true);
    }
  }, [router, pathname]);

  // Tampilkan loading sebentar biar gak kedip
  if (!authorized) {
      // Kecuali kalau emang lagi di halaman login, langsung render aja
      if (pathname === '/login') return <>{children}</>;
      return <div className="h-screen bg-[#0D1117] text-white flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}