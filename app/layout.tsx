
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
      <body className="bg-slate-950 text-white flex">
        <ToastProvider>
          <Sidebar />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  )
}
