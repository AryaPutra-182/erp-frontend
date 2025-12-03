'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { ChevronDown, ChevronRight } from 'lucide-react';

const menu = [
  { name: 'Dashboard', href: '/' },
  { name: 'Customers', href: '/customers' },
   {
    name: 'Manufacturing',
    children: [
      { name: 'Product', href: '/products' },
      { name: 'BOM', href: '/manufacturing/create' },
      { name: 'Manufacturing Order', href: '/manufacturing/mo-list' },
    ],
  },
  { name: 'Purchasing', href: '/purchasing' },
  { name: 'Quotations', href: '/quotations' },
  { name: 'Sales Orders', href: '/sales-orders' },
  { name: 'Delivery Orders', href: '/delivery-orders' },
  { name: 'Invoices', href: '/invoices' },

  {
    name: 'Employees',
    children: [
      { name: 'Employee List', href: '/employees' },
      { name: 'Departments', href: '/employees/departments' },
      { name: 'Positions', href: '/employees/positions' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggle = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-5">
        <h1 className="text-cyan-300 text-2xl font-bold tracking-wide">
          ERP System
        </h1>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-1">

        {menu.map((item) => {
          const isActive = pathname === item.href;
          const isParentActive = item.children?.some((child) =>
            pathname.startsWith(child.href)
          );

          // If the menu item has submenu
          if (item.children) {
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggle(item.name)}
                  className={clsx(
                    "flex justify-between items-center w-full px-4 py-2 rounded-lg text-left text-sm font-medium transition",
                    isParentActive
                      ? "bg-cyan-500 text-slate-900 shadow-md"
                      : "text-cyan-200 hover:bg-slate-800 hover:text-cyan-100"
                  )}
                >
                  {item.name}
                  {openMenu === item.name ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>

                {/* SUBMENU */}
                {openMenu === item.name && (
                  <div className="ml-6 mt-1 space-y-1 transition">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={clsx(
                          "block px-3 py-2 rounded-md text-sm transition",
                          pathname === child.href
                            ? "bg-cyan-400 text-slate-900"
                            : "text-cyan-200 hover:bg-slate-800 hover:text-cyan-100"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Normal link
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition",
                isActive
                  ? "bg-cyan-500 text-slate-900 shadow-md"
                  : "text-cyan-200 hover:bg-slate-800 hover:text-cyan-100"
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="px-4 py-4 border-t border-slate-800 text-slate-500 text-sm">
        v1.0.0
      </div>
    </aside>
  );
}
