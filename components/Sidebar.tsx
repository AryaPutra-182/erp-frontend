'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const menu = [
  { name: 'Dashboard', href: '/' },
  { name: 'Customers', href: '/customers' },
  { name: 'Products', href: '/products' },
  { name: 'Manufacturing', href: '/manufacturing' },
  { name: 'Purchasing', href: '/purchasing' },
  { name: 'Quotations', href: '/quotations' },
  { name: 'Sales Orders', href: '/sales-orders' },
  { name: 'Delivery Orders', href: '/delivery-orders' },
  { name: 'Invoices', href: '/invoices' },

];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="px-6 py-5">
        <h1 className="text-cyan-300 text-2xl font-bold tracking-wide">ERP System</h1>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition",
                active
                  ? "bg-cyan-500 text-slate-900 shadow-md"
                  : "text-cyan-200 hover:bg-slate-800 hover:text-cyan-100"
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800 text-slate-500 text-sm">
        v1.0.0
      </div>
    </aside>
  );
}
