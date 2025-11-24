import './globals.css';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: 'ERP System',
  description: 'ERP Frontend',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
