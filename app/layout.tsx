import './globals.css'
import Sidebar from '../components/Sidebar'
import ToastProvider from '../components/ToastProvider'

export const metadata = {
  title: 'ERP System',
  description: 'ERP Frontend'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* === PERBAIKAN: Pasang ToastProvider di sini === */}
        <ToastProvider>
        
            {/* Sidebar Fixed */}
            <Sidebar /> 
            
            <div className="ml-64 transition-all duration-300"> 
              <main className="min-h-screen bg-[#0D1117]"> 
                {children}
              </main>
            </div>

        </ToastProvider>
        {/* === Jangan lupa tutup tag ToastProvider === */}
        
      </body>
    </html>
  );
}