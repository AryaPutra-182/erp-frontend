import './globals.css'
import { Inter } from 'next/font/google'
import ClientLayout from '../components/ClientLayout' // Import file baru tadi

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ERP System',
  description: 'ERP Frontend',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Panggil komponen ClientLayout di sini */}
        <ClientLayout>
            {children}
        </ClientLayout>
      </body>
    </html>
  );
}